'use client'

import { useState } from 'react'
import { NativeSelect } from '@/components/native-select'
import type { Style } from '@/lib/types'
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

// The select stays native on purpose (NativeSelect lives inside a
// server-action <form> — a JS widget would silently drop its value), and
// native options render name text only. So a small client island renders the
// chosen style's description beneath as help. Without JS the select still
// submits; the help line simply stays on the saved choice.
export function StylePicker({ styles, defaultValue }: { styles: Style[]; defaultValue: string }) {
  const [selected, setSelected] = useState(defaultValue)
  const current = styles.find((style) => style.id === selected)
  const claimed = new Set(GROUPS.flatMap((group) => group.slugs))
  const unknown = styles.filter((style) => !claimed.has(style.slug))

  return (
    <div className="space-y-1.5">
      <Label className={caption} htmlFor="style_id">
        Estilo de la obra
      </Label>
      <NativeSelect
        id="style_id"
        name="style_id"
        defaultValue={defaultValue}
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
  )
}
