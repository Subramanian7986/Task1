const styles = {
  assistant: {
    alignSelf: 'flex-start',
    background: '#dbeafe',
    color: '#1e3a5f',
    borderRadius: '0 12px 12px 12px',
    padding: '10px 14px',
    maxWidth: '80%',
    fontSize: '0.875rem',
    lineHeight: '1.5',
    whiteSpace: 'pre-wrap',
  },
  user: {
    alignSelf: 'flex-end',
    background: '#f1f5f9',
    color: '#1e293b',
    borderRadius: '12px 0 12px 12px',
    borderLeft: '3px solid #3b82f6',
    padding: '10px 14px',
    maxWidth: '80%',
    fontSize: '0.875rem',
    lineHeight: '1.5',
  },
  success: {
    alignSelf: 'flex-start',
    background: '#dcfce7',
    color: '#14532d',
    borderRadius: '0 12px 12px 12px',
    padding: '10px 14px',
    maxWidth: '80%',
    fontSize: '0.875rem',
    lineHeight: '1.5',
    whiteSpace: 'pre-wrap',
  },
};

export default function ChatBubble({ message }) {
  const isSuccess = message.role === 'assistant' && message.text.startsWith('✅');
  const variant = message.role === 'user' ? 'user' : isSuccess ? 'success' : 'assistant';
  return <div style={styles[variant]}>{message.text}</div>;
}
