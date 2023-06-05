import '@babylonjs/loaders/glTF'

import {
  ArcRotateCamera,
  AssetsManager,
  BoundingBoxGizmo,
  Color3,
  CubeTexture,
  DirectionalLight,
  Engine,
  EnvironmentHelper,
  FreeCamera,
  HemisphericLight,
  HighlightLayer,
  Mesh,
  MeshAssetTask,
  MeshBuilder,
  PBRMaterial,
  Scene,
  StandardMaterial,
  Texture,
  Tools,
  TransformNode,
  Vector3
} from '@babylonjs/core'
import red_globe_model_src from 'assets/models/softsoap/Globe1.glb'
import blue_globe_model_src from 'assets/models/softsoap/Globe2.glb'
import cursor_src from 'assets/textures/softsoap_cursor.png'
import instructions_src from 'assets/ui/softsoap/softsoap_instructions.png'
import Dialog from 'components/Dialog'
import LoadingIndicator from 'components/LoadingIndicator'
import SplashOverlay from 'components/SplashOverlay'
import meshGestureBehavior from 'helpers/meshGestureBehavior'
import { useEffect, useRef, useState } from 'preact/hooks'
import { isMobile } from 'react-device-detect'
import { MdPhotoCamera } from 'react-icons/md'

// import pinch_icon_src from 'assets/ui/pinch_icon.png'
// import surface_icon_src from 'assets/ui/surface_icon.png'
// import tap_place_icon_src from 'assets/ui/taptoplace_icon.png'
let engine: Engine
let scene: Scene
let envHelper: EnvironmentHelper | null
let orbitCam: ArcRotateCamera
let arCam: FreeCamera
let surface: Mesh
let placeCursor: Mesh
let rootNode: TransformNode
let redGlobeBB: Mesh
let blueGlobeBB: Mesh
// let animGroup: AnimationGroup
const startScale = Vector3.Zero() // Initial scale value for our model
const endScale = new Vector3(0.8, 0.8, 0.8) // Ending scale value for our model
const animationMillis = 1250
const camFOV = 0.8
const camInertia = 0.9
const camRadius = 5
const camMinZ = 1
const camAlpha = Math.PI
const camBeta = Math.PI / 2.5
const camLowerRadius = 5
const camUpperRadius = 50
const camWheelDeltaPercentage = 0.01
const camWheelPrecision = 50
const xrControllerConfig = {
  enableLighting: true,
  disableWorldTracking: !isMobile,
  imageTargets: ['Red_Globe', 'Blue_Globe']
}

export const SoftsoapXrScene = () => {
  const [started, setStarted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showInstructions, setShowInstructions] = useState(false)
  const [isArMode, setIsArMode] = useState(true)
  const [targetFound, setTargetFound] = useState(false)
  const [enableScreenshot, setEnableScreenshot] = useState(false)
  const [shaken, setShaken] = useState<any>()

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const removeMeshBehaviorRef = useRef<() => void>()
  const enableMotion = useRef(false)
  const motionDetectedTimeout = useRef<NodeJS.Timeout>()

  const placeObjectTouchHandler = (e: TouchEvent) => {
    // Reset AR Camera on two finger tap.
    if (e.touches.length === 3) {
      window.XR8.XrController.recenter()
    }
    // Don't do anything if more than 2 fingers.
    if (e.touches.length > 2) {
      return
    }
    if (rootNode.isEnabled() === false) {
      surface.isPickable = false
      rootNode.position = placeCursor.position
      rootNode.rotation = placeCursor.rotation
      rootNode.rotate(Vector3.Up(), Math.PI)

      const scale = { ...startScale }
      new window.TWEEN.Tween(scale)
        .to(endScale, animationMillis)
        .easing(window.TWEEN.Easing.Elastic.Out) // Use an easing function to make the animation smooth.
        .onStart(() => {
          placeCursor.setEnabled(false)
          rootNode.setEnabled(true)
        })
        .onUpdate(() => {
          rootNode.scaling.x = scale._x
          rootNode.scaling.y = scale._y
          rootNode.scaling.z = scale._z
        })
        // .onComplete(() => {
        //   // bgm.play()
        //   // animGroup.play(true)
        // })
        .start() // Start the tween immediately.
    }
  }

  const startScene = () => {
    const canvas = canvasRef.current
    if (canvas) {
      engine = new Engine(canvas, true, {
        stencil: true,
        preserveDrawingBuffer: true,
        antialias: true
      })
      engine.enableOfflineSupport = false
      engine.setHardwareScalingLevel(0.5)
      scene = new Scene(engine)

      const dirLight = new DirectionalLight(
        'DirectionalLight',
        new Vector3(-5, -10, 7),
        scene
      )
      dirLight.intensity = 0.7

      const ambientLight = new HemisphericLight(
        'AmbientLight',
        Vector3.Up(),
        scene
      )
      ambientLight.intensity = 1

      orbitCam = new ArcRotateCamera(
        'mainCam',
        camAlpha,
        camBeta,
        camRadius,
        Vector3.Zero(),
        scene
      )
      orbitCam.inertia = camInertia
      orbitCam.fov = camFOV
      orbitCam.minZ = camMinZ
      orbitCam.lowerRadiusLimit = camLowerRadius
      orbitCam.upperRadiusLimit = camUpperRadius
      orbitCam.wheelDeltaPercentage = camWheelDeltaPercentage
      orbitCam.wheelPrecision = camWheelPrecision
      orbitCam.attachControl(canvas, true)

      arCam = new FreeCamera('arCam', new Vector3(0, 0, 0), scene)
      arCam.position = new Vector3(0, 3, 0)
      arCam.setEnabled(false)

      // Create surface mesh
      surface = MeshBuilder.CreateGround('ground', {
        width: 150,
        height: 150
      })
      const surfaceMaterial = new StandardMaterial('groundMaterial', scene)
      surfaceMaterial.alpha = 0
      surface.material = surfaceMaterial
      surface.receiveShadows = true
      // surface.setEnabled(false)

      const cursorTexture = new Texture(cursor_src, scene)
      cursorTexture.hasAlpha = true
      const cursorMat = new StandardMaterial('cursor-mat', scene)

      cursorMat.diffuseTexture = cursorTexture
      cursorMat.emissiveColor = Color3.White()
      cursorMat.disableLighting = true
      placeCursor = MeshBuilder.CreateGround(
        'cursor-mesh',
        { width: 1, height: 1 },
        scene
      )
      placeCursor.isPickable = false
      placeCursor.scaling.z = -1
      placeCursor.scaling.x = -1
      placeCursor.material = cursorMat
      placeCursor.setEnabled(false)

      const hl = new HighlightLayer('hl', scene, { camera: arCam })
      hl.addMesh(placeCursor, Color3.Black(), true)
      hl.addExcludedMesh(surface)
      hl.innerGlow = false
      hl.blurHorizontalSize = 3
      hl.blurVerticalSize = 3

      rootNode = new TransformNode('root-node', scene)
      rootNode.setEnabled(false)
      rootNode.onEnabledStateChangedObservable.add(enabled => {
        setEnableScreenshot(enabled)
      })

      const assetMgr = new AssetsManager(scene)
      assetMgr.useDefaultLoadingScreen = false
      assetMgr.addMeshTask('red_globe', '', red_globe_model_src, '')
      assetMgr.addMeshTask('blue_globe', '', blue_globe_model_src, '')

      assetMgr.onTaskSuccess = task => {
        if (task instanceof MeshAssetTask) {
          const rootMesh = task.loadedMeshes[0] as Mesh
          // let finishedMesh
          if (task.name === 'red_globe') {
            redGlobeBB =
              BoundingBoxGizmo.MakeNotPickableAndWrapInBoundingBox(rootMesh)
            redGlobeBB.rotation = new Vector3(0, Tools.ToRadians(270), 0)
            redGlobeBB.parent = rootNode
            hl.addExcludedMesh(redGlobeBB)
            redGlobeBB.setEnabled(false)
            // finishedMesh = redGlobeBB
          }
          if (task.name === 'blue_globe') {
            blueGlobeBB =
              BoundingBoxGizmo.MakeNotPickableAndWrapInBoundingBox(rootMesh)
            blueGlobeBB.rotation = new Vector3(0, Tools.ToRadians(270), 0)
            blueGlobeBB.parent = rootNode
            hl.addExcludedMesh(blueGlobeBB)
            blueGlobeBB.setEnabled(false)
            // finishedMesh = blueGlobeBB
          }
          // if (finishedMesh) {
          //   orbitCam.setTarget(
          //     new Vector3(
          //       finishedMesh.position.x,
          //       finishedMesh.scaling.y / 2,
          //       finishedMesh.position.z
          //     )
          //   )
          // }
        }
      }

      assetMgr.onProgress = (remaining, total) => {
        setProgress(100 - (remaining / total) * 100)
      }

      assetMgr.onFinish = () => {
        setStarted(true)
      }

      assetMgr.load()

      // SceneLoader.ImportMesh(
      //   '',
      //   globe1_model_src,
      //   '',
      //   scene,
      //   meshes => {
      //     globeModel1 = BoundingBoxGizmo.MakeNotPickableAndWrapInBoundingBox(
      //       meshes[0] as Mesh
      //     )
      //     globeModel1.rotation = new Vector3(0, Tools.ToRadians(270), 0)
      //     globeModel1.parent = rootNode
      //     // for (const mesh of meshes) {
      //     //   mesh.isPickable = false
      //     // }
      //     hl.addExcludedMesh(globeModel1)
      //     // orbitCam.useAutoRotationBehavior = true
      //     // if (orbitCam.autoRotationBehavior) {
      //     //   orbitCam.autoRotationBehavior.idleRotationSpeed = -0.05
      //     // }

      //     // orbitCam.setTarget(
      //     //   new Vector3(model.position.x, model.scaling.y / 2, model.position.z)
      //     // )

      //     setStarted(true)
      //   },
      //   xhr => {
      //     setProgress((xhr.loaded / xhr.total) * 100)
      //   },
      //   // undefined,
      //   null,
      //   '.glb'
      // )

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
      envHelper = scene.createDefaultEnvironment({
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
        envHelper.skybox.isPickable = false
        envHelper.skybox.setEnabled(false)
      }

      // surface.isPickable = true

      // meshGestureBehavior(canvas, rootNode)

      // canvas.addEventListener('touchstart', placeObjectTouchHandler, true)

      scene.registerBeforeRender(() => {
        if (
          rootNode &&
          rootNode.isEnabled() === false &&
          placeCursor.isEnabled()
        ) {
          const ray = arCam.getForwardRay(999)
          const pickInfo = scene.pickWithRay(ray)
          if (pickInfo?.pickedMesh === surface) {
            const { pickedPoint } = pickInfo
            if (pickedPoint) {
              placeCursor.position = Vector3.Lerp(
                placeCursor.position,
                pickedPoint,
                0.4
              )
              placeCursor.rotation.y = Math.atan2(
                arCam.position.x - placeCursor.position.x,
                arCam.position.z - placeCursor.position.z
              )
            }
          }
        }
      })

      // scene.onXrImageUpdatedObservable.add(e => {
      //   console.log(`${e.name} updated`)
      //   syncNodeWithImageTargetInfo(rootNode, e, scaleAdjust)
      //   if (!bgm.isPlaying) {
      //     bgm.play()
      //   }
      //   if (!animGroup.isPlaying) {
      //     animGroup.play(true)
      //   }
      // })
      // scene.onXrImageLostObservable.add(e => {
      //   console.log(`${e.name} lost`)
      // })

      engine.runRenderLoop(() => {
        window.TWEEN.update(performance.now())
        scene.render()
      })

      window.addEventListener('resize', () => {
        engine.resize()
      })
    }
  }

  const toggleArMode = () => {
    const canvas = canvasRef.current
    if (canvas === null) return
    if (!isArMode) {
      scene.setActiveCameraById(arCam.id)
      orbitCam.useAutoRotationBehavior = false
      orbitCam.detachControl()
      orbitCam.setEnabled(false)
      arCam.setEnabled(true)
      if (window.XR8.isPaused()) {
        window.XR8.resume()
      } else {
        onxrloaded()
      }
      removeMeshBehaviorRef.current = meshGestureBehavior(canvas, rootNode)
      rootNode.scaling.copyFrom(startScale)
      rootNode.position = Vector3.Zero()
      rootNode.setEnabled(false)
      envHelper?.skybox?.setEnabled(false)
      placeCursor.setEnabled(true)
      surface.isPickable = true
      setShowInstructions(true)
      canvas.addEventListener('touchstart', placeObjectTouchHandler, true)
    } else {
      window.XR8.pause()
      scene.setActiveCameraById(orbitCam.id)
      orbitCam.useAutoRotationBehavior = true
      if (orbitCam.autoRotationBehavior) {
        orbitCam.autoRotationBehavior.idleRotationSpeed = -0.05
      }
      orbitCam.alpha = camAlpha
      orbitCam.beta = camBeta
      orbitCam.radius = camRadius
      orbitCam.setEnabled(true)
      orbitCam.attachControl()
      arCam.setEnabled(false)
      canvas.removeEventListener('touchstart', placeObjectTouchHandler, true)
      if (removeMeshBehaviorRef.current) removeMeshBehaviorRef.current()
      rootNode.scaling = Vector3.One()
      rootNode.position = Vector3.Zero()
      rootNode.rotation = Vector3.Zero()
      rootNode.setEnabled(true)
      envHelper?.skybox?.setEnabled(true)
      placeCursor.setEnabled(false)
      surface.isPickable = false
      orbitCam.setTarget(
        new Vector3(
          redGlobeBB.position.x,
          redGlobeBB.scaling.y / 2,
          redGlobeBB.position.z
        )
      )
    }
    setIsArMode(!isArMode)
  }

  const onxrloaded = () => {
    window.XR8.XrController.configure(xrControllerConfig)
    window.XR8.addCameraPipelineModules([
      {
        name: 'request-accelerometer',
        requiredPermissions: () => {
          return [window.XR8.XrPermissions.permissions().DEVICE_MOTION]
        }
      },
      // Add camera pipeline modules.
      window.XR8.XrController.pipelineModule(), // Enables SLAM
      // window.XRExtras.AlmostThere.pipelineModule(), // Detects unsupported browsers and gives hints.
      window.XRExtras.Loading.pipelineModule(), // Manages the loading screen on startup.
      window.LandingPage.pipelineModule(), // Detects unsupported browsers and gives hints.
      // window.XRExtras.FullWindowCanvas.pipelineModule(),
      window.XRExtras.RuntimeError.pipelineModule(), // Shows an error image on runtime error.,
      window.XR8.CanvasScreenshot.pipelineModule(),

      {
        name: 'camerastartupmodule',
        onCameraStatusChange: ({
          status
        }: {
          status: 'requesting' | 'hasStream' | 'hasVideo' | 'failed'
          stream?: MediaStream
          video?: HTMLVideoElement
          config: object
        }) => {
          if (status === 'hasVideo') {
            // initXrScene() // Add objects to the scene and set starting camera position.
            // setIsArMode(true)
            scene.onXrImageFoundObservable.add(e => {
              console.log(`${e.name} found`)
              // setTargetFound(true)
              // setShowInstructions(true)
              // syncNodeWithImageTargetInfo(rootNode, e, scaleAdjust)
              setTargetFound(true)
              rootNode.setEnabled(false)
              // ! fix naming cuz it should be reversed in my head.
              redGlobeBB.setEnabled(e.name === 'Blue_Globe')
              blueGlobeBB.setEnabled(e.name === 'Red_Globe')
              // placeCursor.setEnabled(true)
              // surface.isPickable = true
              enableMotion.current = true
              toggleArMode()
            })
            if (window.XR8.XrPermissions) {
              const permissions = window.XR8.XrPermissions.permissions()
              const requiredPermissions = window.XR8.requiredPermissions()
              if (!requiredPermissions.has(permissions.DEVICE_MOTION)) {
                return
              }
              window.addEventListener(
                'devicemotion',
                event => {
                  if (!enableMotion.current) return
                  const { acceleration } = event
                  const x = acceleration?.x ?? 0
                  const y = acceleration?.y ?? 0
                  const z = acceleration?.z ?? 0
                  if (
                    x <= -5 ||
                    x >= 5 ||
                    y <= -5 ||
                    y >= 5 ||
                    z <= -5 ||
                    z >= 5
                  ) {
                    setShaken(true)
                    clearTimeout(motionDetectedTimeout.current)
                    motionDetectedTimeout.current = setTimeout(() => {
                      setShaken(false)
                    }, 1000)
                  }
                },
                true
              )
            }
          } else if (status === 'failed') {
            alert('Camera permission required to view AR.')
          }
        }
      }
    ])
    startScene()
    arCam.addBehavior(
      window.XR8.Babylonjs.xrCameraBehavior({
        allowedDevices: window.XR8.XrConfig.device().ANY
        // cameraConfig: { direction: window.XR8.XrConfig.camera().BACK }
      }),
      true
    )
  }

  const handleScreenshot = async () => {
    if (window.XR8) {
      try {
        const data = await window.XR8.CanvasScreenshot.takeScreenshot()
        // const file = new File([...buffer], 'screenshot.jpeg', {
        //   type: 'image/jpeg'
        // })

        // anchor link
        const element = document.createElement('a')
        // const href = URL.createObjectURL(file)
        // setDownloadLink(href)
        element.href = 'data:image/png;base64,' + data
        element.download = `Softsoap AR Screenshot ${Date.now()}.jpeg`
        // simulate link click
        document.body.appendChild(element)
        // Required for this to work in FireFox
        element.click()
      } catch (error) {
        console.error(error)
      }
    }
  }

  // useEffect(() => {
  //   startScene()
  // }, [])

  useEffect(() => {
    const load = () => {
      window.XRExtras.Loading.showLoading({ onxrloaded })
    }
    if (window.XRExtras) {
      load()
    } else {
      window.addEventListener('xrextrasloaded', load)
    }
  }, [])

  useEffect(() => {
    return () => {
      if (scene) scene.dispose()
    }
  }, [])

  return (
    <>
      <SplashOverlay open={!started} variant='softsoap'>
        <LoadingIndicator progress={progress} variant='softsoap' />
      </SplashOverlay>
      <Dialog open={showInstructions}>
        {/* <div class='uppercase text-center py-3 text-lg'>Instructions</div>
        <hr />
        <div class='p-4 text-sm shadow-inner'>
          <div class='w-full flex items-center mt-1 mb-4'>
            <img class='w-11' src={surface_icon_src} alt='' />
            <div class='flex-grow ml-6 mr-6'>
              Point at a horizontal surface to detect it.
            </div>
          </div>
          <div class='w-full flex items-center my-2'>
            <img class='w-11' src={tap_place_icon_src} alt='' />
            <div class='flex-grow ml-6 mr-6'>
              Tap screen to place model on the placement indicator.
            </div>
          </div>
          <div class='w-full flex items-center mb-1 mt-4'>
            <img class='w-11' src={pinch_icon_src} alt='' />
            <div class='flex-grow ml-6 mr-6'>
              You can pinch to scale, rotate and drag to move the model.
            </div>
          </div>
        </div>
        <hr /> */}
        <div class='p-4 shadow-inner flex flex-col items-center space-y-4'>
          <img class='w-auto' src={instructions_src} alt='' />
        </div>
        <hr />
        <button
          class='text-center w-full py-3 font-semibold uppercase text-softsoap-primary'
          onClick={() => setShowInstructions(false)}
        >
          Close
        </button>
      </Dialog>
      {/* <button
        class='absolute top-2 right-2 border-white border-[1px] rounded-lg'
        onClick={() => setShowInstructions(true)}
      >
        <img class='w-10 h-10' src={info_btn_src} alt='Instructions' />
      </button> */}
      {started && (
        <button
          class='btn btn-softsoap absolute top-2 right-2 p-0 rounded-full lowercase text-lg text-center w-10 h-10 font-serif italic'
          onClick={() => setShowInstructions(true)}
        >
          i
        </button>
      )}
      {started && targetFound && (
        <button
          class='btn btn-softsoap absolute top-3 left-1/2 -translate-x-1/2'
          onClick={toggleArMode}
        >
          {isArMode ? 'View in 3D' : 'View in AR'}
        </button>
      )}
      {shaken ? (
        <div class='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-green-500 text-3xl text-center'>
          Shake Detected
        </div>
      ) : null}
      {enableScreenshot && (
        <button
          class='btn btn-softsoap absolute bottom-10 left-1/2 -translate-x-1/2 p-0 rounded-full'
          onClick={handleScreenshot}
        >
          <MdPhotoCamera size='2em' />
        </button>
      )}
      {/* <div class='absolute bottom-2 left-2 pointer-events-none'>
        <PoweredByPostReality />
      </div> */}
      <canvas
        id='renderCanvas'
        ref={canvasRef}
        class='overflow-hidden outline-none h-screen w-screen'
      />
    </>
  )
}
