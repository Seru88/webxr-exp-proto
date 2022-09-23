import 'index.css'
// @ts-expect-error false reporting
import { render } from 'preact'
import { App } from './app'

render(<App />, document.getElementById('app') as HTMLElement)
