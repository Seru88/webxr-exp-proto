import FordXrScene from 'components/FordXrScene'
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
    <SplashOverlay open={true} variant='ford'>
      <StartButton onClick={onStartBtnClick} variant='ford' />
    </SplashOverlay>
  )
}

export default Ford
