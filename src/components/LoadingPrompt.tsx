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
          'text-black',
          'text-2xl',
          'uppercase',
          'font-semibold',
          'text-center'
        )}
      >
        {message}
      </div>
      <ProgressBar value={progress} />
    </>
  )
}

export default LoadingPrompt
