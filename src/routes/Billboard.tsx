import BackToGalleryLink from 'components/BackToGalleryLink'
import { BillboardXrScene } from 'components/BillboardXrScene'
// import { BoothXrScene } from 'components/BoothXrScene'
import SplashOverlay from 'components/SplashOverlay'
import StartButton from 'components/StartButton'
import { FunctionalComponent } from 'preact'
import { RoutableProps } from 'preact-router'
import { useState } from 'preact/hooks'

const Billboard: FunctionalComponent<RoutableProps> = () => {
  const [start, setStart] = useState(false)

  const onStartBtnClick = () => {
    setStart(true)
  }

  if (start) return <BillboardXrScene />

  return (
    <SplashOverlay open={true} variant='billboard'>
      <StartButton onClick={onStartBtnClick} variant='billboard' />
      {/* <h1 class='text-3xl font-bold'>Coming Soon</h1> */}
      <BackToGalleryLink />
    </SplashOverlay>
  )
}

export default Billboard
