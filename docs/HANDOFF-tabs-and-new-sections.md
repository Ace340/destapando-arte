# Handoff — Bottom tabs + new sections (Cine, Favoritos)

Branch: `artist-feature` · Date: 2026-10-18

## Todo list state (session interrupted — weekly quota)

- [x] Load code-quality context + verify SDK 57 Tabs API in Expo docs
- [x] Install `@expo/vector-icons` via `npx expo install`
- [x] Create `(tabs)` group with custom tab bar (Descubre, Artistas, Cine, Favoritos)
- [x] Create blank `cine.tsx` + `favoritos.tsx` pages
- [x] Remove `floating-dock.tsx` + `useDockScroll` wiring from index/artistas
- [x] Update GLOSSARY.md (Cine section + Favorito term)
- [x] Validate: `expo lint` + `tsc --noEmit` — both pass (typed routes
      regenerated via `npx expo customize tsconfig.json`)
- [ ] Manual smoke test in Expo Go (needs a device/simulator — see below)

## What this task was

Replace the floating text-only dock with a fixed full-width bottom tab bar
(Daily Art style): **Descubre, Artistas, Cine, Favoritos** — icons + labels,
always visible (no hide-on-scroll), glass on iOS 26+, themed surface
elsewhere. Add blank pages for Cine and Favoritos. Record the new domain
terms in GLOSSARY.md.

## Decisions made (user-approved)

- Fixed full-width bar, always visible — replaces the floating pill and its
  `useDockScroll` hide-on-scroll behavior.
- Icons + labels via `@expo/vector-icons` (Ionicons): compass / people /
  film / heart. Installed with `npx expo install` (SDK 57 compatible).
- **Favorito** = locally saved Artwork bookmark, on-device only, no account
  (same stance as Avísame). No ADR yet — cheap to reverse while the page is
  blank; graduate to an ADR when the feature gets a real data model.
- Route structure: `(tabs)` group holds the four sections; `obra/[slug]` and
  `artista/[slug]` stay on the root Stack so reading surfaces cover the bar.

## Done

- `apps/mobile/src/components/tab-bar.tsx` — custom bar, self-contained
  (sections map + `usePathname` active matching + `router.navigate`), same
  glass short-circuit pattern the old dock used.
- `apps/mobile/src/app/(tabs)/_layout.tsx` — `Tabs` with
  `tabBar={() => <TabBar />}`, `headerShown: false`.
- `apps/mobile/src/app/(tabs)/index.tsx` + `artistas.tsx` — moved from
  `src/app/`, dock wiring removed, `Animated.FlatList` → plain `FlatList`,
  list bottom padding 112/104 → 24 (bar is in normal flow now).
- `apps/mobile/src/app/(tabs)/cine.tsx` + `favoritos.tsx` — blank pages,
  themed, honest "Próximamente" / empty-state copy.
- Root `src/app/_layout.tsx` — Stack now registers `(tabs)` instead of
  `index`/`artistas`.
- Deleted: `src/app/index.tsx`, `src/app/artistas.tsx`,
  `src/components/floating-dock.tsx`.
- `GLOSSARY.md` — added **Cine (section)** under El Cine and new section
  **Los Favoritos** with **Favorito**.
- `npx expo lint` — passes.

## Blocked on / next steps

1. ~~Stale typed routes~~ — **resolved.** Regenerated with
   `npx expo customize tsconfig.json` (the documented no-dev-server path,
   per https://docs.expo.dev/router/reference/typed-routes.md). `.expo/types/router.d.ts`
   now contains `/cine` and `/favoritos`; the stale `floating-dock` entry is
   gone. `npx tsc --noEmit` and `npx expo lint` both pass (2026-10-18).
2. Manual smoke test in Expo Go: four tabs switch correctly, active state
   tracks pathname, glass bar on iOS 26+ device/simulator, obra/artista
   detail screens render full-screen above the bar, back returns to the
   originating tab.
3. When the Favoritos feature gets a data model: revisit the local-only
   decision and consider an ADR (hard-to-reverse + surprising + real
   trade-off would then all hold).

## Notes

- `@react-navigation/bottom-tabs` is NOT directly importable in SDK 57
  (bundled inside expo-router) — that's why the custom bar is self-contained
  instead of using `BottomTabBarProps` / the `tabBar` render-prop props.
- Old floating-dock comment cited "ADR-0022 surfaces" but ADR-0022 is about
  artist pages — stale reference, now moot (file deleted).
