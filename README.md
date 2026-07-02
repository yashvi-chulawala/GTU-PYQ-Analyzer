# GTU PYQ Analyzer

A full-stack web app for analyzing Gujarat Technological University previous year question papers.

## Project Structure

```
gtu_site/
├── backend/          # FastAPI Python backend
│   ├── main.py       # API server (entry point)
│   ├── subjects/     # Subject data (JSON + PDFs)
│   └── requirements.txt
└── frontend/         # React + Vite + Tailwind frontend
    ├── src/
    │   ├── pages/    # Home, Subject, NotFound
    │   ├── components/
    │   └── services/ # api.js, subjects.js
    └── package.json
```

## Available Subjects

| Code | Name |
|------|------|
| `os` | Operating System |
| `coa` | Computer Organization & Architecture |
| `cn` | Computer Networks |
| `mi` | Microprocessor & Interfacing |
| `pds` | Python & Data Structures |
| `ss` | System Software |

## Setup & Running

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API runs at `http://localhost:8000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173`

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /` | Health check |
| `GET /subjects` | List all available subjects |
| `GET /subject/{code}` | Get topic cards + unit questions for a subject |
| `GET /subject/{code}/papers` | List available papers for a subject |
| `GET /subject/{code}/paper/{filename}` | Download a specific paper PDF |

## Environment Variables (Frontend)

Create a `.env` file in the `frontend/` folder to override the API URL:

```env
VITE_API_BASE_URL=http://localhost:8000
```
