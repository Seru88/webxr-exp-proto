import forc_icon_src from 'assets/ui/ford_icon.jpg'
import pr_logo_src from 'assets/ui/pr_logo.png'
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
        'w-screen',
        'h-screen',
        'bg-white',
        'transition-opacity',
        'ease-in',
        'duration-300',
        show ? 'opacity-100' : 'opacity-0',
        'z-[9999]'
      )}
    >
      <div class='absolute min-w-full flex flex-col justify-center items-center top-16'>
        <img class='w-[250px] h-auto' src={forc_icon_src} alt='Ford' />
      </div>
      {prompt}
      <div class='absolute bottom-5 w-full flex items-center justify-center'>
        <img class='max-w-[128px]' src={pr_logo_src} alt='Post Reality' />
      </div>
    </div>
  )
}

export default PromptScreen
