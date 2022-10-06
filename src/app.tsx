import LoadingIndicator from 'components/LoadingIndicator'
import SplashOverlay from 'components/SplashOverlay'
import AsyncRoute from 'preact-async-route'
import Router from 'preact-router'
import Home from 'routes/Home'

export function App() {
  return (
    <div class='w-screen h-screen'>
      <Router>
        <Home path='/' />
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
          path='/ford'
          getComponent={() =>
            import('routes/Ford').then(module => module.default)
          }
          loading={() => (
            <SplashOverlay open variant='ford'>
              <LoadingIndicator variant='ford' showText={false} />
            </SplashOverlay>
          )}
        />
        <AsyncRoute
          path='/sugarlife'
          getComponent={() =>
            import('routes/Sugarlife').then(module => module.default)
          }
          loading={() => (
            <SplashOverlay open variant='sugarlife'>
              <LoadingIndicator variant='sugarlife' showText={false} />
            </SplashOverlay>
          )}
        />
      </Router>
    </div>
  )
}
