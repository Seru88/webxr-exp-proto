import powered_by_src from 'assets/ui/poweredby.png'
import { FunctionalComponent } from 'preact'

const PoweredByPostReality: FunctionalComponent = () => {
  return (
    <img
      class='max-w-[72px]'
      src={powered_by_src}
      alt='Powered by Post Reality'
    />
  )
}

export default PoweredByPostReality
