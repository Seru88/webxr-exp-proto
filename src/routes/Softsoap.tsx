import SplashOverlay from 'components/SplashOverlay'
import StartButton from 'components/StartButton'
import { FunctionalComponent } from 'preact'
import { RoutableProps } from 'preact-router'
import { useState } from 'preact/hooks'
import { SoftsoapXrScene } from 'scenes/SoftsoapXrScene'

const Softsoap: FunctionalComponent<RoutableProps> = () => {
  const [start, setStart] = useState(false)

  const onStartBtnClick = () => {
    setStart(true)
  }

  if (start) return <SoftsoapXrScene />

  return (
    <SplashOverlay open={true} variant='softsoap'>
      <StartButton onClick={onStartBtnClick} variant='softsoap' />
    </SplashOverlay>
  )
}

export default Softsoap
