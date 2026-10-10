import sys, json, soundfile as sf
from kokoro_onnx import Kokoro
model_dir, src, outdir = sys.argv[1:4]
k = Kokoro(model_dir+"/kokoro-v1.0.onnx", model_dir+"/voices-v1.0.bin")
d = json.load(open(src)); durs = {}
for key, text in d.items():
    s, sr = k.create(text, voice="af_heart", speed=1.0, lang="en-us")
    sf.write(f"{outdir}/{key}.wav", s, sr); durs[key] = round(len(s)/sr, 3)
    print(key, durs[key], flush=True)
json.dump(durs, open(f"{outdir}/durations_{src.split('/')[-1]}", "w"), indent=1)
