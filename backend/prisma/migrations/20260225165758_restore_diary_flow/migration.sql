-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PlaylistMovie" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "playlistId" INTEGER NOT NULL,
    "movieId" INTEGER NOT NULL,
    CONSTRAINT "PlaylistMovie_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "Playlist" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PlaylistMovie_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PlaylistMovie" ("id", "movieId", "playlistId") SELECT "id", "movieId", "playlistId" FROM "PlaylistMovie";
DROP TABLE "PlaylistMovie";
ALTER TABLE "new_PlaylistMovie" RENAME TO "PlaylistMovie";
CREATE UNIQUE INDEX "PlaylistMovie_playlistId_movieId_key" ON "PlaylistMovie"("playlistId", "movieId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
