import clsx from 'clsx'
import { FunctionalComponent } from 'preact'

interface ProgressBarProps {
  value?: number
}

const ProgressBar: FunctionalComponent<ProgressBarProps> = ({ value }) => {
  return (
    <div
      id='progress-bar'
      class='w-24 h-4 mt-2 mx-auto bg-black p-[3px] rounded-lg scale-125'
    >
      <div
        id='progress-bar-rail'
        class='h-full w-full overflow-hidden rounded-lg'
      >
        <div
          id='progress-bar-value'
          class={clsx(
            'w-full h-full bg-white rounded-lg transition-all',
            Boolean(value) === false && 'animate-indeterminate origin-left'
          )}
          style={value && value > 0 ? { width: `${value}%` } : undefined}
        />
      </div>
    </div>
  )
}

export default ProgressBar
