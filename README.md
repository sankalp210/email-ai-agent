
# 📬 Email AI Agents - Smart Email Automation

This project uses **AI-powered agents** to automate email processing. It reads emails, categorizes them, drafts and proofreads responses, and sends replies (with or without attachments).

---

## 🚀 Features

- 🔍 Fetches recent emails via Gmail API
- 🧠 Categorizes emails using AI agents
- ✍️ Drafts intelligent responses
- 🪄 Proofreads replies before sending
- 📎 Attaches PDFs for claims when needed
---

## 🧱 Project Structure

```
project-root/
├── backend/
│   ├── index.js             # Email automation logic
│   ├── server.js            # Express server (API & attachments)
│   ├── new.json             # Stores processed responses
│   ├── attachments/         # Folder for invoice PDFs
│   └── agents/ & utils/     # AI and Gmail logic
├── frontend/
│   ├── EmailResponses.jsx   # React UI component
│   ├── EmailResponses.css   # Dark theme + table styling
│   └── App.jsx / main.jsx   # React entry point
└── README.md
```

---

## ⚙️ Setup Instructions

### 1️⃣ Backend Setup

Open **two terminals** for the backend:

#### Terminal 1 - Run automation script:

```bash
cd backend
npm install
node index.js
```

> ✨ You’ll be asked how many emails to process.

#### Terminal 2 - Start API server:

```bash
cd backend
node server.js
```

> API runs at `http://localhost:5000`, including `/responses` and `/attachments`.

---

### 2️⃣ Frontend Setup

In a **third terminal**:

```bash
cd frontend
npm install
npm run dev
```

> React app runs at `http://localhost:5173` by default.
---

