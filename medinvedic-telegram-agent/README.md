# MedInVedic Telegram AI Agent

Production-ready Telegram AI Agent powered by **Hybrid RAG**, allowlisted tool calling, user memory, and Firebase integration for **MedInVedic** ("Where Modern Medicine Meets Ancient Ayurveda").

## Features
- **Hybrid RAG Engine**: Semantic embeddings + keyword search + confidence reranking.
- **Clinical Safety Layer**: Automated 112 emergency interceptor and dosage modification barriers.
- **Allowlisted Tools**: Medicine lookup (CDSCO), Ayurveda (AYUSH), Home Remedies, Live Products, Prescriptions, and Doctor Consultations.
- **Multilingual**: English, Hindi, Marathi, Kannada.
- **Firebase Sync**: User preferences, consultation records, and audit logging.

## Quick Start
```bash
cd medinvedic-telegram-agent
pip install -r requirements.txt
python -m ingestion.ingest
uvicorn app.main:app --reload
```

## Running Tests
```bash
pytest tests/
```
