import clsx from 'clsx'
import { FC } from 'preact/compat'
import { ThemeVariant } from 'types/themeVariant'

interface ProgressBarProps {
  variant: ThemeVariant
  value?: number
}

const ProgressBar: FC<ProgressBarProps> = ({ variant, value }) => {
  return (
    <div
      id='progress-bar'
      class={clsx(
        'w-28 h-4 mt-2 mx-auto p-[3px] rounded-lg scale-125',
        variant === 'billboard' && 'bg-billboard',
        variant === 'booth' && 'bg-booth',
        variant === 'brochure' && 'bg-brochure',
        variant === 'candy' && 'bg-candy',
        variant === 'car' && 'bg-car',
        variant === 'college' && 'bg-college',
        variant === 'golf' && 'bg-golf',
        variant === 'electro-globe' && 'bg-electro-globe',
        variant === 'electro-booth' && 'bg-electro-booth'
      )}
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
