from __future__ import annotations

import pandas as pd
from fastapi import FastAPI

from ml_service.database import get_interactions
from ml_service.recommender import _build_user_item_matrix, _predict_scores, get_popular_movies

app = FastAPI(title="Cinetrack ML Service")

_interactions: pd.DataFrame = pd.DataFrame()
_predicted_scores: pd.DataFrame = pd.DataFrame()


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.on_event("startup")
def startup_event() -> None:
    global _interactions, _predicted_scores

    _interactions = get_interactions()
    user_item_matrix = _build_user_item_matrix(_interactions)
    _predicted_scores = _predict_scores(user_item_matrix)


@app.get("/recommend/{user_id}")
def recommend(user_id: int) -> dict[str, object]:
    if _predicted_scores.empty:
        return {"user_id": user_id, "recommendations": get_popular_movies(10)}

    if user_id not in _predicted_scores.index:
        return {"user_id": user_id, "recommendations": get_popular_movies(10)}

    user_predictions = _predicted_scores.loc[user_id]
    interacted_movies = set(_interactions.loc[_interactions["userId"] == user_id, "movieId"])
    candidate_predictions = user_predictions.drop(labels=list(interacted_movies), errors="ignore")
    if candidate_predictions.empty:
        return {"user_id": user_id, "recommendations": get_popular_movies(10)}

    recommendations = [int(movie_id) for movie_id in candidate_predictions.sort_values(ascending=False).head(10).index]
    return {"user_id": user_id, "recommendations": recommendations}
