# NeuroFixia

NeuroFixia helps parents screen early for autism-related developmental needs and then practise guided activities at home. It has four modules:

| Module | What the parent/child does | Models |
|---|---|---|
| **Behavioural** | Calibrate eye tracking, watch 4 emotion clips while the webcam records, name each emotion | Pose-sequence CNN (body movement), MobileNetV2 scan-path classifier (gaze), logistic regression (emotion answers), combined by weighting |
| **Social skills** | 10-question parent questionnaire in English / සිංහල / தமிழ், with voice input | Naive Bayes sentiment models (Q9, Q10) + Random Forest risk model |
| **Sensory processing** | Record the child's reaction to noise; graded auditory therapy room with history | MediaPipe pose ear-covering/agitation detector + FER2013 facial-emotion CNN |
| **Learning abilities** | Memory, attention (with eye tracking) and logic games, results and suggested activities | Random Forest on game metrics |

> NeuroFixia is a screening aid, **not** a diagnostic tool.

## Architecture (v2)

```
browser (React, MUI) ──/api──> backend/ (Node + Express, JWT auth, MongoDB)
                                   │  also serves the React build
                                   └──> ml-service/ (Flask + gunicorn, every ML model)
```

v1 ran **7 separate servers** (3 Node apps on 5000/8070/8080 and 4 Flask apps on 5001/5002/5021/5031) with hard-coded `localhost`/`192.168.1.5` URLs. v2 has one API gateway and one ML service, and one Docker image runs both.

```
frontend/       React app (CRA)
backend/        Express API: users, behavioral, social, sensory, cognitive, dashboard
ml-service/     Flask app + models/ + shared preprocessing.py + tests/
ml-training/    reproducible training scripts + datasets used for retraining
Dockerfile      single-container build (Hugging Face Spaces / Render / any Docker host)
```

## Run locally

Requirements: Node 20+, Python 3.11.

```bash
# 1. ML service
cd ml-service && python -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt
python app.py                         # http://127.0.0.1:5001

# 2. API (new terminal). MONGO_URI is optional: if empty, an embedded MongoDB is started.
cd backend && cp .env.example .env && npm install && npm run dev   # http://localhost:5000

# 3. Frontend (new terminal). Dev server proxies /api to :5000
cd frontend && npm install && npm start                            # http://localhost:3000
```

Or with Docker: `docker build -t neurofixia . && docker run -p 7860:7860 -e JWT_SECRET=... -e MONGO_URI=... neurofixia`

Tests: `cd backend && npm test` and `cd ml-service && python -m pytest tests`.

## Environment variables

| Var | Where | Default |
|---|---|---|
| `MONGO_URI` | backend | empty → embedded in-memory MongoDB (data lost on restart; use MongoDB Atlas for persistence) |
| `JWT_SECRET` | backend | random per start in Docker |
| `ML_URL` | backend | `http://127.0.0.1:5001` |
| `CORS_ORIGINS` | backend | allow all |
| `REACT_APP_API_URL` | frontend build | `/api` |

## Model retraining (v2)

Each model was checked against data. Models that were broken were fixed or retrained, using the scripts in `ml-training/`:

| Model | Problem found | Fix | Result |
|---|---|---|---|
| Eye-gaze scan-path (`heatMap_prediction.h5`) | AUC **0.54** on the public scan-path dataset: it labelled almost everything non-ASD. The app also uploaded a fixed example image instead of the child's gaze. | Retrained on the [Carette et al. 2019 scan-path dataset](https://figshare.com/articles/7073087) (547 images) with frozen MobileNetV2 and a logistic head. Evaluated with participant-grouped CV. The in-browser gaze drawing now matches the dataset style. | AUC **≈0.74–0.77** (participant-grouped 5-fold) |
| Emotion-answer model (`asd_prediction_model.h5`) | Case-sensitive encoder crashed on `''` or `'sad'`. Its output was P(non-ASD) but was combined as P(ASD), so the score was inverted. | Normalised answers, added correctness features, logistic regression that outputs P(ASD) | CV accuracy **0.84**, AUC 0.87 |
| Cognitive KNN (`knn_model2.pkl`) | Unscaled features, so distance was dominated by response time | Training set recovered from the pickled KNN. Compared 4 models and kept the best (Random Forest). | CV AUC **0.974** (was 0.941), accuracy 0.92 |
| Body-movement model | Model expects 30-frame windows but inference built 10-frame windows, so it crashed every time | Inference fixed (30 frames at ~10 fps, sliding windows) | works |
| Sensory CNN-LSTM | Ignored hand-to-ear distance entirely: the output only followed the raw elbow angle. The extractor used the same hand for left and right. | Replaced by an explainable pose detector (ear covering, duration, head agitation). No public labelled dataset exists; `ml-training/train_sensory.py` learns a model from your own labelled videos. | unit-tested |
| Social NB + RF models | Worked well | Kept. Sinhala/Tamil yes/no no longer depend on online translation. The Tamil questionnaire was asking different questions; now fixed. | unchanged |

Metrics are saved next to each model in `ml-service/models/*_metrics.json`.

## Main bug fixes (v2)

- Behavioural test downloaded the video and gaze image to the parent's PC. The server then analysed whatever file was in a developer folder (`testFiles/video`). Files are now uploaded and analysed for real.
- The webcam and eye tracker started on every page as soon as the app opened. They now run only during tests and stop afterwards. Added a 9-point calibration.
- App crashed at start-up in Firefox/Safari (`new SpeechRecognition()` at import time).
- Auth: password re-hashed on every save, middleware sent two responses, no route protection. All data is now scoped per parent account.
- The cognitive Node `/predict` crashed (axios not imported). The schema used the reserved `errors` path. Parents had to label their own child "AUTISM"/"TD" before getting a prediction.
- Memory game: clicking the same card twice counted as a match, and the timer never stopped. Logic game: answers mutated shared data and scores could be inflated. Attention game: gaze target was hard-coded to the developer's screen pixels, and the fixation time was computed wrong.
- Simon game score missed the last answer. The Scoreroute was never mounted. Tamil questions mismatched. `prettier` was bundled into the browser. Tailwind classes were used without Tailwind. Many hard-coded `marginLeft: 500px` layouts.
- Sensory: therapy sessions were saved for user "1". Sounds kept playing after leaving the page. The end-date filter excluded that day.
- New: dashboard overview, child profile, consistent UI, mobile layout, dark mode, error boundaries, progress charts, tests, Dockerfile.

## Datasets

- Scan-path images: Carette, R. et al. (2019) *Visualization of Eye-Tracking Scanpaths in Autism Spectrum Disorder: Image Dataset*, figshare, doi:10.6084/m9.figshare.7073087 (download with `ml-training/train_scanpath.py` instructions)
- `ml-training/data/facial_expression_dataset.csv`, `cognitive_games_dataset.csv`: project-collected data
- Facial emotion model: mini-Xception trained on FER2013 from the MIT-licensed `fer` package (`ml-service/models/FER_LICENSE.txt`)
