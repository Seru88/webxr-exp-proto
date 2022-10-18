import android_icon_src from 'assets/ui/android_icon.svg'
import billboard_thumb_src from 'assets/ui/billboard_thumb.jpg'
import booth_thumb_src from 'assets/ui/booth_thumb.jpg'
import candy_thumb_src from 'assets/ui/candy_thumb.jpg'
import car_thumb_src from 'assets/ui/car_thumb.jpg'
import chrome_icon_src from 'assets/ui/chrome_icon.svg'
import college_thumb_src from 'assets/ui/college_thumb.jpg'
import golf_thumb_src from 'assets/ui/golf_thumb.jpg'
import brochure_thumb_src from 'assets/ui/brochure_thumb.jpg'
import PoweredByPostReality from 'components/PoweredByPostReality'
import { FunctionalComponent, JSX } from 'preact'
import { RoutableProps } from 'preact-router'
import { Link } from 'preact-router/match'

const links = [
  {
    href: '/candy',
    thumbSrc: candy_thumb_src,
    title: 'Candy Store',
    subtitle: 'Take a closer look at your favorite products.'
  },
  {
    href: '/booth',
    thumbSrc: booth_thumb_src,
    title: 'Event Booth',
    subtitle: 'Who needs a business card if you have a business booth?'
  },
  {
    href: '/car',
    thumbSrc: car_thumb_src,
    title: 'Vintage Car',
    subtitle: 'A blast from the past, brought to your living room.',
    disclaimer: (
      <>
        AR mode only on:
        <span class='flex items-center text-lg ml-2'>
          <img class='h-5' src={android_icon_src} alt='android' />
          <img class='h-5' src={chrome_icon_src} alt='chrome' />
        </span>
      </>
    )
  },
  {
    href: '/golf',
    thumbSrc: golf_thumb_src,
    title: 'Event Printed Material',
    subtitle: 'Turn your printed material into interactive experiences.',
    disclaimer: (
      <span>
        Image marker available{' '}
        <a class='text-blue-500 visited:text-purple-500 font-semibold'>here.</a>
      </span>
    )
  },
  // {
  //   href: '/college',
  //   thumbSrc: college_thumb_src,
  //   title: 'College Courses',
  //   subtitle: 'Hear directly from alumni and choose the best path for you.',
  //   disclaimer: (
  //     <span>
  //       Image marker available{' '}
  //       <a class='text-blue-500 visited:text-purple-500 font-semibold'>here.</a>
  //     </span>
  //   )
  // },
  {
    href: '/brochure',
    thumbSrc: brochure_thumb_src,
    title: 'Interactive Brochure',
    subtitle: 'Turn your printed material into interactive experiences.',
    disclaimer: (
      <span>
        Image marker available{' '}
        <a class='text-blue-500 visited:text-purple-500 font-semibold'>here.</a>
      </span>
    )
  },
  {
    href: '/billboard',
    thumbSrc: billboard_thumb_src,
    title: 'Billboard NFT',
    subtitle: 'Any sign becomes a direct channel to your client.',
    disclaimer: (
      <span>
        Image marker available{' '}
        <a class='text-blue-500 visited:text-purple-500 font-semibold'>here.</a>
      </span>
    )
  }
]

type ExperienceRouteLinkCardProps = {
  href: string
  thumbSrc: string
  title: string
  subtitle: string
  disclaimer?: JSX.Element
}

const ExperienceRouteLinkCard: FunctionalComponent<
  ExperienceRouteLinkCardProps
> = ({ href, thumbSrc, title, subtitle, disclaimer }) => {
  return (
    <Link
      id={`${title.toLowerCase()} card`}
      class='flex items-center bg-white rounded-md mb-7 shadow-sm'
      href={href}
    >
      <div
        class='basis-28 bg-center bg-no-repeat bg-cover w-28 h-24 rounded-md'
        style={{ backgroundImage: `url(${thumbSrc})` }}
      />
      <div class='basis-2/3 pl-4 pr-2'>
        <h2 class='font-extrabold text-sm'>{title}</h2>
        <p class='font-medium text-xs'>{subtitle}</p>
        {disclaimer && (
          <p
            class='flex text-[11px] items-center text-slate-700 mt-2'
            onClick={ev => ev.preventDefault()}
          >
            {disclaimer}
          </p>
        )}
      </div>
    </Link>
  )
}

const Home: FunctionalComponent<RoutableProps> = () => {
  return (
    <div class='bg-neutral-50 min-h-full flex flex-col'>
      <div class='w-full text-center font-semibold p-3 mb-5 border-b-2 bg-white'>
        <h1>WebAR Gallery</h1>
      </div>
      <div class='max-w-md px-8 m-auto flex-grow'>
        {links.map(link => (
          <ExperienceRouteLinkCard
            href={link.href}
            title={link.title}
            subtitle={link.subtitle}
            thumbSrc={link.thumbSrc}
            disclaimer={link.disclaimer}
          />
        ))}
      </div>
      <div class='basis-1/12 flex flex-col justify-center items-center my-5'>
        <PoweredByPostReality />
      </div>
    </div>
  )
}

export default Home
