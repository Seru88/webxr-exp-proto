import type { Observable } from '@babylonjs/core/Misc/observable'
import type { XrImageTargetInfoEvent, XrImageTarget } from 'types/eigthWall'

declare module '@babylonjs/core/scene' {
  interface Scene {
    onXrImageLoadingObservable: Observable<{ imageTargets: XrImageTarget[] }>
    onXrImageScanningObservable: Observable<{ imageTargets: XrImageTarget[] }>
    onXrImageFoundObservable: Observable<XrImageTargetInfoEvent>
    onXrImageUpdatedObservable: Observable<XrImageTargetInfoEvent>
    onXrImageLostObservable: Observable<XrImageTargetInfoEvent>
  }
}
