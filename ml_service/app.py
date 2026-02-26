from __future__ import annotations

import pandas as pd
from fastapi import FastAPI

from ml_service.database import get_interactions
from ml_service.recommender import (
    _build_user_item_matrix, 
    _predict_scores, 
    get_popular_movies
)

app = FastAPI(title="Cinetrack ML Service")

_interactions: pd.DataFrame = pd.DataFrame()
_predicted_scores: pd.DataFrame = pd.DataFrame()

@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}

@app.on_event("startup")
def startup_event() -> None:
    global _interactions, _predicted_scores
    # Load interactions and pre-calculate SVD scores on startup
    _interactions = get_interactions()
    user_item_matrix = _build_user_item_matrix(_interactions)
    _predicted_scores = _predict_scores(user_item_matrix)

@app.get("/recommend/{user_id}")
def recommend(user_id: int) -> dict[str, object]:
    # 1. Fetch a pool of popular movies as the "Safety Net" fallback
    # We fetch 20 so we have enough to filter out ones the user already saw
    popular_pool = get_popular_movies(20)

    # 2. Handle Cold Start: If the SVD model is empty or the user is unknown
    if _predicted_scores.empty or user_id not in _predicted_scores.index:
        return {
            "user_id": user_id, 
            "recommendations": popular_pool[:10],
            "type": "popularity_fallback"
        }

    # 3. Collaborative Filtering Logic
    user_predictions = _predicted_scores.loc[user_id]
    
    # Identify what the user has already interacted with to avoid repeats
    interacted_movies = set(_interactions.loc[_interactions["userId"] == user_id, "movieId"])
    
    # Filter out already seen movies from the predictions
    candidate_predictions = user_predictions.drop(labels=list(interacted_movies), errors="ignore")
    
    # Get top 5 highly-scored personalized recommendations
    personalized = [
        int(movie_id) for movie_id in 
        candidate_predictions.sort_values(ascending=False).head(5).index
    ]

    # 4. Hybrid Merge: Fill the remaining slots with popular movies they haven't seen
    # This keeps the row full and stable even if the CF model only has a few strong matches
    remaining_needed = 10 - len(personalized)
    fillers = [
        mid for mid in popular_pool 
        if mid not in interacted_movies and mid not in personalized
    ]
    
    final_recommendations = (personalized + fillers)[:10]

    return {
        "user_id": user_id, 
        "recommendations": final_recommendations,
        "type": "hybrid_personalized"
    }