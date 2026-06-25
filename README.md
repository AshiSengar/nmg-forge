# ⚡ NMG Forge — Kanban Board

> **Qualifier Kanban Board built by a Two-Agent AI System**  
> Full-stack Trello-style task management application built during the Forge 2 online qualifier.

[![Laravel](https://img.shields.io/badge/Laravel-11-FF2D20?logo=laravel)](https://laravel.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://reactjs.org)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)](https://vitejs.dev)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite)](https://sqlite.org)

---

## 📋 Project Description

NMG Forge Kanban Board is a full-stack task management application built entirely by a cooperative two-agent AI system — **Hermes** (the brain) and **OpenClaw** (the hands) — communicating through Slack to plan, write, test, and deploy a complete web application from scratch.

---

## 🧠 The Two-Agent System

| Agent | Role | Model |
|-------|------|-------|
| **Hermes** | Planner / Orchestrator | Google Gemini 2.5 Flash |
| **OpenClaw** | Coder / Executor | Google Gemini 2.5 Flash (OpenAI compat) |

**Slack channels:**
- `#sprint-main` → Human ↔ Hermes
- `#agent-coder` → Hermes → OpenClaw tasks
- `#agent-log` → Unified audit trail

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Laravel 11, PHP 8.2+ |
| Database | SQLite (zero-config, file-based) |
| API | RESTful JSON |
| Frontend | React 18 + Vite 5 |
| Styling | Pure CSS (no UI frameworks) |
| Drag & Drop | HTML5 native Drag API |
| Frontend Deploy | Vercel |
| Backend Expose | Localtunnel |

---

## ✅ Features

- [x] Multiple boards with tab switching
- [x] Create / rename / delete lists
- [x] Create / edit / delete cards via modal
- [x] Drag-and-drop cards between lists (HTML5 native)
- [x] Colored tags — attach/detach from cards
- [x] Member assignment — avatars shown on cards
- [x] Overdue flag — cards past due date glow red
- [x] Board summary bar — live counts
- [x] Activity log and comments on each card
- [x] Two-agent AI build system (Hermes + OpenClaw via Slack)
- [x] Vercel deployment config
- [x] Localtunnel backend exposure

---

## 🗄️ Database Schema

```
boards          id, name, timestamps
board_lists     id, board_id (FK), name, position, timestamps
cards           id, list_id (FK), title, description, due_date, position, timestamps
tags            id, name, color (hex)
members         id, name, email
card_tag        card_id, tag_id       (pivot)
card_member     card_id, member_id    (pivot)
card_activities id, card_id, member_id, type, content, timestamps
```

---

## 🔌 API Endpoints

| Method | Endpoint | Action |
|--------|----------|--------|
| GET | `/api/boards` | List all boards |
| POST | `/api/boards` | Create a board |
| GET | `/api/boards/{id}` | Get board with lists & cards |
| DELETE | `/api/boards/{id}` | Delete a board |
| POST | `/api/boards/{id}/lists` | Add a list |
| PUT | `/api/lists/{id}` | Rename a list |
| DELETE | `/api/lists/{id}` | Delete a list |
| POST | `/api/lists/{id}/cards` | Create a card |
| PUT | `/api/cards/{id}` | Update card |
| PATCH | `/api/cards/{id}/move` | Move card to list |
| DELETE | `/api/cards/{id}` | Delete a card |
| POST | `/api/cards/{id}/tags` | Attach tag |
| DELETE | `/api/cards/{id}/tags/{tagId}` | Detach tag |
| POST | `/api/cards/{id}/members` | Assign member |
| DELETE | `/api/cards/{id}/members/{memberId}` | Unassign member |
| GET | `/api/tags` | List all tags |
| POST | `/api/tags` | Create a tag |
| GET | `/api/members` | List all members |
| POST | `/api/members` | Create a member |
| GET | `/api/cards/{id}/activities` | Get activity log |
| POST | `/api/cards/{id}/comments` | Post a comment |

---

## 🚀 Quick Start

### Prerequisites

- PHP 8.2+
- Composer
- Node.js 18+
- npm
- Git

### Option A — Automated Setup

```bash
git clone https://github.com/YOUR_USERNAME/nmg-forge.git
cd nmg-forge
chmod +x setup.sh
./setup.sh
```

### Option B — Manual Setup

#### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/nmg-forge.git
cd nmg-forge
```

#### 2. Backend setup

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate:fresh --seed
```

#### 3. Frontend setup

```bash
cd ../frontend
npm install
cp .env.example .env
# Edit .env → set VITE_API_BASE_URL=http://localhost:8000/api
```

#### 4. Run both servers

```bash
# Terminal 1
cd backend && php artisan serve --port=8000

# Terminal 2
cd frontend && npm run dev
```

Open **http://localhost:5173** — the Kanban board loads with demo data.

---

## 🌐 Deployment

### Frontend → Vercel

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import repo
3. Set **Root Directory**: `frontend`
4. Set **Build Command**: `npm run build`
5. Set **Output Directory**: `dist`
6. Add env var: `VITE_API_BASE_URL` = your backend URL
7. Deploy

### Backend → Localtunnel (quick)

```bash
npm install -g localtunnel
cd backend
php artisan serve --port=8000
# In another terminal:
lt --port 8000 --subdomain nmg-forge-yourname
```

Your backend is now public at `https://nmg-forge-yourname.loca.lt`

Update Vercel env var `VITE_API_BASE_URL` to `https://nmg-forge-yourname.loca.lt/api` and redeploy.

### Backend → Railway / Render (permanent)

For permanent hosting, deploy the `backend/` folder to [Railway](https://railway.app) or [Render](https://render.com).

---

## 🤖 Agent System Setup

### Slack App Setup

1. Go to [api.slack.com/apps](https://api.slack.com/apps) → Create New App
2. Enable **Socket Mode** → get `xapp-` token
3. Enable **Event Subscriptions** → subscribe to `message.channels`, `message.groups`, `app_mention`
4. Add **Bot Scopes**: `channels:read`, `channels:history`, `groups:history`, `chat:write`, `app_mentions:read`
5. Install to workspace → get `xoxb-` bot token
6. Create channels: `#sprint-main`, `#agent-coder`, `#agent-log`

### Environment Variables

```bash
export SLACK_BOT_TOKEN=xoxb-your-token
export SLACK_APP_TOKEN=xapp-your-token
export GEMINI_API_KEY=your-gemini-key
```

### Run Hermes

```bash
pip install hermes-ai
hermes --platform slack --config hermes-config.yaml
```

### Run OpenClaw

```bash
npm install -g @openclaw/cli
openclaw gateway run
```

Then type in `#sprint-main` and watch the agents build!

---

## 📁 Project Structure

```
nmg-kanban/
├── backend/
│   ├── app/
│   │   ├── Http/Controllers/Api/
│   │   │   ├── BoardController.php
│   │   │   ├── ListController.php
│   │   │   ├── CardController.php
│   │   │   ├── TagController.php
│   │   │   ├── MemberController.php
│   │   │   └── CardActivityController.php
│   │   ├── Models/
│   │   │   ├── Board.php
│   │   │   ├── BoardList.php
│   │   │   ├── Card.php
│   │   │   ├── Tag.php
│   │   │   ├── Member.php
│   │   │   └── CardActivity.php
│   │   └── Providers/
│   │       └── AppServiceProvider.php
│   ├── bootstrap/
│   │   ├── app.php
│   │   └── providers.php
│   ├── config/
│   │   └── cors.php
│   ├── database/
│   │   ├── migrations/
│   │   │   ├── 2024_01_01_000001_create_boards_table.php
│   │   │   ├── 2024_01_01_000002_create_board_lists_table.php
│   │   │   ├── 2024_01_01_000003_create_cards_table.php
│   │   │   └── 2024_01_01_000004_create_tags_members_activities.php
│   │   ├── seeders/
│   │   │   └── DatabaseSeeder.php
│   │   └── database.sqlite          ← auto-created on setup
│   ├── public/
│   │   └── index.php
│   ├── routes/
│   │   ├── api.php
│   │   └── console.php
│   ├── .env.example
│   ├── .gitignore
│   ├── artisan
│   └── composer.json
├── frontend/
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── App.jsx          ← Main board UI
│   │   ├── CardModal.jsx    ← Card detail modal
│   │   ├── api.js           ← API client
│   │   ├── index.css        ← All styles
│   │   └── main.jsx         ← React entry
│   ├── .env.example
│   ├── .gitignore
│   ├── index.html
│   ├── package.json
│   ├── vercel.json
│   └── vite.config.js
├── hermes-config.yaml       ← Hermes agent config
├── openclaw.json            ← OpenClaw agent config
├── setup.sh                 ← Automated setup script
├── .gitignore
└── README.md
```

---

## 🎯 Key Design Decisions

1. **SQLite** — Zero infra setup; entire database is one file. Perfect for a hackathon.
2. **No auth** — Intentionally skipped to focus on agent collaboration.
3. **Native Drag API** — No third-party DnD library. Lightweight frontend.
4. **OpenAI compat for Gemini** — OpenClaw uses Gemini's OpenAI-compatible endpoint to bypass Groq rate limits.
5. **Slack as message bus** — Every agent action is visible, loggable, and human-reviewable in real time.

---

## 📄 License

MIT — built during NMG Forge 2 qualifier.
