/* eslint-disable */
import 'global.css'
import { render } from 'preact'
import { App } from './app'
import * as BABYLON from '@babylonjs/core/Legacy/legacy'

declare global {
  interface Window {
    XR8: any
    XRExtras: any
    LandingPage: any
    TWEEN: any
    BABYLON: typeof BABYLON
  }
}

/**
 *  Append BABYLON to window for 8th Wall
 */
;(window.BABYLON as any) = BABYLON

render(<App />, document.getElementById('app') as HTMLElement)
