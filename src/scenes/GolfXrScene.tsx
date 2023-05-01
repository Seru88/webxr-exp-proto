import '@babylonjs/loaders/glTF'

import {
  AbstractMesh,
  Color3,
  DirectionalLight,
  Engine,
  FreeCamera,
  HemisphericLight,
  Mesh,
  PBRMaterial,
  Scene,
  SceneLoader,
  Sound,
  TransformNode,
  Vector3,
  VideoTexture
} from '@babylonjs/core'
import bgm_src from 'assets/audio/golf_bgm.mp3'
import model_src from 'assets/models/golf_model.glb'
import point_at_src from 'assets/ui/golf_point_at.png'
import golf_video_src from 'assets/videos/golf.mp4'
import syncNodeWithImageTargetInfo from 'helpers/syncNodeWithImageTarget'
import { useEffect, useRef, useState } from 'preact/hooks'

import Dialog from 'components/Dialog'
import LoadingIndicator from 'components/LoadingIndicator'
import PoweredByPostReality from 'components/PoweredByPostReality'
import SplashOverlay from 'components/SplashOverlay'
import { isMobile } from 'react-device-detect'

let engine: Engine
let scene: Scene
let freeCam: FreeCamera
let rootNode: TransformNode
let model: Mesh
let bgm: Sound
let vidTexture: VideoTexture
const scaleAdjust = 0.605
const xrControllerConfig = {
  enableLighting: true,
  imageTargets: ['golf'],
  disableWorldTracking: !isMobile
}

export const GolfXrScene = () => {
  const [started, setStarted] = useState(false)
  const [progress, setProgress] = useState(0)
  // const [targetFound, setTargetFound] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // Populates some object into an XR scene and sets the initial camera position.
  const initXrScene = () => {
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

    bgm = new Sound('bgm', bgm_src, scene, null, {
      loop: true,
      autoplay: false,
      volume: 0.5
    })

    vidTexture = new VideoTexture(
      'golf-vid',
      golf_video_src,
      scene,
      undefined,
      true,
      undefined,
      { loop: true, autoPlay: false, muted: true }
    )

    rootNode = new TransformNode('root-node', scene)

    SceneLoader.ImportMesh(
      '',
      model_src,
      '',
      scene,
      meshes => {
        let videoMesh: AbstractMesh | undefined
        model = meshes[0] as Mesh
        model.rotation = Vector3.Zero()
        model.parent = rootNode
        for (const mesh of meshes) {
          if (
            mesh.name === 'button_email_primitive0' ||
            mesh.name === 'button_email_primitive1' ||
            mesh.name === 'button_website_primitive0' ||
            mesh.name === 'button_website_primitive1'
          ) {
            mesh.isPickable = true
          } else {
            mesh.isPickable = false
          }
          if (mesh.name === 'video') {
            videoMesh = mesh
          }
        }
        if (videoMesh) {
          const mat = videoMesh.material as PBRMaterial
          mat.albedoTexture = vidTexture
          mat.emissiveTexture = vidTexture
          mat.emissiveColor = Color3.White()
          videoMesh.material = mat
        }
        setStarted(true)
        setShowInstructions(true)
      },
      xhr => {
        setProgress((xhr.loaded / xhr.total) * 100)
      },
      null,
      '.glb'
    )
    rootNode.setEnabled(false)

    // Set the initial camera position relative to the scene we just laid out. This must be at a
    // height greater than y=0.
    freeCam.position = new Vector3(0, 3, 0)

    scene.onXrImageFoundObservable.add(e => {
      console.log(`${e.name} found`)
      // setTargetFound(true)
      setShowInstructions(false)
      syncNodeWithImageTargetInfo(rootNode, e, scaleAdjust)
      rootNode.setEnabled(true)
    })
    scene.onXrImageUpdatedObservable.add(e => {
      console.log(`${e.name} updated`)
      syncNodeWithImageTargetInfo(rootNode, e, scaleAdjust)
      if (!bgm.isPlaying) {
        bgm.play()
      }
      if (vidTexture.video.paused) {
        vidTexture.video.loop = true
        vidTexture.video.play()
      }
    })
    scene.onXrImageLostObservable.add(e => {
      console.log(`${e.name} lost`)
    })
  }

  const startScene = () => {
    const canvas = canvasRef.current
    if (canvas) {
      engine = new Engine(canvas, true, {
        stencil: true,
        preserveDrawingBuffer: true
      })
      engine.enableOfflineSupport = false

      scene = new Scene(engine)

      freeCam = new FreeCamera('mainCam', new Vector3(0, 0, 0), scene)
      const xrCamConfig = {
        allowedDevices: window.XR8.XrConfig.device().ANY,
        webgl2: true
      }
      // Connect the camera to the XR engine and show camera feed
      freeCam.addBehavior(
        window.XR8.Babylonjs.xrCameraBehavior(xrCamConfig),
        true
      )

      scene.onPointerDown = () => {
        const result = scene.pick(scene.pointerX, scene.pointerY)
        if (result?.pickedMesh) {
          const mesh = result.pickedMesh
          switch (mesh.name) {
            case 'button_email_primitive0':
            case 'button_email_primitive1':
              window.open('mailto:dolly@firstteedc.org')
              break
            case 'button_website_primitive0':
            case 'button_website_primitive1':
              window.open('https://firstteedc.org/', '_self')
              break
          }
        }
      }

      engine.runRenderLoop(() => {
        scene.render()
      })

      window.addEventListener('resize', () => {
        engine.resize()
      })
    }
  }

  const onxrloaded = () => {
    window.XR8.XrController.configure(xrControllerConfig)
    window.XR8.addCameraPipelineModules([
      window.LandingPage.pipelineModule(), // Detects unsupported browsers and gives hints.
      window.XRExtras.Loading.pipelineModule(), // Manages the loading screen on startup.
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
      <SplashOverlay open={!started} variant='golf'>
        <LoadingIndicator progress={progress} variant='golf' />
      </SplashOverlay>
      <Dialog open={showInstructions}>
        <div class='uppercase text-center py-3 text-lg'>Instructions</div>
        <hr />
        <div class='p-4 shadow-inner flex flex-col items-center space-y-4'>
          <img class='w-32' src={point_at_src} alt='' />
          <p class='text-center'>
            Point your device at the event poster to reveal the AR content.
          </p>
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
        class='btn btn-golf absolute top-2 right-2 p-0 rounded-full lowercase text-lg text-center w-10 h-10 font-serif italic'
        onClick={() => setShowInstructions(true)}
      >
        i
      </button>
      <div class='absolute bottom-2 left-2 pointer-events-none'>
        <PoweredByPostReality />
      </div>
      <canvas
        id='renderCanvas'
        ref={canvasRef}
        class='overflow-hidden outline-none h-screen w-screen'
      />
    </>
  )
}
