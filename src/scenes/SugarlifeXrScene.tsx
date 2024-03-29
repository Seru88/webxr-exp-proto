import '@babylonjs/loaders/glTF'

import {
  Color3,
  DirectionalLight,
  Engine,
  FreeCamera,
  HemisphericLight,
  Mesh,
  MeshBuilder,
  PBRMaterial,
  Scene,
  SceneLoader,
  Sound,
  StandardMaterial,
  Texture,
  TransformNode,
  Vector3,
  VideoTexture
} from '@babylonjs/core'
import bgmPath from 'assets/audio/sugarlife_bgm.mp3'
import modelPath from 'assets/models/sugarlife_model.glb'
import cursorPath from 'assets/textures/sugarlife_cursor.png'
import pinch_icon_src from 'assets/ui/pinch_icon.png'
import surface_icon_src from 'assets/ui/surface_icon.png'
import tap_place_icon_src from 'assets/ui/taptoplace_icon.png'
import videoPath from 'assets/videos/sugarlife_banner.mp4'
import meshGestureBehavior from 'helpers/meshGestureBehavior'
import { useEffect, useState } from 'preact/hooks'
import { isMobile } from 'react-device-detect'

import Dialog from 'components/Dialog'
import LoadingIndicator from 'components/LoadingIndicator'
import PoweredByPostReality from 'components/PoweredByPostReality'
import SplashOverlay from 'components/SplashOverlay'

let engine: Engine
let scene: Scene
let freeCam: FreeCamera
let surface: Mesh
let placeCursor: Mesh
let rootNode: TransformNode
let model: Mesh
let bgm: Sound
let bannerVidTex: VideoTexture
const startScale = Vector3.Zero() // Initial scale value for our model
const endScale = new Vector3(1, 1, 1) // Ending scale value for our model
const animationMillis = 1250
const xrControllerConfig = {
  enableLighting: true,
  disableWorldTracking: !isMobile
}

export const SugarlifeXrScene = () => {
  const [started, setStarted] = useState(false)
  const [storeBtnActive, setStoreBtnActive] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showInstructions, setShowInstructions] = useState(false)

  // Populates some object into an XR scene and sets the initial camera position.
  const initXrScene = () => {
    const directionalLight = new DirectionalLight(
      'DirectionalLight',
      new Vector3(-5, 10, -7),
      scene
    )
    directionalLight.intensity = 1.0

    const ambientLight = new HemisphericLight(
      'AmbientLight',
      Vector3.Up(),
      scene
    )
    ambientLight.intensity = 0.5

    // Create surface mesh
    surface = MeshBuilder.CreateGround('ground', {
      width: 150,
      height: 150
    })
    const surfaceMaterial = new StandardMaterial('groundMaterial', scene)
    surfaceMaterial.alpha = 0
    surface.material = surfaceMaterial
    surface.receiveShadows = true

    const cursorTexture = new Texture(cursorPath, scene)
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

    bgm = new Sound('bgm', bgmPath, scene, null, {
      loop: true,
      autoplay: false,
      volume: 0.5
    })

    bannerVidTex = new VideoTexture(
      'banner-vid',
      videoPath,
      scene,
      undefined,
      true,
      undefined,
      { loop: true }
    )

    rootNode = new TransformNode('root-node', scene)
    const canvas = engine.getRenderingCanvas()
    if (canvas) {
      meshGestureBehavior(canvas, rootNode)
    }

    SceneLoader.ImportMesh(
      '',
      modelPath,
      '',
      scene,
      meshes => {
        const root = meshes[0] as Mesh
        const banner = meshes[1] as Mesh
        for (const mesh of meshes) {
          if (mesh.material instanceof PBRMaterial) {
            mesh.material.emissiveColor = Color3.White()
          }
        }
        ;(banner.material as PBRMaterial).albedoTexture = bannerVidTex
        ;(banner.material as PBRMaterial).emissiveTexture = bannerVidTex
        ;(banner.material as PBRMaterial).emissiveColor = Color3.White()
        ;(banner.material as PBRMaterial).disableLighting = true
        model = root
        model.rotation = new Vector3(0, 0, 0)
        model.parent = rootNode

        setStarted(true)
      },
      xhr => {
        setProgress((xhr.loaded / xhr.total) * 100)
      }
    )
    rootNode.scaling.copyFrom(startScale)
    rootNode.setEnabled(false)

    // Set the initial camera position relative to the scene we just laid out. This must be at a
    // height greater than y=0.
    freeCam.position = new Vector3(0, 3, 0)
  }

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
      rootNode.position = placeCursor.position
      rootNode.rotation = placeCursor.rotation
      rootNode.rotate(Vector3.Up(), Math.PI)

      const scale = { ...startScale }
      new window.TWEEN.Tween(scale)
        .to(endScale, animationMillis)
        .easing(window.TWEEN.Easing.Elastic.Out) // Use an easing function to make the animation smooth.
        .onStart(() => {
          setStoreBtnActive(true)
          placeCursor.setEnabled(false)
          rootNode.setEnabled(true)
          bannerVidTex.video.play()
        })
        .onUpdate(() => {
          rootNode.scaling.x = scale._x
          rootNode.scaling.y = scale._y
          rootNode.scaling.z = scale._z
        })
        .onComplete(() => {
          bgm.play()
        })
        .start() // Start the tween immediately.
    }
  }

  const startScene = () => {
    const canvas = document.getElementById(
      'renderCanvas'
    ) as HTMLCanvasElement | null
    if (canvas) {
      engine = new Engine(canvas, true, {
        stencil: true,
        preserveDrawingBuffer: true
      })
      engine.enableOfflineSupport = false

      scene = new Scene(engine)

      freeCam = new FreeCamera('mainCam', new Vector3(0, 0, 0), scene)
      const xrCamConfig = {
        allowedDevices: window.XR8.XrConfig.device().ANY
      }
      // Connect the camera to the XR engine and show camera feed
      freeCam.addBehavior(
        window.XR8.Babylonjs.xrCameraBehavior(xrCamConfig),
        true
      )

      canvas.addEventListener('touchstart', placeObjectTouchHandler, true) // Add touch listener.

      engine.runRenderLoop(() => {
        window.TWEEN.update(performance.now())
        scene.render()
      })

      scene.registerBeforeRender(() => {
        if (rootNode && rootNode.isEnabled() === false && placeCursor) {
          const ray = freeCam.getForwardRay(999)
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
                freeCam.position.x - placeCursor.position.x,
                freeCam.position.z - placeCursor.position.z
              )
            }
          }
        }
      })

      window.addEventListener('resize', () => {
        engine.resize()
      })
    }
  }

  const onxrloaded = () => {
    window.XR8.XrController.configure(xrControllerConfig)
    window.XR8.addCameraPipelineModules([
      // Add camera pipeline modules.
      window.XR8.XrController.pipelineModule(), // Enables SLAM
      // window.XRExtras.AlmostThere.pipelineModule(), // Detects unsupported browsers and gives hints.
      window.XRExtras.Loading.pipelineModule(), // Manages the loading screen on startup.
      window.XRExtras.FullWindowCanvas.pipelineModule(),
      window.LandingPage.pipelineModule(), // Detects unsupported browsers and gives hints.
      window.XRExtras.RuntimeError.pipelineModule(), // Shows an error image on runtime error.
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
            initXrScene() // Add objects to the scene and set starting camera position.
          } else if (status === 'failed') {
            alert('Camera permission required to view AR.')
          }
        }
      }
    ])
    startScene()
  }

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
      <SplashOverlay open={!started} variant='candy'>
        <LoadingIndicator progress={progress} variant='candy' />
      </SplashOverlay>
      <Dialog open={showInstructions}>
        <div class='uppercase text-center py-3 text-lg'>Instructions</div>
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
        <hr />
        <button
          class='text-center w-full py-3 font-semibold uppercase'
          onClick={() => setShowInstructions(false)}
        >
          Close
        </button>
      </Dialog>
      <button
        class='btn btn-candy absolute top-2 right-2 p-0 rounded-full lowercase text-lg text-center w-10 h-10 font-serif italic'
        onClick={() => setShowInstructions(true)}
      >
        i
      </button>
      {storeBtnActive && (
        <div class='w-full absolute bottom-24 flex justify-center items-center'>
          <a
            role='button'
            href='https://www.sugarlifecandy.com/'
            target='_blank'
            class='btn btn-candy'
          >
            Enter Store
          </a>
        </div>
      )}
      <div class='absolute bottom-2 left-2 pointer-events-none'>
        <PoweredByPostReality />
      </div>
      <canvas id='renderCanvas' class='overflow-hidden outline-none' />
    </>
  )
}
