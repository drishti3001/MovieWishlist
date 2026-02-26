# moviewishlist
# 🎬 CineTrack – AI-Powered Movie Recommendation Platform

CineTrack is a full-stack SaaS application that allows users to track movies, create playlists, and receive personalized recommendations using a hybrid machine learning model.

🚀 Live Demo: https://frontend-lni5.onrender.com

---

## 📌 Features

- 🔐 Email & Google OAuth Authentication
- 🎞️ Movie Search (TMDB Integration)
- 📂 Create & Manage Custom Playlists
- 📌 Watchlist Tracking (Plan to Watch / Watching / Watched)
- ⭐ Rating System
- 🤖 Hybrid AI Recommendation Engine
- 🐳 Fully Dockerized Multi-Service Architecture
- ☁️ Deployed on Render Cloud

---

## 🏗️ System Architecture

CineTrack uses a microservice-based architecture:

```
Frontend (React + Vite + Nginx)
        ↓ REST API
Backend (Node.js + Express + Prisma + SQLite)
        ↓ HTTP
ML Service (FastAPI + SVD Recommender)
```

Each service is containerized using Docker and deployed independently.

---

## 🛠️ Tech Stack

### Frontend
- React
- Vite
- React Router
- Google OAuth
- Nginx (Production serving)

### Backend
- Node.js
- Express
- Prisma ORM
- SQLite
- JWT Authentication

### Machine Learning Service
- Python
- FastAPI
- Pandas
- Collaborative Filtering (SVD Matrix Factorization)

### DevOps
- Docker (Multi-container setup)
- Render Cloud Deployment
- Environment Variable Configuration

---

## 🗄️ Database Schema

Core Entities:

- **User**
- **Movie**
- **Watchlist**
- **Playlist**
- **PlaylistMovie**

Watchlist stores:
- status (`plan_to_watch`, `watching`, `watched`)
- rating
- computed score

Prisma ORM manages schema and migrations.

---

## 🤖 Recommendation Engine

CineTrack uses a Hybrid Recommendation System:

### 1️⃣ Collaborative Filtering
- Builds user-item interaction matrix
- Applies SVD-based matrix factorization
- Predicts personalized scores

### 2️⃣ Popularity Fallback
- Handles cold-start users
- Uses top popular movies

### 3️⃣ Hybrid Merge Strategy
- Removes already watched movies
- Fills recommendation slots intelligently

The model precomputes predicted scores on service startup for faster inference.

---

## 🚀 Deployment

The project is deployed on **Render** using Docker.

### Live Services

- Frontend: https://frontend-lni5.onrender.com
- Backend: https://backend-7eqg.onrender.com
- ML Service: https://ml-service-wyms.onrender.com

### Key Deployment Challenges Solved

- Prisma `DATABASE_URL` configuration in cloud
- Absolute SQLite path resolution inside Docker
- OAuth production origin setup
- Multi-service communication in production
- Environment variable management

---

## 🧪 Running Locally

### 1️⃣ Clone the repository

```bash
git clone https://github.com/drishti3001/MovieWishlist.git
cd MovieWishlist
```

### 2️⃣ Run with Docker Compose

```bash
docker-compose up --build
```

Services:
- Frontend → http://localhost
- Backend → http://localhost:4000
- ML Service → http://localhost:8000

---

## 🔐 Environment Variables

Backend requires:

```
DATABASE_URL=file:/app/dev.db
JWT_SECRET=your_secret
TMDB_TOKEN=your_tmdb_token
GOOGLE_CLIENT_ID=your_google_client_id
RECOMMENDATION_SERVICE_URL=https://ml-service-wyms.onrender.com
CLIENT_ORIGIN=https://frontend-lni5.onrender.com
```

Frontend requires:

```
VITE_API_URL=https://backend-7eqg.onrender.com
```

---

## 📈 Future Improvements

- 🔄 Migrate SQLite → PostgreSQL
- ⚡ Add Redis caching for recommendations
- 📊 Analytics Dashboard
- 🔁 Background model retraining
- 🔄 CI/CD pipeline integration
- 🌍 Custom domain setup

---

## 🎯 Key Learnings

- Production ≠ Local environment
- Docker build context & file path management
- Environment variable handling in cloud platforms
- Microservice architecture debugging
- OAuth configuration for deployed applications

---

## 👩‍💻 Author

Drishti Garg  
B.Tech Computer Science  
Full-stack + ML Enthusiast  

---

⭐ If you found this project interesting, feel free to star the repo!
