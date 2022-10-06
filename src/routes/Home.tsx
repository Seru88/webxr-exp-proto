import { FunctionalComponent } from 'preact'
import { RoutableProps } from 'preact-router'
import { Link } from 'preact-router/match'
import sugarlife_bg_src from 'assets/ui/sugarlife_bg.jpg'
import booth_bg_src from 'assets/ui/booth_bg.png'
import ford_bg_src from 'assets/ui/ford_icon.jpg'
import PoweredByPostReality from 'components/PoweredByPostReality'
import iOS_icon_src from 'assets/ui/iOS_icon.svg'
import android_icon_src from 'assets/ui/android_icon.svg'
import chrome_icon_src from 'assets/ui/chrome_icon.svg'

const Home: FunctionalComponent<RoutableProps> = () => {
  return (
    <div class='fixed w-screen h-full flex flex-col'>
      <div class='basis-4/12 px-6 py-6'>
        <Link
          role='button'
          class={`
            shadow-lg
            text-sugarlife
            font-extrabold
            text-4xl
            w-full
            h-full
            flex
            justify-center
            items-center
            rounded-lg
            relative
          `}
          href='/sugarlife'
          style={{ backgroundImage: `url(${sugarlife_bg_src})` }}
        >
          <span class='absolute top-2 left-2'>Sugarlife</span>
          <span class='absolute bottom-1 right-1 text-sm flex'>
            <img src={iOS_icon_src} height={24} width={24} alt='iOS' />
            <img src={android_icon_src} height={24} width={24} alt='Android' />
          </span>
        </Link>
      </div>
      <div class='basis-4/12 px-6 py-6'>
        <Link
          role='button'
          class={`
            shadow-lg
          text-[#92d957]
            font-extrabold
            text-4xl
            w-full
            h-full
            flex
            justify-center
            items-center
            rounded-lg
            bg-center
            bg-no-repeat
            bg-cover
            relative
          `}
          href='/booth'
          style={{ backgroundImage: `url(${booth_bg_src})` }}
        >
          <span class='absolute top-2 left-2'>Booth</span>
          <span class='absolute bottom-1 right-1 text-sm flex'>
            <img src={iOS_icon_src} height={24} width={24} alt='iOS' />
            <img src={android_icon_src} height={24} width={24} alt='Android' />
          </span>
        </Link>
      </div>
      <div class='basis-4/12 px-6 py-6'>
        <Link
          role='button'
          class={`
            shadow-lg
          text-black
            font-extrabold
            text-4xl
            w-full
            h-full
            flex
            justify-center
            items-center
            rounded-lg
            bg-center
            bg-no-repeat
            bg-cover
            relative
          `}
          href='/ford'
          style={{ backgroundImage: `url(${ford_bg_src})` }}
        >
          <span class='absolute top-2 left-2'>Ford</span>
          <span class='absolute bottom-1 right-1 text-sm flex'>
            <img src={android_icon_src} height={24} width={24} alt='Android' />
            <img src={chrome_icon_src} height={24} width={24} alt='Chrome' />
          </span>
        </Link>
      </div>
      <div class='basis-1/12 flex justify-center pb-2'>
        <PoweredByPostReality />
      </div>
    </div>
  )
}

export default Home
