from __future__ import annotations

import numpy as np
import pandas as pd
import sqlite3
from sklearn.decomposition import TruncatedSVD
from ml_service.database import DB_PATH, get_interactions

def _build_user_item_matrix(interactions: pd.DataFrame) -> pd.DataFrame:
    """Creates a user-item pivot table from interaction scores."""
    if interactions.empty:
        return pd.DataFrame()
    matrix = interactions.pivot_table(
        index="userId",
        columns="movieId",
        values="score",
        aggfunc="mean",
    )
    return matrix.fillna(0)

def _predict_scores(user_item_matrix: pd.DataFrame) -> pd.DataFrame:
    """Uses SVD to predict movie scores for users based on latent factors."""
    if user_item_matrix.empty:
        return user_item_matrix.copy()

    max_components = min(user_item_matrix.shape) - 1
    if max_components < 1:
        return user_item_matrix.copy()

    n_components = min(20, max_components)
    svd = TruncatedSVD(n_components=n_components, random_state=42)

    latent_user_factors = svd.fit_transform(user_item_matrix.values)
    reconstructed = np.dot(latent_user_factors, svd.components_)

    return pd.DataFrame(
        reconstructed,
        index=user_item_matrix.index,
        columns=user_item_matrix.columns,
    )

def get_popular_movies(top_n: int = 10) -> list[int]:
    """
    Returns top movies based on interactions. 
    If interactions are sparse, it fills the list with the latest movies from the DB.
    """
    # 1. Fetch baseline fallback from the Movie table
    try:
        with sqlite3.connect(DB_PATH) as connection:
            all_movies_df = pd.read_sql_query(
                "SELECT id FROM Movie ORDER BY id DESC LIMIT 50", 
                connection
            )
        global_defaults = all_movies_df["id"].tolist()
    except Exception as e:
        print(f"Error fetching global defaults: {e}")
        global_defaults = []

    interactions = get_interactions()
    
    # Cold Start: If no interactions exist at all, return the latest movies
    if interactions.empty:
        return global_defaults[:top_n]

    # 2. Calculate popularity based on actual user interactions
    popularity = (
        interactions.groupby("movieId")
        .agg(
            interaction_count=("movieId", "size"),
            avg_score=("score", "mean"),
        )
        .reset_index()
    )
    popularity["popularity_score"] = popularity["interaction_count"] * popularity["avg_score"]

    ranked = popularity.sort_values(by="popularity_score", ascending=False).head(top_n)
    popular_ids = [int(movie_id) for movie_id in ranked["movieId"].tolist()]

    # 3. Hybrid Fill: Ensure we always return exactly top_n movies
    if len(popular_ids) < top_n:
        needed = top_n - len(popular_ids)
        fillers = [mid for mid in global_defaults if mid not in popular_ids]
        popular_ids.extend(fillers[:needed])

    return popular_ids

def get_recommendations_for_user(user_id: int, top_n: int = 10) -> list[int]:
    """Generates personalized SVD recommendations with a popularity fallback."""
    interactions = get_interactions()
    
    if interactions.empty:
        return get_popular_movies(top_n)

    user_item_matrix = _build_user_item_matrix(interactions)
    
    if user_id not in user_item_matrix.index:
        return get_popular_movies(top_n)

    predicted_scores = _predict_scores(user_item_matrix)
    user_predictions = predicted_scores.loc[user_id]

    # Filter out movies the user has already seen
    interacted_movies = set(interactions.loc[interactions["userId"] == user_id, "movieId"])
    candidate_predictions = user_predictions.drop(labels=list(interacted_movies), errors="ignore")
    
    if candidate_predictions.empty:
        return get_popular_movies(top_n)

    ranked_movie_ids = candidate_predictions.sort_values(ascending=False).head(top_n).index.tolist()
    return [int(movie_id) for movie_id in ranked_movie_ids]