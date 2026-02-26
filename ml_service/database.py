from pathlib import Path

import pandas as pd
import sqlite3

DB_PATH = Path("/app/dev.db")


def get_database_path() -> Path:
    return DB_PATH


def get_interactions() -> pd.DataFrame:
    query = """
    SELECT userId, movieId, status, rating
    FROM Watchlist
    """
    status_map = {
        "plan_to_watch": 1,
        "watching": 2,
        "watched": 3,
    }

    with sqlite3.connect(DB_PATH) as connection:
        interactions = pd.read_sql_query(query, connection)

    interactions["status_score"] = interactions["status"].map(status_map).fillna(0)
    interactions["rating"] = interactions["rating"].fillna(0)
    interactions["score"] = interactions["status_score"] + interactions["rating"]

    return interactions
def get_all_movie_ids() -> list[int]:
    query = "SELECT id FROM Movie ORDER BY id ASC LIMIT 50" # Pull top 50 as global defaults
    with sqlite3.connect(DB_PATH) as connection:
        df = pd.read_sql_query(query, connection)
    return df["id"].tolist()