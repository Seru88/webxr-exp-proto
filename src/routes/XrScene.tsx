import '@babylonjs/core/Helpers/sceneHelpers '
import '@babylonjs/core/Materials/Textures/Loaders/envTextureLoader'
import '@babylonjs/loaders/glTF'

import {
  ArcRotateCamera,
  Color3,
  CubeTexture,
  DirectionalLight,
  Engine,
  MeshBuilder,
  PBRMaterial,
  PointerEventTypes,
  PointerInfo,
  Quaternion,
  Scene,
  SceneLoader,
  StandardMaterial,
  Texture,
  TransformNode,
  Vector3
} from '@babylonjs/core'
import {
  WebXRBackgroundRemover,
  WebXRHitTest,
  WebXRState
} from '@babylonjs/core/XR'
import modelPath from 'assets/models/car_model.glb'
import indicatorPath from 'assets/textures/cursor.png'
import { RoutableProps } from 'preact-router'
import { FC, useEffect, useRef } from 'preact/compat'

import type { Mesh } from '@babylonjs/core/Meshes/mesh'

const camFOV = 0.8
const camInertia = 0.9
const camRadius = 8
const camMinZ = 1
const camAlpha = -Math.PI / 2
const camBeta = Math.PI / 2
const camLowerRadius = 5
const camUpperRadius = 15
const camWheelDeltaPercentage = 0.01
const camWheelPrecision = 50
let rootModel: Mesh | null = null
// let dirLight: DirectionalLight | null = null

const XrScene: FC<RoutableProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const initScene = async () => {
    const canvas = canvasRef.current
    if (canvas) {
      const engine = new Engine(canvas, true, {
        stencil: true,
        preserveDrawingBuffer: true
      })
      engine.enableOfflineSupport = false
      const scene = new Scene(engine)

      /**
       * Environment texture for 3d preview/skybox.
       */
      const hdrTexture = CubeTexture.CreateFromPrefilteredData(
        'https://assets.babylonjs.com/environments/environmentSpecular.env',
        scene
      )
      hdrTexture.coordinatesMode = Texture.CUBIC_MODE
      hdrTexture.updateSamplingMode(Texture.LINEAR_LINEAR)

      /**
       * 3D preview environment.
       */
      const envHelper = scene.createDefaultEnvironment({
        createGround: false,
        // groundColor: Color3.White(),
        // groundSize: 40,
        skyboxSize: 100,
        environmentTexture: hdrTexture
      })
      if (envHelper?.skybox) {
        const skyBoxMaterial = new PBRMaterial('skybox-mat', scene)
        skyBoxMaterial.reflectionTexture = hdrTexture.clone()
        skyBoxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE
        skyBoxMaterial.backFaceCulling = false

        skyBoxMaterial.microSurface = 0.7
        skyBoxMaterial.disableLighting = true
        envHelper.skybox.material = skyBoxMaterial
        envHelper.skybox.infiniteDistance = true
      }

      /**
       * Camera for 3d preview.
       */
      const camera = new ArcRotateCamera(
        'main-camera',
        camAlpha,
        camBeta,
        camRadius,
        Vector3.Zero(),
        scene
      )
      camera.inertia = camInertia
      camera.fov = camFOV
      camera.minZ = camMinZ
      camera.lowerRadiusLimit = camLowerRadius
      camera.upperRadiusLimit = camUpperRadius
      camera.wheelDeltaPercentage = camWheelDeltaPercentage
      camera.wheelPrecision = camWheelPrecision
      camera.attachControl(canvas, true)

      /**
       * Ligihting for 3d preview.
       */
      new DirectionalLight('light', Vector3.Down(), scene)

      /**
       * Show loading screen while loading assets.
       */
      engine.displayLoadingUI()

      const transNode = new TransformNode('trans-node', scene)
      transNode.rotationQuaternion = new Quaternion()

      /**
       * Create hit-test indicator for AR.
       */
      const indicatorTexture = new Texture(indicatorPath, scene)
      indicatorTexture.hasAlpha = true
      const indicatorMat = new StandardMaterial('indicator-mat', scene)
      indicatorMat.diffuseTexture = indicatorTexture
      indicatorMat.emissiveColor = Color3.White()
      indicatorMat.disableLighting = true
      const indicator = MeshBuilder.CreateGround(
        'indicator',
        { width: 1, height: 1 },
        scene
      )
      indicator.isPickable = false
      indicator.material = indicatorMat
      indicator.setEnabled(false)

      /**
       * Load model
       */
      SceneLoader.ImportMesh(
        '',
        modelPath,
        '',
        scene,
        (meshes, pS, skl, animationsGroup) => {
          animationsGroup[0].stop()
          rootModel = meshes[0] as Mesh
          for (const mesh of meshes) {
            mesh.isPickable = false
          }
          rootModel.parent = transNode
          rootModel.rotate(Vector3.Up(), Math.PI)
          // const { max, min } = rootModel.getHierarchyBoundingVectors(true)
          // const bInfo = rootModel.buildBoundingInfo(min, max)
          // rootModel.setBoundingInfo(bInfo)
          // camera.setTarget(rootModel, true, false, true)
          camera.setTarget(transNode.position)
          engine.hideLoadingUI()
        }
      )

      /**
       * Ground for dragging gesture.
       */
      const dragGround = MeshBuilder.CreateGround('drag-groudn', {
        width: 150,
        height: 150
      })
      dragGround.material = new StandardMaterial('drag-ground-mat', scene)
      dragGround.material.alpha = 0

      /**
       * Create xr helper in immersive-ar mode.
       */
      const xr = await scene.createDefaultXRExperienceAsync({
        uiOptions: {
          sessionMode: 'immersive-ar'
        },
        optionalFeatures: true,
        // @ts-expect-error should work just fine.
        pointerSelectionOptions: {
          enablePointerSelectionOnAllControllers: true
        }
      })

      const fm = xr.baseExperience.featuresManager

      /**
       * Enable background remover for ar session.
       */
      fm.enableFeature(WebXRBackgroundRemover, 'latest', {
        environmentHelperRemovalFlags: {
          skyBox: true,
          ground: false
        }
      })

      /**
       * Enable continuous hit-test in ar session.
       * TODO: Pause this when model isEnabled() and resume on entering xr.
       */
      const xrTest = fm.enableFeature(WebXRHitTest, 'latest', {
        // disablePermanentHitTest: true,
        // enableTransientHitTest: true
      }) as WebXRHitTest
      xrTest.onHitTestResultObservable.add(results => {
        if (results.length > 0 && transNode?.isEnabled() === false) {
          indicator.setEnabled(true)
          if (indicator.rotationQuaternion === null) {
            indicator.rotationQuaternion = new Quaternion()
          }
          if (dragGround.rotationQuaternion === null) {
            dragGround.rotationQuaternion = new Quaternion()
          }
          results[0].transformationMatrix.decompose(
            indicator.scaling,
            indicator.rotationQuaternion,
            indicator.position
          )
          results[0].transformationMatrix.decompose(
            dragGround.scaling,
            dragGround.rotationQuaternion,
            dragGround.position
          )
        }
      })

      const pointerCache = new Map<number, PointerEvent>()
      let startingPoint: Vector3 | null = null
      let currScalingFactor = transNode.scaling.x
      let currYRotation = transNode.rotationQuaternion.toEulerAngles().y
      let startDistance = 0
      let startAngle = 0
      let touchStartAngle = 0
      const minScalingFactor = 0.5
      const maxScalingFactor = 5

      const removePointerEventFromCache = (key: number) => {
        pointerCache.delete(key)
      }

      const getGroundPosition = (event: PointerEvent) => {
        const pickInfo = scene.pick(
          event.screenX,
          event.screenY,
          function (mesh) {
            return mesh.name === dragGround.name
          }
        )
        if (pickInfo?.hit) {
          return pickInfo.pickedPoint
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
        scale = Math.min(Math.max(minScalingFactor, scale), maxScalingFactor)
        return scale
      }

      // Calculate rotation of two finger touches
      const getTouchAngle = (
        x0: number,
        x1: number,
        y0: number,
        y1: number
      ) => {
        return Math.atan2(y0 - y1, x0 - x1)
      }

      const getAngleDiff = (delta: number, start: number) => {
        return delta - start
      }

      const getTwoFingerCoordinates = (pointerEvents: PointerEvent[]) => ({
        x0: pointerEvents[0].screenX,
        y0: pointerEvents[0].screenY,
        x1: pointerEvents[1].screenX,
        y1: pointerEvents[1].screenY
      })

      const onSceneXrPointer = (pointerInfo: PointerInfo) => {
        const pEvent = pointerInfo.event as PointerEvent
        const key = pEvent.pointerId
        pointerCache.set(key, pEvent)
        switch (pointerInfo.type) {
          case PointerEventTypes.POINTERDOWN: {
            if (indicator.isEnabled() && rootModel) {
              transNode.position = indicator.position
              transNode.scaling = indicator.scaling
              transNode.rotationQuaternion = indicator.rotationQuaternion
              indicator.setEnabled(false)
              transNode.setEnabled(true)
            }
            if (pointerCache.size === 1) {
              startingPoint = getGroundPosition(
                pointerInfo.event as PointerEvent
              )
            } else if (pointerCache.size === 2) {
              const { x0, x1, y0, y1 } = getTwoFingerCoordinates(
                Array.from(pointerCache.values())
              )
              startDistance = getDistance(x0, x1, y0, y1) / currScalingFactor
              touchStartAngle = getTouchAngle(x0, x1, y0, y1)
              startAngle = currYRotation
            }
            break
          }
          case PointerEventTypes.POINTERMOVE: {
            if (pointerCache.size === 1) {
              startingPoint =
                startingPoint ??
                getGroundPosition(pointerInfo.event as PointerEvent)
              if (!startingPoint) {
                return
              }
              const current = getGroundPosition(
                pointerInfo.event as PointerEvent
              )
              if (!current) {
                return
              }
              const diff = current.subtract(startingPoint)
              transNode.position.addInPlace(diff)
              startingPoint = current
            } else if (pointerCache.size === 2) {
              const { x0, x1, y0, y1 } = getTwoFingerCoordinates(
                Array.from(pointerCache.values())
              )
              const distanceChange = getDistance(x0, x1, y0, y1)
              const angleChange = getTouchAngle(x0, x1, y0, y1)
              currScalingFactor = getScale(distanceChange, startDistance)
              currYRotation =
                getAngleDiff(angleChange, touchStartAngle) + startAngle
              transNode.scaling = new Vector3(
                currScalingFactor,
                currScalingFactor,
                currScalingFactor
              )
              transNode.rotation = new Vector3(
                transNode.rotation.x,
                currYRotation,
                transNode.rotation.z
              )
            }
            break
          }
          case PointerEventTypes.POINTERUP: {
            if (pointerCache.size === 1) {
              if (startingPoint) {
                startingPoint === null
              }
            }
            removePointerEventFromCache(key)
            break
          }
        }
      }

      xr.baseExperience.onStateChangedObservable.add(xrState => {
        if (rootModel) {
          switch (xrState) {
            case WebXRState.ENTERING_XR:
              camera.detachControl()
              break
            case WebXRState.IN_XR:
              transNode.setEnabled(false)
              rootModel.scalingDeterminant = 0.25
              scene.onPointerObservable.add(onSceneXrPointer)
              break
            case WebXRState.EXITING_XR: {
              scene.onPointerObservable.removeCallback(onSceneXrPointer)
              camera.attachControl(canvas, true)
              rootModel.scalingDeterminant = 1
              transNode.setEnabled(true)
              camera.setTarget(transNode.position)
              camera.radius = camRadius
              camera.alpha = camAlpha
              camera.beta = camBeta
              break
            }
          }
        }
      })

      engine.runRenderLoop(() => {
        scene.render()
      })

      window.addEventListener('resize', () => {
        engine.resize()
      })
    }
  }

  useEffect(() => {
    initScene()
  }, [])

  return (
    <canvas
      id='render-canvas'
      ref={canvasRef}
      class='h-screen w-screen overflow-hidden outline-none'
    />
  )
}

export default XrScene
