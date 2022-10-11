import LoadingIndicator from 'components/LoadingIndicator'
import SplashOverlay from 'components/SplashOverlay'
import AsyncRoute from 'preact-async-route'
import Router from 'preact-router'
import Billboard from 'routes/Billboard'
import College from 'routes/College'
import Golf from 'routes/Golf'
import Home from 'routes/Home'

export function App() {
  return (
    <div class='w-screen h-screen'>
      <Router>
        <Home path='/' />
        <Golf path='/golf' />
        <College path='/college' />
        <Billboard path='/billboard' />
        <AsyncRoute
          path='/booth'
          getComponent={() =>
            import('routes/Booth').then(module => module.default)
          }
          loading={() => (
            <SplashOverlay open variant='booth'>
              <LoadingIndicator variant='booth' showText={false} />
            </SplashOverlay>
          )}
        />
        <AsyncRoute
          path='/car'
          getComponent={() =>
            import('routes/Ford').then(module => module.default)
          }
          loading={() => (
            <SplashOverlay open variant='car'>
              <LoadingIndicator variant='car' showText={false} />
            </SplashOverlay>
          )}
        />
        <AsyncRoute
          path='/candy'
          getComponent={() =>
            import('routes/Sugarlife').then(module => module.default)
          }
          loading={() => (
            <SplashOverlay open variant='candy'>
              <LoadingIndicator variant='candy' showText={false} />
            </SplashOverlay>
          )}
        />
      </Router>
    </div>
  )
}
