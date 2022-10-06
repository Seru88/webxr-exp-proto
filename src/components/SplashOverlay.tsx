import clsx from 'clsx'
import { FunctionalComponent } from 'preact'
import { useEffect, useRef } from 'preact/hooks'
import PoweredByPostReality from './PoweredByPostReality'

import booth_bg from 'assets/ui/booth_bg.jpg'
import sugarlife_bg from 'assets/ui/sugarlife_bg.jpg'

import ford_brand_src from 'assets/ui/ford_icon.jpg'

type SplashOverlayProps = {
  open: boolean
  variant: 'booth' | 'sugarlife' | 'ford'
}

const SplashOverlay: FunctionalComponent<SplashOverlayProps> = ({
  open,
  variant,
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
        `bg-white
        bg-center
        bg-no-repeat
        bg-cover
        fixed
        w-screen
        h-full
        flex
        flex-col
        z-[9999]
        transition-opacit
        ease-in
        duration-300`,
        open ? 'opacity-100' : 'opacity-0'
      )}
      style={
        variant !== 'ford'
          ? {
              backgroundImage: `url(${
                variant === 'booth' ? booth_bg : sugarlife_bg
              })`
            }
          : undefined
      }
    >
      <div class='basis-9/12 flex flex-col justify-center items-center'>
        {variant === 'ford' && (
          <img class='w-auto h-auto' src={ford_brand_src} alt='' />
        )}
      </div>
      <div class='basis-2/12 flex flex-col justify-center items-center'>
        {children}
      </div>
      <div class='basis-1/12 flex flex-col justify-center items-center'>
        <PoweredByPostReality />
      </div>
    </div>
  )
}

export default SplashOverlay
