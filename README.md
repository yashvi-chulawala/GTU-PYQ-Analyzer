<div align="center">

# GTU PYQ Analyzer

**Stop skimming a decade of question papers. Know exactly what to study.**

A full-stack web app that analyzes Gujarat Technological University (GTU) previous-year question papers and surfaces the topics that actually recur — so students can revise with signal, not guesswork.

[**Live App**](https://gtu-pyq-analyzer.vercel.app/) · [Report a Bug](../../issues) · [Request a Subject](../../issues)

</div>

<br />

![GTU PYQ Analyzer — homepage](docs/screenshots/home.png)
<img width="1857" height="983" alt="image" src="https://github.com/user-attachments/assets/2f649be3-b534-4a28-8c17-4c4cd5d5a785" />


<br />

## Overview

Every semester, GTU students dig through years of scattered PDF question papers trying to guess what's likely to show up on the exam. **GTU PYQ Analyzer** automates that guesswork: it extracts every question from past papers for a subject, clusters them by topic, and ranks those topics by how often they've actually been asked — unit by unit.

Feed it a subject code, and it shows you:

- **Topic rankings** — which topics recur most often across past papers, ordered by exam frequency
- **Unit-wise breakdown** — questions grouped by syllabus unit, so revision maps directly to your course structure
- **Past papers** — browse and download the original question paper PDFs by session/year
- **Syllabus reference** — the official syllabus alongside the analysis, for context

Question extraction and topic clustering happen **offline**, via a Python pipeline. The live API just serves the resulting JSON — so the app stays fast and cheap to run, with no analysis happening on the request path.

<br />

## Screenshots

<table>
<tr>
<td width="50%">

**Home — search by subject**
![Home page](docs/screenshots/home.png)

</td>
<td width="50%">

**Subject page — ranked topics**
![Subject topic rankings](docs/screenshots/subject-topics.png)

</td>
</tr>
<tr>
<td width="50%">

**Unit-wise question breakdown**
![Unit-wise breakdown](docs/screenshots/unit-wise.png)

</td>
<td width="50%">

**Past papers & syllabus**
![Past papers list](docs/screenshots/papers.png)

</td>
</tr>
</table>

<br />

## Tech Stack

| Layer | Stack |
|---|---|
| **Frontend** | React 19, Vite, React Router, Tailwind CSS, lucide-react |
| **Backend** | FastAPI, Uvicorn |
| **Data pipeline** | Python (PDF text extraction + topic clustering) |
| **Auth / Storage** | Supabase |
| **Hosting** | Frontend on Vercel · Backend on Render |

<br />

## Project Structure

```
gtu_site/
├── backend/                    # FastAPI Python backend
│   ├── main.py                  # API server (entry point)
│   ├── que_extracter.py         # Extracts questions from paper PDFs
│   ├── group_topics.py          # Clusters/ranks questions into topics
│   ├── topic_wise.py            # Topic-wise aggregation
│   ├── unit_wise_topic.py       # Unit-wise aggregation
│   ├── topics.py                # Topic utilities
│   ├── rebuild.py               # One-shot pipeline runner for a subject
│   ├── show_report.py           # CLI inspection of topic rankings
│   ├── subjects/                # One folder per subject
│   │   └── <code>/
│   │       ├── papers/*.pdf          # Past question papers
│   │       ├── all_questions.json    # Extracted questions
│   │       ├── all_topics.json       # Raw topic clusters
│   │       ├── topic_cards.json      # Ranked topic cards (served to frontend)
│   │       ├── website_data.json     # Unit-wise question data
│   │       └── syllabus_info.json    # Syllabus metadata + PDF path
│   └── requirements.txt
│
└── frontend/                   # React + Vite + Tailwind frontend
    ├── src/
    │   ├── pages/                # Home, Subject, NotFound
    │   ├── components/           # Navbar, SubjectCard, TopicCard, UnitTabs, ...
    │   ├── services/              # api.js, subjects.js
    │   └── lib/supabase.js
    └── package.json
```

<br />

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- npm

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API runs at `http://localhost:8000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

To point the frontend at a non-default API URL, create a `.env` file in `frontend/`:

```env
VITE_API_BASE_URL=http://localhost:8000
```

<br />

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `GET` | `/` | API info |
| `GET` | `/subjects` | List all available subjects with metadata |
| `GET` | `/subject/{code}` | Topic cards + unit-wise question data for a subject |
| `GET` | `/subject/{code}/papers` | List available past papers for a subject |
| `GET` | `/subject/{code}/paper/{filename}` | Download a specific paper PDF |
| `GET` | `/subject/{code}/syllabus` | Download the subject's syllabus PDF |
| `PUT` | `/subject/{code}/meta` | Set a subject's display name / short code / blurb |

<br />

## Available Subjects

| Code | Subject | | Code | Subject |
|---|---|---|---|---|
| `ada` | Analysis and Design of Algorithms | | `dv` | Data Visualization |
| `ajp` | Advanced Java Programming | | `mi` | Microprocessor and Interfacing |
| `bd` | Big Data Analytics | | `oop` | Object Oriented Programming |
| `be` | Basic Electronics Engineering | | `os` | Operating Systems |
| `bee` | Basic Electrical Engineering | | `pds` | Python for Data Science |
| `bme` | Basic Mechanical Engineering | | `phy` | Physics |
| `cc` | Cloud Computing | | `pps` | Programming for Problem Solving |
| `chem` | Chemistry | | `ps` | Probability and Statistics |
| `cn` | Computer Networks | | `ss` | System Software |
| `coa` | Computer Organization & Architecture | | `wad` | Web Application Development |
| `dbms` | Database Management System | | | |
| `df` | Digital Fundamentals | | | |
| `dfs` | Digital Forensics | | | |
| `dmt` | Data Mining Techniques | | | |
| `ds` | Data Structures | | | |

New subjects can be added by dropping paper PDFs into `backend/subjects/<code>/papers/` and running the extraction pipeline — no frontend changes needed, since `/subjects` returns the full subject list dynamically.

<br />

## Regenerating Topic Data

The `backend/` scripts form the offline analysis pipeline. Run these after adding new paper PDFs to refresh a subject's data:

1. **`que_extracter.py`** — pulls raw questions out of each paper PDF
2. **`group_topics.py` / `topics.py` / `topic_wise.py` / `unit_wise_topic.py`** — cluster and rank questions into topics, unit by unit
3. **`rebuild.py`** — regenerates everything for a subject in one go
4. **`show_report.py`** — inspects the resulting topic rankings from the CLI

This refreshes `all_questions.json`, `all_topics.json`, `topic_cards.json`, and `website_data.json` for the subject.

<br />

## Contributing

Contributions are welcome — whether that's adding a new subject's papers, improving the extraction/clustering pipeline, or polishing the frontend. Feel free to open an issue or submit a pull request.

<br />

## Disclaimer

Not affiliated with Gujarat Technological University. Built for students, by students.
