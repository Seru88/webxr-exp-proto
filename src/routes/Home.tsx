import { FunctionalComponent } from 'preact'
import { RoutableProps } from 'preact-router'
import { Link } from 'preact-router/match'

const Home: FunctionalComponent<RoutableProps> = () => {
  return (
    <div>
      <div>
        <Link href='/sugarlife'>Go To Sugarlife</Link>
      </div>
      <div>
        <Link href='/booth'>Go To Booth</Link>
      </div>
      <div>
        <Link href='/ford'>Go To Ford</Link>
      </div>
    </div>
  )
}

export default Home
