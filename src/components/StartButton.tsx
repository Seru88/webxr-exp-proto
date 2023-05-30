import clsx from 'clsx'
import { FunctionalComponent, JSX } from 'preact'
import { ThemeVariant } from 'types/themeVariant'

type StartButtonProps = {
  variant: ThemeVariant
  text?: string
} & JSX.HTMLAttributes<HTMLButtonElement>

const StartButton: FunctionalComponent<StartButtonProps> = ({
  variant,
  text = 'Start',
  ...rest
}) => {
  return (
    <button
      class={clsx(
        variant === 'billboard' && 'btn btn-billboard',
        variant === 'booth' && 'btn btn-booth',
        variant === 'brochure' && 'btn btn-brochure',
        variant === 'candy' && 'btn btn-candy',
        variant === 'car' && 'btn btn-car',
        variant === 'college' && 'btn btn-college',
        variant === 'golf' && 'btn btn-golf',
        variant === 'electro-booth' && 'btn btn-electro-booth',
        variant === 'electro-globe' && 'btn btn-electro-globe',
        variant === 'liver' && 'btn btn-liver',
        variant === 'softsoap' && 'btn btn-softsoap'
      )}
      {...rest}
    >
      {text}
    </button>
  )
}

export default StartButton
