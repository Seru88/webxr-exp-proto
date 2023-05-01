import BackToGalleryLink from 'components/BackToGalleryLink'
import FordXrScene from 'scenes/FordXrScene'
import SplashOverlay from 'components/SplashOverlay'
import StartButton from 'components/StartButton'
import { FunctionalComponent } from 'preact'
import { RoutableProps } from 'preact-router'
import { useState } from 'preact/hooks'

const Ford: FunctionalComponent<RoutableProps> = () => {
  const [start, setStart] = useState(false)

  const onStartBtnClick = () => {
    setStart(true)
  }

  if (start) return <FordXrScene />

  return (
    <SplashOverlay open={true} variant='car'>
      <StartButton onClick={onStartBtnClick} variant='car' />
      <BackToGalleryLink />
    </SplashOverlay>
  )
}

export default Ford
