// import BackToGalleryLink from 'components/BackToGalleryLink'
import { ElectroBoothXrScene } from 'components/ElectroBoothXrScene'
import SplashOverlay from 'components/SplashOverlay'
import StartButton from 'components/StartButton'
import { FunctionalComponent } from 'preact'
import { RoutableProps } from 'preact-router'
import { useState } from 'preact/hooks'

const ElectroBooth: FunctionalComponent<RoutableProps> = () => {
  const [start, setStart] = useState(false)

  const onStartBtnClick = () => {
    setStart(true)
  }

  if (start) return <ElectroBoothXrScene />

  return (
    <SplashOverlay open={true} variant='electro-booth'>
      <StartButton
        onClick={onStartBtnClick}
        variant='electro-booth'
        text='Enter AR Booth'
      />
      {/* <BackToGalleryLink /> */}
    </SplashOverlay>
  )
}

export default ElectroBooth
