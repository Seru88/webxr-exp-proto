import clsx from 'clsx'
import { FunctionalComponent } from 'preact'
import { useEffect, useMemo, useRef } from 'preact/hooks'
import PoweredByPostReality from './PoweredByPostReality'

import booth_bg_src from 'assets/ui/booth_bg.png'
import candy_bg_src from 'assets/ui/candy_bg.png'
import billboard_bg_src from 'assets/ui/billboard_bg.png'
import car_bg_src from 'assets/ui/car_bg.png'
import college_bg_src from 'assets/ui/college_bg.png'
import golf_bg_src from 'assets/ui/golf_bg.png'

type SplashOverlayProps = {
  open: boolean
  variant: 'billboard' | 'booth' | 'candy' | 'car' | 'college' | 'golf'
}

const SplashOverlay: FunctionalComponent<SplashOverlayProps> = ({
  open,
  variant,
  children
}) => {
  const divRef = useRef<HTMLDivElement | null>(null)

  const bgImage = useMemo(() => {
    switch (variant) {
      case 'billboard':
        return billboard_bg_src
      case 'booth':
        return booth_bg_src
      case 'candy':
        return candy_bg_src
      case 'car':
        return car_bg_src
      case 'college':
        return college_bg_src
      case 'golf':
        return golf_bg_src
    }
  }, [variant])

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
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div class='basis-9/12 flex flex-col justify-center items-center' />
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
