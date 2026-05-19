# ThesisMate AI 🎓🤖

### **Your Premium AI Academic Co-Pilot & Thesis Auditing Suite**

**ThesisMate AI** is a state-of-the-art academic workspace application designed to streamline literature reviews, track supervisor feedback registers, analyze writing drafts, and verify academic criteria compliance in research papers. 

Powered by **Next.js 14 (App Router)**, **TypeScript**, **Prisma**, **SQLite**, and **Tailwind CSS**, it features a fully responsive, premium dark-mode glassmorphic dashboard tailored for modern graduate and postgraduate researchers.

---

## 🌟 Premium Features

### 1. 🔑 Live LLM RAG & Dynamic API panel
- **Dual Engine Integration**: Connect your custom **OpenAI** (`gpt-4o-mini`, `gpt-4o`) or **Gemini** (`gemini-1.5-flash`, `gemini-1.5-pro`) API keys.
- **Live RAG (Retrieval-Augmented Generation)**: The co-pilot dynamically retrieves your uploaded sources and supervisor comment logs to construct highly robust, contextual prompts—answering questions specifically tailored to your thesis.

### 2. 🎓 Academic Citation Generator
- **Multi-Format Formatter**: Select any cataloged document and instantly generate citations in **APA (7th Edition)**, **MLA (9th Edition)**, **Harvard**, **Chicago Manual**, and **IEEE** styles.
- **Copy-Paste Flow**: One-click "Copy to Clipboard" buttons with active indicator alerts.

### 3. ✍️ Scholarly Tone & Colloquialisms Checker
- **Tone Sandbox**: Paste writing drafts to scan for informal or colloquial expressions (e.g., "basically", "think", "bad", "very").
- **Scholarly Substitutes**: Highlights colloquial words and maps them to formal academic alternatives (e.g., "fundamentally", "postulate", "detrimental").
- **Academic Score**: Computes an overall **Academic Vocabulary Score** dynamically.

### 4. 📄 Printable Supervisor Revisions Report
- **Formal Export**: Compile your active supervisor comment log into a clean, print-ready document template optimized for Print-to-PDF.
- **Academic Structure**: Includes chapter completion checklists, priority status, signature blocks for both candidate and supervisor, and formal layout stylesheets.

### 5. 📌 Document Excerpt Annotations Notepad
- **Analytical Reflections**: Extract and save highlighted quotes from bibliography documents, attach analytic notes/hypotheses, and persist them in the local SQLite database.

### 6. 📂 Full Thesis Draft Audit & AI Detector
- **Draft Sandbox**: Drag and drop complete `.pdf`, `.docx`, or `.txt` drafts.
- **AI Written Probability (AI Oranı)**: Analyzes sentence length variation, paragraph transition densities (e.g., "moreover", "therefore"), and passive structures to compute a heuristic AI-written percentage score.
- **Bibliography Cross-Reference Checker**: Scans the text for citation markers (e.g., `(Banister, 2020)`) and matches them against your cataloged sources. Flags missing citations as warnings.
- **Readability Index**: Identifies sentences exceeding 30 words and passive voice density with active grammar improvements guides.
- **Printable Audit Report**: Export the comprehensive draft audit dashboard as a professional printable PDF.

---

## 🛠️ Technology Stack
- **Framework**: [Next.js 14 (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescript.org/)
- **Database ORM**: [Prisma Client](https://www.prisma.io/)
- **Database Engine**: [SQLite](https://www.sqlite.org/) (Zero-config local MVP development)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🚀 Quick Start Guide

Follow these steps to run ThesisMate AI locally on your machine:

### 1. Clone the repository and install dependencies
```bash
git clone https://github.com/Papazinmakinesi/thesismate-ai.git
cd thesismate-ai
npm install
```

### 2. Configure Environment variables
Create a `.env` file in the root directory and define the local SQLite database path:
```env
DATABASE_URL="file:./dev.db"
```

### 3. Sync Database Schema and Seed Sample Data
Push the schema to your local SQLite database and populate sample records:
```bash
npx prisma db push
npx prisma db seed
```

### 4. Run the Development Server
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser to launch the application.

---

## 📂 Project Architecture
```text
thesismate-ai/
├── app/
│   ├── api/                  # API endpoints (RAG, upload, comments, annotations)
│   ├── chapter-checker/      # Tone Checker & Full Thesis Audit views
│   ├── source-manager/       # Bibliography Library, Citation output & Notepad
│   ├── supervisor-comments/  # Supervisor revisions log & Print report templates
│   ├── settings/             # Thesis working details & API credentials
│   ├── layout.tsx            # Navigation Sidebar & Global Shell Layout
│   └── page.tsx              # Main Dashboard analytics snapshot
├── prisma/
│   ├── schema.prisma         # Database models (Thesis, Source, Annotation, Comment)
│   └── seed.ts               # Core database seed script
└── styles/
    └── globals.css           # Styling system & Tailwind configurations
```
