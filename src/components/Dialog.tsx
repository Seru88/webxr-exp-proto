import clsx from 'clsx'
import { FunctionalComponent } from 'preact'
import { useEffect, useRef } from 'preact/hooks'

type DialogProps = {
  open: boolean
  className?: string
}

const Dialog: FunctionalComponent<DialogProps> = ({
  open,
  className,
  children
}) => {
  const divRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const div = divRef.current
    if (div) {
      if (open) {
        div.classList.remove('hidden')
      } else {
        setTimeout(() => {
          div.classList.add('hidden')
        }, 350)
      }
    }
  }, [open])

  return (
    <div
      ref={divRef}
      class={clsx(
        `fixed
        w-screen
        h-full
        px-6
        flex
        flex-col
        justify-center
        items-cente
        bg-[#000000AA]
        z-[9999]
        transition-opacit
        ease-in
        duration-300`,
        open ? 'opacity-100' : 'opacity-0'
      )}
    >
      <div class={clsx('max-w-[295] rounded-lg shadow-lg bg-white', className)}>
        {children}
      </div>
    </div>
  )
}

export default Dialog
