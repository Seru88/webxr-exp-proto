import clsx from 'clsx'
import { FunctionalComponent, JSX } from 'preact'

type StartButtonProps = {
  variant: 'billboard' | 'booth' | 'candy' | 'car' | 'college' | 'golf'
} & JSX.HTMLAttributes<HTMLButtonElement>

const StartButton: FunctionalComponent<StartButtonProps> = ({
  variant,
  ...rest
}) => {
  return (
    <button
      class={clsx(
        variant === 'billboard' && 'btn btn-billboard',
        variant === 'booth' && 'btn btn-booth',
        variant === 'candy' && 'btn btn-candy',
        variant === 'car' && 'btn btn-car',
        variant === 'college' && 'btn btn-college',
        variant === 'golf' && 'btn btn-golf'
      )}
      {...rest}
    >
      Start
    </button>
  )
}

export default StartButton
