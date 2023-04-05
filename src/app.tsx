import LoadingIndicator from 'components/LoadingIndicator'
import SplashOverlay from 'components/SplashOverlay'
import AsyncRoute from 'preact-async-route'
import Router from 'preact-router'
import Home from 'routes/Home'

export function App() {
  return (
    <div class='h-[100dvh]'>
      <Router>
        <Home path='/' />
        <AsyncRoute
          path='/billboard'
          getComponent={() =>
            import('routes/Billboard').then(module => module.default)
          }
          loading={() => (
            <SplashOverlay open variant='billboard'>
              <LoadingIndicator variant='billboard' showText={false} />
            </SplashOverlay>
          )}
        />
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
          path='/brochure'
          getComponent={() =>
            import('routes/Brochure').then(module => module.default)
          }
          loading={() => (
            <SplashOverlay open variant='brochure'>
              <LoadingIndicator variant='brochure' showText={false} />
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
        {/* <AsyncRoute
          path='/college'
          getComponent={() =>
            import('routes/College').then(module => module.default)
          }
          loading={() => (
            <SplashOverlay open variant='college'>
              <LoadingIndicator variant='college' showText={false} />
            </SplashOverlay>
          )}
        /> */}
        <AsyncRoute
          path='/golf'
          getComponent={() =>
            import('routes/Golf').then(module => module.default)
          }
          loading={() => (
            <SplashOverlay open variant='golf'>
              <LoadingIndicator variant='golf' showText={false} />
            </SplashOverlay>
          )}
        />
        <AsyncRoute
          path='/electro-booth'
          getComponent={() =>
            import('routes/ElectroBooth').then(module => module.default)
          }
          loading={() => (
            <SplashOverlay open variant='electro-booth'>
              <LoadingIndicator variant='electro-booth' showText={false} />
            </SplashOverlay>
          )}
        />
        <AsyncRoute
          path='/electro-globe'
          getComponent={() =>
            import('routes/ElectroGlobe').then(module => module.default)
          }
          loading={() => (
            <SplashOverlay open variant='electro-globe'>
              <LoadingIndicator variant='electro-globe' showText={false} />
            </SplashOverlay>
          )}
        />
      </Router>
    </div>
  )
}
