'use client'

import { useActionState, useState } from 'react'
import { saveStyleState } from '@/lib/actions'
import { NativeSelect } from '@/components/native-select'
import type { Style } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

const caption = 'text-xs font-medium uppercase tracking-wide text-muted-foreground'

// ADR-0025 addendum: the grouping of the Estilo dropdown is a presentation
// constant here — never a column on styles (that is the genre field the ADR
// keeps off the table). Group labels are Patrick's (2026-11-26); a style
// whose slug no group claims falls into «Otros», so future seed or import
// entries never vanish from the picker.
const GROUPS: Array<{ label: string; slugs: string[] }> = [
  {
    label: 'Realismo y representación de la forma',
    slugs: ['realismo', 'renacimiento', 'barroco', 'neoclasicismo'],
  },
  {
    label: 'Luz, color y ruptura moderna',
    slugs: ['impresionismo', 'postimpresionismo', 'expresionismo', 'cubismo', 'surrealismo'],
  },
  {
    label: 'Abstracción y arte contemporáneo',
    slugs: ['arte-abstracto', 'pop-art', 'minimalismo', 'arte-conceptual'],
  },
]

// The select stays native (NativeSelect lives inside a server-action <form> —
// a JS popup widget would silently drop its value) — native options render
// name text only, so the chosen style's description renders beneath as help.
// The save confirmation is the island's one piece of state: saveStyleState
// (the same write as saveStyle, useActionState's prevState signature) runs
// the mutation server-side; the line just confirms the write happened.
export function StylePicker({
  slug,
  styles,
  defaultStyleId,
}: {
  slug: string
  styles: Style[]
  defaultStyleId: string
}) {
  const [selected, setSelected] = useState(defaultStyleId)
  const [saved, formAction] = useActionState(saveStyleState, false)
  const current = styles.find((style) => style.id === selected)
  const claimed = new Set(GROUPS.flatMap((group) => group.slugs))
  const unknown = styles.filter((style) => !claimed.has(style.slug))

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="slug" value={slug} />

      <div className="space-y-1.5">
        <Label className={caption} htmlFor="style_id">
          Estilo de la obra
        </Label>
        <NativeSelect
          id="style_id"
          name="style_id"
          defaultValue={defaultStyleId}
          onChange={(event) => setSelected(event.target.value)}
        >
          <option value="">Sin clasificar</option>
          {GROUPS.map((group) => {
            const members = styles.filter((style) => group.slugs.includes(style.slug))
            if (members.length === 0) return null
            return (
              <optgroup key={group.label} label={group.label}>
                {members.map((style) => (
                  <option key={style.id} value={style.id}>
                    {style.name}
                  </option>
                ))}
              </optgroup>
            )
          })}
          {unknown.length > 0 && (
            <optgroup label="Otros">
              {unknown.map((style) => (
                <option key={style.id} value={style.id}>
                  {style.name}
                </option>
              ))}
            </optgroup>
          )}
        </NativeSelect>
        {current?.description ? (
          <p className="text-xs leading-relaxed text-muted-foreground">{current.description}</p>
        ) : null}
      </div>

      <Button type="submit">Guardar estilo</Button>
      {saved ? (
        <p role="status" className="text-xs text-primary">
          Estilo guardado.
        </p>
      ) : null}
    </form>
  )
}
