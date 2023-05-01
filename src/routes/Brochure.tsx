import BackToGalleryLink from 'components/BackToGalleryLink'
import { BrochureXrScene } from 'scenes/BrochureXrScene'
import SplashOverlay from 'components/SplashOverlay'
import StartButton from 'components/StartButton'
import { FunctionalComponent } from 'preact'
import { RoutableProps } from 'preact-router'
import { useState } from 'preact/hooks'

const Brochure: FunctionalComponent<RoutableProps> = () => {
  const [start, setStart] = useState(false)

  const onStartBtnClick = () => {
    setStart(true)
  }

  if (start) return <BrochureXrScene />

  return (
    <SplashOverlay open={true} variant='brochure'>
      <StartButton onClick={onStartBtnClick} variant='brochure' />
      {/* <h1 class='text-3xl font-bold'>Coming Soon</h1> */}
      <BackToGalleryLink />
    </SplashOverlay>
  )
}

export default Brochure
