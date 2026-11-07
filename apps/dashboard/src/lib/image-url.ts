// Editor-side twin of apps/mobile/src/lib/image-url.ts — same Commons
// transform, stricter contract: the mobile version falls back to the raw URL
// (the phone already holds a vetted row); the editor returns null for
// anything that is not a Commons file page, so a mis-pasted URL can never
// render raw (the Google Art Project scans are ~30k px wide).
//
// image_assets.source_url stores the Commons *file page*, not a renderable
// URL. Special:FilePath 302-redirects to the real upload URL and ?width=
// serves a server-made thumbnail.
const COMMONS_FILE_PAGE = /^https?:\/\/commons\.wikimedia\.org\/wiki\/File:(.+)$/i

export function previewUrl(sourceUrl: string, width = 640): string | null {
  const match = COMMONS_FILE_PAGE.exec(sourceUrl)
  if (!match) return null
  const file = decodeURIComponent(match[1]).replace(/ /g, '_')
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=${width}`
}

// Mobile-parity fallback for public reads (ADR-0023 Sello): the row is
// vetted by the editor, so unlike previewUrl a non-Commons URL falls back
// to the raw source instead of null.
export function displayUrl(sourceUrl: string, width = 1080): string {
  const match = COMMONS_FILE_PAGE.exec(sourceUrl)
  if (!match) return sourceUrl
  const file = decodeURIComponent(match[1]).replace(/ /g, '_')
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=${width}`
}
