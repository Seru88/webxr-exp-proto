import '@babylonjs/core/Helpers/sceneHelpers '
import '@babylonjs/core/Materials/Textures/Loaders/envTextureLoader'
import '@babylonjs/loaders/glTF'

import {
  ArcRotateCamera,
  Color3,
  CubeTexture,
  DirectionalLight,
  Engine,
  HemisphericLight,
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
  WebXRDefaultExperience,
  WebXRDomOverlay,
  WebXRHitTest,
  WebXRState
} from '@babylonjs/core/XR'
import model_src from 'assets/models/car_model.glb'
import tap_palce_texture_src from 'assets/textures/cursor.png'
import enter_ar_btn_src from 'assets/ui/enter_ar_btn.png'
import exit_ar_btn_src from 'assets/ui/exit_ar_btn.png'
import pinch_icon_src from 'assets/ui/pinch_icon.png'
import surface_icon_src from 'assets/ui/surface_icon.png'
import tap_place_icon_src from 'assets/ui/tap_to_place_icon.png'
import info_btn_src from 'assets/ui/info_btn.png'
import LoadingPrompt from 'components/LoadingPrompt'
import PromptScreen from 'components/PromptScreen'
import { FunctionalComponent } from 'preact'
import { RoutableProps } from 'preact-router'
import { useEffect, useRef, useState } from 'preact/hooks'

import type { Mesh } from '@babylonjs/core/Meshes/mesh'

const iOS = () => {
  return (
    [
      'iPad Simulator',
      'iPhone Simulator',
      'iPod Simulator',
      'iPad',
      'iPhone',
      'iPod'
    ].includes(navigator.platform) ||
    // iPad on iOS 13 detection
    (navigator.userAgent.includes('Mac') && 'ontouchend' in document)
  )
}

const camFOV = 0.8
const camInertia = 0.9
const camRadius = 13
const camMinZ = 1
const camAlpha = -Math.PI / 4
const camBeta = Math.PI / 3
const camLowerRadius = 5
const camUpperRadius = 15
const camWheelDeltaPercentage = 0.01
const camWheelPrecision = 50
let rootModel: Mesh | null = null
let xr: WebXRDefaultExperience
// let dirLight: DirectionalLight | null = null

const XrScene: FunctionalComponent<RoutableProps> = () => {
  const [arSupported, setArSupported] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [showInfo, setShowInfo] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const infoBtnRef = useRef<HTMLButtonElement | null>(null)
  const exitBtnRef = useRef<HTMLButtonElement | null>(null)

  const initScene = async () => {
    const canvas = canvasRef.current
    const infoBtn = infoBtnRef.current
    const exitBtn = exitBtnRef.current
    if (canvas) {
      const engine = new Engine(canvas, true, {
        stencil: true,
        preserveDrawingBuffer: true,
        // iOS does not support WebGL2
        disableWebGL2Support: iOS()
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
        // groundColor: Color3.Gray(),
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
      new DirectionalLight('directional-light', Vector3.Down(), scene)
      const ambLight = new HemisphericLight(
        'ambient-light',
        Vector3.Up(),
        scene
      )
      ambLight.intensity = 0.7

      /**
       * Show loading screen while loading assets.
       */
      // engine.loadingScreen = new CustomSceneLoadingScreen(loadingScreen)
      // engine.displayLoadingUI()

      /**
       * Create transform node for easier model manipulation.
       */
      const transNode = new TransformNode('trans-node', scene)
      transNode.rotationQuaternion = new Quaternion()

      /**
       * Create hit-test indicator for AR.
       */
      const indicatorTexture = new Texture(tap_palce_texture_src, scene)
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
        model_src,
        '',
        scene,
        (meshes, pS, skl, animationsGroup) => {
          setIsLoading(false)
          animationsGroup[0].stop()
          rootModel = meshes[0] as Mesh
          for (const mesh of meshes) {
            mesh.isPickable = false
          }
          rootModel.parent = transNode
          rootModel.rotate(Vector3.Up(), Math.PI)
          const { max, min } = rootModel.getHierarchyBoundingVectors(true)
          const bInfo = rootModel.buildBoundingInfo(min, max)
          rootModel.setBoundingInfo(bInfo)
          camera.setTarget(rootModel, true, false, true)
          // camera.setTarget(transNode.position)
          // engine.hideLoadingUI()
        },
        xhr => {
          setProgress((xhr.loaded / xhr.total) * 100)
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

      if (!iOS()) {
        /**
         * Create xr helper in immersive-ar mode.
         */
        xr = await scene.createDefaultXRExperienceAsync({
          disableDefaultUI: true,
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
         * Enable DOM overlay
         */
        fm.enableFeature(WebXRDomOverlay, 'latest', {
          element: '#ar-overlay'
        })

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
        const getDistance = (
          x0: number,
          x1: number,
          y0: number,
          y1: number
        ) => {
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

        /**
         * React to XR state changes accordingly
         */
        xr.baseExperience.onStateChangedObservable.add(xrState => {
          if (rootModel) {
            switch (xrState) {
              case WebXRState.ENTERING_XR:
                camera.detachControl()
                // Make sure to re-attach pointer selection
                xr.pointerSelection.attach()
                break
              case WebXRState.EXITING_XR: {
                pointerCache.clear()
                break
              }
              case WebXRState.IN_XR:
                transNode.setEnabled(false)
                rootModel.scalingDeterminant = 0.25
                scene.onPointerObservable.add(onSceneXrPointer)
                break
              case WebXRState.NOT_IN_XR: {
                scene.onPointerObservable.removeCallback(onSceneXrPointer)
                camera.attachControl(canvas, true)
                rootModel.scalingDeterminant = 1
                transNode.position = Vector3.Zero()
                transNode.scaling = Vector3.One()
                transNode.rotationQuaternion = new Quaternion()
                transNode.setEnabled(true)
                const { max, min } = rootModel.getHierarchyBoundingVectors(true)
                const bInfo = rootModel.buildBoundingInfo(min, max)
                rootModel.setBoundingInfo(bInfo)
                camera.setTarget(rootModel, true, false, true)
                camera.radius = camRadius
                camera.alpha = camAlpha
                camera.beta = camBeta
                setShowInfo(false)
                break
              }
            }
          }
        })
      }

      /**
       * Prevent scene pointer events on WebXRDomOverlay elements
       */
      if (infoBtn) {
        infoBtn.addEventListener('beforexrselect', () => {
          xr.pointerSelection.detach()
        })
      }
      if (exitBtn) {
        exitBtn.addEventListener('beforexrselect', () => {
          xr.pointerSelection.detach()
        })
      }

      engine.runRenderLoop(() => {
        scene.render()
      })

      window.addEventListener('resize', () => {
        engine.resize()
      })
    }
  }

  const handleEnterArBtnClick = () => {
    if (xr) {
      xr.baseExperience.enterXRAsync('immersive-ar', 'local-floor')
    }
  }

  const handleInfoBtnClick = () => {
    setShowInfo(prev => !prev)
    if (xr) {
      if (showInfo) {
        setTimeout(() => {
          xr.pointerSelection.attach()
        }, 100)
      }
    }
  }

  const handleExitArBtnClick = () => {
    if (xr) {
      // if (xr.pointerSelection.attached === false) {
      //   xr.pointerSelection.attach()
      // }
      xr.baseExperience.exitXRAsync()
    }
    // setShowInfo(false)
  }

  useEffect(() => {
    initScene()
    if (navigator.xr) {
      navigator.xr.isSessionSupported('immersive-ar').then(isSupported => {
        setArSupported(isSupported)
      })
    }
  }, [])

  return (
    <>
      <PromptScreen
        show={isLoading}
        prompt={
          <LoadingPrompt
            message={
              <>
                <h6>Loading</h6>
                <h6>Experience</h6>
              </>
            }
            progress={progress}
          />
        }
      />
      {arSupported && (
        <div class='z-[12] absolute bottom-10 w-full flex justify-center'>
          <button id='start_ar_button' onClick={handleEnterArBtnClick}>
            <img class='h-9' src={enter_ar_btn_src} alt='Start AR' />
          </button>
        </div>
      )}
      <canvas
        id='render-canvas'
        ref={canvasRef}
        class='h-screen w-screen overflow-hidden outline-none'
      />
      <div
        id='ar-overlay'
        class='z-[-12] absolute top-0 w-screen h-screen p-4 flex flex-col justify-center items-center'
      >
        <div>
          <button
            id='info'
            ref={infoBtnRef}
            class='absolute top-5 right-5'
            onClick={handleInfoBtnClick}
          >
            <img
              class='w-14 h-14'
              src={info_btn_src}
              alt='Start immersive-ar'
            />
          </button>
          {showInfo && (
            <div class='max-w-[295] rounded-lg shadow-lg bg-white'>
              <div class='uppercase text-center py-3'>Instructions</div>
              <hr />
              <div class='p-4'>
                <div class='w-full flex items-center mt-1 mb-4'>
                  <img class='w-12' src={surface_icon_src} alt='' />
                  <div class='flex-grow ml-3'>
                    Point at a horizontal surface to detect it.
                  </div>
                </div>
                <div class='w-full flex items-center my-3'>
                  <img class='w-12' src={tap_place_icon_src} alt='' />
                  <div class='flex-grow ml-3'>Tap screen to place model.</div>
                </div>
                <div class='w-full flex items-center mb-1 mt-4'>
                  <img class='w-12' src={pinch_icon_src} alt='' />
                  <div class='flex-grow ml-3'>
                    You can pinch to scale, rotate and drag to move the model.
                  </div>
                </div>
              </div>
            </div>
          )}
          <button
            id='exit'
            ref={exitBtnRef}
            class='absolute bottom-5 right-5'
            onClick={handleExitArBtnClick}
          >
            <img
              class='w-14 h-14'
              src={exit_ar_btn_src}
              alt='Start immersive-ar'
            />
          </button>
        </div>
      </div>
    </>
  )
}

export default XrScene
