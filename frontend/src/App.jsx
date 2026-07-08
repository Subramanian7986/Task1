import InteractionForm from './components/InteractionForm';
import ChatPanel from './components/ChatPanel';

export default function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#f0f2f5' }}>
      {/* Top bar */}
      <div style={{ background: '#0f172a', padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <span style={{ fontSize: '1.2rem' }}>💊</span>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.01em' }}>HCP CRM</span>
        <span style={{ color: '#475569', fontSize: '0.8rem', marginLeft: 4 }}>AI-First Interaction Logger</span>
      </div>

      {/* Split screen */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, padding: 16, overflow: 'hidden' }}>
        <InteractionForm />
        <ChatPanel />
      </div>
    </div>
  );
}
