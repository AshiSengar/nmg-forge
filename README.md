# ⚡ NMG Forge — Kanban Board

> **Full-stack Kanban Board built for the NMG Forge Qualifier using a collaborative two-agent development workflow**
> 
![Laravel](https://img.shields.io/badge/Laravel-11-FF2D20?logo=laravel&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite&logoColor=white)

---

## 📋 Project Description

NMG Forge Kanban Board is a full-stack Kanban-based project management application developed through a collaborative two-agent AI workflow. Hermes acted as the planner and orchestrator, while OpenClaw served as the coding agent responsible for implementation and feature development.

The application enables users to organize projects through boards, lists, and cards while providing an intuitive workflow for task tracking, collaboration, and progress management.

---

## 🧠 Two-Agent Architecture

| Agent | Role | Model |
|--------|--------|--------|
| **Hermes** | Planner & Orchestrator | Google Gemini 2.5 Flash |
| **OpenClaw** | Coding Agent | Google Gemini 2.5 Flash |

---

## 🏗️ Tech Stack

| Layer | Technology |
|---------|-------------|
| Backend | Laravel 11, PHP 8.2+ |
| Database | SQLite |
| API | RESTful JSON |
| Frontend | React 18 + Vite |
| Styling | CSS |
| Drag & Drop | HTML5 Native Drag API |
| Frontend Deployment | Vercel |
| Backend Deployment | LocalTunnel / Render |

---

## ✅ Features

- Multiple boards with tab switching
- Create, rename, and delete lists
- Create, edit, and delete task cards
- Native drag-and-drop card movement
- Colored tags and labels
- Member assignment
- Due date tracking
- Overdue task highlighting
- Activity log and comments
- Board summary statistics
- Responsive user interface
- RESTful API architecture

---

## 🖼️ Project Preview

## Dashboard & Workflow Management

![Dashboard](https://github.com/AshiSengar/nmg-forge/blob/main/frontend/src/frontend%20workflow.png?raw=true)

## REST API Backend Workflow

![API](https://github.com/AshiSengar/nmg-forge/blob/main/frontend/src/backend%20workflow.png?raw=true)

---

## 🏗️ System Architecture

```text
React Frontend
      │
      ▼
Laravel REST API
      │
      ▼
SQLite Database
```

---

## 📁 Project Structure

```text
nmg-forge/
├── backend/
│   ├── app/
│   ├── bootstrap/
│   ├── config/
│   ├── database/
│   ├── public/
│   ├── routes/
│   ├── storage/
│   ├── .env.example
│   ├── artisan
│   └── composer.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── vercel.json
│   └── vite.config.js
│
├── hermes-config.yaml
├── openclaw.json
├── setup.sh
├── .gitignore
└── README.md
```

---

## 🤖 Agent Workflow

- Hermes handled planning, task decomposition, and workflow orchestration.
- OpenClaw implemented application features and code generation tasks.
- Both agents collaborated through a structured workflow to deliver the final application.

---

## 🚀 Future Scope

- Authentication & Authorization
- Real-Time Collaboration
- File Attachments
- Notifications & Reminders
- Team Workspaces
- Advanced Analytics

---

### Built for NMG Forge 

****Built with Laravel, React, SQLite, and a collaborative AI-assisted development workflow.****
