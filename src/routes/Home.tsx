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
        <div class='w-full flex justify-center mt-32'>
          <Link href='/xr'>
            <img class='w-[256px]' src={startBtnPath} alt='start' />
          </Link>
        </div>
      }
    />
  )
}

export default Home
