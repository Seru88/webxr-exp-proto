import clsx from 'clsx'
import { FunctionalComponent } from 'preact'
import { useEffect, useMemo, useRef } from 'preact/hooks'
import PoweredByPostReality from './PoweredByPostReality'

import booth_bg_src from 'assets/ui/booth_bg.jpg'
import candy_bg_src from 'assets/ui/candy_bg.jpg'
import billboard_bg_src from 'assets/ui/billboard_bg.jpg'
import brochure_bg_src from 'assets/ui/brochure_bg.jpg'
import car_bg_src from 'assets/ui/car_bg.jpg'
import college_bg_src from 'assets/ui/college_bg.jpg'
import golf_bg_src from 'assets/ui/golf_bg.jpg'
import electro_globe_bg_src from 'assets/ui/electro_globe_bg.jpg'
import electro_booth_bg_src from 'assets/ui/electro_booth_bg.jpg'
import electro_globe_thumb_src from 'assets/ui/electro_globe_thumb.jpg'
import electro_booth_thumb_src from 'assets/ui/electro_booth_thumb.jpg'
import electro_logo_src from 'assets/ui/electro_logo.png'

import { ThemeVariant } from 'types/themeVariant'

type SplashOverlayProps = {
  open: boolean
  variant: ThemeVariant
}

const SplashOverlay: FunctionalComponent<SplashOverlayProps> = ({
  open,
  variant,
  children
}) => {
  const divRef = useRef<HTMLDivElement | null>(null)

  const bgImageSrc = useMemo(() => {
    switch (variant) {
      case 'billboard':
        return billboard_bg_src
      case 'booth':
        return booth_bg_src
      case 'brochure':
        return brochure_bg_src
      case 'candy':
        return candy_bg_src
      case 'car':
        return car_bg_src
      case 'college':
        return college_bg_src
      case 'golf':
        return golf_bg_src
      case 'electro-booth':
        return electro_booth_bg_src
      case 'electro-globe':
        return electro_globe_bg_src
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

  if (variant === 'electro-booth' || variant === 'electro-globe') {
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
          justify-center
          items-center
          py-2
          z-[9999]
          transition-opacit
          ease-in
          duration-300`,
          open ? 'opacity-100' : 'opacity-0',
          variant === 'electro-booth' ? 'px-4' : 'px-6'
        )}
        style={{ backgroundImage: `url(${bgImageSrc})` }}
      >
        <img class='scale-[1.03] mb-10' src={electro_logo_src} alt='' />
        {variant === 'electro-booth' && (
          <div class='-mt-4 mb-4 font-bold text-2xl tracking-tight text-center'>
            Collaborative spaces to drive innovation and performance.
          </div>
        )}
        <img
          class='rounded-xl mb-6'
          src={
            variant === 'electro-booth'
              ? electro_booth_thumb_src
              : electro_globe_thumb_src
          }
          alt=''
        />
        {variant === 'electro-globe' && (
          <div class='mt-4 mb-10 font-semibold text-4xl text-[#515151] leading-tight tracking-[0.0125em]'>
            Create a lasting impression with inspirational branded lobbies and
            courtyards.
          </div>
        )}
        {children}
      </div>
    )
  }

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
      style={{ backgroundImage: `url(${bgImageSrc})` }}
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
