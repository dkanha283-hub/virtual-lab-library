import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import {
  RotateCcw,
  Maximize2,
  Minimize2,
  Layers,
  Scissors,
  Play,
  Pause,
  Eye,
  EyeOff,
  Info,
  Sparkles,
} from 'lucide-react'
import type { ModelPresetId } from '../../types/lab'
import { cn } from '../../lib/utils'

interface PartMetadata {
  id: string
  name: string
  category: string
  description: string
  materialSpec: string
  explodeOffset: [number, number, number]
  isHousing?: boolean
}

const PRESET_PARTS: Record<ModelPresetId, PartMetadata[]> = {
  'dc-shunt-motor': [
    {
      id: 'stator-yoke',
      name: 'Cast-Steel Stator Yoke (Frame)',
      category: 'Magnetic Frame',
      description: 'Provides mechanical protection and serves as the low-reluctance return path for the 4-pole magnetic flux Φ.',
      materialSpec: 'Rolled Cast Steel (High Permeability)',
      explodeOffset: [0, 1.5, 0],
      isHousing: true,
    },
    {
      id: 'field-poles',
      name: '4-Pole Laminated Field Cores & Shunt Coils',
      category: 'Field Excitation (Z-ZZ)',
      description: 'Four salient stator poles wound with many turns of fine enameled copper wire connected in parallel across the 220V DC supply.',
      materialSpec: '0.5mm Silicon Steel + Enameled Copper (R_f = 220 Ω)',
      explodeOffset: [0, 0.8, 0],
    },
    {
      id: 'armature-core',
      name: 'Slotted Laminated Rotor Armature Core',
      category: 'Rotating Armature (A-AA)',
      description: 'Cylindrical rotor built from insulated silicon-steel laminations to minimize eddy-current and hysteresis core losses.',
      materialSpec: 'CRGO Laminated Silicon Steel (R_a = 1.2 Ω)',
      explodeOffset: [0, 0, 0],
    },
    {
      id: 'commutator',
      name: 'Hard-Drawn Copper Commutator Cylinder',
      category: 'Mechanical Rectifier',
      description: 'Segmented copper cylinder insulated by 0.8mm mica sheets that converts alternating induced EMF into unidirectional DC torque.',
      materialSpec: 'Hard-Drawn Electrolytic Copper + Mica',
      explodeOffset: [1.3, 0, 0],
    },
    {
      id: 'brushes',
      name: 'Electro-Graphite Carbon Brushes & Rig',
      category: 'Current Collector',
      description: 'Spring-loaded stationary carbon-graphite brushes riding on the commutator surface to inject armature current I_a.',
      materialSpec: 'Self-Lubricating Electro-Graphite Carbon',
      explodeOffset: [1.7, 0.5, 0],
    },
    {
      id: 'shaft-base',
      name: 'High-Tensile Alloy Shaft & Cast Base Plinth',
      category: 'Mechanical Transmission',
      description: 'Supports rotor bearings and transmits mechanical shaft torque T_sh at speeds up to 2500 RPM.',
      materialSpec: 'EN-8 Forged Carbon Steel Shaft',
      explodeOffset: [-1.4, -0.6, 0],
    },
  ],
  'rlc-workbench': [
    {
      id: 'dso-oscilloscope',
      name: '100 MHz Dual-Channel Digital Storage Oscilloscope',
      category: 'Waveform Telemetry',
      description: 'Displays real-time sinusoidal source voltage V_s(t) on CH1 and circuit current waveform I(t) on CH2 to measure phase shift φ.',
      materialSpec: '1 GS/s Digital Acquisition Unit',
      explodeOffset: [-1.2, 0.8, 0],
    },
    {
      id: 'decade-resistor',
      name: 'Precision Non-Inductive Decade Resistance Box (R)',
      category: 'Dissipative Element',
      description: 'Controls damping and Quality Factor Q₀ = (1/R)√(L/C). Limits peak current I_max = V/R at series resonance.',
      materialSpec: 'Manganin Wire-Wound (±0.5%, 10–500 Ω)',
      explodeOffset: [-0.8, 0, 0.9],
    },
    {
      id: 'air-core-inductor',
      name: 'Toroidal Air-Core Standard Inductor (L)',
      category: 'Magnetic Energy Storage',
      description: 'Stores magnetic field energy (½ L I²) and provides inductive reactance X_L = 2πfL that increases linearly with frequency.',
      materialSpec: 'Litz-Wire Multi-Tap Coil (10–200 mH)',
      explodeOffset: [0.3, 0, 0.9],
    },
    {
      id: 'film-capacitor',
      name: 'Metallized Polypropylene Decade Capacitor (C)',
      category: 'Electrostatic Energy Storage',
      description: 'Stores electrostatic energy (½ C V²) and provides capacitive reactance X_C = 1/(2πfC) that balances X_L at resonance f₀.',
      materialSpec: 'Low-ESR Film Dielectric (0.1–10 µF, 630V)',
      explodeOffset: [1.3, 0, 0.9],
    },
  ],
  'centrifugal-pump': [
    {
      id: 'volute-casing',
      name: 'Spiral Cast-Iron Volute Casing',
      category: 'Pressure Recovery Housing',
      description: 'Gradually expanding spiral flow passage surrounding the impeller that converts high-velocity kinetic head into static pressure head.',
      materialSpec: 'FG-260 Close-Grained Cast Iron',
      explodeOffset: [0, 1.3, 0],
      isHousing: true,
    },
    {
      id: 'impeller-vanes',
      name: 'Backward-Curved Bronze Impeller',
      category: 'Rotating Turbomachine Element',
      description: 'Imparts centrifugal acceleration to fluid entering the suction eye and discharges it radially into the volute.',
      materialSpec: 'Phosphor Bronze Dynamically Balanced Rotor',
      explodeOffset: [0, 0, 0],
    },
    {
      id: 'suction-delivery',
      name: 'Suction Eye & Delivery Flange Manifold',
      category: 'Fluid Piping Ports',
      description: 'Axial suction inlet pipe with vacuum gauge port and vertical tangential delivery flange with pressure gauge port.',
      materialSpec: 'Schedule 40 Flanged Steel Pipe',
      explodeOffset: [1.4, 0.5, 0],
    },
  ],
  'three-phase-induction': [
    {
      id: 'stator-yoke',
      name: '3-Phase Distributed Stator Frame',
      category: 'Stator Assembly',
      description: 'Produces a synchronous rotating magnetic field N_s = 120f / P when excited by a balanced 415V 3-phase supply.',
      materialSpec: 'Silicon Steel Stator Core',
      explodeOffset: [0, 1.4, 0],
      isHousing: true,
    },
    {
      id: 'squirrel-rotor',
      name: 'Skewed Squirrel-Cage Copper Rotor',
      category: 'Rotor Assembly',
      description: 'Short-circuited rotor bars brazed to end-rings that develop slip-dependent electromagnetic torque.',
      materialSpec: 'Die-Cast Aluminum / Copper Bars',
      explodeOffset: [0, 0, 0],
    },
  ],
  'logic-gate-ic-trainer': [
    {
      id: 'ic-breadboard',
      name: '74xx TTL Digital IC Trainer Board',
      category: 'Logic Prototyping',
      description: 'Equipped with regulated +5V DC power rail, logic toggle switches, LED logic indicators, and 14-pin DIP IC sockets.',
      materialSpec: 'FR-4 Double-Sided PCB',
      explodeOffset: [0, 0, 0],
    },
  ],
}

interface Props {
  preset: ModelPresetId
  title: string
  rpm?: number
}

export function Engineering3DViewer({ preset, title, rpm = 1200 }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const partsList = PRESET_PARTS[preset] || PRESET_PARTS['dc-shunt-motor']

  const [selectedPartId, setSelectedPartId] = useState<string>(partsList[0].id)
  const [explodeFactor, setExplodeFactor] = useState<number>(0)
  const [cutawayActive, setCutawayActive] = useState<boolean>(false)
  const [isAnimating, setIsAnimating] = useState<boolean>(true)
  const [showLabels, setShowLabels] = useState<boolean>(true)
  const [hiddenPartIds, setHiddenPartIds] = useState<string[]>([])
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)
  const [resetTrigger, setResetTrigger] = useState<number>(0)

  // Refs synced with Three.js animation loop
  const stateRef = useRef({
    explodeFactor,
    cutawayActive,
    isAnimating,
    hiddenPartIds,
    selectedPartId,
    rpm,
  })
  useEffect(() => {
    stateRef.current = {
      explodeFactor,
      cutawayActive,
      isAnimating,
      hiddenPartIds,
      selectedPartId,
      rpm,
    }
  }, [explodeFactor, cutawayActive, isAnimating, hiddenPartIds, selectedPartId, rpm])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const width = container.clientWidth || 720
    const height = container.clientHeight || 440

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#090d16')

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100)
    camera.position.set(4.5, 3.2, 5.4)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.innerHTML = ''
    container.appendChild(renderer.domElement)

    // Lighting tailored for metallic engineering components
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85)
    scene.add(ambientLight)

    const keyLight = new THREE.DirectionalLight(0x38bdf8, 1.6)
    keyLight.position.set(6, 8, 6)
    scene.add(keyLight)

    const fillLight = new THREE.DirectionalLight(0xf59e0b, 0.9)
    fillLight.position.set(-6, -3, -5)
    scene.add(fillLight)

    // Engineering Reference Grid
    const grid = new THREE.GridHelper(10, 20, 0x1e293b, 0x0f172a)
    grid.position.y = -1.45
    scene.add(grid)

    const rootGroup = new THREE.Group()
    scene.add(rootGroup)

    const partGroups: Record<string, THREE.Group> = {}
    const rotorSpinGroups: THREE.Object3D[] = []

    // Build Procedural Engineering Models based on preset
    if (preset === 'dc-shunt-motor' || preset === 'three-phase-induction') {
      // 1. Stator Yoke Housing (Cutaway capable)
      const yokeGroup = new THREE.Group()
      const yokeGeo = new THREE.CylinderGeometry(1.38, 1.38, 2.2, 36, 1, true, 0, Math.PI * 2)
      const yokeMat = new THREE.MeshStandardMaterial({
        color: 0x1e3a5f,
        metalness: 0.65,
        roughness: 0.35,
        side: THREE.DoubleSide,
      })
      const yokeMesh = new THREE.Mesh(yokeGeo, yokeMat)
      yokeMesh.rotation.z = Math.PI / 2
      yokeGroup.add(yokeMesh)
      partGroups['stator-yoke'] = yokeGroup
      rootGroup.add(yokeGroup)

      // 2. 4 Salient Field Poles & Copper Coils
      const polesGroup = new THREE.Group()
      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2 + Math.PI / 4
        const pole = new THREE.Mesh(
          new THREE.BoxGeometry(1.5, 0.36, 0.42),
          new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.5, roughness: 0.3 })
        )
        pole.position.set(0, Math.sin(angle) * 1.0, Math.cos(angle) * 1.0)
        pole.rotation.x = -angle
        polesGroup.add(pole)
      }
      partGroups['field-poles'] = polesGroup
      rootGroup.add(polesGroup)

      // 3. Slotted Laminated Rotor Armature Core
      const armatureGroup = new THREE.Group()
      const coreMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.72, 0.72, 1.65, 28),
        new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.75, roughness: 0.25 })
      )
      coreMesh.rotation.z = Math.PI / 2
      armatureGroup.add(coreMesh)

      // Rotor slots / copper bars for visual rotation feedback
      for (let k = 0; k < 12; k++) {
        const barAngle = (k * Math.PI * 2) / 12
        const bar = new THREE.Mesh(
          new THREE.BoxGeometry(1.68, 0.06, 0.06),
          new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8, roughness: 0.2 })
        )
        bar.position.set(0, Math.sin(barAngle) * 0.71, Math.cos(barAngle) * 0.71)
        armatureGroup.add(bar)
      }
      partGroups['armature-core'] = armatureGroup
      partGroups['squirrel-rotor'] = armatureGroup
      rotorSpinGroups.push(armatureGroup)
      rootGroup.add(armatureGroup)

      // 4. Copper Commutator Cylinder
      const commGroup = new THREE.Group()
      const commMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.45, 0.45, 0.55, 24),
        new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.85, roughness: 0.2 })
      )
      commMesh.rotation.z = Math.PI / 2
      commMesh.position.x = 1.15
      commGroup.add(commMesh)
      partGroups['commutator'] = commGroup
      rotorSpinGroups.push(commGroup)
      rootGroup.add(commGroup)

      // 5. Carbon Brushes
      const brushGroup = new THREE.Group()
      const b1 = new THREE.Mesh(
        new THREE.BoxGeometry(0.22, 0.28, 0.18),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 })
      )
      b1.position.set(1.15, 0.54, 0)
      const b2 = b1.clone()
      b2.position.set(1.15, -0.54, 0)
      brushGroup.add(b1, b2)
      partGroups['brushes'] = brushGroup
      rootGroup.add(brushGroup)

      // 6. Alloy Shaft & Base Plinth
      const shaftGroup = new THREE.Group()
      const shaftMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.16, 0.16, 3.6, 20),
        new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.9, roughness: 0.15 })
      )
      shaftMesh.rotation.z = Math.PI / 2
      const baseMesh = new THREE.Mesh(
        new THREE.BoxGeometry(2.8, 0.22, 2.2),
        new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.4, roughness: 0.6 })
      )
      baseMesh.position.y = -1.32
      shaftGroup.add(shaftMesh, baseMesh)
      partGroups['shaft-base'] = shaftGroup
      rootGroup.add(shaftGroup)
    } else if (preset === 'rlc-workbench') {
      // Benchtop + DSO + R, L, C Decade Boxes
      const dsoGroup = new THREE.Group()
      const dsoBody = new THREE.Mesh(
        new THREE.BoxGeometry(1.7, 1.1, 0.8),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.4, roughness: 0.5 })
      )
      dsoBody.position.set(-1.1, 0.25, -0.5)
      const dsoScreen = new THREE.Mesh(
        new THREE.PlaneGeometry(1.1, 0.72),
        new THREE.MeshBasicMaterial({ color: 0x0284c7 })
      )
      dsoScreen.position.set(-1.2, 0.28, -0.09)
      dsoGroup.add(dsoBody, dsoScreen)
      partGroups['dso-oscilloscope'] = dsoGroup
      rootGroup.add(dsoGroup)

      const rGroup = new THREE.Group()
      const rBox = new THREE.Mesh(
        new THREE.BoxGeometry(0.95, 0.48, 0.75),
        new THREE.MeshStandardMaterial({ color: 0x0f766e, metalness: 0.5, roughness: 0.4 })
      )
      rBox.position.set(-1.1, -0.65, 0.85)
      rGroup.add(rBox)
      partGroups['decade-resistor'] = rGroup
      rootGroup.add(rGroup)

      const lGroup = new THREE.Group()
      const lCoil = new THREE.Mesh(
        new THREE.TorusGeometry(0.38, 0.14, 18, 36),
        new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.8, roughness: 0.25 })
      )
      lCoil.rotation.x = Math.PI / 2
      lCoil.position.set(0.15, -0.6, 0.85)
      lGroup.add(lCoil)
      partGroups['air-core-inductor'] = lGroup
      rotorSpinGroups.push(lGroup)
      rootGroup.add(lGroup)

      const cGroup = new THREE.Group()
      const cCyl = new THREE.Mesh(
        new THREE.CylinderGeometry(0.34, 0.34, 0.75, 24),
        new THREE.MeshStandardMaterial({ color: 0x2563eb, metalness: 0.6, roughness: 0.3 })
      )
      cCyl.position.set(1.3, -0.55, 0.85)
      cGroup.add(cCyl)
      partGroups['film-capacitor'] = cGroup
      rootGroup.add(cGroup)
    } else {
      // Centrifugal Pump Volute + Bronze Impeller
      const casingGroup = new THREE.Group()
      const casing = new THREE.Mesh(
        new THREE.TorusGeometry(0.95, 0.36, 20, 40),
        new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.6, roughness: 0.35 })
      )
      casingGroup.add(casing)
      partGroups['volute-casing'] = casingGroup
      rootGroup.add(casingGroup)

      const impellerGroup = new THREE.Group()
      const hub = new THREE.Mesh(
        new THREE.CylinderGeometry(0.75, 0.75, 0.28, 24),
        new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.85, roughness: 0.2 })
      )
      hub.rotation.x = Math.PI / 2
      impellerGroup.add(hub)
      partGroups['impeller-vanes'] = impellerGroup
      rotorSpinGroups.push(impellerGroup)
      rootGroup.add(impellerGroup)

      const pipeGroup = new THREE.Group()
      const pipe = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.25, 1.4, 20),
        new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.7, roughness: 0.3 })
      )
      pipe.position.set(0.95, 0.9, 0)
      pipeGroup.add(pipe)
      partGroups['suction-delivery'] = pipeGroup
      rootGroup.add(pipeGroup)
    }

    // Touch & Pointer Orbit/Zoom Interaction on iPad Safari
    let isDragging = false
    let prevX = 0
    let prevY = 0
    let sphericalTheta = 0.72
    let sphericalPhi = 1.05
    let radius = 6.2

    const updateCameraFromSpherical = () => {
      camera.position.x = radius * Math.sin(sphericalPhi) * Math.sin(sphericalTheta)
      camera.position.y = radius * Math.cos(sphericalPhi)
      camera.position.z = radius * Math.sin(sphericalPhi) * Math.cos(sphericalTheta)
      camera.lookAt(0, 0, 0)
    }
    updateCameraFromSpherical()

    const domElem = renderer.domElement
    const onPointerDown = (e: PointerEvent) => {
      isDragging = true
      prevX = e.clientX
      prevY = e.clientY
    }
    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return
      const dx = e.clientX - prevX
      const dy = e.clientY - prevY
      prevX = e.clientX
      prevY = e.clientY
      sphericalTheta -= dx * 0.008
      sphericalPhi = Math.max(0.25, Math.min(Math.PI - 0.25, sphericalPhi - dy * 0.008))
      updateCameraFromSpherical()
    }
    const onPointerUp = () => {
      isDragging = false
    }
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      radius = Math.max(3.0, Math.min(11.0, radius + e.deltaY * 0.004))
      updateCameraFromSpherical()
    }

    domElem.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    domElem.addEventListener('wheel', onWheel, { passive: false })

    // Animation Loop
    let frameId = 0
    const animate = () => {
      frameId = requestAnimationFrame(animate)
      const st = stateRef.current

      // Rotate Rotor based on RPM
      if (st.isAnimating) {
        const angularStep = Math.max(0.01, (st.rpm / 1500) * 0.045)
        rotorSpinGroups.forEach((grp) => {
          grp.rotation.x += angularStep
        })
      }

      // Apply Exploded View Offsets, Visibility, Cutaway & Selection Highlight
      partsList.forEach((meta) => {
        const grp = partGroups[meta.id]
        if (!grp) return

        // Visibility
        grp.visible = !st.hiddenPartIds.includes(meta.id)

        // Explode offset interpolation
        const [ox, oy, oz] = meta.explodeOffset
        grp.position.set(
          ox * st.explodeFactor,
          oy * st.explodeFactor,
          oz * st.explodeFactor
        )

        // Cutaway mode makes outer housing wireframe/semi-transparent so internal rotor is visible
        grp.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh
            const mat = mesh.material as THREE.MeshStandardMaterial
            if (meta.isHousing && mat) {
              mat.transparent = st.cutawayActive
              mat.opacity = st.cutawayActive ? 0.28 : 1.0
              mat.wireframe = st.cutawayActive
            }
            if (mat && 'emissive' in mat) {
              mat.emissive = new THREE.Color(
                st.selectedPartId === meta.id ? 0x0284c7 : 0x000000
              )
              mat.emissiveIntensity = st.selectedPartId === meta.id ? 0.35 : 0
            }
          }
        })
      })

      renderer.render(scene, camera)
    }
    animate()

    const handleResize = () => {
      if (!container) return
      const w = container.clientWidth || 720
      const h = container.clientHeight || 440
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(frameId)
      domElem.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      domElem.removeEventListener('wheel', onWheel)
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
    }
  }, [preset, resetTrigger, isFullscreen])

  const selectedPart =
    partsList.find((p) => p.id === selectedPartId) || partsList[0]

  const togglePartVisibility = (id: string) => {
    setHiddenPartIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  return (
    <div
      className={cn(
        'bg-slate-900/95 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl transition-all',
        isFullscreen ? 'fixed inset-3 z-50 flex flex-col' : ''
      )}
    >
      {/* Top 3D Control Bar */}
      <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-md bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-bold">
            Interactive Three.js 3D Lab
          </span>
          <h3 className="text-sm font-bold text-white truncate">{title}</h3>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setIsAnimating(!isAnimating)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer',
              isAnimating
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-900 text-slate-300 border-slate-700'
            )}
          >
            {isAnimating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isAnimating ? 'Rotor Live' : 'Paused'}
          </button>

          <button
            onClick={() => setCutawayActive(!cutawayActive)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer',
              cutawayActive
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-900 text-slate-300 border-slate-700'
            )}
          >
            <Scissors className="w-3.5 h-3.5" />
            Cutaway Stator
          </button>

          <button
            onClick={() => setShowLabels(!showLabels)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer',
              showLabels
                ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                : 'bg-slate-900 text-slate-300 border-slate-700'
            )}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Labels
          </button>

          <button
            onClick={() => {
              setExplodeFactor(0)
              setCutawayActive(false)
              setHiddenPartIds([])
              setResetTrigger((t) => t + 1)
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-slate-300 border border-slate-700 hover:text-white cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset View
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-slate-300 border border-slate-700 hover:text-white cursor-pointer"
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </button>
        </div>
      </div>

      {/* Main 3D Viewport + Inspector Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 flex-1">
        {/* Left/Center WebGL Canvas */}
        <div className="lg:col-span-8 relative bg-slate-950 flex flex-col">
          <div
            ref={containerRef}
            className={cn(
              'w-full touch-none select-none cursor-grab active:cursor-grabbing',
              isFullscreen ? 'h-[62vh] lg:h-full' : 'h-[360px] sm:h-[430px]'
            )}
          />

          {/* Floating Educational Labels Overlay */}
          {showLabels && (
            <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
              <div className="bg-slate-950/85 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-300">
                👆 <strong className="text-sky-400">iPad Touch:</strong> Drag with 1 finger to Orbit 360° • Tap parts on right to inspect
              </div>
              <div className="bg-slate-950/85 backdrop-blur-md border border-sky-500/40 px-3 py-1.5 rounded-xl text-xs font-mono text-sky-300">
                Active Focus: {selectedPart.name}
              </div>
            </div>
          )}

          {/* Bottom Exploded View Touch Slider */}
          <div className="p-3.5 bg-slate-900/90 border-t border-slate-800 flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 shrink-0">
              <Layers className="w-4 h-4 text-sky-400" />
              Exploded Assembly View ({Math.round(explodeFactor * 100)}%)
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.02}
              value={explodeFactor}
              onChange={(e) => setExplodeFactor(parseFloat(e.target.value))}
              className="w-full accent-sky-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Right Side Component Selector & Engineering Inspector */}
        <div className="lg:col-span-4 bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 p-4 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Sub-Assemblies &amp; Visibility
              </span>
              <span className="text-[11px] text-sky-400 font-medium">
                {partsList.length} Components
              </span>
            </div>

            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {partsList.map((part) => {
                const isSelected = part.id === selectedPartId
                const isHidden = hiddenPartIds.includes(part.id)
                return (
                  <div
                    key={part.id}
                    className={cn(
                      'flex items-center justify-between gap-2 p-2.5 rounded-xl border text-left transition-all',
                      isSelected
                        ? 'bg-sky-500/15 border-sky-500 text-white'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300'
                    )}
                  >
                    <button
                      onClick={() => setSelectedPartId(part.id)}
                      className="flex-1 text-left cursor-pointer"
                    >
                      <div className="text-xs font-bold leading-snug">{part.name}</div>
                      <div className="text-[10px] text-slate-400">{part.category}</div>
                    </button>
                    <button
                      onClick={() => togglePartVisibility(part.id)}
                      className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
                      title={isHidden ? 'Show Component' : 'Hide Component'}
                    >
                      {isHidden ? (
                        <EyeOff className="w-3.5 h-3.5 text-rose-400" />
                      ) : (
                        <Eye className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Selected Component Technical Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center gap-2 text-sky-400 text-xs font-bold">
              <Info className="w-4 h-4 shrink-0" />
              <span>{selectedPart.name}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedPart.description}
            </p>
            <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
              <strong className="text-slate-200">Material &amp; Spec:</strong>{' '}
              {selectedPart.materialSpec}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
