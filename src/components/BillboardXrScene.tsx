import '@babylonjs/loaders/glTF'

import {
  AnimationGroup,
  DirectionalLight,
  Engine,
  FreeCamera,
  HemisphericLight,
  Mesh,
  Scene,
  SceneLoader,
  Sound,
  TransformNode,
  Vector3
} from '@babylonjs/core'
import bgm_src from 'assets/audio/billboard_bgm.mp3'
import model_src from 'assets/models/billboard_model.glb'
import pinch_icon_src from 'assets/ui/pinch_icon.png'
import surface_icon_src from 'assets/ui/surface_icon.png'
import tap_place_icon_src from 'assets/ui/taptoplace_icon.png'
import syncNodeWithImageTargetInfo from 'helpers/syncNodeWithImageTarget'
import { useEffect, useRef, useState } from 'preact/hooks'

import Dialog from './Dialog'
import LoadingIndicator from './LoadingIndicator'
import PoweredByPostReality from './PoweredByPostReality'
import SplashOverlay from './SplashOverlay'

let engine: Engine
let scene: Scene
let freeCam: FreeCamera
let rootNode: TransformNode
let model: Mesh
let bgm: Sound
let animGroup: AnimationGroup
const scaleAdjust = 6
const xrControllerConfig = {
  enableLighting: true,
  imageTargets: ['logi']
  // disableWorldTracking: true
}

export const BillboardXrScene = () => {
  const [started, setStarted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [targetFound, setTargetFound] = useState(false)
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

    rootNode = new TransformNode('root-node', scene)

    SceneLoader.ImportMesh(
      '',
      model_src,
      '',
      scene,
      (meshes, ps, skl, animationsGroup) => {
        animGroup = animationsGroup[0]
        animGroup.stop()

        model = meshes[0] as Mesh
        model.rotation = Vector3.Zero()
        model.parent = rootNode
        for (const mesh of meshes) {
          mesh.isPickable = false
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
      setTargetFound(true)
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
      if (!animGroup.isPlaying) {
        animGroup.play(true)
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

      // scene.onPointerDown = () => {
      //   const result = scene.pick(
      //     scene.pointerX,
      //     scene.pointerY,
      //     mesh =>
      //       mesh.name === 'button_facebook_primitive0' ||
      //       mesh.name === 'button_facebook_primitive1' ||
      //       mesh.name === 'button_linkedin_primitive0' ||
      //       mesh.name === 'button_linkedin_primitive1' ||
      //       mesh.name === 'button_twitter_primitive0' ||
      //       mesh.name === 'button_twitter_primitive1'
      //   )
      //   if (result?.pickedMesh) {
      //     const mesh = result.pickedMesh
      //     switch (mesh.name) {
      //       case 'button_facebook_primitive0':
      //       case 'button_facebook_primitive1':
      //         window.open('https://pt-br.facebook.com/postrealityAR/', '_blank')
      //         break
      //       case 'button_linkedin_primitive0':
      //       case 'button_linkedin_primitive1':
      //         window.open(
      //           'https://www.linkedin.com/company/post-reality',
      //           '_blank'
      //         )
      //         break
      //       case 'button_twitter_primitive0':
      //       case 'button_twitter_primitive1':
      //         window.open('https://mobile.twitter.com/postrealityar', '_blank')
      //         break
      //     }
      //   }
      // }

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
      // window.XR8.XrController.pipelineModule(), // Enables SLAM
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
      <SplashOverlay open={!started} variant='billboard'>
        <LoadingIndicator progress={progress} variant='billboard' />
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
        class='btn btn-billboard absolute top-2 right-2 p-0 rounded-full lowercase text-lg text-center w-10 h-10 font-serif italic'
        onClick={() => setShowInstructions(true)}
      >
        i
      </button>
      {targetFound && (
        <div class='w-full absolute bottom-24 flex justify-center items-center'>
          <a
            role='button'
            href='https://docs.opensea.io/'
            target='_blank'
            class='btn btn-billboard'
          >
            Bid Now
          </a>
        </div>
      )}
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
