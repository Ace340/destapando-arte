// One honest Spanish fallback for unexpected errors — data-layer errors
// already arrive as Spanish `Error` messages (see lib/artworks.ts).
export function message(error: unknown): string {
  return error instanceof Error ? error.message : 'Error inesperado'
}
