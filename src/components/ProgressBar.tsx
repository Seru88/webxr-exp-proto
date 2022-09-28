import clsx from 'clsx'
import { FunctionalComponent } from 'preact'

interface ProgressBarProps {
  value?: number
}

const ProgressBar: FunctionalComponent<ProgressBarProps> = ({ value }) => {
  return (
    <div
      id='progress-bar'
      class='w-28 h-4 mt-2 bg-[#216d6f] p-[3px] rounded-lg scale-125'
    >
      <div
        id='progress-bar-rail'
        class='h-full w-full overflow-hidden rounded-lg'
      >
        <div
          id='progress-bar-value'
          class={clsx(
            'w-full h-full bg-white rounded-lg transition-all',
            (value === undefined || value === 0) &&
              'animate-indeterminate origin-left'
          )}
          style={value && value > 0 ? { width: `${value}%` } : undefined}
        />
      </div>
    </div>
  )
}

export default ProgressBar
