# Vision cost and architecture: decided at the Phase-3 gate

2026-09-29, recorded deferral. Scans per MAU is unknowable before launch, and the architecture choice changes the answer from a per-scan fee (Google Vision web-detection) to roughly $0 marginal (local CLIP embeddings against our own reference vectors — the multi-reference approach of ADR-0001/0005 leans local). Both the cost model and the architecture are decided at the Phase 3 gate, fed by real v1 retention data.

Placeholder envelope on record: ~$15 per 1,000 MAU/month at 10 scans/MAU via Vision web-detection — a bound, not a budget.
