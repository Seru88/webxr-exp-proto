/* eslint-disable */
import 'index.css'
import { render } from 'preact'
import { App } from './app'

declare global {
  interface Window {
    XR8: any
    XRExtras: any
    LandingPage: any
    TWEEN: any
  }
}

render(<App />, document.getElementById('app') as HTMLElement)
