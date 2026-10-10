import Link from 'next/link'
import type { ComponentProps } from 'react'
import type { VariantProps } from 'class-variance-authority'
import { cn } from 'cn'
import { buttonVariants } from '@/components/ui/button'

// A navigation link styled as a Button. Deliberately NOT <Button render={<Link/>}>:
// Base UI's Button is for actions — on an anchor it either warns (nativeButton
// default) or stamps role="button" + key handlers (nativeButton={false}), both
// wrong for navigation. A plain <a> with buttonVariants keeps link semantics.
function ButtonLink({
  variant = 'default',
  size = 'default',
  className,
  ...props
}: ComponentProps<typeof Link> & VariantProps<typeof buttonVariants>) {
  return (
    <Link
      data-slot="button-link"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { ButtonLink }
