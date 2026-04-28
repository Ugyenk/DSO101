# Taskflow — Todo List App
### DSO101 Assignment 1 | CI/CD Pipeline
**Student Name:** `<Ugyen Kinley Phuntshok>`  
**Student Number:** `<02240337>`  

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Repository Structure](#repository-structure)
4. [Step 0 — Local Setup](#step-0--local-setup)
5. [Part A — Docker Hub Deployment](#part-a--docker-hub-deployment)
6. [Part B — Git-triggered Auto Deployment](#part-b--git-triggered-auto-deployment)
7. [Environment Variables Reference](#environment-variables-reference)
8. [API Reference](#api-reference)

---

## Project Overview

**Taskflow** is a full-stack to-do list web application built with:
- A **React** single-page frontend
- A **Node.js / Express** REST API backend
- A **PostgreSQL** relational database

The project demonstrates a full **CI/CD pipeline** using Docker Hub and Render.com — from local development to automated production deployments.

---

## Tech Stack

| Layer    | Technology            |
|----------|-----------------------|
| Frontend | React 18, nginx       |
| Backend  | Node.js 18, Express 4 |
| Database | PostgreSQL 15         |
| Registry | Docker Hub            |
| Hosting  | Render.com            |
| CI/CD    | GitHub Actions        |

---

## Repository Structure

```
studentname_studentnumber_DSO101_A1/
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js          # Main React component (UI)
│   │   ├── App.css         # Styles
│   │   ├── api.js          # API service layer
│   │   └── index.js        # React entry point
│   ├── .dockerignore
│   ├── .env.example        # Template — never commit actual .env
│   ├── .env.production     # Build-time vars for production
│   ├── Dockerfile          # Multi-stage build (React → nginx)
│   └── package.json
├── backend/
│   ├── server.js           # Express API + DB logic
│   ├── .dockerignore
│   ├── .env.example        # Template — never commit actual .env
│   ├── Dockerfile
│   └── package.json
├── .github/
│   └── workflows/
│       └── docker-publish.yml   # GitHub Actions CI/CD
├── .gitignore
├── docker-compose.yml           # Local dev orchestration
├── render.yaml                  # Render Blueprint (Part B)
└── README.md
```

---

## Step 0 — Local Setup

### Prerequisites
- [Node.js 18+](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Git](https://git-scm.com/)
- [PostgreSQL](https://www.postgresql.org/) (or use Docker)

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/studentname_studentnumber_DSO101_A1.git
cd studentname_studentnumber_DSO101_A1
```

### 2. Configure environment variables

**Backend** — create `backend/.env` from the example:
```bash
cp backend/.env.example backend/.env
```
Edit `backend/.env`:
```env
PORT=5000
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=tododb
DB_PORT=5432
DB_SSL=false
FRONTEND_URL=http://localhost:3000
```

**Frontend** — create `frontend/.env` from the example:
```bash
cp frontend/.env.example frontend/.env
```
Edit `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000
```

> ⚠️ **IMPORTANT:** Both `.env` files are listed in `.gitignore` and will **never** be committed to Git.

### 3. Run with Docker Compose (recommended)
```bash
docker-compose up --build
```
This spins up all three services (db, backend, frontend) together.

| Service  | URL                     |
|----------|-------------------------|
| Frontend | http://localhost:3000   |
| Backend  | http://localhost:5000   |
| Database | localhost:5432          |

**Screenshot — App running locally:**

![Logo](Ugyen Kinley Phuntshok_02240337_DSO101_A1\Screenshot 2026-03-22 212426.png)

### 4. Run manually (without Docker)

**Start the database** (using Docker):
```bash
docker run -d \
  --name todo-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=tododb \
  -p 5432:5432 \
  postgres:15-alpine
```

**Start the backend:**
```bash
cd backend
npm install
node server.js
# Server running on port 5000 ✅
```

**Start the frontend:**
```bash
cd frontend
npm install
npm start
# App opens at http://localhost:3000 ✅
```

**Screenshot — Backend health check:**

![alt text](Screenshot 2026-03-22 212632.png)

---

## Part A — Docker Hub Deployment

### Step A1 — Build Docker images

Replace `yourdockerhub` with your Docker Hub username and `02190108` with **your student ID**.

**Build backend image:**
```bash
docker build -t yourdockerhub/be-todo:02190108 ./backend
```

**Build frontend image:**
```bash
docker build \
  --build-arg REACT_APP_API_URL=https://be-todo.onrender.com \
  -t yourdockerhub/fe-todo:02190108 \
  ./frontend
```

**Screenshot — Successful docker build output:**

![alt text](Screenshot 2026-03-22 214711.png)


### Step A2 — Push images to Docker Hub

**Login to Docker Hub:**
```bash
docker login
# Enter your Docker Hub username and password/token
```

**Push both images:**
```bash
docker push yourdockerhub/be-todo:02190108
docker push yourdockerhub/fe-todo:02190108
```

**Screenshot — Docker Hub showing pushed images:**

> 📸 *[Insert screenshot of hub.docker.com showing your be-todo and fe-todo repositories with the tag matching your student ID]*

### Step A3 — Deploy Backend on Render.com

1. Go to [render.com](https://render.com) → **New** → **Web Service**
2. Select **"Deploy an existing image from a registry"**
3. Enter the image URL: `yourdockerhub/be-todo:02190108`
4. Set the service name to `be-todo`
5. Select the **Free** plan
6. Under **Environment Variables**, add:

| Key           | Value                          |
|---------------|--------------------------------|
| `NODE_ENV`    | `production`                   |
| `PORT`        | `5000`                         |
| `DB_HOST`     | *(from Render PostgreSQL dashboard)* |
| `DB_USER`     | *(from Render PostgreSQL dashboard)* |
| `DB_PASSWORD` | *(from Render PostgreSQL dashboard)* |
| `DB_NAME`     | `tododb`                       |
| `DB_PORT`     | `5432`                         |
| `DB_SSL`      | `true`                         |

7. Click **Deploy**

**Screenshot — Render backend environment variables:**

> 📸 *[Insert screenshot of Render's environment variables panel for be-todo]*

**Screenshot — Render backend service live:**

> 📸 *[Insert screenshot of Render dashboard showing be-todo as "Live" with its URL]*

### Step A4 — Create PostgreSQL Database on Render

1. Go to Render → **New** → **PostgreSQL**
2. Name: `todo-db`, Plan: **Free**
3. Click **Create Database**
4. Copy the **Host**, **Username**, **Password**, and **Database** values into the backend service's environment variables (Step A3)

**Screenshot — Render PostgreSQL dashboard:**

> 📸 *[Insert screenshot of the Render PostgreSQL service showing connection details]*

### Step A5 — Deploy Frontend on Render.com

1. Go to Render → **New** → **Web Service**
2. Select **"Deploy an existing image from a registry"**
3. Enter: `yourdockerhub/fe-todo:02190108`
4. Name: `fe-todo`
5. Add environment variable:

| Key                  | Value                             |
|----------------------|-----------------------------------|
| `REACT_APP_API_URL`  | `https://be-todo.onrender.com`    |

6. Click **Deploy**

**Screenshot — Render frontend service live:**

> 📸 *[Insert screenshot of Render dashboard showing fe-todo as "Live"]*

**Screenshot — Full app working on Render URLs:**

> 📸 *[Insert screenshot of the Todo app working at https://fe-todo.onrender.com]*

---

## Part B — Git-triggered Auto Deployment

In Part B, Render builds and deploys a **new image automatically on every git push** using a `render.yaml` Blueprint file — no manual Docker build/push required.

### How it works

```
git push → GitHub → Render detects render.yaml → builds Docker images → deploys all services
```

### Step B1 — Review the render.yaml

The `render.yaml` at the root of this repo declares all services:

```yaml
databases:
  - name: todo-db
    plan: free
    databaseName: tododb

services:
  - type: web
    name: be-todo
    env: docker
    dockerfilePath: ./backend/Dockerfile
    ...
  - type: web
    name: fe-todo
    env: docker
    dockerfilePath: ./frontend/Dockerfile
    ...
```

Render reads this file and handles orchestration automatically — similar to how `docker-compose.yml` works locally.

### Step B2 — Connect GitHub repo to Render

1. Go to [render.com](https://render.com) → **New** → **Blueprint**
2. Connect your GitHub account if not already connected
3. Select the repository: `studentname_studentnumber_DSO101_A1`
4. Render will detect `render.yaml` automatically
5. Review the services to be created, then click **Apply**

**Screenshot — Render Blueprint detection:**

> 📸 *[Insert screenshot of Render showing it has detected render.yaml and listing the services to deploy]*

### Step B3 — Set environment secrets in Render dashboard

Any **secret** values (DB passwords, etc.) that are not hardcoded in `render.yaml` must be set manually in the Render dashboard:

1. Open each service → **Environment** tab
2. Add sensitive values that were left as placeholders in `render.yaml`

**Screenshot — Render services auto-created from Blueprint:**

> 📸 *[Insert screenshot of Render dashboard showing all services (be-todo, fe-todo, todo-db) created from the Blueprint]*

### Step B4 — Trigger a deployment via git push

Make a small change (e.g., update this README), commit, and push:

```bash
git add .
git commit -m "feat: trigger auto-deployment test"
git push origin main
```

Watch Render automatically build and deploy:

**Screenshot — Render auto-deployment triggered by git push:**

> 📸 *[Insert screenshot of Render showing a new deployment in progress after the git push]*

**Screenshot — Render deployment logs:**

> 📸 *[Insert screenshot of Render build logs showing Docker build steps]*

**Screenshot — All services live after auto-deploy:**

> 📸 *[Insert screenshot of all services showing "Live" status in Render dashboard]*

### Step B5 — GitHub Actions (Bonus: push to Docker Hub on each commit)

The `.github/workflows/docker-publish.yml` workflow automatically builds and pushes updated images to Docker Hub on every push to `main`.

#### Setup — Add GitHub Secrets

Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**:

| Secret Name          | Value                              |
|----------------------|------------------------------------|
| `DOCKERHUB_USERNAME` | Your Docker Hub username           |
| `DOCKERHUB_TOKEN`    | Docker Hub Access Token (not password) |
| `STUDENT_ID`         | `02190108` (your student ID)       |
| `REACT_APP_API_URL`  | `https://be-todo.onrender.com`     |

> 💡 Generate a Docker Hub Access Token at: hub.docker.com → Account Settings → Security → New Access Token

**Screenshot — GitHub Secrets configured:**

> 📸 *[Insert screenshot of GitHub repository Settings > Secrets showing the secret names (values hidden)]*

**Screenshot — GitHub Actions workflow running:**

> 📸 *[Insert screenshot of GitHub Actions tab showing the workflow running after a push]*

**Screenshot — GitHub Actions workflow succeeded:**

> 📸 *[Insert screenshot of the workflow showing all jobs green / passed]*

---

## Environment Variables Reference

### Backend (`backend/.env`)

| Variable      | Description                          | Example                  |
|---------------|--------------------------------------|--------------------------|
| `PORT`        | Port the server listens on           | `5000`                   |
| `DB_HOST`     | PostgreSQL host                      | `localhost`              |
| `DB_USER`     | PostgreSQL username                  | `postgres`               |
| `DB_PASSWORD` | PostgreSQL password                  | `secret`                 |
| `DB_NAME`     | Database name                        | `tododb`                 |
| `DB_PORT`     | PostgreSQL port                      | `5432`                   |
| `DB_SSL`      | Use SSL for DB connection            | `false` / `true`         |
| `FRONTEND_URL`| Allowed CORS origin                  | `http://localhost:3000`  |

### Frontend (`frontend/.env`)

| Variable              | Description               | Example                          |
|-----------------------|---------------------------|----------------------------------|
| `REACT_APP_API_URL`   | Backend API base URL      | `http://localhost:5000`          |

> ⚠️ All `.env` files are in `.gitignore`. Only `.env.example` files and `.env.production` (with non-secret build-time vars) are committed.

---

## API Reference

Base URL: `https://be-todo.onrender.com` (production) or `http://localhost:5000` (local)

| Method   | Endpoint                  | Description           |
|----------|---------------------------|-----------------------|
| `GET`    | `/health`                 | Health check          |
| `GET`    | `/api/todos`              | Get all todos         |
| `GET`    | `/api/todos/:id`          | Get a single todo     |
| `POST`   | `/api/todos`              | Create a todo         |
| `PUT`    | `/api/todos/:id`          | Update a todo         |
| `PATCH`  | `/api/todos/:id/toggle`   | Toggle complete       |
| `DELETE` | `/api/todos/:id`          | Delete a todo         |

### Example: Create a todo
```bash
curl -X POST https://be-todo.onrender.com/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "Submit DSO101 Assignment", "priority": "high"}'
```

### Example response
```json
{
  "id": 1,
  "title": "Submit DSO101 Assignment",
  "description": null,
  "completed": false,
  "priority": "high",
  "created_at": "2025-03-12T08:00:00.000Z",
  "updated_at": "2025-03-12T08:00:00.000Z"
}
```

---

*DSO101 — Continuous Integration and Continuous Deployment | Bachelor of Engineering in Software Engineering*
