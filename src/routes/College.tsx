import BackToGalleryLink from 'components/BackToGalleryLink'
import { CollegeXrScene } from 'scenes/CollegeXrScene'
import SplashOverlay from 'components/SplashOverlay'
import StartButton from 'components/StartButton'
import { FunctionalComponent } from 'preact'
import { RoutableProps } from 'preact-router'
import { useState } from 'preact/hooks'

const College: FunctionalComponent<RoutableProps> = () => {
  const [start, setStart] = useState(false)

  const onStartBtnClick = () => {
    setStart(true)
  }

  if (start) return <CollegeXrScene />

  return (
    <SplashOverlay open={true} variant='college'>
      <StartButton onClick={onStartBtnClick} variant='college' />
      {/* <h1 class='text-3xl font-bold'>Coming Soon</h1> */}
      <BackToGalleryLink />
    </SplashOverlay>
  )
}

export default College
