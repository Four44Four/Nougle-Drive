cd "$(dirname "$0")"
sqlite3 ./data.db "CREATE TABLE IF NOT EXISTS file_metadata (
  id TEXT NOT NULL PRIMARY KEY,
  relFilePath TEXT NOT NULL,
  mimeType TEXT NOT NULL,
  sizeBytes INTEGER NOT NULL,
  sha256Hash TEXT NOT NULL,
  updatedTime TEXT NOT NULL
)"
