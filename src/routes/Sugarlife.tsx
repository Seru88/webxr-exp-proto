import SplashOverlay from 'components/SplashOverlay'
import StartButton from 'components/StartButton'
import { SugarlifeXrScene } from 'components/SugarlifeXrScene'
import { FunctionalComponent } from 'preact'
import { RoutableProps } from 'preact-router'
import { useState } from 'preact/hooks'

const Sugarlife: FunctionalComponent<RoutableProps> = () => {
  const [start, setStart] = useState(false)

  const onStartBtnClick = () => {
    setStart(true)
  }

  if (start) return <SugarlifeXrScene />

  return (
    <SplashOverlay open={true} variant='sugarlife'>
      <StartButton onClick={onStartBtnClick} variant='sugarlife' />
    </SplashOverlay>
  )
}

export default Sugarlife
