import clsx from 'clsx'
import { FunctionalComponent } from 'preact'
import ProgressBar from 'components/ProgressBar'

type LoadingIndicatorProps = {
  progress?: number
  showText?: boolean
  variant: 'booth' | 'sugarlife' | 'ford'
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
          variant === 'booth' && 'text-booth',
          variant === 'sugarlife' && 'text-sugarlife',
          variant === 'ford' && 'text-ford',
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
