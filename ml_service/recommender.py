from __future__ import annotations

import numpy as np
import pandas as pd
from sklearn.decomposition import TruncatedSVD

from ml_service.database import get_interactions


def _build_user_item_matrix(interactions: pd.DataFrame) -> pd.DataFrame:
    matrix = interactions.pivot_table(
        index="userId",
        columns="movieId",
        values="score",
        aggfunc="mean",
    )
    return matrix.fillna(0)


def _predict_scores(user_item_matrix: pd.DataFrame) -> pd.DataFrame:
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
    interactions = get_interactions()
    if interactions.empty:
        return []

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
    return [int(movie_id) for movie_id in ranked["movieId"].tolist()]


def get_recommendations_for_user(user_id: int, top_n: int = 10) -> list[int]:
    interactions = get_interactions()
    if interactions.empty:
        return get_popular_movies(top_n)

    user_item_matrix = _build_user_item_matrix(interactions)
    if user_id not in user_item_matrix.index:
        return get_popular_movies(top_n)

    predicted_scores = _predict_scores(user_item_matrix)
    user_predictions = predicted_scores.loc[user_id]

    interacted_movies = set(interactions.loc[interactions["userId"] == user_id, "movieId"])
    candidate_predictions = user_predictions.drop(labels=list(interacted_movies), errors="ignore")
    if candidate_predictions.empty:
        return get_popular_movies(top_n)

    ranked_movie_ids = candidate_predictions.sort_values(ascending=False).head(top_n).index.tolist()
    return [int(movie_id) for movie_id in ranked_movie_ids]
