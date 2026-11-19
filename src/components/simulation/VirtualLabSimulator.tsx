import { useState, useMemo } from 'react'
import {
  Sliders,
  PlusCircle,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Table,
  TrendingUp,
} from 'lucide-react'
import type { SimulationPresetId } from '../../types/lab'

interface ObservationRow {
  slNo: number
  param1: string
  param2: string
  param3: string
  outputMain: string
  outputSecondary: string
}

interface Props {
  preset: SimulationPresetId
  onRpmChange?: (rpm: number) => void
}

export function VirtualLabSimulator({ preset, onRpmChange }: Props) {
  // 1. DC Shunt Motor Speed Control State (SI Units)
  const [armatureVoltage, setArmatureVoltage] = useState<number>(220) // V (80 to 240 V)
  const [armatureRheostat, setArmatureRheostat] = useState<number>(0) // Ohms (0 to 12 Ohms)
  const [fieldRheostat, setFieldRheostat] = useState<number>(0) // Ohms (0 to 220 Ohms)
  const [loadTorque, setLoadTorque] = useState<number>(12) // N.m (2 to 25 N.m)

  // 2. Series RLC Resonance State (SI Units)
  const [rlcFreq, setRlcFreq] = useState<number>(503) // Hz (100 to 1200 Hz)
  const [rlcR, setRlcR] = useState<number>(50) // Ohms (10 to 200 Ohms)
  const [rlcL, setRlcL] = useState<number>(100) // mH (20 to 250 mH)
  const [rlcC, setRlcC] = useState<number>(1.0) // uF (0.2 to 5.0 uF)

  // 3. Centrifugal Pump State (SI Units)
  const [valveOpening, setValveOpening] = useState<number>(65) // % (0 to 100%)
  const [pumpSpeed, setPumpSpeed] = useState<number>(2850) // RPM (1800 to 3000 RPM)

  const [observations, setObservations] = useState<ObservationRow[]>([])

  // Pure Mathematical Solver (Strictly Separated from 3D Rendering)
  const dcMetrics = useMemo(() => {
    const Ra = 1.2 // Ohm
    const Rf = 220 // Ohm
    const V_field = 220 // Separate/Shunt 220V excitation
    const If = V_field / (Rf + fieldRheostat) // Amperes (1.0A rated)
    const fluxRatio = Math.max(0.35, If / 1.0) // Normalized flux Phi
    const Ia = Math.max(1.2, loadTorque / (1.35 * fluxRatio)) // Armature current (A)
    const Eb = Math.max(20, armatureVoltage - Ia * (Ra + armatureRheostat)) // Back EMF (V)
    const Eb_rated = 220 - 8.5 * 1.2 // 209.8V at 1500 RPM
    const speedRpm = Math.round(1500 * (Eb / Eb_rated) * (1 / fluxRatio))
    if (onRpmChange) onRpmChange(speedRpm)
    return {
      If: If.toFixed(3),
      Ia: Ia.toFixed(2),
      Eb: Eb.toFixed(1),
      speedRpm,
      copperLoss: (Ia * Ia * (Ra + armatureRheostat)).toFixed(1),
      overspeedWarning: speedRpm > 2400,
    }
  }, [armatureVoltage, armatureRheostat, fieldRheostat, loadTorque, onRpmChange])

  const rlcMetrics = useMemo(() => {
    const Vs = 10.0 // 10 V RMS
    const L_H = rlcL / 1000.0
    const C_F = rlcC * 1e-6
    const f0 = 1 / (2 * Math.PI * Math.sqrt(L_H * C_F))
    const XL = 2 * Math.PI * rlcFreq * L_H
    const XC = 1 / (2 * Math.PI * rlcFreq * C_F)
    const Z = Math.sqrt(rlcR * rlcR + Math.pow(XL - XC, 2))
    const I_mA = (Vs / Z) * 1000.0
    const I_max_mA = (Vs / rlcR) * 1000.0
    const phaseDeg = (Math.atan2(XL - XC, rlcR) * 180) / Math.PI
    const Q0 = (1 / rlcR) * Math.sqrt(L_H / C_F)
    const BW = f0 / Q0
    return {
      f0: f0.toFixed(1),
      XL: XL.toFixed(1),
      XC: XC.toFixed(1),
      Z: Z.toFixed(2),
      I_mA: I_mA.toFixed(1),
      I_max_mA: I_max_mA.toFixed(1),
      phaseDeg: phaseDeg.toFixed(1),
      Q0: Q0.toFixed(2),
      BW: BW.toFixed(1),
    }
  }, [rlcFreq, rlcR, rlcL, rlcC])

  const pumpMetrics = useMemo(() => {
    const speedRatio = pumpSpeed / 2850
    const Q_Ls = (valveOpening / 100) * 6.8 * speedRatio // L/s
    const Q_m3s = Q_Ls / 1000
    const H_shutoff = 24.5 * Math.pow(speedRatio, 2)
    const Hm = Math.max(2.0, H_shutoff - 0.31 * Math.pow(Q_Ls, 2))
    const Pw = 1000 * 9.81 * Q_m3s * Hm // Hydraulic Watts
    const Pshaft = 420 * Math.pow(speedRatio, 3) + 175 * Q_Ls * speedRatio
    const eff = Q_Ls <= 0.05 ? 0 : Math.min(76, (Pw / Pshaft) * 100)
    return {
      Q_Ls: Q_Ls.toFixed(2),
      Hm: Hm.toFixed(2),
      Pw: Pw.toFixed(0),
      Pshaft: Pshaft.toFixed(0),
      eff: eff.toFixed(1),
    }
  }, [valveOpening, pumpSpeed])

  const handleRecordObservation = () => {
    const nextSl = observations.length + 1
    if (preset === 'dc-motor-speed-control') {
      setObservations((prev) => [
        ...prev,
        {
          slNo: nextSl,
          param1: `${armatureVoltage} V`,
          param2: `${dcMetrics.If} A`,
          param3: `${dcMetrics.Ia} A`,
          outputMain: `${dcMetrics.Eb} V`,
          outputSecondary: `${dcMetrics.speedRpm} RPM`,
        },
      ])
    } else if (preset === 'series-rlc-resonance') {
      setObservations((prev) => [
        ...prev,
        {
          slNo: nextSl,
          param1: `${rlcFreq} Hz`,
          param2: `${rlcMetrics.XL} Ω / ${rlcMetrics.XC} Ω`,
          param3: `${rlcMetrics.Z} Ω`,
          outputMain: `${rlcMetrics.I_mA} mA`,
          outputSecondary: `${rlcMetrics.phaseDeg}°`,
        },
      ])
    } else {
      setObservations((prev) => [
        ...prev,
        {
          slNo: nextSl,
          param1: `${valveOpening}%`,
          param2: `${pumpMetrics.Q_Ls} L/s`,
          param3: `${pumpMetrics.Hm} m`,
          outputMain: `${pumpMetrics.Pw} W`,
          outputSecondary: `${pumpMetrics.eff}%`,
        },
      ])
    }
  }

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              Scientific Virtual Laboratory Simulation Engine
            </h3>
            <p className="text-xs text-slate-400">
              Real-time SI-unit mathematical solver with live waveform plotting &amp; observation logger
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRecordObservation}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-lg shadow-sky-600/20 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Record Reading to Table ({observations.length})
          </button>
          <button
            onClick={() => {
              setArmatureVoltage(220)
              setArmatureRheostat(0)
              setFieldRheostat(0)
              setLoadTorque(12)
              setRlcFreq(503)
              setRlcR(50)
              setRlcL(100)
              setRlcC(1.0)
              setValveOpening(65)
              setObservations([])
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Lab
          </button>
        </div>
      </div>

      {/* Controls + Digital Instrument Readouts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Parameter Sliders */}
        <div className="lg:col-span-6 bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400">
            <Sliders className="w-4 h-4" />
            Adjustable Engineering Parameters (SI Units)
          </div>

          {preset === 'dc-motor-speed-control' && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-slate-300">Applied Armature Voltage (V_a)</span>
                  <span className="font-mono text-sky-400 font-bold">{armatureVoltage} V</span>
                </div>
                <input
                  type="range"
                  min={80}
                  max={240}
                  step={5}
                  value={armatureVoltage}
                  onChange={(e) => setArmatureVoltage(Number(e.target.value))}
                  className="w-full accent-sky-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-slate-300">External Armature Rheostat (R_ext)</span>
                  <span className="font-mono text-amber-400 font-bold">{armatureRheostat.toFixed(1)} Ω</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={10}
                  step={0.5}
                  value={armatureRheostat}
                  onChange={(e) => setArmatureRheostat(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-slate-300">Field Rheostat Resistance (R_f_ext — Flux Weakening)</span>
                  <span className="font-mono text-emerald-400 font-bold">{fieldRheostat} Ω</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={180}
                  step={5}
                  value={fieldRheostat}
                  onChange={(e) => setFieldRheostat(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-slate-300">Mechanical Shaft Load Torque (T_L)</span>
                  <span className="font-mono text-purple-400 font-bold">{loadTorque} N·m</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={25}
                  step={1}
                  value={loadTorque}
                  onChange={(e) => setLoadTorque(Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>
            </div>
          )}

          {preset === 'series-rlc-resonance' && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-slate-300">Signal Generator Frequency (f)</span>
                  <span className="font-mono text-sky-400 font-bold">{rlcFreq} Hz (f₀ = {rlcMetrics.f0} Hz)</span>
                </div>
                <input
                  type="range"
                  min={100}
                  max={1100}
                  step={5}
                  value={rlcFreq}
                  onChange={(e) => setRlcFreq(Number(e.target.value))}
                  className="w-full accent-sky-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-slate-300">Series Resistance (R)</span>
                  <span className="font-mono text-emerald-400 font-bold">{rlcR} Ω</span>
                </div>
                <input
                  type="range"
                  min={15}
                  max={150}
                  step={5}
                  value={rlcR}
                  onChange={(e) => setRlcR(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-slate-300">Inductance (L)</span>
                  <span className="font-mono text-amber-400 font-bold">{rlcL} mH</span>
                </div>
                <input
                  type="range"
                  min={40}
                  max={200}
                  step={10}
                  value={rlcL}
                  onChange={(e) => setRlcL(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-slate-300">Capacitance (C)</span>
                  <span className="font-mono text-purple-400 font-bold">{rlcC.toFixed(1)} µF</span>
                </div>
                <input
                  type="range"
                  min={0.4}
                  max={3.0}
                  step={0.2}
                  value={rlcC}
                  onChange={(e) => setRlcC(Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>
            </div>
          )}

          {preset !== 'dc-motor-speed-control' && preset !== 'series-rlc-resonance' && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-slate-300">Delivery Gate Valve Opening (%)</span>
                  <span className="font-mono text-sky-400 font-bold">{valveOpening}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={valveOpening}
                  onChange={(e) => setValveOpening(Number(e.target.value))}
                  className="w-full accent-sky-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-slate-300">Impeller Rotational Speed (N)</span>
                  <span className="font-mono text-emerald-400 font-bold">{pumpSpeed} RPM</span>
                </div>
                <input
                  type="range"
                  min={1800}
                  max={3000}
                  step={50}
                  value={pumpSpeed}
                  onChange={(e) => setPumpSpeed(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>

        {/* Live Digital Meters & Characteristic Plot */}
        <div className="lg:col-span-6 bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-4">
          {preset === 'dc-motor-speed-control' && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] uppercase text-slate-400">Field Current I_f</div>
                  <div className="text-base font-extrabold font-mono text-emerald-400 mt-0.5">
                    {dcMetrics.If} A
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] uppercase text-slate-400">Armature I_a</div>
                  <div className="text-base font-extrabold font-mono text-amber-400 mt-0.5">
                    {dcMetrics.Ia} A
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] uppercase text-slate-400">Back EMF E_b</div>
                  <div className="text-base font-extrabold font-mono text-sky-400 mt-0.5">
                    {dcMetrics.Eb} V
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-sky-500/40">
                  <div className="text-[10px] uppercase text-sky-300">Shaft Speed N</div>
                  <div className="text-base font-extrabold font-mono text-white mt-0.5">
                    {dcMetrics.speedRpm} RPM
                  </div>
                </div>
              </div>

              {/* Live SVG Characteristic Curve */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
                <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
                  <span className="font-semibold flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
                    Live Operating Point on Speed vs. Voltage/Flux Plane
                  </span>
                  <span className="font-mono text-[11px] text-sky-400">
                    Rated Base = 1500 RPM
                  </span>
                </div>
                <svg viewBox="0 0 360 110" className="w-full h-28 overflow-visible">
                  <line x1="30" y1="95" x2="340" y2="95" stroke="#334155" strokeWidth="1.5" />
                  <line x1="30" y1="10" x2="30" y2="95" stroke="#334155" strokeWidth="1.5" />
                  {/* Rated 1500 RPM reference dashed line */}
                  <line
                    x1="30"
                    y1="52"
                    x2="340"
                    y2="52"
                    stroke="#0ea5e9"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                  <polyline
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2.5"
                    points="35,88 110,72 185,52 260,34 330,16"
                  />
                  <circle
                    cx={Math.min(330, Math.max(35, ((dcMetrics.speedRpm - 400) / 2200) * 295 + 35))}
                    cy={Math.min(90, Math.max(12, 95 - ((dcMetrics.speedRpm - 400) / 2200) * 78))}
                    r="6"
                    fill="#10b981"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                </svg>
              </div>

              {dcMetrics.overspeedWarning ? (
                <div className="flex items-center gap-2 text-xs text-amber-300 bg-amber-500/15 border border-amber-500/30 rounded-xl px-3 py-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  High Field-Weakening Alert: Speed exceeds 2400 RPM (160% base speed). Do not reduce I_f further.
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-3 py-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  Operating safely within permissible commutating &amp; centrifugal limits.
                </div>
              )}
            </>
          )}

          {preset === 'series-rlc-resonance' && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] uppercase text-slate-400">Impedance |Z|</div>
                  <div className="text-base font-extrabold font-mono text-amber-400 mt-0.5">
                    {rlcMetrics.Z} Ω
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-sky-500/40">
                  <div className="text-[10px] uppercase text-sky-300">RMS Current I</div>
                  <div className="text-base font-extrabold font-mono text-white mt-0.5">
                    {rlcMetrics.I_mA} mA
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] uppercase text-slate-400">Phase Angle φ</div>
                  <div className="text-base font-extrabold font-mono text-emerald-400 mt-0.5">
                    {rlcMetrics.phaseDeg}°
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] uppercase text-slate-400">Q-Factor Q₀</div>
                  <div className="text-base font-extrabold font-mono text-purple-400 mt-0.5">
                    {rlcMetrics.Q0}
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 space-y-1">
                <div className="font-bold text-sky-300">
                  Resonance Telemetry (f₀ = {rlcMetrics.f0} Hz, BW = {rlcMetrics.BW} Hz):
                </div>
                <p>
                  X_L = {rlcMetrics.XL} Ω | X_C = {rlcMetrics.XC} Ω | Peak Current I_max ={' '}
                  {rlcMetrics.I_max_mA} mA
                </p>
              </div>
            </>
          )}

          {preset !== 'dc-motor-speed-control' && preset !== 'series-rlc-resonance' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[10px] uppercase text-slate-400">Discharge Q</div>
                <div className="text-base font-extrabold font-mono text-sky-400 mt-0.5">
                  {pumpMetrics.Q_Ls} L/s
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[10px] uppercase text-slate-400">Total Head H_m</div>
                <div className="text-base font-extrabold font-mono text-amber-400 mt-0.5">
                  {pumpMetrics.Hm} m
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[10px] uppercase text-slate-400">Water Power</div>
                <div className="text-base font-extrabold font-mono text-emerald-400 mt-0.5">
                  {pumpMetrics.Pw} W
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-sky-500/40">
                <div className="text-[10px] uppercase text-sky-300">Efficiency η</div>
                <div className="text-base font-extrabold font-mono text-white mt-0.5">
                  {pumpMetrics.eff}%
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recorded Observation Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
            <Table className="w-4 h-4 text-sky-400" />
            Recorded Laboratory Observation Table
          </div>
          <span className="text-xs text-slate-400">
            Tap &ldquo;Record Reading to Table&rdquo; above after adjusting sliders
          </span>
        </div>

        {observations.length === 0 ? (
          <div className="text-xs text-slate-400 py-4 text-center border border-dashed border-slate-800 rounded-lg">
            No readings logged yet. Adjust the sliders above and tap &ldquo;Record Reading to Table&rdquo; to populate live test rows.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2 px-3">Sl. No.</th>
                  <th className="py-2 px-3">Input Parameter 1</th>
                  <th className="py-2 px-3">Parameter 2</th>
                  <th className="py-2 px-3">Parameter 3</th>
                  <th className="py-2 px-3">Calculated Output 1</th>
                  <th className="py-2 px-3">Primary Response</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {observations.map((row) => (
                  <tr key={row.slNo} className="text-slate-200">
                    <td className="py-2 px-3 font-bold text-sky-400">#{row.slNo}</td>
                    <td className="py-2 px-3">{row.param1}</td>
                    <td className="py-2 px-3">{row.param2}</td>
                    <td className="py-2 px-3">{row.param3}</td>
                    <td className="py-2 px-3 text-emerald-400">{row.outputMain}</td>
                    <td className="py-2 px-3 font-bold text-white">{row.outputSecondary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
