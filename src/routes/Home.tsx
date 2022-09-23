import { FC } from 'preact/compat'
import { Link } from 'preact-router/match'
import { RoutableProps } from 'preact-router'

const Home: FC<RoutableProps> = () => {
  return (
    <div class='flex justify-center items-center h-screen'>
      <Link
        // @ts-expect-error fale repoting
        class='p-4 bg-slate-800 text-white'
        activeClassName='active'
        href='/xr'
      >
        Go to Scene
      </Link>
    </div>
  )
}

export default Home
