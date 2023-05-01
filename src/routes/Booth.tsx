import BackToGalleryLink from 'components/BackToGalleryLink'
import { BoothXrScene } from 'scenes/BoothXrScene'
import SplashOverlay from 'components/SplashOverlay'
import StartButton from 'components/StartButton'
import { FunctionalComponent } from 'preact'
import { RoutableProps } from 'preact-router'
import { useState } from 'preact/hooks'

const Booth: FunctionalComponent<RoutableProps> = () => {
  const [start, setStart] = useState(false)

  const onStartBtnClick = () => {
    setStart(true)
  }

  if (start) return <BoothXrScene />

  return (
    <SplashOverlay open={true} variant='booth'>
      <StartButton onClick={onStartBtnClick} variant='booth' />
      <BackToGalleryLink light />
    </SplashOverlay>
  )
}

export default Booth
