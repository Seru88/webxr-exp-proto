import clsx from 'clsx'
import { FunctionalComponent, JSX } from 'preact'

import ProgressBar from './ProgressBar'

type LoadingPromptProps = {
  message: JSX.Element
  progress?: number
}

const LoadingPrompt: FunctionalComponent<LoadingPromptProps> = ({
  message,
  progress
}) => {
  return (
    <>
      <div
        class={clsx(
          'w-full',
          'absolute',
          'bottom-28',
          'flex',
          'flex-col',
          'justify-center',
          'items-center',
          'text-black',
          'text-md',
          'uppercase',
          'font-semibold'
        )}
      >
        {message}
        <ProgressBar value={progress} />
      </div>
    </>
  )
}

export default LoadingPrompt
