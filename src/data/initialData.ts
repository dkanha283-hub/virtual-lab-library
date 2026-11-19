import type { Department, Laboratory, Experiment, ExperimentSectionConfig } from '../types/lab'

export const DEFAULT_SECTIONS_CONFIG: ExperimentSectionConfig[] = [
  { id: 'aim', title: '1. Aim & Objectives', enabled: true, order: 1 },
  { id: 'outcomes', title: '2. Learning Outcomes', enabled: true, order: 2 },
  { id: 'apparatus', title: '3. Apparatus Required', enabled: true, order: 3 },
  { id: 'theory', title: '4. Engineering Theory', enabled: true, order: 4 },
  { id: 'equations', title: '5. Mathematical Equations', enabled: true, order: 5 },
  { id: 'circuit_diagram', title: '6. Circuit / Schematic Diagram', enabled: true, order: 6 },
  { id: 'model_3d', title: '7. Interactive 3D Engineering Model', enabled: true, order: 7 },
  { id: 'simulation', title: '8. Virtual Laboratory Simulation', enabled: true, order: 8 },
  { id: 'procedure', title: '9. Step-by-Step Procedure', enabled: true, order: 9 },
  { id: 'observations', title: '10. Live Observation Table', enabled: true, order: 10 },
  { id: 'calculations', title: '11. Engineering Calculations', enabled: true, order: 11 },
  { id: 'graphs', title: '12. Characteristic Graphs & Waveforms', enabled: true, order: 12 },
  { id: 'results', title: '13. Results & Engineering Conclusions', enabled: true, order: 13 },
  { id: 'precautions', title: '14. Safety & Lab Precautions', enabled: true, order: 14 },
  { id: 'viva', title: '15. Viva-Voce Questions & Answers', enabled: true, order: 15 },
  { id: 'references', title: '16. Standard Textbooks & References', enabled: true, order: 16 },
  { id: 'downloads', title: '17. Downloadable Lab Manuals & 3D Assets', enabled: true, order: 17 },
]

export const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: 'dept-ee',
    slug: 'electrical-engineering',
    code: 'EE',
    name: 'Electrical Engineering',
    shortName: 'Electrical (EE)',
    description: 'Electrical Machines, Network Theory, Power Systems, Power Electronics, and High-Voltage Engineering laboratories.',
    iconName: 'Zap',
    accentColor: 'sky',
    published: true,
  },
  {
    id: 'dept-me',
    slug: 'mechanical-engineering',
    code: 'ME',
    name: 'Mechanical Engineering',
    shortName: 'Mechanical (ME)',
    description: 'Fluid Mechanics, Hydraulic Machines, Thermodynamics, Heat Transfer, and Theory of Machines virtual workbenches.',
    iconName: 'Cog',
    accentColor: 'amber',
    published: true,
  },
  {
    id: 'dept-ce',
    slug: 'civil-engineering',
    code: 'CE',
    name: 'Civil Engineering',
    shortName: 'Civil (CE)',
    description: 'Strength of Materials, Structural Analysis, Geotechnical Engineering, Concrete Technology, and Environmental Hydraulics.',
    iconName: 'Building2',
    accentColor: 'emerald',
    published: true,
  },
  {
    id: 'dept-ece',
    slug: 'electronics-communication',
    code: 'ECE',
    name: 'Electronics and Communication Engineering',
    shortName: 'Electronics (ECE)',
    description: 'Analog & Digital Circuits, Microprocessors, VLSI Design, Digital Signal Processing, and Microwave Communication.',
    iconName: 'Radio',
    accentColor: 'purple',
    published: true,
  },
  {
    id: 'dept-cse',
    slug: 'computer-science',
    code: 'CSE',
    name: 'Computer Science and Engineering',
    shortName: 'Computer Science (CSE)',
    description: 'Computer Architecture, Digital Logic Design, Operating Systems, Computer Networks, and Embedded Systems labs.',
    iconName: 'Terminal',
    accentColor: 'indigo',
    published: true,
  },
  {
    id: 'dept-it',
    slug: 'information-technology',
    code: 'IT',
    name: 'Information Technology',
    shortName: 'Info Tech (IT)',
    description: 'IoT Sensor Networks, Cloud Infrastructure, Cybersecurity Protocols, Web Engineering, and Database Systems.',
    iconName: 'Globe',
    accentColor: 'cyan',
    published: true,
  },
  {
    id: 'dept-che',
    slug: 'chemical-engineering',
    code: 'CHE',
    name: 'Chemical Engineering',
    shortName: 'Chemical (CHE)',
    description: 'Chemical Reaction Engineering, Mass Transfer Operations, Process Control, and Shell-and-Tube Heat Exchangers.',
    iconName: 'FlaskConical',
    accentColor: 'rose',
    published: true,
  },
  {
    id: 'dept-auto',
    slug: 'automobile-engineering',
    code: 'AE',
    name: 'Automobile Engineering',
    shortName: 'Automobile (AE)',
    description: 'IC Engine Testing, EV Powertrain Dynamics, Automotive Transmission, Aerodynamics, and Braking Diagnostics.',
    iconName: 'Gauge',
    accentColor: 'orange',
    published: true,
  },
  {
    id: 'dept-ie',
    slug: 'instrumentation-engineering',
    code: 'IE',
    name: 'Instrumentation Engineering',
    shortName: 'Instrumentation (IE)',
    description: 'Transducers & Industrial Sensors, PID Process Control, Bridge Measurements, and Virtual Oscilloscope Telemetry.',
    iconName: 'Activity',
    accentColor: 'teal',
    published: true,
  },
  {
    id: 'dept-bme',
    slug: 'biomedical-engineering',
    code: 'BME',
    name: 'Biomedical Engineering',
    shortName: 'Biomedical (BME)',
    description: 'Bio-Signal Acquisition (ECG/EEG), Medical Imaging Physics, Biomechanics, and Diagnostic Instrumentation.',
    iconName: 'HeartPulse',
    accentColor: 'pink',
    published: true,
  },
]

export const INITIAL_LABORATORIES: Laboratory[] = [
  {
    id: 'lab-ee-em1',
    slug: 'electrical-machines-1-lab',
    code: 'EEPC-301',
    name: 'Electrical Machines - I Laboratory',
    departmentId: 'dept-ee',
    semester: 3,
    description: 'Hands-on testing and 3D electromagnetic inspection of DC Shunt/Series/Compound Motors, Generators, and Single/Three-Phase Transformers.',
    incharge: 'Prof. S. K. Dash (Machines Division)',
    roomNumber: 'EE High-Bay Machine Hall - G02',
    equipmentHighlights: ['220V 5HP DC Shunt Motor', '3-Point Starter', 'Optical Tachometer'],
    featured: true,
    published: true,
  },
  {
    id: 'lab-ee-eca',
    slug: 'electric-circuit-analysis-lab',
    code: 'EEPC-2201',
    name: 'Electric Circuit Analysis (ECA) Laboratory',
    departmentId: 'dept-ee',
    semester: 3,
    description: 'Network Theorems (Thevenin, Norton, Superposition, Maximum Power Transfer), Series/Parallel RLC Resonance, and Transient Response.',
    incharge: 'Prof. A. K. Mohanty (Circuits Group)',
    roomNumber: 'EE Main Building - Room 204',
    equipmentHighlights: ['100 MHz Dual-Trace DSO', 'DDS Function Generator', 'Decade RLC Boxes'],
    featured: true,
    published: true,
  },
  {
    id: 'lab-ee-bee',
    slug: 'basic-electrical-engineering-lab',
    code: 'BEEC-101',
    name: 'Basic Electrical Engineering (BEE) Laboratory',
    departmentId: 'dept-ee',
    semester: 1,
    description: 'First-year B.Tech foundational laboratory covering AC/DC circuit measurements, three-phase star-delta connections, and magnetic circuits.',
    incharge: 'Lab Instructor Team (First Year B.Tech)',
    roomNumber: 'Central Workshop Block - Room 108',
    equipmentHighlights: ['3-Phase Variac', 'Clamp Meters', 'Wattmeters'],
    featured: false,
    published: true,
  },
  {
    id: 'lab-me-fm',
    slug: 'fluid-mechanics-hydraulic-machines-lab',
    code: 'MEPC-304',
    name: 'Fluid Mechanics & Hydraulic Machines Laboratory',
    departmentId: 'dept-me',
    semester: 4,
    description: 'Experimental verification of Bernoulli theorem, Venturimeter discharge, Orifice meter, and Centrifugal/Pelton Turbine characteristics.',
    incharge: 'Dr. R. K. Nayak (Thermal & Fluids)',
    roomNumber: 'Hydraulics Annex - Hall B1',
    equipmentHighlights: ['Volute Centrifugal Pump', 'Bourdon Pressure Gauge', 'Venturimeter'],
    featured: true,
    published: true,
  },
  {
    id: 'lab-ece-dld',
    slug: 'digital-logic-design-lab',
    code: 'ECPC-202',
    name: 'Digital Logic & Integrated Circuits Laboratory',
    departmentId: 'dept-ece',
    semester: 3,
    description: 'Universal NAND/NOR realization, Combinational Adders/Multiplexers, Flip-Flops, and CMOS/TTL IC 74xx breadboard verification.',
    incharge: 'Prof. M. Pattnaik (VLSI & Digital Lab)',
    roomNumber: 'Electronics Block - Room 305',
    equipmentHighlights: ['74xx TTL IC Trainer', 'Logic Probe', '+5V Regulated Supply'],
    featured: true,
    published: true,
  },
]

export const INITIAL_EXPERIMENTS: Experiment[] = [
  {
    id: 'exp-dc-motor-speed',
    slug: 'speed-control-of-dc-shunt-motor',
    code: 'EM1-EXP-01',
    experimentNumber: 'EXP-01',
    title: 'Speed Control of DC Shunt Motor by Armature Voltage & Field Flux Control',
    status: 'published',
    viewsCount: 1420,
    createdAt: '2026-10-15',
    updatedAt: '2026-11-12',
    authorName: 'Prof. S. K. Dash',
    authorRole: 'instructor',
    topics: ['DC Machines', 'Speed Control', 'Flux Weakening', 'Armature Control', 'Back EMF'],
    has3dModel: true,
    hasSimulation: true,
    labId: 'lab-ee-em1',
    departmentId: 'dept-ee',
    semester: 3,
    difficulty: 'Intermediate',
    estimatedMinutes: 120,
    published: true,
    summary: 'Investigate the speed variations of a 220V, 5 HP, 1500 RPM Four-Pole DC Shunt Motor above and below rated base speed using Field Rheostat (Flux Weakening) and Armature Rheostat / Voltage Control.',
    aim: 'To perform speed control of a 220V DC Shunt Motor using: (a) Armature Voltage / Resistance Control (below rated speed) and (b) Field Flux Control (above rated speed), and to plot the N vs Va, N vs If, and N vs Torque curves.',
    objectives: [
      'Understand the fundamental back-EMF speed equation N ∝ (V_a - I_a R_a) / Φ of a DC machine.',
      'Obtain speeds below base speed (constant torque region) by varying effective armature voltage V_a.',
      'Obtain speeds above base speed (constant power region) by increasing field rheostat resistance R_f to weaken field flux Φ.',
      'Inspect the internal 4-pole stator, laminated armature core, commutator segments, and carbon brushes in 3D.'
    ],
    learningOutcomes: [
      'CO1: Ability to wire a 3-point starter, field rheostat, and armature rheostat safely with a 4-terminal DC shunt machine.',
      'CO2: Explain why a DC shunt motor must NEVER be started with an open field circuit (runaway speed hazard).',
      'CO3: Quantitatively compute Back EMF (E_b), armature copper loss (I_a² R_a), and shaft speed (RPM) from live instrument readings.'
    ],
    apparatus: [
      { name: 'DC Shunt Motor', specification: '220 V DC, 5 HP (3.7 kW), 1500 RPM, I_a = 19 A, R_a = 1.2 Ω, R_f = 220 Ω', quantity: 1 },
      { name: '3-Point DC Motor Starter', specification: '220 V, 25 A with No-Volt Release (NVR) and Overload Release (OLR)', quantity: 1 },
      { name: 'Field Rheostat (Wire-Wound)', specification: '0 – 300 Ω, 2.5 A continuous rating', quantity: 1 },
      { name: 'Armature Rheostat (Wire-Wound)', specification: '0 – 25 Ω, 20 A continuous rating', quantity: 1 },
      { name: 'DC Moving-Coil Voltmeter', specification: '0 – 300 V MC Type', quantity: 1 },
      { name: 'DC Moving-Coil Ammeters', specification: '0 – 2 A (Field) and 0 – 25 A (Armature)', quantity: 2 },
      { name: 'Digital Optical Tachometer', specification: '0 – 5000 RPM (±1 RPM accuracy)', quantity: 1 }
    ],
    theory: `The rotational speed N (in RPM) of a DC Shunt Motor is governed by the Induced Back-EMF equation:

E_b = (P · Φ · Z · N) / (60 · A)  =  k_e · Φ · ω

From Kirchhoff's Voltage Law applied to the armature circuit:
E_b = V_a - I_a · (R_a + R_ext)

Combining both expressions yields the fundamental speed equation:
N = [ V_a - I_a · (R_a + R_ext) ] / (k · Φ)

1. Armature Voltage / Resistance Control (Below Base Speed):
By keeping field current I_f constant at its rated value (field rheostat set to 0 Ω minimum), the magnetic flux Φ remains constant. Decreasing the applied armature voltage V_a (or inserting external resistance R_ext in series with the armature) reduces the back-EMF E_b and proportionally reduces motor speed N below the rated 1500 RPM.

2. Field Flux Control (Above Base Speed):
By keeping armature voltage V_a at rated 220 V and inserting external resistance R_f_ext into the shunt field circuit, the field current I_f = V_f / (R_f + R_f_ext) decreases. Since flux Φ is proportional to I_f (prior to severe magnetic saturation), weakening Φ forces the motor to accelerate above 1500 RPM to generate the required back-EMF E_b.`,
    equations: [
      {
        label: 'Back-EMF Equation',
        formula: 'E_b = V_a - I_a · (R_a + R_ext)   [Volts]',
        variables: 'V_a = Applied Armature Voltage (V), I_a = Armature Current (A), R_a = Armature Winding Resistance (1.2 Ω), R_ext = External Armature Rheostat (Ω)'
      },
      {
        label: 'Shunt Field Current & Flux Relation',
        formula: 'I_f = V_supply / (R_f + R_f_ext)   [Amperes]',
        variables: 'R_f = Field Winding Resistance (220 Ω), R_f_ext = External Field Rheostat (0 to 300 Ω)'
      },
      {
        label: 'Shaft Speed Equation',
        formula: 'N = N_rated · (E_b / E_b_rated) · (I_f_rated / I_f)   [RPM]',
        variables: 'N_rated = 1500 RPM at V_a = 220 V, I_f_rated = 1.0 A'
      },
      {
        label: 'Electromagnetic Torque',
        formula: 'T_e = (E_b · I_a) / (2π · N / 60)   [N·m]',
        variables: 'T_e = Developed Electromagnetic Torque (N·m), ω = 2πN/60 (rad/s)'
      }
    ],
    circuitDiagramSvgType: 'dc-shunt',
    circuitDiagramDescription: 'Standard 4-terminal DC Shunt Motor test bench schematic with 220V DC Supply, DPST Main Switch, 3-Point Starter (L, F, A terminals), Shunt Field Ammeter (0-2A) in series with Field Rheostat across Z-ZZ, and Armature Rheostat + Voltmeter across A-AA.',
    model3dPreset: 'dc-shunt-motor',
    simulationPreset: 'dc-motor-speed-control',
    procedure: [
      'Verify all circuit connections as per the schematic diagram before switching ON the 220V DC supply.',
      'Set the Field Rheostat to its MINIMUM resistance position (0 Ω cut-in) so that full rated field flux is present at starting.',
      'Set the Armature Rheostat to its MAXIMUM resistance position to limit initial starting inrush current.',
      'Close the DPST main switch and slowly move the 3-Point Starter handle from OFF to ON until the No-Volt Release (NVR) electromagnet holds it.',
      'Part A (Armature Control): Keep Field Current I_f constant at 1.0 A. Gradually vary the effective Armature Voltage V_a from 100 V to 220 V in steps of 20 V and record V_a, I_a, E_b, and Speed N (RPM) in the Observation Table.',
      'Part B (Field Flux Control): Keep Armature Voltage fixed at rated 220 V. Gradually increase Field Rheostat resistance to reduce I_f from 1.0 A down to 0.55 A in steps, recording I_f and Speed N (RPM) at each step.'
    ],
    sampleCalculations: `At Rated Base Point:
• Supply Voltage V_a = 220 V, Field Current I_f = 1.00 A, Load Armature Current I_a = 8.50 A, R_a = 1.20 Ω
• Back EMF: E_b = 220 - (8.50 × 1.20) = 220 - 10.20 = 209.80 V
• Speed N = 1500 × (209.80 / 209.80) × (1.00 / 1.00) = 1500 RPM

During Field Weakening (R_f_ext = 110 Ω):
• Field Current I_f = 220 / (220 + 110) = 0.667 A
• New Speed N = 1500 × (1.00 / 0.667) ≈ 2249 RPM`,
    resultsTemplate: `1. In Armature Voltage Control, speed varied linearly from 650 RPM to 1500 RPM below base speed with constant flux.
2. In Field Flux Control, speed increased inversely with field current from 1500 RPM to 2450 RPM above base speed.`,
    precautions: [
      'NEVER open the shunt field circuit while the motor is running—zero flux causes dangerously high runaway speed.',
      'Always keep the Field Rheostat at MINIMUM resistance (0 Ω) at the time of starting the motor.',
      'Ensure carbon brushes make smooth, spark-free contact with the copper commutator segments.',
      'Do not exceed 180% of rated base speed (2700 RPM) during field weakening to prevent centrifugal damage to rotor windings.'
    ],
    vivaQuestions: [
      {
        id: 'v1',
        question: 'Why should the field rheostat be kept at minimum resistance when starting a DC shunt motor?',
        answer: 'Starting torque T_e = k · Φ · I_a is directly proportional to field flux Φ. Keeping the field rheostat at minimum resistance (0 Ω) ensures maximum rated field current I_f and maximum starting flux Φ, producing high starting torque and preventing excessive starting armature current.'
      },
      {
        id: 'v2',
        question: 'What happens if the shunt field winding accidentally opens while a DC shunt motor is running on no-load?',
        answer: 'Since N ∝ E_b / Φ, if the field circuit opens, the flux Φ drops to a tiny residual magnetism value (~5%). To generate the required back-EMF, the motor accelerates to dangerously high runaway speeds that can mechanically destroy the commutator and rotor.'
      },
      {
        id: 'v3',
        question: 'Which speed control method is suitable for speeds below rated speed, and which for above rated speed?',
        answer: 'Armature voltage/resistance control provides speeds BELOW rated base speed (constant torque drive), whereas Field flux control provides speeds ABOVE rated base speed (constant power drive) because flux cannot be increased appreciably beyond rated saturation.'
      }
    ],
    references: [
      'P. S. Bimbhra, "Electrical Machinery", 7th Edition, Khanna Publishers.',
      'I. J. Nagrath & D. P. Kothari, "Electric Machines", 5th Edition, McGraw Hill Education.',
      'A. E. Fitzgerald, C. Kingsley, S. D. Umans, "Electric Machinery", 7th Edition, McGraw-Hill.'
    ],
    downloads: [
      {
        id: 'dl-em1-01',
        title: 'EM-I Lab Manual — Exp 01: DC Shunt Motor Speed Control (Complete Lab Sheet)',
        fileType: 'PDF',
        fileSize: '1.4 MB',
        url: '#manual-dc-shunt-motor',
        requiresAuth: false
      },
      {
        id: 'dl-em1-02',
        title: 'Four-Pole DC Shunt Machine CAD Assembly & Cutaway Reference (.GLB)',
        fileType: 'GLB',
        fileSize: '4.8 MB',
        url: '#glb-dc-shunt-motor',
        requiresAuth: true
      },
      {
        id: 'dl-em1-03',
        title: 'GATE EE Past Year Numerical Solutions on DC Motor Speed Control',
        fileType: 'PDF',
        fileSize: '890 KB',
        url: '#gate-ee-dc-motor-notes',
        requiresAuth: true
      }
    ],
    sectionsConfig: DEFAULT_SECTIONS_CONFIG
  },
  {
    id: 'exp-series-rlc-resonance',
    slug: 'frequency-response-series-rlc-circuit',
    code: 'EEPC2201-EXP-04',
    experimentNumber: 'EXP-04',
    title: 'Frequency Response & Resonance Analysis of a Series R-L-C Circuit',
    status: 'published',
    viewsCount: 1185,
    createdAt: '2026-10-22',
    updatedAt: '2026-11-14',
    authorName: 'Prof. A. K. Mohanty',
    authorRole: 'instructor',
    topics: ['Series Resonance', 'Quality Factor', 'Bandwidth', 'Impedance', 'Oscilloscope'],
    has3dModel: true,
    hasSimulation: true,
    labId: 'lab-ee-eca',
    departmentId: 'dept-ee',
    semester: 3,
    difficulty: 'Intermediate',
    estimatedMinutes: 90,
    published: true,
    summary: 'Determine the Resonant Frequency (f₀), Half-Power Cut-off Frequencies (f₁, f₂), Bandwidth (BW), and Quality Factor (Q) of a Series R-L-C circuit using a Digital Function Generator and Dual-Channel Oscilloscope.',
    aim: 'To plot the current vs. frequency resonance curve of a Series R-L-C circuit excited by a variable-frequency sinusoidal source, and to verify the resonant frequency f₀ = 1 / (2π√(LC)), Quality Factor Q₀ = (1/R)√(L/C), and Bandwidth BW = R / (2πL).',
    objectives: [
      'Observe the transition of circuit impedance Z(jω) = R + j(ωL - 1/ωC) from capacitive (f < f₀) to purely resistive (f = f₀) to inductive (f > f₀).',
      'Measure the maximum RMS current I_max = V_rms / R at series resonance when X_L = X_C.',
      'Locate the lower and upper -3 dB half-power frequencies (f₁ and f₂) where I = I_max / √2 = 0.707 · I_max.',
      'Inspect voltage magnification across the inductor (V_L = Q · V_s) and capacitor (V_C = Q · V_s) at resonance.'
    ],
    learningOutcomes: [
      'CO1: Operate a precision Function Generator and Dual-Trace CRO/DSO to capture frequency response and phase angle θ.',
      'CO2: Analytically and experimentally determine Quality Factor (Q) and selectivity of tuned RLC filters.',
      'CO3: Compare theoretical and experimental bandwidths and account for internal inductor winding resistance R_L.'
    ],
    apparatus: [
      { name: 'DDS Function Generator', specification: '1 Hz – 2 MHz, 0 – 20 Vpp Sine/Square/Triangle Output, 50 Ω', quantity: 1 },
      { name: 'Dual-Channel Digital Storage Oscilloscope (DSO)', specification: '100 MHz Bandwidth, 1 GS/s Sample Rate', quantity: 1 },
      { name: 'Decade Resistance Box', specification: '10 Ω to 1000 Ω, ±1% Precision', quantity: 1 },
      { name: 'Precision Air-Core Inductor Box', specification: '10 mH to 200 mH low-loss tapped inductor', quantity: 1 },
      { name: 'Decade Capacitance Box', specification: '0.01 µF to 10 µF polypropylene film capacitor', quantity: 1 }
    ],
    theory: `In a Series R-L-C circuit connected across an AC sinusoidal source V ∠0°, the total complex impedance is:
Z(f) = R + j (X_L - X_C) = R + j (2πfL - 1 / (2πfC))

The magnitude of impedance is:
|Z| = √[ R² + (2πfL - 1/(2πfC))² ]

Series Resonance occurs at the specific frequency f₀ where Inductive Reactance equals Capacitive Reactance (X_L = X_C):
2πf₀L = 1 / (2πf₀C)   ⇒   f₀ = 1 / [ 2π √(L · C) ]   [Hz]

At f = f₀:
1. Total impedance is minimum and purely resistive: Z_min = R.
2. Circuit current is maximum: I_max = V_rms / R, and is strictly in phase with supply voltage (Power Factor cos φ = 1.0).
3. Half-Power Frequencies (f₁ and f₂): The frequencies where current drops to I_max / √2 (power drops to half of P_max).
4. Bandwidth: BW = f₂ - f₁ = R / (2πL)  [Hz].
5. Quality Factor: Q₀ = f₀ / BW = (2πf₀L) / R = (1 / R) · √(L / C).`,
    equations: [
      {
        label: 'Resonant Frequency',
        formula: 'f₀ = 1 / (2π · √(L · C))   [Hz]',
        variables: 'L = Inductance in Henries (H), C = Capacitance in Farads (F)'
      },
      {
        label: 'Complex Impedance & Phase Angle',
        formula: '|Z| = √(R² + (X_L - X_C)²),   φ = tan⁻¹((X_L - X_C) / R)',
        variables: 'X_L = 2πfL (Ω), X_C = 1/(2πfC) (Ω), φ = Phase angle between V and I (deg)'
      },
      {
        label: 'Quality Factor & Bandwidth',
        formula: 'Q₀ = (1 / R) · √(L / C),   BW = f₂ - f₁ = f₀ / Q₀   [Hz]',
        variables: 'f₁ = Lower -3 dB cut-off frequency, f₂ = Upper -3 dB cut-off frequency'
      }
    ],
    circuitDiagramSvgType: 'series-rlc',
    circuitDiagramDescription: 'Series connection of Sine Wave Function Generator (Vs), non-inductive Resistor (R), Inductor (L), and Capacitor (C) with Channel-1 & Channel-2 CRO probes measuring source voltage and current sense resistor drop.',
    model3dPreset: 'rlc-workbench',
    simulationPreset: 'series-rlc-resonance',
    procedure: [
      'Connect the Function Generator, Decade Resistor R, Inductor L, and Capacitor C in a single series loop on the workbench.',
      'Set initial component values (e.g., R = 50 Ω, L = 100 mH, C = 1.0 µF) and set Function Generator RMS amplitude to V_s = 10 V.',
      'Sweep the source frequency f from 100 Hz up to 1200 Hz, taking closer frequency steps near the resonant peak around 503 Hz.',
      'At each frequency step, record frequency f (Hz), inductive reactance X_L, capacitive reactance X_C, impedance |Z|, RMS current I (mA), and phase angle φ.',
      'Plot the resonance curve (Current I in mA vs. Frequency f in Hz) and mark I_max, 0.707·I_max, f₁, f₀, and f₂.'
    ],
    sampleCalculations: `For R = 50 Ω, L = 100 mH (0.1 H), C = 1.0 µF (10⁻⁶ F), V_s = 10 V:
• Theoretical Resonant Frequency: f₀ = 1 / (2π √(0.1 × 10⁻⁶)) = 503.29 Hz
• Maximum Current at Resonance: I_max = V_s / R = 10 V / 50 Ω = 0.200 A = 200 mA
• Half-Power Current: I_hp = 200 / √2 = 141.42 mA
• Quality Factor: Q₀ = (1 / 50) × √(0.1 / 10⁻⁶) = 6.325
• Bandwidth: BW = f₀ / Q₀ = 503.29 / 6.325 = 79.58 Hz`,
    resultsTemplate: 'The Series R-L-C circuit exhibited sharp current resonance at f₀ = 503.3 Hz with I_max = 200 mA, Quality Factor Q₀ = 6.32, and -3 dB Bandwidth BW = 79.6 Hz.',
    precautions: [
      'Keep the Function Generator output amplitude constant across the entire frequency sweep.',
      'Account for the 50 Ω internal source impedance of the signal generator or measure terminal voltage directly with CRO Channel 1.',
      'At high Quality Factor (low R), voltage across L and C equals Q · V_s and can exceed supply voltage significantly—verify capacitor voltage rating.'
    ],
    vivaQuestions: [
      {
        id: 'rlc-v1',
        question: 'Why is a Series RLC resonant circuit called an Acceptor Circuit?',
        answer: 'At the resonant frequency f₀, the inductive and capacitive reactances cancel out (X_L = X_C), resulting in minimum impedance (Z = R) and maximum current. Thus, it readily accepts currents at f₀ while rejecting other frequencies.'
      },
      {
        id: 'rlc-v2',
        question: 'What is the nature of power factor of a Series RLC circuit below, at, and above resonant frequency?',
        answer: 'Below f₀ (f < f₀), X_C > X_L so the circuit is capacitive with a LEADING power factor. At f = f₀, X_L = X_C so it is purely resistive with UNITY (1.0) power factor. Above f₀ (f > f₀), X_L > X_C so it is inductive with a LAGGING power factor.'
      }
    ],
    references: [
      'M. E. Van Valkenburg, "Network Analysis", 3rd Edition, Pearson Education.',
      'C. K. Alexander & M. N. O. Sadiku, "Fundamentals of Electric Circuits", 6th Edition, McGraw-Hill.'
    ],
    downloads: [
      {
        id: 'dl-eca-01',
        title: 'EEPC-2201 Lab Manual — Series & Parallel RLC Resonance Experiment',
        fileType: 'PDF',
        fileSize: '1.1 MB',
        url: '#manual-series-rlc',
        requiresAuth: false
      },
      {
        id: 'dl-eca-02',
        title: '3D CRO & RLC Workbench Scene Asset (.GLB)',
        fileType: 'GLB',
        fileSize: '3.2 MB',
        url: '#glb-rlc-workbench',
        requiresAuth: true
      }
    ],
    sectionsConfig: DEFAULT_SECTIONS_CONFIG
  },
  {
    id: 'exp-centrifugal-pump',
    slug: 'performance-characteristics-of-centrifugal-pump',
    code: 'MEPC304-EXP-02',
    experimentNumber: 'EXP-02',
    title: 'Constant-Speed Performance Characteristics of a Single-Stage Centrifugal Pump',
    status: 'published',
    viewsCount: 890,
    createdAt: '2026-11-01',
    updatedAt: '2026-11-15',
    authorName: 'Dr. R. K. Nayak',
    authorRole: 'instructor',
    topics: ['Centrifugal Pump', 'Manometric Head', 'Best Efficiency Point', 'Hydraulics'],
    has3dModel: true,
    hasSimulation: true,
    labId: 'lab-me-fm',
    departmentId: 'dept-me',
    semester: 4,
    difficulty: 'Intermediate',
    estimatedMinutes: 120,
    published: true,
    summary: 'Evaluate Total Manometric Head (H_m), Discharge (Q), Water Power, Shaft Brake Power, and Overall Efficiency (η_o) of a Volute Centrifugal Pump at various delivery valve openings.',
    aim: 'To conduct a constant-speed test on a single-stage Centrifugal Pump and plot the operating characteristic curves: Total Head (H_m) vs. Discharge (Q), Shaft Power (P_s) vs. Discharge (Q), and Overall Efficiency (η) vs. Discharge (Q).',
    objectives: [
      'Measure suction vacuum head (h_s) and delivery pressure gauge head (h_d) across different flow rates.',
      'Calculate hydraulic output power P_w = ρ · g · Q · H_m in Watts.',
      'Determine the Best Efficiency Point (BEP) of the impeller-volute casing assembly.'
    ],
    learningOutcomes: [
      'CO1: Identify suction eye, backward-curved impeller vanes, volute casing, and mechanical stuffing box on a 3D pump.',
      'CO2: Apply Euler’s turbomachinery head equation and affinity laws (Q ∝ N, H ∝ N², P ∝ N³).'
    ],
    apparatus: [
      { name: 'Single-Stage Volute Centrifugal Pump', specification: '2 HP, 2880 RPM, 50 mm × 40 mm Suction/Delivery', quantity: 1 },
      { name: 'Bourdon Pressure Gauge (Delivery)', specification: '0 – 4 kg/cm²', quantity: 1 },
      { name: 'Vacuum Gauge (Suction)', specification: '0 – 760 mm Hg', quantity: 1 },
      { name: 'Sump & Measuring Tank with Piezometer', specification: '0.8 m × 0.6 m calibrated collecting tank', quantity: 1 }
    ],
    theory: `A Centrifugal Pump converts mechanical rotational energy of an impeller into kinetic and pressure energy of an incompressible fluid. As fluid enters the impeller eye axially and exits radially through backward-curved vanes into a gradually expanding volute casing, velocity head converts into static pressure head.

Total Manometric Head (H_m):
H_m = h_d + h_s + (V_d² - V_s²) / (2g)   [meters of water]

Hydraulic (Water) Power Output:
P_w = ρ · g · Q · H_m   [Watts]   (where ρ = 1000 kg/m³, g = 9.81 m/s²)

Overall Pump Efficiency:
η_o = (P_w / P_shaft) × 100   [%]`,
    equations: [
      {
        label: 'Manometric Head & Affinity Scaling',
        formula: 'H_m = H_shutoff · (N / N₀)² - K_f · Q²   [m]',
        variables: 'H_m = Total Head (m), Q = Discharge (L/s or m³/s), N = Impeller Speed (RPM)'
      },
      {
        label: 'Hydraulic Power & Efficiency',
        formula: 'P_w = ρ · g · Q · H_m   [W],   η = (P_w / P_shaft) × 100%',
        variables: 'ρ = 1000 kg/m³, g = 9.81 m/s², P_shaft = Input mechanical power (W)'
      }
    ],
    circuitDiagramSvgType: 'pump-loop',
    circuitDiagramDescription: 'Closed-loop hydraulic test rig showing Sump Tank, Foot Valve with Strainer, Suction Pipe with Vacuum Gauge, Volute Centrifugal Pump driven by 3-Phase Induction Motor, Delivery Pressure Gauge, Gate Control Valve, and Measuring Tank.',
    model3dPreset: 'centrifugal-pump',
    simulationPreset: 'bernoulli-flow-rig',
    procedure: [
      'Prime the centrifugal pump completely with water to expel any trapped air from the suction pipe and impeller casing.',
      'Close the delivery gate valve fully (Q = 0 shut-off condition) and switch ON the driving motor.',
      'Record the shut-off delivery pressure, suction vacuum reading, impeller speed N, and input motor power.',
      'Open the delivery gate valve in 6 progressive steps from 0% to 100% open, recording discharge Q (L/s), Total Head H_m (m), and Efficiency η (%).'
    ],
    sampleCalculations: `At Best Efficiency Point (BEP):
• Impeller Speed N = 2850 RPM, Discharge Q = 4.5 L/s (0.0045 m³/s), Total Head H_m = 18.4 m
• Water Power Output: P_w = 1000 × 9.81 × 0.0045 × 18.4 = 812.3 W
• Shaft Input Power: P_shaft = 1210 W
• Overall Efficiency: η = (812.3 / 1210) × 100 = 67.1%`,
    resultsTemplate: 'Best Efficiency Point (BEP) was achieved at Q = 4.5 L/s with Total Head H_m = 18.4 m and Peak Efficiency η_max = 67.1%.',
    precautions: [
      'Never run a centrifugal pump dry without priming—running dry destroys the mechanical seal and causes air binding.',
      'Always start the centrifugal pump with the delivery gate valve CLOSED to minimize starting load on the motor.'
    ],
    vivaQuestions: [
      {
        id: 'me-v1',
        question: 'Why is a centrifugal pump started with its delivery valve closed?',
        answer: 'For a centrifugal pump, shaft power consumption is minimum at zero discharge (Q = 0, shut-off head). Starting with the delivery valve closed reduces the starting current and mechanical load on the driving electric motor.'
      }
    ],
    references: [
      'R. K. Bansal, "A Textbook of Fluid Mechanics and Hydraulic Machines", Laxmi Publications.',
      'F. M. White, "Fluid Mechanics", 8th Edition, McGraw-Hill.'
    ],
    downloads: [
      {
        id: 'dl-me-01',
        title: 'Hydraulics Lab Manual — Centrifugal Pump Characteristic Curves',
        fileType: 'PDF',
        fileSize: '1.2 MB',
        url: '#manual-pump',
        requiresAuth: false
      }
    ],
    sectionsConfig: DEFAULT_SECTIONS_CONFIG
  }
]
