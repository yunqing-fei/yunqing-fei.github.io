export const smrAtlasSchema = `
CREATE TABLE IF NOT EXISTS smr_atlas_data (
  id TEXT PRIMARY KEY,
  payload TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
`;
