import '@babylonjs/loaders/glTF'

import {
  AnimationGroup,
  Color3,
  DirectionalLight,
  Effect,
  Engine,
  FreeCamera,
  HemisphericLight,
  Mesh,
  MeshBuilder,
  Scene,
  SceneLoader,
  ShaderMaterial,
  StandardMaterial,
  Texture,
  TransformNode,
  Vector3,
  VideoTexture
} from '@babylonjs/core'
import base_model_src from 'assets/models/college_base_model.glb'
import blue_model_src from 'assets/models/college_blue_model.glb'
import green_model_src from 'assets/models/college_green_model.glb'
import orange_model_src from 'assets/models/college_orange_model.glb'
import pink_model_src from 'assets/models/college_pink_model.glb'
import cursor_src from 'assets/textures/college_cursor.png'
import pinch_icon_src from 'assets/ui/pinch_icon.png'
import surface_icon_src from 'assets/ui/surface_icon.png'
import tap_place_icon_src from 'assets/ui/taptoplace_icon.png'
import blue_vid_src from 'assets/videos/college_blue.mp4'
import green_vid_src from 'assets/videos/college_green.mp4'
import orange_vid_src from 'assets/videos/college_orange.mp4'
import pink_vid_src from 'assets/videos/college_pink.mp4'
import meshGestureBehavior from 'helpers/meshGestureBehavior'
import { useEffect, useMemo, useState } from 'preact/hooks'

import Dialog from './Dialog'
import LoadingIndicator from './LoadingIndicator'
import PoweredByPostReality from './PoweredByPostReality'
import SplashOverlay from './SplashOverlay'

Effect.ShadersStore['basicVertexShader'] = `
precision highp float;
 
// Attributes
attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;
 
// Uniforms
uniform mat4 worldViewProjection;
uniform float time;
 
// Varying
varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUV;

varying float noise;
 
void main(void) {
    vec3 v = position;
 
    gl_Position = worldViewProjection * vec4(v, 1.0);
 
    vPosition = position;
    vNormal = normal;
    vUV = uv;
}
`

Effect.ShadersStore['videoFxFragmentShader'] = `
precision highp float;
 
uniform sampler2D textureSampler;
varying vec2 vUV;
//uniform mat4 worldView;

//recommended 0.24
uniform float thresholdSensitivity;

//recommended 0.3
uniform float smoothing;

vec4 transparentColor = vec4(0.0, 0.0, 0.0, 0.0);

void main(void) {
  vec2 uv = vUV.xy;
  vec4 sample_color = texture2D(textureSampler, uv);
  
  // Get chroma key color
  vec4 chromaColorAuto = texture2D(textureSampler, vec2(1.0, 1.0));
  vec3 newChromaColorAuto = vec3(chromaColorAuto.r, chromaColorAuto.g, chromaColorAuto.b);

  float maskY = 0.2989 * newChromaColorAuto.r + 0.5866 * newChromaColorAuto.g + 0.1145 * newChromaColorAuto.b;
  float maskCr = 0.7132 * (newChromaColorAuto.r - maskY);
  float maskCb = 0.5647 * (newChromaColorAuto.b - maskY);
  float Y = 0.2989 * sample_color.r + 0.5866 * sample_color.g + 0.1145 * sample_color.b;
  float Cr = 0.7132 * (sample_color.r - Y);
  float Cb = 0.5647 * (sample_color.b - Y);
  float blendValue = smoothstep(thresholdSensitivity, thresholdSensitivity + smoothing, distance(vec2(Cr, Cb), vec2(maskCr, maskCb)));
  gl_FragColor = vec4(sample_color.rgb * blendValue, 1.0 * blendValue);
}`

let engine: Engine
let scene: Scene
let freeCam: FreeCamera
let surface: Mesh
let placeCursor: Mesh
let rootNode: TransformNode
let baseModel: Mesh
let blueModel: Mesh
let greenModel: Mesh
let orangeModel: Mesh
let pinkModel: Mesh
let baseAnimGroup: AnimationGroup
let blueAnimGroup: AnimationGroup
let greenAnimGroup: AnimationGroup
let orangeAnimGroup: AnimationGroup
let pinkAnimGroup: AnimationGroup
let blueVidTex: VideoTexture
let greenVidTex: VideoTexture
let orangeVidTex: VideoTexture
let pinkVidTex: VideoTexture
// let bgm: Sound
const xrControllerConfig = {
  enableLighting: true
  // disableWorldTracking: true
}

export const CollegeXrScene = () => {
  const [started, setStarted] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [progress, setProgress] = useState([0, 0, 0, 0, 0])
  const [showInstructions, setShowInstructions] = useState(false)

  const totalProgress = useMemo(() => {
    const [base, blue, green, orange, pink] = progress
    return (base + blue + green + orange + pink) / 5
  }, [progress])

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

    // bgm = new Sound('bgm', bgm_src, scene, null, {
    //   loop: true,
    //   autoplay: false,
    //   volume: 0.5
    // })

    blueVidTex = new VideoTexture(
      'blue-vid',
      blue_vid_src,
      scene,
      undefined,
      true,
      undefined,
      { loop: true, autoPlay: false }
    )
    blueVidTex.video.volume = 0.7
    greenVidTex = new VideoTexture(
      'green-vid',
      green_vid_src,
      scene,
      undefined,
      true,
      undefined,
      { loop: true, autoPlay: false }
    )
    greenVidTex.video.volume = 0.7
    orangeVidTex = new VideoTexture(
      'orange-vid',
      orange_vid_src,
      scene,
      undefined,
      true,
      undefined,
      { loop: true, autoPlay: false }
    )
    orangeVidTex.video.volume = 0.7
    pinkVidTex = new VideoTexture(
      'pink-vid',
      pink_vid_src,
      scene,
      undefined,
      true,
      undefined,
      { loop: true, autoPlay: false }
    )
    pinkVidTex.video.volume = 0.7

    rootNode = new TransformNode('root-node', scene)
    const canvas = engine.getRenderingCanvas()
    if (canvas) {
      meshGestureBehavior(canvas, rootNode)
    }

    const modelSrcs = [
      base_model_src,
      blue_model_src,
      green_model_src,
      orange_model_src,
      pink_model_src
    ]

    Promise.all(
      modelSrcs.map((src, index) =>
        SceneLoader.ImportMeshAsync('', src, '', scene, xhr => {
          setProgress(prev => [
            ...prev.slice(0, index),
            (xhr.loaded / xhr.total) * 100,
            ...prev.slice(index + 1)
          ])
        })
      )
    ).then(results => {
      const [base, blue, green, orange, pink] = results

      // Base Model
      for (const mesh of base.meshes) {
        mesh.isPickable = false
        if (mesh.name === 'OCCLUDER') {
          const occluder = mesh
          if (occluder.material) {
            occluder.material.disableColorWrite = true
          }
        }
      }
      baseModel = base.meshes[0] as Mesh
      baseModel.rotation = Vector3.Zero()
      baseModel.parent = rootNode
      baseAnimGroup = base.animationGroups[0]
      baseAnimGroup.stop()

      const createChromaKeyShaderMateriall = (texture: VideoTexture) => {
        const shaderMaterial = new ShaderMaterial(
          'shader',
          scene,
          {
            vertex: 'basic',
            fragment: 'videoFx'
          },
          {
            needAlphaBlending: true,
            attributes: [
              'position',
              'normal',
              'uv',
              'world0',
              'world1',
              'world2',
              'world3'
            ],
            uniforms: [
              'world',
              'worldView',
              'viewProjection',
              'worldViewProjection',
              'view',
              'projection'
            ]
          }
        )
        shaderMaterial.setTexture('textureSampler', texture)
        shaderMaterial.setFloat('thresholdSensitivity', 0.24)
        shaderMaterial.setFloat('smoothing', 0.3)
        return shaderMaterial
      }

      // Blue Model
      for (const mesh of blue.meshes) {
        mesh.isPickable = false
        if (mesh.name.includes('VIDEO')) {
          mesh.material?.dispose()
          mesh.material = createChromaKeyShaderMateriall(blueVidTex)
        }
      }
      blueModel = blue.meshes[0] as Mesh
      blueModel.rotation = Vector3.Zero()
      blueModel.parent = rootNode
      blueModel.setEnabled(false)
      blueAnimGroup = blue.animationGroups[0]
      blueAnimGroup.stop()

      // Green Model
      for (const mesh of green.meshes) {
        mesh.isPickable = false
        if (mesh.name.includes('VIDEO')) {
          mesh.material?.dispose()
          mesh.material = createChromaKeyShaderMateriall(greenVidTex)
        }
      }
      greenModel = green.meshes[0] as Mesh
      greenModel.rotation = Vector3.Zero()
      greenModel.parent = rootNode
      greenModel.setEnabled(false)
      greenAnimGroup = green.animationGroups[0]
      greenAnimGroup.stop()

      // Orange Model
      for (const mesh of orange.meshes) {
        mesh.isPickable = false
        if (mesh.name.includes('VIDEO')) {
          mesh.material?.dispose()
          mesh.material = createChromaKeyShaderMateriall(orangeVidTex)
        }
      }
      orangeModel = orange.meshes[0] as Mesh
      orangeModel.rotation = Vector3.Zero()
      orangeModel.parent = rootNode
      orangeModel.setEnabled(false)
      orangeAnimGroup = orange.animationGroups[0]
      orangeAnimGroup.stop()

      // Pink Model
      for (const mesh of pink.meshes) {
        mesh.isPickable = false
        if (mesh.name.includes('VIDEO')) {
          mesh.material?.dispose()
          mesh.material = createChromaKeyShaderMateriall(pinkVidTex)
        }
      }
      pinkModel = pink.meshes[0] as Mesh
      pinkModel.rotation = Vector3.Zero()
      pinkModel.parent = rootNode
      pinkModel.setEnabled(false)
      pinkAnimGroup = pink.animationGroups[0]
      pinkAnimGroup.stop()

      setStarted(true)
    })
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
      rootNode.setEnabled(true)
      placeCursor.setEnabled(false)

      // bgm.play()
      baseAnimGroup.play(false)

      setShowOptions(true)
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
        // window.TWEEN.update(performance.now())
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

  const handleExperienceToggle = (exp: string) => () => {
    blueModel.setEnabled(false)
    blueAnimGroup.stop()
    blueVidTex.video.pause()
    blueVidTex.video.currentTime = 0
    greenModel.setEnabled(false)
    greenAnimGroup.stop()
    greenVidTex.video.pause()
    greenVidTex.video.currentTime = 0
    orangeModel.setEnabled(false)
    orangeAnimGroup.stop()
    orangeVidTex.video.pause()
    orangeVidTex.video.currentTime = 0
    pinkModel.setEnabled(false)
    pinkAnimGroup.stop()
    pinkVidTex.video.pause()
    pinkVidTex.video.currentTime = 0
    switch (exp) {
      case 'blue':
        blueModel.setEnabled(true)
        blueAnimGroup.play()
        blueVidTex.video.play()
        break
      case 'green':
        greenModel.setEnabled(true)
        greenAnimGroup.play()
        greenVidTex.video.play()
        break
      case 'orange':
        orangeModel.setEnabled(true)
        orangeAnimGroup.play()
        orangeVidTex.video.play()
        break
      case 'pink':
        pinkModel.setEnabled(true)
        pinkAnimGroup.play()
        pinkVidTex.video.play()
        break
    }
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
      <SplashOverlay open={!started} variant='college'>
        <LoadingIndicator progress={totalProgress} variant='college' />
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
        class='btn btn-college absolute top-2 right-2 p-0 rounded-full lowercase text-lg text-center w-10 h-10 font-serif italic'
        onClick={() => setShowInstructions(true)}
      >
        i
      </button>
      {showOptions && (
        <div class='w-full absolute bottom-24 flex justify-center items-center space-x-4'>
          <button
            id='blue-exp-btn'
            onClick={handleExperienceToggle('blue')}
            class='btn bg-blue-500 h-12 hover:bg-blue-700'
          />
          <button
            id='green-exp-btn'
            onClick={handleExperienceToggle('green')}
            class='btn bg-green-500 h-12 hover:bg-green-700'
          />
          <button
            id='orange-exp-btn'
            onClick={handleExperienceToggle('orange')}
            class='btn bg-orange-500 h-12 hover:bg-orange-700'
          />
          <button
            id='pink-exp-btn'
            onClick={handleExperienceToggle('pink')}
            class='btn bg-pink-500 h-12 hover:bg-pink-700'
          />
        </div>
      )}
      <div class='absolute bottom-2 left-2 pointer-events-none'>
        <PoweredByPostReality />
      </div>
      <canvas id='renderCanvas' class='overflow-hidden outline-none' />
    </>
  )
}
