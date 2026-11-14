-- City picture (ADR-0008 rider on ADR-0024): an optional link to the city's
-- public-domain picture — linked to Wikimedia Commons, never hosted here.
-- Stored as the Commons *file page* (same contract as
-- image_assets.source_url); the Special:FilePath transform renders it and
-- ?width= serves a server-made thumbnail. Null keeps the honest placeholder:
-- the app shows the city's initial monogram until the editor links a
-- picture from the Tablero. The Tablero validates the Commons file-page
-- shape at the boundary (saveCity), like saveImage does for artworks.
alter table cities add column image_url text;
