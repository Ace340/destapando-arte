-- ADR-0023 (amended 2026-11-02): the Sello pointer — the editor's pick of
-- which published obra represents the artist on artist surfaces. Null keeps
-- the alphabetical derivation. Their art, never their face; no hosted media.
alter table artists
  add column sello_artwork_id uuid references artworks (id) on delete set null;
