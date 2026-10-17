-- ADR-0022: the Bio — the optional short narrative beneath the why_special
-- hook on the Artist page. Enrichment, never a launch gate.
alter table artists add column bio text;
