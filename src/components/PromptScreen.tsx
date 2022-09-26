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
      }, 350)
    }
  }, [show, setUnMount])

  if (unmount) return null

  return (
    <div
      id='prompt-screen'
      class={clsx(
        'absolute',

        // 'top-0',
        // 'bottom-0',
        // 'left-0',
        // 'right-0',
        'w-full',
        'h-full',
        'bg-white',
        'transition-opacity',
        'ease-in',
        'duration-300',
        // 'delay-75',
        show ? 'opacity-100' : 'opacity-0',
        'z-[9999]'
      )}
    >
      <div class='absolute min-w-full flex flex-col justify-center items-center top-16'>
        <img class='w-[250px] h-auto' src={iconSrc} alt='Ford' />
      </div>
      {prompt}
      <div class='absolute bottom-6 w-full flex items-center justify-center'>
        <img class='max-w-[128px]' src={logoSrc} alt='Post Reality' />
      </div>
    </div>
  )
}

export default PromptScreen
