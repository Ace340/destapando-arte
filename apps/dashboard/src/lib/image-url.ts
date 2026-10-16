// Editor-side twin of apps/mobile/src/lib/image-url.ts — same Commons
// transform, stricter contract: the mobile version falls back to the raw URL
// (the phone already holds a vetted row); the editor returns null for
// anything that is not a Commons file page, so a mis-pasted URL can never
// render raw (the Google Art Project scans are ~30k px wide).
const COMMONS_FILE_PAGE = /^https?:\/\/commons\.wikimedia\.org\/wiki\/File:(.+)$/i

export function previewUrl(sourceUrl: string, width = 640): string | null {
  const match = COMMONS_FILE_PAGE.exec(sourceUrl)
  if (!match) return null
  const file = decodeURIComponent(match[1]).replace(/ /g, '_')
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=${width}`
}
