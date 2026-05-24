# DSO101 Assignment 3: GitHub Actions CI/CD Workflow

## Objective
Configure a GitHub Actions workflow to automate:
1. Building Docker containers for both backend and frontend applications
2. Pushing containers to DockerHub
3. Deploying containers on Render.com

---

## Project Structure
```
DSO101/
├── Ugyen Kinley Phuntshok_02240337_DSO101_A1/
│   ├── backend/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── server.js
│   ├── frontend/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── src/
│   └── docker-compose.yml
├── .github/
│   └── workflows/
│       └── docker-publish.yml
└── render.yaml
```

---

## Task 1: GitHub Repository Verification ✅

### 1.1 Package.json Scripts
**Backend (`package.json`):**
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

**Frontend (`package.json`):**
```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  }
}
```

✅ **Status:** Both have relevant scripts for building and starting applications.

### 1.2 Repository Status
✅ **Status:** Repository is public and accessible at: `https://github.com/Ugyenk/DSO101`

---

## Task 2: Dockerfile Verification ✅

### 2.1 Backend Dockerfile
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN rm -f .env .env.local .env.development .env.test
EXPOSE 5000
CMD ["node", "server.js"]
```

✅ **Verified:** Uses Node.js LTS (18-alpine), installs dependencies, exposes port 5000.

### 2.2 Frontend Dockerfile
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL
RUN npm run build

FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/build /usr/share/nginx/html
RUN printf 'server {...}' > /etc/nginx/conf.d/default.conf
```

✅ **Verified:** Multi-stage build, React build optimization, nginx serving, SPA routing support.

---

## Task 3: GitHub Actions Workflow ✅

### 3.1 Workflow File: `.github/workflows/docker-publish.yml`

```yaml
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      # 1. Checkout code
      - name: Checkout Repository
        uses: actions/checkout@v4

      # 2. Login to DockerHub
      - name: Login to DockerHub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      # 3. Build and Push Backend Docker Image
      - name: Build and Push Backend Image
        run: |
          docker build -t ${{ secrets.DOCKERHUB_USERNAME }}/todo-backend:latest ./Ugyen\ Kinley\ Phuntshok_02240337_DSO101_A1/backend
          docker push ${{ secrets.DOCKERHUB_USERNAME }}/todo-backend:latest

      # 4. Build and Push Frontend Docker Image
      - name: Build and Push Frontend Image
        run: |
          docker build -t ${{ secrets.DOCKERHUB_USERNAME }}/todo-frontend:latest ./Ugyen\ Kinley\ Phuntshok_02240337_DSO101_A1/frontend
          docker push ${{ secrets.DOCKERHUB_USERNAME }}/todo-frontend:latest

      # 5. Deploy to Render.com (via webhook)
      - name: Trigger Render Deployment
        run: |
          curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK_URL }}
```

**Workflow Features:**
- Triggers on push to `main` branch
- Builds both backend and frontend separately
- Pushes to DockerHub with `:latest` tag
- Triggers Render deployment webhook

---

## Task 4: GitHub Secrets Configuration ✅

### Required Secrets to Add:

| Secret Name | Description | Where to Find |
|---|---|---|
| `DOCKERHUB_USERNAME` | Your Docker Hub username | Docker Hub Profile |
| `DOCKERHUB_TOKEN` | Docker Hub Personal Access Token | Docker Hub → Account Settings → Security → New Access Token |
| `RENDER_DEPLOY_HOOK_URL` | Render deployment webhook | Render Dashboard → Service → Deploy → Settings → Deploy Hook |

### How to Add Secrets:
1. Go to GitHub Repository → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add each secret name and value
4. Save

---

## Challenges Faced & Solutions

### Challenge 1: Subfolder Path in Repository
**Problem:** Project is in a subfolder `Ugyen Kinley Phuntshok_02240337_DSO101_A1/` which has spaces in the name.

**Solution:** Used escaped paths in Docker build commands:
```bash
docker build -t image:latest ./Ugyen\ Kinley\ Phuntshok_02240337_DSO101_A1/backend
```

### Challenge 2: Frontend Build Arguments
**Problem:** React app needs `REACT_APP_API_URL` environment variable at build time.

**Solution:** Used Docker build arguments (ARG) in multi-stage build to inject the API URL:
```dockerfile
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL
```

### Challenge 3: Render Deployment Automation
**Problem:** Render doesn't automatically redeploy when new images are pushed to DockerHub.

**Solution:** Used Render's deployment webhook endpoint to trigger manual redeployment:
```bash
curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK_URL }}
```

---

## Learning Outcomes

1. **GitHub Actions:** Learned to create CI/CD workflows with GitHub Actions, including:
   - Workflow triggers (on push)
   - Job execution with steps
   - Secret management for credentials
   - Docker login and image pushing

2. **Docker Best Practices:**
   - Multi-stage builds for optimizing image size
   - Layer caching with package.json placement
   - Using alpine images for smaller footprints
   - Build arguments for environment-specific configuration

3. **Container Registry Management:**
   - DockerHub authentication and image pushing
   - Image naming conventions with usernames and tags
   - Access token security instead of passwords

4. **Deployment Automation:**
   - Render deployment webhook integration
   - Automating deployments on code changes
   - Infrastructure-as-code with render.yaml

---

## Deployment Steps

### Step 1: Local Testing
```bash
# Build backend
docker build -t todo-backend:latest ./Ugyen\ Kinley\ Phuntshok_02240337_DSO101_A1/backend

# Build frontend
docker build -t todo-frontend:latest ./Ugyen\ Kinley\ Phuntshok_02240337_DSO101_A1/frontend

# Run with docker-compose
docker-compose -f ./Ugyen\ Kinley\ Phuntshok_02240337_DSO101_A1/docker-compose.yml up
```

### Step 2: Configure Secrets
Add the three required secrets in GitHub repository settings.

### Step 3: Create Render Services
1. Log in to Render.com
2. Create new Web Service for backend (connect DockerHub)
3. Create new Web Service for frontend (connect DockerHub)
4. Configure environment variables
5. Get deployment webhook URLs

### Step 4: Push to GitHub
```bash
git add .github/workflows/docker-publish.yml
git commit -m "Add GitHub Actions CI/CD workflow"
git push origin main
```

The workflow will automatically trigger and:
- Build both images
- Push to DockerHub
- Deploy to Render

---

## Expected Outcomes

✅ **GitHub Actions Workflow:** Automatic build and push on code changes
✅ **DockerHub Images:** Both backend and frontend images available
✅ **Render Deployment:** Automatic deployment triggered via webhook
✅ **Continuous Deployment:** Every push to main triggers the complete pipeline

---

## Repository Links

- **GitHub Repository:** https://github.com/Ugyenk/DSO101
- **Workflow File:** `.github/workflows/docker-publish.yml`
- **DockerHub:** [Your username]/todo-backend and [Your username]/todo-frontend
- **Render Deployment:** [To be configured]

---

## Conclusion

This assignment demonstrates a complete CI/CD pipeline from code push to cloud deployment. The automation ensures code quality, consistent containerization, and seamless deployment to production environments.

