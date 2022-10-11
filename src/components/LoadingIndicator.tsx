import clsx from 'clsx'
import { FunctionalComponent } from 'preact'
import ProgressBar from 'components/ProgressBar'

type LoadingIndicatorProps = {
  progress?: number
  showText?: boolean
  variant: 'billboard' | 'booth' | 'candy' | 'car' | 'college' | 'golf'
}

const LoadingIndicator: FunctionalComponent<LoadingIndicatorProps> = ({
  progress,
  showText = true,
  variant
}) => {
  return (
    <>
      <div
        class={clsx(
          'flex',
          'flex-col',
          'justify-center',
          'items-center',
          variant === 'billboard' && 'text-billboard',
          variant === 'booth' && 'text-booth',
          variant === 'candy' && 'text-candy',
          variant === 'car' && 'text-car',
          variant === 'college' && 'text-college',
          variant === 'golf' && 'text-golf',
          'text-lg',
          'uppercase',
          'font-semibold'
        )}
      >
        {showText && (
          <>
            <p>Loading</p>
            <p>Experience</p>
          </>
        )}
        <ProgressBar value={progress} variant={variant} />
      </div>
    </>
  )
}

export default LoadingIndicator
