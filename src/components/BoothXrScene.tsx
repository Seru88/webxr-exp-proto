import '@babylonjs/loaders/glTF'

import {
  AbstractMesh,
  AnimationGroup,
  Color3,
  DirectionalLight,
  Effect,
  Engine,
  FreeCamera,
  HemisphericLight,
  Mesh,
  MeshBuilder,
  PBRMaterial,
  Scene,
  SceneLoader,
  ShaderMaterial,
  Sound,
  StandardMaterial,
  Texture,
  TransformNode,
  Vector3,
  VideoTexture
} from '@babylonjs/core'
import info_btn_src from 'assets/ui/booth_info_btn.png'
import model_src from 'assets/models/booth_model.glb'
import bgm_src from 'assets/audio/booth_bgm.mp3'
import cursor_src from 'assets/textures/booth_cursor.png'
import greeter_video_src from 'assets/videos/greeter.mp4'
import pinch_icon_src from 'assets/ui/pinch_icon.png'
import surface_icon_src from 'assets/ui/surface_icon.png'
import tap_place_icon_src from 'assets/ui/taptoplace_icon.png'
import pr_video_src from 'assets/videos/post_reality.mp4'
import starry_sky_video_src from 'assets/videos/starry_sky.mp4'
import meshGestureBehavior from 'meshGestureBehavior'
import { useEffect, useRef, useState } from 'preact/hooks'

import Dialog from './Dialog'
import LoadingIndicator from './LoadingIndicator'
import SplashOverlay from './SplashOverlay'
import PoweredByPostReality from './PoweredByPostReality'

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
let model: Mesh
let bgm: Sound
let animGroup: AnimationGroup
let greeterVidTex: VideoTexture
let prVidTex: VideoTexture
let starrySkyVidTex: VideoTexture
const startScale = Vector3.Zero() // Initial scale value for our model
const endScale = new Vector3(1, 1, 1) // Ending scale value for our model
const animationMillis = 1250
const xrControllerConfig = {
  enableLighting: true
  // disableWorldTracking: true
}

export const BoothXrScene = () => {
  const [started, setStarted] = useState(false)
  const [progress, setProgress] = useState(0)
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

    bgm = new Sound('bgm', bgm_src, scene, null, {
      loop: true,
      autoplay: false,
      volume: 0.5
    })

    greeterVidTex = new VideoTexture(
      'greeter-vid',
      greeter_video_src,
      scene,
      undefined,
      true,
      undefined,
      { loop: true, autoPlay: false, muted: true }
    )
    prVidTex = new VideoTexture(
      'pr-vid',
      pr_video_src,
      scene,
      undefined,
      true,
      undefined,
      { loop: true, autoPlay: false, muted: true }
    )
    starrySkyVidTex = new VideoTexture(
      'starry-sky-vid',
      starry_sky_video_src,
      scene,
      undefined,
      true,
      undefined,
      { loop: true, autoPlay: false, muted: true }
    )

    rootNode = new TransformNode('stage', scene)
    const canvas = engine.getRenderingCanvas()
    if (canvas) {
      meshGestureBehavior(canvas, rootNode)
    }

    SceneLoader.ImportMesh(
      '',
      model_src,
      '',
      scene,
      (meshes, ps, skl, animationsGroup) => {
        let starsMesh: AbstractMesh | undefined
        let prMesh: AbstractMesh | undefined
        let greenMesh: AbstractMesh | undefined

        animGroup = animationsGroup[0]
        animGroup.stop()

        model = meshes[0] as Mesh
        model.rotation = new Vector3(0, 0, 0)
        model.parent = rootNode
        for (const mesh of meshes) {
          if (
            mesh.name === 'button_facebook' ||
            mesh.name === 'button_facebook_primitive0' ||
            mesh.name === 'button_facebook_primitive1' ||
            mesh.name === 'button_linkedin' ||
            mesh.name === 'button_linkedin_primitive0' ||
            mesh.name === 'button_linkedin_primitive1' ||
            mesh.name === 'button_twitter' ||
            mesh.name === 'button_twitter_primitive0' ||
            mesh.name === 'button_twitter_primitive1'
          ) {
            if (mesh instanceof Mesh) {
              mesh.isPickable = true
            }
          } else {
            mesh.isPickable = false
            if (mesh.name === 'video_stars_primitive1') starsMesh = mesh
            else if (mesh.name === 'video_postreality') prMesh = mesh
            else if (mesh.name === 'video_greenscreen') greenMesh = mesh
          }
        }

        if (starsMesh) {
          const mat = starsMesh.material as PBRMaterial
          mat.albedoTexture = starrySkyVidTex
          mat.emissiveTexture = starrySkyVidTex
          mat.emissiveColor = Color3.White()
          starsMesh.material = mat
        }
        if (prMesh) {
          const mat = prMesh.material as PBRMaterial
          mat.albedoTexture = prVidTex
          mat.emissiveTexture = prVidTex
          mat.emissiveColor = Color3.White()
          prMesh.material = mat
        }
        if (greenMesh) {
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
          shaderMaterial.setTexture('textureSampler', greeterVidTex)
          shaderMaterial.setFloat('thresholdSensitivity', 0.24)
          shaderMaterial.setFloat('smoothing', 0.3)
          greenMesh.material?.dispose()
          greenMesh.material = shaderMaterial
        }
        setStarted(true)
      },
      xhr => {
        setProgress((xhr.loaded / xhr.total) * 100)
      },
      null,
      '.glb'
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
      surface.isPickable = false
      rootNode.position = placeCursor.position
      rootNode.rotation = placeCursor.rotation
      rootNode.rotate(Vector3.Up(), Math.PI)

      const scale = { ...startScale }
      new window.TWEEN.Tween(scale)
        .to(endScale, animationMillis)
        .easing(window.TWEEN.Easing.Elastic.Out) // Use an easing function to make the animation smooth.
        .onStart(() => {
          // setStoreBtnActive(true)
          placeCursor.setEnabled(false)
          rootNode.setEnabled(true)
          greeterVidTex.video.loop = true
          greeterVidTex.video.play()
          prVidTex.video.loop = true
          prVidTex.video.play()
          starrySkyVidTex.video.loop = true
          starrySkyVidTex.video.play()
        })
        .onUpdate(() => {
          rootNode.scaling.x = scale._x
          rootNode.scaling.y = scale._y
          rootNode.scaling.z = scale._z
        })
        .onComplete(() => {
          bgm.play()
          animGroup.play(true)
        })
        .start() // Start the tween immediately.
    }
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
        allowedDevices: window.XR8.XrConfig.device().ANY
      }
      // Connect the camera to the XR engine and show camera feed
      freeCam.addBehavior(
        window.XR8.Babylonjs.xrCameraBehavior(xrCamConfig),
        true
      )

      canvas.addEventListener('touchstart', placeObjectTouchHandler, true) // Add touch listener.

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

      engine.runRenderLoop(() => {
        window.TWEEN.update(performance.now())
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
      <SplashOverlay open={!started} variant='booth'>
        <LoadingIndicator progress={progress} variant='booth' />
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
        class='absolute top-2 right-2 border-white border-[1px] rounded-lg'
        onClick={() => setShowInstructions(true)}
      >
        <img class='w-10 h-10' src={info_btn_src} alt='Instructions' />
      </button>
      <div class='absolute bottom-2 left-2 pointer-events-none'>
        <PoweredByPostReality />
      </div>
      <canvas
        id='renderCanvas'
        ref={canvasRef}
        class='overflow-hidden outline-none'
      />
    </>
  )
}
