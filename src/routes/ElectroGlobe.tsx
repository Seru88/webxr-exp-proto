// import BackToGalleryLink from 'components/BackToGalleryLink'
import { ElectroGlobeXrScene } from 'components/ElectroGlobeXrScene'
import SplashOverlay from 'components/SplashOverlay'
import StartButton from 'components/StartButton'
import { FunctionalComponent } from 'preact'
import { RoutableProps } from 'preact-router'
import { useState } from 'preact/hooks'

const ElectroGlobe: FunctionalComponent<RoutableProps> = () => {
  const [start, setStart] = useState(false)

  const onStartBtnClick = () => {
    setStart(true)
  }

  if (start) return <ElectroGlobeXrScene />

  return (
    <SplashOverlay open={true} variant='electro-globe'>
      <StartButton
        onClick={onStartBtnClick}
        variant='electro-globe'
        // text='Preview in Augmented Reality'
      />
      {/* <BackToGalleryLink /> */}
    </SplashOverlay>
  )
}

export default ElectroGlobe
