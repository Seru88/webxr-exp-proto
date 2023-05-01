import BackToGalleryLink from 'components/BackToGalleryLink'
import SplashOverlay from 'components/SplashOverlay'
import StartButton from 'components/StartButton'
import { SugarlifeXrScene } from 'scenes/SugarlifeXrScene'
import { FunctionalComponent } from 'preact'
import { RoutableProps } from 'preact-router'
import { useState } from 'preact/hooks'

const Sugarlife: FunctionalComponent<RoutableProps> = () => {
  const [start, setStart] = useState(false)

  const onStartBtnClick = () => {
    setStart(true)
  }

  if (start) return <SugarlifeXrScene />

  return (
    <SplashOverlay open={true} variant='candy'>
      <StartButton onClick={onStartBtnClick} variant='candy' />
      <BackToGalleryLink />
    </SplashOverlay>
  )
}

export default Sugarlife
