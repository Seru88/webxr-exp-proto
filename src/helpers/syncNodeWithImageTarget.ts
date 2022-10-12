import { Quaternion } from '@babylonjs/core/Maths/math.vector'

import type { TransformNode } from '@babylonjs/core/Meshes/transformNode'
import type { XrImageTargetInfoEvent } from 'types/eigthWall'

const syncNodeWithImageTargetInfo = (
  node: TransformNode,
  event: XrImageTargetInfoEvent,
  scaleAdjustment: number
) => {
  const { position, scale, rotation } = event
  node.position.set(position.x, position.y, position.z)
  if (node.rotationQuaternion === null) {
    node.rotationQuaternion = new Quaternion()
  }
  node.rotationQuaternion.set(rotation.x, rotation.y, rotation.z, rotation.w)
  const adjustedScale = scale * scaleAdjustment
  node.scaling.set(adjustedScale, adjustedScale, adjustedScale)
}

export default syncNodeWithImageTargetInfo
