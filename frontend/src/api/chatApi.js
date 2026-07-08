const API_BASE = 'http://localhost:8000/api';

export async function sendChatMessage(message, formState) {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, form_state: formState }),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
