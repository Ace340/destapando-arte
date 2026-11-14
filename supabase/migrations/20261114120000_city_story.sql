-- City story (rider on ADR-0024, GLOSSARY: Ciudad): one short editorial
-- paragraph, hand-written in the Tablero — the narrative voice that keeps
-- the deliberately-thin Ciudad page from feeling bare. Plain text only, no
-- links or facts schema (ADR-0007/0014 spirit: narrative, not data). Null
-- is the honest stub: the app renders NO story section at all — never a
-- placeholder box. The Tablero treats an emptied field as null.
alter table cities add column story text;
