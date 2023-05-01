import BackToGalleryLink from 'components/BackToGalleryLink'
import { GolfXrScene } from 'scenes/GolfXrScene'
import SplashOverlay from 'components/SplashOverlay'
import StartButton from 'components/StartButton'
import { FunctionalComponent } from 'preact'
import { RoutableProps } from 'preact-router'
import { useState } from 'preact/hooks'

const Golf: FunctionalComponent<RoutableProps> = () => {
  const [start, setStart] = useState(false)

  const onStartBtnClick = () => {
    setStart(true)
  }

  if (start) return <GolfXrScene />

  return (
    <SplashOverlay open={true} variant='golf'>
      <StartButton onClick={onStartBtnClick} variant='golf' />
      <BackToGalleryLink />
    </SplashOverlay>
  )
}

export default Golf
