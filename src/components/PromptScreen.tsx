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
        'fixed',
        'w-screen',
        'h-full',
        'flex',
        'flex-col',
        'bg-white',
        'z-[9999]',
        'transition-opacity',
        'ease-in',
        'duration-300',
        show ? 'opacity-100' : 'opacity-0'
      )}
    >
      <div class='basis-9/12 flex flex-col justify-center items-center'>
        <img class='w-auto h-auto' src={forc_icon_src} alt='Ford' />
      </div>
      <div class='basis-2/12 flex flex-col justify-center items-center'>
        {prompt}
      </div>
      <div class='basis-1/12 flex flex-col justify-center items-center'>
        <img class='max-w-[96px]' src={pr_logo_src} alt='Post Reality' />
      </div>
    </div>
  )
}

export default PromptScreen
