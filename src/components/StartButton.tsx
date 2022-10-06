import clsx from 'clsx'
import { FunctionalComponent, JSX } from 'preact'
import ford_start_btn_src from 'assets/ui/ford_start_btn.png'
import booth_start_btn_src from 'assets/ui/booth_start_btn.png'

type StartButtonProps = {
  variant: 'sugarlife' | 'booth' | 'ford'
} & JSX.HTMLAttributes<HTMLButtonElement>

const StartButton: FunctionalComponent<StartButtonProps> = ({
  variant,
  ...rest
}) => {
  return (
    <button
      class={clsx(variant === 'sugarlife' && 'btn btn-sugarlife')}
      {...rest}
    >
      {variant === 'sugarlife' ? (
        'Start'
      ) : (
        <img
          class={variant === 'ford' ? 'max-w-[196px]' : 'max-w-[156px]'}
          src={variant === 'ford' ? ford_start_btn_src : booth_start_btn_src}
          alt='Start Experience'
        />
      )}
    </button>
  )
}

export default StartButton
