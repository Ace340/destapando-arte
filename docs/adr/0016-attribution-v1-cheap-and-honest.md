# Attribution v1: cheap and honest

2026-09-29. Installs: a distinct deep link per episode (QR + description) → Play Install Referrer — first-party, free, Android-native; primary metric is installs per 1,000 views per episode. Amplifier loop: "Ver el episodio" taps land as analytics_events rows in Supabase (a table and a fetch, no SDK). Web: UTMs through the public Story pages.

Known gaps, on record: no view-through attribution (watch today, install organically two days later — the referrer misses it; attribution undercounts, directionally correct), and no iOS attribution at all (v1 is Android-first).
