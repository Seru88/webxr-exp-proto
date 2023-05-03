// import BackToGalleryLink from 'components/BackToGalleryLink'
// import SplashOverlay from 'components/SplashOverlay'
// import StartButton from 'components/StartButton'
import { FunctionalComponent } from 'preact'
import { RoutableProps } from 'preact-router'
// import { useState } from 'preact/hooks'
import { LiverXrScene } from 'scenes/LiverXrScene'

const Liver: FunctionalComponent<RoutableProps> = () => {
  // const [start, setStart] = useState(false)

  // const onStartBtnClick = () => {
  //   setStart(true)
  // }

  // if (start) return <LiverXrScene />
  return <LiverXrScene />

  // return (
  //   <SplashOverlay open={true} variant='liver'>
  //     <StartButton
  //       onClick={onStartBtnClick}
  //       variant='liver'
  //       // text='Enter AR Booth'
  //     />
  //     {/* <BackToGalleryLink /> */}
  //   </SplashOverlay>
  // )
}

export default Liver
