import { useState } from 'react'

export default function App() {
  const [statusChecked, setStatusChecked] = useState(false)

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        color: '#f8fafc',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          maxWidth: '640px',
          width: '100%',
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '16px',
          padding: '32px 24px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4)',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            backgroundColor: '#0284c7',
            color: '#ffffff',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            padding: '6px 12px',
            borderRadius: '9999px',
            marginBottom: '16px',
          }}
        >
          Milestone 1 • iPad Cloud Workspace Active
        </span>

        <h1
          style={{
            fontSize: '28px',
            fontWeight: 800,
            margin: '0 0 12px 0',
            color: '#ffffff',
          }}
        >
          Virtual Lab Library
        </h1>

        <p
          style={{
            fontSize: '16px',
            lineHeight: 1.6,
            color: '#cbd5e1',
            margin: '0 0 24px 0',
          }}
        >
          Central Digital Engineering Education Platform — Department → Laboratory → Experiment → Interactive 3D &amp; Simulations.
        </p>

        <button
          onClick={() => setStatusChecked(!statusChecked)}
          style={{
            backgroundColor: statusChecked ? '#16a34a' : '#2563eb',
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
            padding: '14px 24px',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            width: '100%',
            touchAction: 'manipulation',
          }}
        >
          {statusChecked
            ? '✅ Touch Controls & React State Verified!'
            : 'Tap Here to Test iPad Touch Interaction'}
        </button>
      </div>
    </div>
  )
}
