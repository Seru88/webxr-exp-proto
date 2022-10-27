import '@babylonjs/loaders/glTF'

import {
  AnimationGroup,
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
import bgm_src from 'assets/audio/brochure_bgm.mp3'
import model_1_src from 'assets/models/brochure_model_1.glb'
import model_2_src from 'assets/models/brochure_model_2.glb'
import point_at_src from 'assets/ui/brochure_point_at.png'
import syncNodeWithImageTargetInfo from 'helpers/syncNodeWithImageTarget'
import { useEffect, useMemo, useRef, useState } from 'preact/hooks'
import brochure_video_src from 'assets/videos/brochure.mp4'
import Dialog from './Dialog'
import LoadingIndicator from './LoadingIndicator'
import PoweredByPostReality from './PoweredByPostReality'
import SplashOverlay from './SplashOverlay'
import { isMobile } from 'react-device-detect'

let engine: Engine
let scene: Scene
let freeCam: FreeCamera
let root1Node: TransformNode
let root2Node: TransformNode
let brochure1Model: Mesh
let brochure2Model: Mesh
let brochure1AnimGroup: AnimationGroup
let brochure2AnimGroup: AnimationGroup
let bgm: Sound
let vidTexture: VideoTexture
const scaleAdjust = 0.1675
const xrControllerConfig = {
  enableLighting: true,
  imageTargets: ['brochure_1', 'brochure_2'],
  disableWorldTracking: !isMobile
}

export const BrochureXrScene = () => {
  const [started, setStarted] = useState(false)
  const [progress, setProgress] = useState([0, 0])
  const [targetFound, setTargetFound] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)

  const totalProgress = useMemo(() => {
    const [model1, model2] = progress
    return (model1 + model2) / progress.length
  }, [progress])

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
      'vid-texture',
      brochure_video_src,
      scene,
      false,
      true,
      undefined,
      {
        loop: true,
        autoPlay: false
      }
    )

    root1Node = new TransformNode('root-1-node', scene)
    root2Node = new TransformNode('root-2-node', scene)

    Promise.all(
      [model_1_src, model_2_src].map((src, index) =>
        SceneLoader.ImportMeshAsync('', src, '', scene, xhr => {
          setProgress(prev => [
            ...prev.slice(0, index),
            (xhr.loaded / xhr.total) * 100,
            ...prev.slice(index + 1)
          ])
        })
      )
    ).then(results => {
      const [model1, model2] = results

      for (const mesh of model1.meshes) {
        mesh.isPickable = false
        if (mesh.name === 'video_page1') {
          const mat = mesh.material as PBRMaterial
          mat.albedoTexture = vidTexture
          mat.emissiveTexture = vidTexture
          mat.emissiveColor = Color3.White()
        }
      }
      for (const mesh of model2.meshes) {
        if (
          mesh.name === 'button_1_primitive0' ||
          mesh.name === 'button_1_primitive1' ||
          mesh.name === 'button_2_primitive0' ||
          mesh.name === 'button_2_primitive1'
        ) {
          mesh.isPickable = true
        } else {
          mesh.isPickable = false
        }
      }

      brochure1Model = model1.meshes[0] as Mesh
      brochure1Model.rotation = Vector3.Zero()
      brochure1Model.parent = root1Node
      brochure1AnimGroup = model1.animationGroups[0]
      brochure1AnimGroup.stop()

      brochure2Model = model2.meshes[0] as Mesh
      brochure2Model.rotation = Vector3.Zero()
      brochure2Model.parent = root2Node
      brochure2AnimGroup = model2.animationGroups[0]
      brochure2AnimGroup.stop()

      setStarted(true)
      setShowInstructions(true)
    })

    root1Node.setEnabled(false)
    root2Node.setEnabled(false)

    // Set the initial camera position relative to the scene we just laid out. This must be at a
    // height greater than y=0.
    freeCam.position = new Vector3(0, 3, 0)

    scene.onXrImageFoundObservable.add(e => {
      console.log(`${e.name} found`)
      setTargetFound(true)
      setShowInstructions(false)
      if (e.name === 'brochure_1') {
        syncNodeWithImageTargetInfo(root1Node, e, scaleAdjust)
        root1Node.setEnabled(true)
        vidTexture.video.play()
      }
      if (e.name === 'brochure_2') {
        syncNodeWithImageTargetInfo(root2Node, e, scaleAdjust)
        root2Node.setEnabled(true)
      }
    })
    scene.onXrImageUpdatedObservable.add(e => {
      console.log(`${e.name} updated`)
      if (!bgm.isPlaying) {
        bgm.play()
      }
      if (e.name === 'brochure_1') {
        syncNodeWithImageTargetInfo(root1Node, e, scaleAdjust)
        if (!brochure1AnimGroup.isPlaying) {
          brochure1AnimGroup.play(true)
        }
      }
      if (e.name === 'brochure_2') {
        syncNodeWithImageTargetInfo(root2Node, e, scaleAdjust)
        if (!brochure2AnimGroup.isPlaying) {
          brochure2AnimGroup.play(true)
        }
      }
    })
    scene.onXrImageLostObservable.add(e => {
      console.log(`${e.name} lost`)
      if (e.name === 'brochure_1') {
        root1Node.setEnabled(false)
        brochure1AnimGroup.stop()
        vidTexture.video.pause()
        vidTexture.video.currentTime = 0
      }
      if (e.name === 'brochure_2') {
        root2Node.setEnabled(false)
        brochure2AnimGroup.stop()
      }
    })
  }

  const startScene = () => {
    const canvas = canvasRef.current
    if (canvas) {
      engine = new Engine(
        canvas,
        true,
        {
          stencil: true,
          preserveDrawingBuffer: true
        },
        true
      )
      engine.enableOfflineSupport = false
      engine.setHardwareScalingLevel(1 / window.devicePixelRatio)

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
        const result = scene.pick(
          scene.pointerX,
          scene.pointerY,
          mesh =>
            mesh.name === 'button_1_primitive0' ||
            mesh.name === 'button_1_primitive1' ||
            mesh.name === 'button_2_primitive0' ||
            mesh.name === 'button_2_primitive1'
        )
        if (result?.pickedMesh) {
          console.log('picked')
          window.open('https://dmedelivers.com/', '_blank')
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
      <SplashOverlay open={!started} variant='brochure'>
        <LoadingIndicator progress={totalProgress} variant='brochure' />
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
        class='btn btn-brochure absolute top-2 right-2 p-0 rounded-full lowercase text-lg text-center w-10 h-10 font-serif italic'
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
