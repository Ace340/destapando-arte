// image_assets.source_url stores the Commons *file page* (migration comment:
// "Commons file page"), not a renderable file URL. Special:FilePath
// 302-redirects to the real upload URL and ?width= serves a server-made
// thumbnail — the Google Art Project scans are ~30k px wide and must never
// ship raw to a phone.
const COMMONS_FILE_PAGE = /^https?:\/\/commons\.wikimedia\.org\/wiki\/File:(.+)$/i

export function displayUrl(sourceUrl: string, width = 1080): string {
  const match = COMMONS_FILE_PAGE.exec(sourceUrl)
  if (!match) return sourceUrl
  const file = decodeURIComponent(match[1]).replace(/ /g, '_')
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=${width}`
}
