import '@babylonjs/loaders/glTF'

import {
  AnimationEvent,
  AnimationGroup,
  ArcRotateCamera,
  AssetsManager,
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
  TransformNode,
  Vector3
} from '@babylonjs/core'
import hcc_liver_src from 'assets/models/liver/HCC_Liver.glb'
import healthy_liver_src from 'assets/models/liver/Healthy_Liver.glb'
import nafl_liver_src from 'assets/models/liver/NAFL_Liver.glb'
import nash_fibro_liver_src from 'assets/models/liver/Nash_Fib_Liver.glb'
import nash_liver_src from 'assets/models/liver/NASH_Liver.glb'
import spawn_disc_src from 'assets/models/liver/Spawn_Object.glb'
import cursor_src from 'assets/textures/electrosonic_cursor.png'
import healthy_liver_thumb_src from 'assets/ui/liver/01_healthy.jpg'
import nafl_liver_thumb_src from 'assets/ui/liver/02_nafl.jpg'
import nash_liver_thumb_src from 'assets/ui/liver/03_nash.jpg'
import nash_fibro_liver_thumb_src from 'assets/ui/liver/04_nashfib.jpg'
import hcc_liver_thumb_src from 'assets/ui/liver/05_hcc.jpg'
import Dialog from 'components/Dialog'
import LoadingIndicator from 'components/LoadingIndicator'
import SplashOverlay from 'components/SplashOverlay'
import meshGestureBehavior from 'helpers/meshGestureBehavior'
import { ChangeEvent } from 'preact/compat'
import { useEffect, useRef, useState } from 'preact/hooks'
import { isMobile } from 'react-device-detect'

const livers = [
  {
    label: 'Healthy',
    thumbSrc: healthy_liver_thumb_src,
    modelSrc: healthy_liver_src,
    desc: `
      The liver is an organ which provides essential functions for survival including nutrient metabolism, 
      protein synthesis, bile production, and glycoprotein storage; the healthy liver contains less than or equal to 5% 
      fat. Consumption of a high caloric diet, having a sedentary lifestyle, or accumulation of chronic injury due to 
      viral infection, excessive alcohol consumption, or autoimmune/cholestatic/metabolic disorders may result in 
      progression of liver disease.
    `
  },
  {
    label: 'NAFL',
    thumbSrc: nafl_liver_thumb_src,
    modelSrc: nafl_liver_src,
    desc: `
      NAFL includes two pathologically distinct conditions with different prognoses: non-alcoholic fatty liver (NAFL) 
      and non-alcoholic steatohepatitis (NASH). 86-108 million people in the US are afflicted with NAFLD. NAFL is 
      characterized by hepatic steatosis exceeding 5% of liver weight.
    `
  },
  {
    label: 'NASH',
    thumbSrc: nash_liver_thumb_src,
    modelSrc: nash_liver_src,
    desc: `
      NAFL includes two pathologically distinct conditions with different prognoses: non-alcoholic fatty liver (NAFL) 
      and non-alcoholic steatohepatitis (NASH). Of those afflicted with NAFLD, 9-15 million people progress to the more 
      severe form of NAFLD known as NASH. In addition to steatosis, signs of lobular and portal inflammation, as well 
      as hepatocellular ballooning and cell death are apparent upon histological examination. Of those with NASH, 
      6-10 million people are at high-risk of progressing to cirrhosis and death from cardiovascular disease.
    `
  },
  {
    label: 'NASH Fibrosis',
    thumbSrc: nash_fibro_liver_thumb_src,
    modelSrc: nash_fibro_liver_src,
    desc: `
      Chronic hepatic injury in NASH initiates a wound-healing response in the liver that results in hepatic fibrosis. 
      Accumulation of extracellular matrix proteins distorts the hepatic architecture and forms a fibrous scar. 
      Inflammation also contributes to an increase in fibrosis. Fibrosis stage is assessed using scales such as 
      NASH-CRN (stages 0-4) and Ishak score (stages 0-6).
    `
  },
  {
    label: 'HCC',
    thumbSrc: hcc_liver_thumb_src,
    modelSrc: hcc_liver_src,
    desc: `
      Chronic hepatic injury in NASH initiates a wound-healing response in the liver that results in hepatic fibrosis. 
      Accumulation of extracellular matrix proteins distorts the hepatic architecture and forms a fibrous scar. 
      Inflammation also contributes to an increase in fibrosis. Fibrosis stage is assessed using scales such as NASH-CRN 
      (stages 0-4) and Ishak score (stages 0-6).
    `
  }
]

let engine: Engine
let scene: Scene
let envHelper: EnvironmentHelper | null
let orbitCam: ArcRotateCamera
let arCam: FreeCamera
let surface: Mesh
let placeCursor: Mesh
let rootNode: TransformNode
let liversNode: TransformNode
let spawnDisc: Mesh
let spawnDiscAnimGrps: AnimationGroup[]
const startScale = Vector3.Zero() // Initial scale value for our model
const endScale = new Vector3(1, 1, 1) // Ending scale value for our model
const animationMillis = 1750
const camFOV = 0.8
const camInertia = 0.9
const camRadius = 3
const camMinZ = 1
const camAlpha = Math.PI / 2
const camBeta = Math.PI / 2
const camLowerRadius = 1.75
const camUpperRadius = 10
const camWheelDeltaPercentage = 0.01
const camWheelPrecision = 50
const xrControllerConfig = {
  enableLighting: true,
  disableWorldTracking: !isMobile
}
const targetPos = Vector3.Up()

export const LiverXrScene = () => {
  const [started, setStarted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showDescription, setShowDescription] = useState(false)
  const [isArMode, setIsArMode] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const removeMeshBehaviorRef = useRef<() => void>()

  const placeObjectTouchHandler = (e: TouchEvent) => {
    // Reset AR Camera on two finger tap.
    if (e.touches.length === 3) {
      window.XR8.XrController.recenter()
    }
    // Don't do anything if more than 2 fingers.
    if (e.touches.length > 2) {
      return
    }
    if (liversNode.isEnabled() === false) {
      surface.isPickable = false
      rootNode.position = placeCursor.position
      rootNode.rotation = placeCursor.rotation
      // rootNode.rotate(Vector3.Up(), Math.PI)
      placeCursor.setEnabled(false)
      spawnDisc.setEnabled(true)
      const animGrp = spawnDiscAnimGrps[0]
      animGrp.targetedAnimations[0].animation.addEvent(
        new AnimationEvent(
          40,
          () => {
            const scale = { ...startScale }
            new window.TWEEN.Tween(scale)
              .to(endScale, animationMillis)
              .easing(window.TWEEN.Easing.Elastic.Out) // Use an easing function to make the animation smooth.
              .onStart(() => {
                // setStoreBtnActive(true)

                liversNode.setEnabled(true)
                // screen1VidTex.video.loop = true
                // screen1VidTex.video.play()
                // screen2VidTex.video.loop = true
                // screen2VidTex.video.play()
              })
              .onUpdate(() => {
                liversNode.scaling.x = scale._x
                liversNode.scaling.y = scale._y
                liversNode.scaling.z = scale._z
              })
              .onComplete(() => {
                // bgm.play()
                // animGroup.play(true)
              })
              .start() // Start the tween immediately.
          },
          true
        )
      )
      // animGrp.onAnimationEndObservable.addOnce(() => {

      // })
      animGrp.play(false)
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
        targetPos,
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
      hl.addMesh(placeCursor, Color3.FromHexString('#45CCAD'))
      hl.addExcludedMesh(surface)
      hl.innerGlow = false
      hl.blurHorizontalSize = 3
      hl.blurVerticalSize = 3

      rootNode = new TransformNode('root-node', scene)
      liversNode = new TransformNode('livers-node', scene)
      liversNode.position = targetPos
      liversNode.parent = rootNode

      const assetMgr = new AssetsManager(scene)
      assetMgr.useDefaultLoadingScreen = false
      livers.forEach(liver => {
        assetMgr.addMeshTask(liver.label, '', liver.modelSrc, '')
      })
      assetMgr.addMeshTask('spawn-disc', '', spawn_disc_src, '')

      assetMgr.onTaskSuccess = task => {
        if (task instanceof MeshAssetTask) {
          for (const mesh of task.loadedMeshes) {
            mesh.isPickable = false
          }
          const rootMesh = task.loadedMeshes[0] as Mesh
          rootMesh.name = task.name
          rootMesh.setEnabled(task.name.includes('Healthy'))
          if (task.name !== 'spawn-disc') {
            rootMesh.normalizeToUnitCube()
            rootMesh.parent = liversNode
            // rootMesh.position = targetPos
          } else {
            spawnDiscAnimGrps = task.loadedAnimationGroups
            spawnDiscAnimGrps[0].stop()
            rootMesh.parent = rootNode
            spawnDisc = rootMesh
          }

          hl.addExcludedMesh(rootMesh)
        }
      }

      assetMgr.onFinish = () => {
        setStarted(true)
      }

      assetMgr.onProgress = (remaining, total) => {
        setProgress(100 - (remaining / total) * 100)
      }

      assetMgr.load()

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
        envHelper.skybox.rotation.y = Math.PI / 2
        hl.addExcludedMesh(envHelper.skybox)
      }

      scene.registerBeforeRender(() => {
        if (rootNode && placeCursor.isEnabled()) {
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

      engine.runRenderLoop(() => {
        window.TWEEN.update(performance.now())
        scene.render()
      })

      window.addEventListener('resize', () => {
        engine.resize()
      })
    }
  }

  const handleModelSelect =
    (modelName: string) => (event: ChangeEvent<HTMLButtonElement>) => {
      event.preventDefault()
      liversNode.getChildren().forEach(child => {
        const toggle = child.name === modelName
        child.setEnabled(toggle)
        if (toggle) {
          setCurrentIndex(livers.findIndex(l => l.label === modelName))
        }
      })
    }

  const toggleArMode = () => {
    const canvas = canvasRef.current
    if (canvas === null) return
    if (!isArMode) {
      scene.setActiveCameraById(arCam.id)
      orbitCam.detachControl()
      orbitCam.setEnabled(false)
      arCam.setEnabled(true)
      if (window.XR8.isPaused()) {
        window.XR8.resume()
      } else {
        onxrloaded()
      }
      removeMeshBehaviorRef.current = meshGestureBehavior(canvas, rootNode)
      liversNode.scaling.copyFrom(startScale)
      liversNode.setEnabled(false)
      envHelper?.skybox?.setEnabled(false)
      surface.isPickable = true
      placeCursor.setEnabled(true)
      canvas.addEventListener('touchstart', placeObjectTouchHandler, true)
    } else {
      window.XR8.pause()
      scene.setActiveCameraById(orbitCam.id)
      orbitCam.alpha = camAlpha
      orbitCam.beta = camBeta
      orbitCam.radius = camRadius
      orbitCam.setEnabled(true)
      orbitCam.attachControl()
      arCam.setEnabled(false)
      canvas.removeEventListener('touchstart', placeObjectTouchHandler, true)
      if (removeMeshBehaviorRef.current) removeMeshBehaviorRef.current()
      rootNode.position = Vector3.Zero()
      rootNode.rotation = Vector3.Zero()
      liversNode.scaling = Vector3.One()
      liversNode.setEnabled(true)
      envHelper?.skybox?.setEnabled(true)
      placeCursor.setEnabled(false)
    }
    setIsArMode(!isArMode)
  }

  const onxrloaded = () => {
    window.XR8.XrController.configure(xrControllerConfig)
    window.XR8.addCameraPipelineModules([
      // Add camera pipeline modules.
      window.XR8.XrController.pipelineModule(), // Enables SLAM
      // window.XRExtras.AlmostThere.pipelineModule(), // Detects unsupported browsers and gives hints.
      window.XRExtras.Loading.pipelineModule(), // Manages the loading screen on startup.
      window.LandingPage.pipelineModule(), // Detects unsupported browsers and gives hints.
      // window.XRExtras.FullWindowCanvas.pipelineModule(),
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
            // initXrScene() // Add objects to the scene and set starting camera position.
          } else if (status === 'failed') {
            alert('Camera permission required to view AR.')
          }
        }
      }
    ])
    arCam.addBehavior(
      window.XR8.Babylonjs.xrCameraBehavior({
        allowedDevices: window.XR8.XrConfig.device().ANY,
        cameraConfig: { direction: window.XR8.XrConfig.camera().BACK }
      }),
      true
    )
  }

  useEffect(() => {
    startScene()
  }, [])

  useEffect(() => {
    return () => {
      if (scene) scene.dispose()
    }
  }, [])

  return (
    <div class='relative'>
      <SplashOverlay open={!started} variant='liver'>
        {/* <div class='text-white text-3xl'>Liver</div> */}
        <LoadingIndicator
          variant='liver'
          showText={false}
          progress={progress}
        />
      </SplashOverlay>
      <Dialog className='border-2 border-liver' open={showDescription}>
        <div class='px-3 py-2 flex justify-end'>
          <button
            class='text-liver font-bold text-2xl'
            onClick={() => setShowDescription(false)}
          >
            X
          </button>
        </div>
        <div class='p-4 text-sm -mt-8'>
          <img src={livers[currentIndex].thumbSrc} class='w-44 mx-auto my-2' />
          <p>{livers[currentIndex].desc}</p>
        </div>
      </Dialog>
      {started && (
        <button
          class='bg-liver px-4 rounded-t-lg text-white border-b border-teal-600 py-1 absolute bottom-32 left-1/2 -translate-x-1/2'
          onClick={toggleArMode}
        >
          {isArMode ? '3D' : 'AR'}
        </button>
      )}
      {/* <div class='absolute bottom-2 left-2 pointer-events-none'>
        <PoweredByPostReality />
      </div> */}
      <div class='bg-liver w-full z-20 top-0 left-0 shadow-lg'>
        <div class='flex flex-wrap items-center justify-between mx-auto py-2 px-4 h-12 text-white'>
          <div class='h-full aspect-square' />
          <div class='text-2xl flex-grow text-center'>
            {livers[currentIndex].label}
          </div>
          <button
            class='h-full aspect-square rounded-lg border-2 border-white'
            onClick={() => {
              setShowDescription(!showDescription)
            }}
          >
            i
          </button>
        </div>
      </div>
      <canvas
        id='renderCanvas'
        ref={canvasRef}
        class='overflow-hidden outline-none h-[calc(100dvh-176px)] w-screen'
      />
      <div
        id='liver-selection-footer'
        class='h-32 w-full overflow-auto bg-liver px-3 py-2 flex space-x-2'
      >
        {livers.map(liver => (
          <button
            key={liver.label}
            class='h-full aspect-square text-white'
            onClick={handleModelSelect(liver.label)}
          >
            <img
              src={liver.thumbSrc}
              class='rounded-lg border-teal-600 border-2'
            />
            <span>{liver.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
