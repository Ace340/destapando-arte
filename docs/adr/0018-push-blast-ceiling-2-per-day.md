# Push blast ceiling: 2/day/device, digest-batched

2026-09-29. The rule lives in the sender, not in hope: maximum two pushes per device per day, ever, including launch-week sprints — one editorial (obra del día), one Avísame digest. Digest batching: the publish webhook enqueues per-device, and a daily flush sends exactly one push ("Destapamos 3 obras que pediste") no matter how many requests fired.

**Open** (decide before Phase 2 exit): when obra del día and the digest compete for the same device-day, which one spends the slot — editorial wins and the digest slides a day, or the digest wins.
