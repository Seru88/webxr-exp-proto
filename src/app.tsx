import Router from 'preact-router'
import Home from 'routes/Home'
import AsyncRoute from 'preact-async-route'

export function App() {
  return (
    // @ts-expect-error this works fine
    <Router>
      <Home path='/' />
      {/* <XrScene path='/xr' /> */}
      {/* @ts-expect-error false reporting */}
      <AsyncRoute
        path='/xr'
        getComponent={() =>
          import('routes/XrScene').then(module => module.default)
        }
        loading={() => <div>loading...</div>}
      />
    </Router>
  )
}
