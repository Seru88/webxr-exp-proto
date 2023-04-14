import { Vector3 } from '@babylonjs/core'

import type { Mesh, TransformNode } from '@babylonjs/core'

const meshGestureBehavior = (
  canvas: HTMLCanvasElement,
  sceneObj: Mesh | TransformNode
) => {
  let startingPoint: Vector3 | null = null
  let currentScale = sceneObj.scaling.x
  let currentRotation = sceneObj.rotation.y
  let startDistance = 0
  let startAngle = currentRotation
  let touchStartAngle = 0
  const minScale = 0.1
  const maxScale = 4
  const scene = sceneObj.getScene()

  const getTwoFingerCoordinates = (event: TouchEvent) => ({
    x0: event.touches[0].pageX,
    y0: event.touches[0].pageY,
    x1: event.touches[1].pageX,
    y1: event.touches[1].pageY
  })

  const getGroundPosition = (event: TouchEvent) => {
    const pickinfo = scene.pick(
      event.touches[0].pageX,
      event.touches[0].pageY,
      function (mesh) {
        return mesh.name === 'ground'
      }
    )
    if (pickinfo?.hit) {
      return pickinfo.pickedPoint
    }

    return null
  }

  // Calculate distance between two fingers
  const getDistance = (x0: number, x1: number, y0: number, y1: number) => {
    return Math.hypot(x0 - x1, y0 - y1)
  }

  // Calculate scale between two distances
  const getScale = (delta: number, start: number) => {
    let scale = delta / start
    scale = Math.min(Math.max(minScale, scale), maxScale)
    return scale
  }

  // Calculate rotation of two finger touches
  const getTouchAngle = (x0: number, x1: number, y0: number, y1: number) => {
    return Math.atan2(y0 - y1, x0 - x1)
  }

  const getAngleDiff = (delta: number, start: number) => {
    return delta - start
  }

  const handleTouchStart = (event: TouchEvent) => {
    const touches = event.touches.length
    if (touches === 1) {
      event.preventDefault()
      startingPoint = getGroundPosition(event)
    } else if (touches === 2) {
      event.preventDefault()
      const { x0, x1, y0, y1 } = getTwoFingerCoordinates(event)
      startDistance = getDistance(x0, x1, y0, y1) / currentScale
      touchStartAngle = getTouchAngle(x0, x1, y0, y1)
      startAngle = currentRotation
    }
  }
  canvas.addEventListener('touchstart', handleTouchStart)

  const handleTouchMove = (event: TouchEvent) => {
    const touches = event.touches.length
    if (touches === 1) {
      startingPoint = startingPoint ?? getGroundPosition(event)
      if (!startingPoint) {
        return
      }
      const current = getGroundPosition(event)
      if (!current) {
        return
      }
      const diff = current.subtract(startingPoint)
      sceneObj.position.addInPlace(diff)
      startingPoint = current
    } else if (touches === 2) {
      event.preventDefault()
      const { x0, x1, y0, y1 } = getTwoFingerCoordinates(event)
      const distanceChange = getDistance(x0, x1, y0, y1)
      const angleChange = getTouchAngle(x0, x1, y0, y1)
      currentScale = getScale(distanceChange, startDistance)
      currentRotation = getAngleDiff(angleChange, touchStartAngle) + startAngle
      sceneObj.scaling = new Vector3(currentScale, currentScale, currentScale)
      sceneObj.rotation = new Vector3(
        sceneObj.rotation.x,
        currentRotation,
        sceneObj.rotation.z
      )
    }
  }
  canvas.addEventListener('touchmove', handleTouchMove)

  const handleTouchEnd = (event: TouchEvent) => {
    if (event.touches.length === 1) {
      event.preventDefault()
      if (startingPoint) {
        startingPoint = null
        return
      }
    }
  }
  canvas.addEventListener('touchend', handleTouchEnd)

  return () => {
    canvas.removeEventListener('touchstart', handleTouchStart)
    canvas.removeEventListener('touchmove', handleTouchMove)
    canvas.removeEventListener('touchend', handleTouchEnd)
  }
}

export default meshGestureBehavior
