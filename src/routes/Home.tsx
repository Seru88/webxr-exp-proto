import PromptScreen from 'components/PromptScreen'
import { FunctionalComponent } from 'preact'
import { RoutableProps } from 'preact-router'
import { Link } from 'preact-router/match'
import startBtnPath from 'assets/ui/ford_start_button.png'

const Home: FunctionalComponent<RoutableProps> = () => {
  return (
    <PromptScreen
      show={true}
      prompt={
        <div class='w-full absolute bottom-32 flex justify-center'>
          <Link href='/xr'>
            <img class='w-[230px]' src={startBtnPath} alt='start' />
          </Link>
        </div>
      }
    />
  )
}

export default Home
