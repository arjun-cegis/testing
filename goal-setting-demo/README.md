# WorkStation Goal Setting: Demo Video

`workstation-goal-setting-demo.mp4`: 1920×1080, 4 min 48 s, with an AI-generated English voiceover.

Recorded on https://betaworkstation.cegis.org/ with the demo accounts: the employee (Arjun Dev) submits the 2026-2027 goal sheet, and the reporting manager (dev raj) approves it.

## Narration script

### Intro
This video walks you through the goal setting process in WorkStation. In part one, an employee fills in and submits the goal setting form. In part two, the reporting manager reviews the submission, and either approves it, or sends it back for resubmission.

### Part one. Submitting your goals as an employee.
- To begin, open WorkStation in your browser, and sign in with your employee e-mail and password.
- After signing in, open the P M S menu in the left sidebar, and click Goal Setting.
- The My Goal Setting tab lists your goal sheet for the financial year, along with your reporting manager, and the current approval status, which is Draft. Click View, Add Goals, to open it.
- This page shows your details, and the goals added so far. Click Edit or Submit Goals, to start filling in the form.
- The form has two tabs. Goals carry a total weight of eighty percent, and Collaboration carries the remaining twenty percent. The bars at the top track how much weight you have assigned.
- For each goal, choose a Category, the K R Type, and the P G F Element it links to. Then enter the goal's weight, and describe the key result you plan to achieve.
- Click Add Goals, to add another goal. Here we add a second goal with a weight of forty percent, which brings the goals total to eighty percent. You can add up to eight goals.
- Next, open the Collaboration tab. Select the collaboration category and sub-category, and give this collaboration a weight. Here we assign ten percent.
- Choose the collaborator by name, then enter their team or function, and how often you plan to check in with them.
- Describe the projects you will collaborate on, the joint output you will work on together, and why this collaboration is critical for your goals.
- Then, link the collaboration to the goals it supports.
- At least two collaborators are required. Click Add Collaboration, to add the second one. Here we choose collaboration within the team, and assign the remaining ten percent, bringing collaboration to twenty percent.
- Fill in the collaborator's details, and the nature of the collaboration, in the same way, and link it to the goals it supports.
- Both sections are now complete, at eighty and twenty percent. Click Save and submit, to send your goals to your reporting manager. If you want to finish later, use Save as draft instead.
- Your goals are submitted. A confirmation message appears, thanking you for submitting your goals, and the status changes to In Review, while your reporting manager reviews them.

### Part two. Reviewing the goals as the reporting manager.
- The reporting manager signs in to WorkStation, with their own account.
- From the sidebar, open P M S, and then Goal Setting.
- Open the To be Review tab. It lists the goal sheets submitted by your team members. Arjun Dev's goals for twenty twenty-six, twenty-seven, are In Review. Click View Details, to open them.
- Go through the employee's goals, their weights and key results, and the collaboration details.
- When you have reviewed the goals, click Update Status.
- Use the Change Status list to take action. Choose Resubmit, to send the goals back to the employee for changes. The employee can then edit the form and submit it again, following the same steps shown in part one.
- If the goals look good, choose Approved. You can also add feedback in the comment box. Then click Update Status.
- The goals are approved. A confirmation message appears, and the status now shows Approved. The employee can track every status change using the Status Flow button.

### Outro
And that's the complete goal setting process in WorkStation. Employees submit their goals, and reporting managers review them, and either approve them, or send them back for resubmission.

## Re-recording

Scripts live in `scripts/` and need Node with Playwright, Xvfb, ffmpeg and the `kokoro-onnx` TTS model (`kokoro-v1.0.onnx`, `voices-v1.0.bin`).
Set `WS_EMP_USER`, `WS_EMP_PASS`, `WS_MGR_USER` and `WS_MGR_PASS`, then:

1. `python3 tts.py <model_dir> narration_emp.json audio/` (and again for `narration_mgr.json`)
2. `node record_emp.js real` then `node record_mgr.js real` (leave off `real` for a practice run that stops before Submit / Update Status)
3. `node cards/make.js`, then `python3 assemble.py out.mp4`

The goal sheet must be in Draft for the employee part, and In Review for the manager part. The form requires the goals to total 80% and at least two collaborators totalling 20%.
