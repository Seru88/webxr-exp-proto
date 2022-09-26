import Router from 'preact-router'
import Home from 'routes/Home'
import AsyncRoute from 'preact-async-route'
import PromptScreen from 'components/PromptScreen'
import LoadingPrompt from 'components/LoadingPrompt'

declare global {
  interface Navigator {
    xr: any
  }
}

export function App() {
  return (
    <div class='w-screen h-screen'>
      <Router>
        <Home path='/' />
        <AsyncRoute
          path='/xr'
          getComponent={() =>
            import('routes/XrScene').then(module => module.default)
          }
          loading={() => (
            <PromptScreen
              show
              prompt={
                <LoadingPrompt
                  message={
                    <>
                      <h6>Loading</h6>
                      <h6>Experience</h6>
                    </>
                  }
                />
              }
            />
          )}
        />
      </Router>
    </div>
  )
}
