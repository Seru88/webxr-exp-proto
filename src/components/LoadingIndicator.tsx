import clsx from 'clsx'
import { FunctionalComponent } from 'preact'
import ProgressBar from 'components/ProgressBar'
import { ThemeVariant } from 'types/themeVariant'

type LoadingIndicatorProps = {
  progress?: number
  showText?: boolean
  variant: ThemeVariant
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
          variant === 'brochure' && 'text-brochure',
          variant === 'candy' && 'text-candy',
          variant === 'car' && 'text-car',
          variant === 'college' && 'text-college',
          variant === 'golf' && 'text-golf',
          variant === 'electro-globe' && 'text-electro-globe',
          variant === 'electro-booth' && 'text-electro-booth',
          variant === 'liver' && 'text-white',
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
