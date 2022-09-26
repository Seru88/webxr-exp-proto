import iconSrc from 'assets/ui/ford_icon.jpg'
import logoSrc from 'assets/ui/pr_logo.png'
import clsx from 'clsx'
import { FunctionalComponent, JSX } from 'preact'
import { useEffect, useState } from 'preact/hooks'

type PromptScreenProps = {
  show: boolean
  prompt: JSX.Element
}

const PromptScreen: FunctionalComponent<PromptScreenProps> = ({
  show,
  prompt
}) => {
  const [unmount, setUnMount] = useState(false)

  useEffect(() => {
    if (show === false) {
      setTimeout(() => {
        setUnMount(true)
      }, 1300)
    }
  }, [show, setUnMount])

  if (unmount) return null

  return (
    <div
      id='loading-screen'
      class={clsx(
        'absolute',
        'w-screen',
        'h-screen',
        'bg-white',
        'transition-opacity',
        'ease-out',
        'duration-1000',
        // 'duration-1000',
        'delay-300',
        show ? 'opacity-100' : 'opacity-0',
        'z-[9999]'
      )}
    >
      <div class='min-w-full flex flex-col justify-center items-center mt-32'>
        <img class='max-w-sm h-auto' src={iconSrc} alt='Ford' />
      </div>
      {prompt}
      <div class='absolute bottom-6 w-full flex items-center justify-center'>
        <img class='max-w-[128px]' src={logoSrc} alt='Post Reality' />
      </div>
    </div>
  )
}

export default PromptScreen
