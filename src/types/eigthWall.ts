export type XrImageTargetType = 'FLAT' | 'CYLINDRICAL' | 'CONICAL'

export interface XrImageTarget {
  name: string
  type: XrImageTargetType
  metadata: any
}

export interface XrImageTargetInfoEvent extends XrImageTarget {
  position: { x: number; y: number; z: number }
  rotation: { x: number; y: number; z: number; w: number }
  scale: number
  scaleWidth: number
  scaledHeight: number
  height?: number
  radiusTop?: number
  radiusBottom?: number
  arcStartRadians?: number
  arcLengthRadians?: number
}
