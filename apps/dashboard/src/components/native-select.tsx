import * as React from 'react'
import { cn } from 'cn'

// Native <select> styled to match the shadcn Input. Deliberately NOT shadcn's
// Select: these live inside server-action forms (<form action={serverAction}>),
// which need real form fields — a JS popup widget would silently drop its value.
function NativeSelect({ className, ...props }: React.ComponentProps<'select'>) {
  return (
    <select
      data-slot="native-select"
      className={cn(
        'h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed dark:bg-input/30 md:text-sm',
        className,
      )}
      {...props}
    />
  )
}

export { NativeSelect }
