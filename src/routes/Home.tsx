import PromptScreen from 'components/PromptScreen'
import { FunctionalComponent } from 'preact'
import { RoutableProps } from 'preact-router'
import { Link } from 'preact-router/match'
import start_btn_src from 'assets/ui/start_btn.png'

const Home: FunctionalComponent<RoutableProps> = () => {
  return (
    <PromptScreen
      show={true}
      prompt={
        <Link href='/xr'>
          <img class='h-20' src={start_btn_src} alt='start' />
        </Link>
      }
    />
  )
}

export default Home
