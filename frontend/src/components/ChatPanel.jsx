import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addMessage, setLoading } from '../redux/chatSlice';
import { updateFields } from '../redux/interactionSlice';
import { sendChatMessage } from '../api/chatApi';
import ChatBubble from './ChatBubble';

export default function ChatPanel() {
  const dispatch = useDispatch();
  const messages = useSelector((s) => s.chat.messages);
  const loading = useSelector((s) => s.chat.loading);
  const formState = useSelector((s) => s.interaction);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    dispatch(addMessage({ role: 'user', text }));
    dispatch(setLoading(true));
    try {
      const data = await sendChatMessage(text, formState);
      if (data.updated_fields && Object.keys(data.updated_fields).length > 0) {
        dispatch(updateFields(data.updated_fields));
      }
      dispatch(addMessage({ role: 'assistant', text: data.chat_reply }));
    } catch (err) {
      dispatch(addMessage({ role: 'assistant', text: `⚠️ Error: ${err.message}. Is the backend running?` }));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', background: '#1e40af', borderRadius: '12px 12px 0 0' }}>
        <div style={{ color: '#fff', fontWeight: 600, fontSize: '1rem' }}>🤖 AI Assistant</div>
        <div style={{ color: '#bfdbfe', fontSize: '0.75rem', marginTop: 2 }}>Powered by LangGraph + Groq</div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map((m) => <ChatBubble key={m.id} message={m} />)}
        {loading && (
          <div style={{ alignSelf: 'flex-start', background: '#dbeafe', borderRadius: '0 12px 12px 12px', padding: '10px 14px', fontSize: '0.875rem', color: '#1e3a5f' }}>
            <span>⏳ Thinking...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Describe Interaction..."
          rows={2}
          style={{
            flex: 1, resize: 'none', border: '1px solid #cbd5e1', borderRadius: 8,
            padding: '8px 12px', fontFamily: 'Inter, sans-serif', fontSize: '0.875rem',
            outline: 'none', lineHeight: 1.5,
          }}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          style={{
            background: loading || !input.trim() ? '#94a3b8' : '#2563eb',
            color: '#fff', border: 'none', borderRadius: 8,
            padding: '10px 18px', fontFamily: 'Inter, sans-serif',
            fontWeight: 600, fontSize: '0.875rem', cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
          }}
        >
          📋 Log
        </button>
      </div>
    </div>
  );
}
