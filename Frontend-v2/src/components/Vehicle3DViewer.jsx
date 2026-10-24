import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

// Official TAPRO Brand Automotive Paint Swatches
const PAINT_SWATCHES = [
  { name: 'Tapro Red', hex: 0xD01F26, label: 'Tapro Red Metallic Pearl' },
  { name: 'Tokyo Black', hex: 0x111111, label: 'Tokyo Obsidian Metallic' },
  { name: 'Yokohama Silver', hex: 0xD0D5DD, label: 'Yokohama Billet Silver' },
  { name: 'Fuji White', hex: 0xF5F5F7, label: 'Fuji Crystal White' },
  { name: 'Deep Pacific Blue', hex: 0x0E2841, label: 'Deep Pacific Metallic' },
]

export default function Vehicle3DViewer() {
  const containerRef = useRef(null)
  const bodyMaterialRef = useRef(null)
  const wheelsRef = useRef([])
  const vehicleGroupRef = useRef(null)
  const cameraRef = useRef(null)
  const [selectedPaint, setSelectedPaint] = useState(PAINT_SWATCHES[0])
  const [isRotating, setIsRotating] = useState(true)
  const [activeAngle, setActiveAngle] = useState('orbit')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x111111) // Showroom dark charcoal

    const width = container.clientWidth || 640
    const height = container.clientHeight || 460

    // Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100)
    camera.position.set(4.2, 1.6, 4.4)
    cameraRef.current = camera

    // High performance WebGL Renderer with ACES Tone Mapping
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.05
    container.appendChild(renderer.domElement)

    // ── High Dynamic Range Studio Environment (Crucial for Metallic Clearcoat & Glass) ──
    const environment = new RoomEnvironment()
    const pmremGenerator = new THREE.PMREMGenerator(renderer)
    scene.environment = pmremGenerator.fromScene(environment).texture

    // Additional Showroom Spotlights
    const spotLight = new THREE.DirectionalLight(0xffffff, 1.8)
    spotLight.position.set(4, 8, 4)
    spotLight.castShadow = true
    spotLight.shadow.mapSize.width = 1024
    spotLight.shadow.mapSize.height = 1024
    spotLight.shadow.bias = -0.0002
    scene.add(spotLight)

    const rimLight = new THREE.DirectionalLight(0xD01F26, 1.2)
    rimLight.position.set(-4, 3, -4)
    scene.add(rimLight)

    // Floor Underglow
    const underGlow = new THREE.PointLight(0xD01F26, 1.6, 8)
    underGlow.position.set(0, 0.1, 0)
    scene.add(underGlow)

    // ── Showroom Turntable Grid & Glowing Red LED Ring ──
    const grid = new THREE.GridHelper(10, 20, 0x444444, 0x222222)
    grid.position.y = 0.002
    scene.add(grid)

    const ringGeo = new THREE.RingGeometry(3.6, 3.7, 64)
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xD01F26, side: THREE.DoubleSide })
    const ring = new THREE.Mesh(ringGeo, ringMat)
    ring.rotation.x = -Math.PI / 2
    ring.position.y = 0.005
    scene.add(ring)

    // ── 3D Vehicle Group ──
    const vehicleGroup = new THREE.Group()
    vehicleGroupRef.current = vehicleGroup
    scene.add(vehicleGroup)

    // Official Metallic Clearcoat Body Material
    const bodyMaterial = new THREE.MeshPhysicalMaterial({
      color: selectedPaint.hex,
      metalness: 1.0,
      roughness: 0.45,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      sheen: 0.5,
    })
    bodyMaterialRef.current = bodyMaterial

    // Chrome Rims & Details Material
    const detailsMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.98,
      roughness: 0.15,
    })

    // Obsidian Tinted Glass Material
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.2,
      roughness: 0.02,
      transmission: 0.9,
      transparent: true,
      opacity: 0.85,
    })

    // Load High-Poly Authentic Supercar GLB Model with Draco Geometry Decompression
    wheelsRef.current = []
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/')

    const loader = new GLTFLoader()
    loader.setDRACOLoader(dracoLoader)
    loader.load(
      '/models/car.glb',
      (gltf) => {
        const carModel = gltf.scene.children[0]

        // Assign materials to model nodes
        const bodyMesh = carModel.getObjectByName('body')
        if (bodyMesh) bodyMesh.material = bodyMaterial

        const rimFl = carModel.getObjectByName('rim_fl')
        if (rimFl) rimFl.material = detailsMaterial

        const rimFr = carModel.getObjectByName('rim_fr')
        if (rimFr) rimFr.material = detailsMaterial

        const rimRr = carModel.getObjectByName('rim_rr')
        if (rimRr) rimRr.material = detailsMaterial

        const rimRl = carModel.getObjectByName('rim_rl')
        if (rimRl) rimRl.material = detailsMaterial

        const trimMesh = carModel.getObjectByName('trim')
        if (trimMesh) trimMesh.material = detailsMaterial

        const glassMesh = carModel.getObjectByName('glass')
        if (glassMesh) glassMesh.material = glassMaterial

        // Enable shadows on all child meshes
        carModel.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true
            child.receiveShadow = true
          }
        })

        // Store wheels for rotating when spinning
        const wFl = carModel.getObjectByName('wheel_fl')
        const wFr = carModel.getObjectByName('wheel_fr')
        const wRl = carModel.getObjectByName('wheel_rl')
        const wRr = carModel.getObjectByName('wheel_rr')
        if (wFl) wheelsRef.current.push(wFl)
        if (wFr) wheelsRef.current.push(wFr)
        if (wRl) wheelsRef.current.push(wRl)
        if (wRr) wheelsRef.current.push(wRr)

        vehicleGroup.add(carModel)
        camera.lookAt(0, 0.5, 0)
        setIsLoading(false)
      },
      undefined,
      (err) => {
        console.error('Failed to load 3D vehicle model:', err)
        setIsLoading(false)
      }
    )

    // ── Mouse & Touch Drag Controls ──
    let isDragging = false
    let prevMousePos = { x: 0, y: 0 }

    const onMouseDown = (e) => {
      isDragging = true
      prevMousePos = { x: e.clientX, y: e.clientY }
    }

    const onMouseMove = (e) => {
      if (!isDragging) return
      const deltaX = e.clientX - prevMousePos.x
      const deltaY = e.clientY - prevMousePos.y
      vehicleGroup.rotation.y += deltaX * 0.008
      camera.position.y = Math.max(0.6, Math.min(3.2, camera.position.y - deltaY * 0.008))
      camera.lookAt(0, 0.5, 0)
      prevMousePos = { x: e.clientX, y: e.clientY }
    }

    const onMouseUp = () => { isDragging = false }

    const domEl = renderer.domElement
    domEl.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)

    // Touch support
    const onTouchStart = (e) => {
      if (e.touches.length === 1) {
        isDragging = true
        prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      }
    }
    const onTouchMove = (e) => {
      if (!isDragging || e.touches.length !== 1) return
      const deltaX = e.touches[0].clientX - prevMousePos.x
      vehicleGroup.rotation.y += deltaX * 0.008
      prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
    const onTouchEnd = () => { isDragging = false }

    domEl.addEventListener('touchstart', onTouchStart)
    window.addEventListener('touchmove', onTouchMove)
    window.addEventListener('touchend', onTouchEnd)

    // Animation Loop
    let animId
    const animate = () => {
      animId = requestAnimationFrame(animate)
      if (isRotating && !isDragging) {
        vehicleGroup.rotation.y += 0.004
        wheelsRef.current.forEach((w) => {
          w.rotation.x += 0.015
        })
      }
      renderer.render(scene, camera)
    }
    animate()

    // Responsive Resize Handler
    const handleResize = () => {
      if (!container) return
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
      domEl.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      domEl.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      if (domEl.parentNode) domEl.parentNode.removeChild(domEl)
      pmremGenerator.dispose()
      renderer.dispose()
    }
  }, [isRotating])

  // Change Paint Color Dynamically
  function handleSelectPaint(swatch) {
    setSelectedPaint(swatch)
    if (bodyMaterialRef.current) {
      bodyMaterialRef.current.color.setHex(swatch.hex)
    }
  }

  // Camera Presets
  function setCameraAngle(angle) {
    setActiveAngle(angle)
    if (!vehicleGroupRef.current || !cameraRef.current) return
    if (angle === 'front') {
      setIsRotating(false)
      vehicleGroupRef.current.rotation.y = -Math.PI / 4
    } else if (angle === 'side') {
      setIsRotating(false)
      vehicleGroupRef.current.rotation.y = 0
    } else if (angle === 'rear') {
      setIsRotating(false)
      vehicleGroupRef.current.rotation.y = (3 * Math.PI) / 4
    } else {
      setIsRotating(true)
    }
  }

  return (
    <div className="relative w-full h-[380px] sm:h-[420px] md:h-[460px] bg-[#111111] rounded border border-[#2A2A2A] overflow-hidden select-none shadow-2xl">
      {/* 3D WebGL Canvas */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Loading State Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-[#111111] flex flex-col items-center justify-center text-white z-10">
          <div className="w-10 h-10 border-2 border-[#D01F26] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-mono tracking-widest text-[#D8D8D8]">
            INITIALIZING TAPRO 3D SHOWROOM...
          </p>
        </div>
      )}

      {/* Top Header Badge & Preset Angles */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-20">
        <div className="flex items-center gap-2 pointer-events-auto">
          <span className="inline-block px-2.5 py-1 rounded bg-[#1A1A1A]/95 text-white text-[11px] font-mono font-bold tracking-wider border border-[#333333] shadow-md">
            VIRTUAL SHOWROOM 360°
          </span>
          <span className="text-[11px] font-mono text-[#D8D8D8]/70 hidden sm:inline-block">
            JAPAN SPEC TURNTABLE
          </span>
        </div>

        {/* View Angle Presets */}
        <div className="pointer-events-auto flex items-center gap-1 bg-[#1A1A1A]/95 p-1 rounded border border-[#333333] text-[11px] font-mono text-[#D8D8D8] shadow-md">
          <button
            onClick={() => setCameraAngle('orbit')}
            className={`px-2 py-0.5 rounded transition-colors ${activeAngle === 'orbit' ? 'bg-[#D01F26] text-white font-bold' : 'hover:text-white'}`}
          >
            360°
          </button>
          <button
            onClick={() => setCameraAngle('front')}
            className={`px-2 py-0.5 rounded transition-colors ${activeAngle === 'front' ? 'bg-[#D01F26] text-white font-bold' : 'hover:text-white'}`}
          >
            Front
          </button>
          <button
            onClick={() => setCameraAngle('side')}
            className={`px-2 py-0.5 rounded transition-colors ${activeAngle === 'side' ? 'bg-[#D01F26] text-white font-bold' : 'hover:text-white'}`}
          >
            Profile
          </button>
          <button
            onClick={() => setCameraAngle('rear')}
            className={`px-2 py-0.5 rounded transition-colors ${activeAngle === 'rear' ? 'bg-[#D01F26] text-white font-bold' : 'hover:text-white'}`}
          >
            Rear
          </button>
        </div>
      </div>

      {/* Bottom Swatch Selector & Spec Footer */}
      <div className="absolute bottom-3 left-3 right-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pointer-events-auto bg-[#1A1A1A]/95 p-2.5 rounded border border-[#333333] backdrop-blur-xs text-[11px] font-mono text-[#D8D8D8] shadow-lg z-20">
        
        {/* Paint Swatches with Official Tapro Red */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase text-[#D8D8D8]/80 font-bold hidden md:inline">Finish:</span>
          <div className="flex items-center gap-1.5">
            {PAINT_SWATCHES.map((s) => (
              <button
                key={s.name}
                onClick={() => handleSelectPaint(s)}
                title={s.label}
                className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-110 ${
                  selectedPaint.name === s.name ? 'border-[#D01F26] scale-110 shadow-sm' : 'border-white/30'
                }`}
                style={{ backgroundColor: `#${s.hex.toString(16).padStart(6, '0')}` }}
              />
            ))}
          </div>
          <span className="text-[11px] text-white font-bold ml-1">{selectedPaint.label}</span>
        </div>

        {/* Drag to Rotate hint & Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-3">
          <span className="text-[#D01F26] font-bold hidden sm:inline">DRAG TO ROTATE 360°</span>
          <button
            onClick={() => setIsRotating(r => !r)}
            className="text-[10px] uppercase font-bold px-2.5 py-1 rounded bg-[#2A2A2A] hover:bg-[#383838] text-white border border-[#444444] transition-colors"
          >
            {isRotating ? '⏸ Pause' : '▶ Spin'}
          </button>
        </div>

      </div>
    </div>
  )
}
