import json, subprocess, sys, os
D = os.path.dirname(os.path.abspath(__file__)); A = D + '/audio'; B = D + '/build'; os.makedirs(B, exist_ok=True)
dur = {}
for f in ['durations_narration_emp.json','durations_narration_emp_patch.json','durations_narration_emp_patch2.json','durations_narration_mgr.json','durations_narration_mgr_patch.json']:
    if os.path.exists(f'{A}/{f}'): dur.update(json.load(open(f'{A}/{f}')))
def run(cmd): print(' '.join(cmd[:6]), '...'); subprocess.run(cmd, check=True)
VOUT = ['-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p','-r','30','-c:a','aac','-b:a','192k','-ar','48000','-ac','2']
def card(name, key):
    T = dur[key] + 1.6
    run(['ffmpeg','-loglevel','error','-y','-loop','1','-t',f'{T}','-i',f'{D}/cards/{name}.png','-i',f'{A}/{key}.wav',
         '-filter_complex',f"[0:v]fps=30,format=yuv420p,fade=in:st=0:d=0.5,fade=out:st={T-0.5}:d=0.5[v];[1:a]adelay=600|600,apad,atrim=0:{T},aresample=48000,pan=stereo|c0=c0|c1=c0,loudnorm=I=-16:TP=-1.5[a]",
         '-map','[v]','-map','[a]','-t',f'{T}',*VOUT,f'{B}/{name}.mp4'])
def clip(name, raw, segs, end, skip=()):
    segs = [s for s in json.load(open(segs)) if s['key'] not in skip]
    rawdur = float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',raw]))
    extra = max(0, end - rawdur + 0.1)
    ins = ['-i', raw]; parts = []
    for i, s in enumerate(segs):
        ins += ['-i', f"{A}/{s['key']}.wav"]; ms = int(s['start'] * 1000)
        parts.append(f"[{i+1}:a]aresample=48000,adelay={ms}|{ms}[a{i}]")
    mix = ''.join(f'[a{i}]' for i in range(len(segs)))
    fc = ';'.join(parts) + f";{mix}amix=inputs={len(segs)}:normalize=0,apad,atrim=0:{end},pan=stereo|c0=c0|c1=c0,loudnorm=I=-16:TP=-1.5[a];" \
         f"[0:v]tpad=stop_mode=clone:stop_duration={extra},trim=0:{end},setpts=PTS-STARTPTS,fade=in:st=0:d=0.4,fade=out:st={end-0.5}:d=0.5[v]"
    run(['ffmpeg','-loglevel','error','-y',*ins,'-filter_complex',fc,'-map','[v]','-map','[a]','-t',f'{end}',*VOUT,f'{B}/{name}.mp4'])
se = {s['key']: s['start'] for s in json.load(open(D+'/segs_emp.json'))}
sm = {s['key']: s['start'] for s in json.load(open(D+'/segs_mgr.json'))}
card('intro','intro'); card('part1','part1')
clip('emp', D+'/raw_emp.mp4', D+'/segs_emp.json', se['submitted'] + dur['submitted'] + 1.0, skip=('logout',))
card('part2','part2')
clip('mgr', D+'/raw_mgr.mp4', D+'/segs_mgr.json', sm['m_done'] + dur['m_done'] + 1.0)
card('outro','outro')
open(B+'/list.txt','w').write(''.join(f"file '{B}/{n}.mp4'\n" for n in ['intro','part1','emp','part2','mgr','outro']))
run(['ffmpeg','-loglevel','error','-y','-f','concat','-safe','0','-i',B+'/list.txt','-c','copy','-movflags','+faststart',sys.argv[1]])
