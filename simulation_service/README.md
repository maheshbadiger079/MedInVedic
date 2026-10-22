# MedInVedic Cloud Run Simulation Microservice

Independent, containerized Python 3.11+ / FastAPI simulation microservice for MedInVedic.

## Architectural Features
- **Clean-Room Implementation**: 100% MIT / Permissive license stack; zero AGPL code.
- **Bounded Multi-Agent Execution**: Rounds, tokens, and execution times are strictly capped.
- **Healthcare Safety Guardrails**: Built-in regex and heuristic interceptors for acute emergency symptoms and prompt injections.
- **Cloud Run Native**: Stateless container design, standard `/health` and `/ready` probes, graceful shutdown handling.

## Local Development
```bash
cd simulation_service
pip install -r requirements.txt
python main.py
```

## Cloud Run Container Build & Deployment
```bash
# Build container with Google Cloud Build
gcloud builds submit --tag gcr.io/medinvedic/simulation-engine:1.0.0

# Deploy to Cloud Run
gcloud run deploy medinvedic-simulation-engine \
  --image gcr.io/medinvedic/simulation-engine:1.0.0 \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated \
  --min-instances 0 \
  --max-instances 5 \
  --memory 1Gi \
  --cpu 1 \
  --set-env-vars ENABLE_AI_SIMULATION_LAB=true
```
