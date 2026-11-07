// One honest error per query — the shared shape behind every fetch in
// lib/artworks.ts and lib/artists.ts.
export function unwrap<T>(
  response: { data: T | null; error: { message: string } | null },
  label: string,
): T | null {
  if (response.error) throw new Error(`${label}: ${response.error.message}`)
  return response.data ?? null
}
