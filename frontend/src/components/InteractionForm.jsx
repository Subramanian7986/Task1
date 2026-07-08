import { useSelector } from 'react-redux';

const fieldStyle = {
  width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0',
  borderRadius: 8, fontFamily: 'Inter, sans-serif', fontSize: '0.875rem',
  background: '#f8fafc', color: '#1e293b', outline: 'none',
};

const labelStyle = { fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4, display: 'block' };
const sectionStyle = { marginBottom: 20 };
const sectionTitleStyle = { fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, paddingBottom: 6, borderBottom: '1px solid #f1f5f9' };

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

function ReadInput({ value, placeholder }) {
  return <input readOnly value={value || ''} placeholder={placeholder} style={fieldStyle} />;
}

function ReadTextarea({ value, placeholder, rows = 3 }) {
  return <textarea readOnly value={value || ''} placeholder={placeholder} rows={rows} style={{ ...fieldStyle, resize: 'none', lineHeight: 1.5 }} />;
}

const SENTIMENT_OPTIONS = [
  { value: 'Positive', emoji: '😊' },
  { value: 'Neutral', emoji: '😐' },
  { value: 'Negative', emoji: '🙁' },
];

export default function InteractionForm() {
  const form = useSelector((s) => s.interaction);

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', background: '#1e40af', borderRadius: '12px 12px 0 0' }}>
        <div style={{ color: '#fff', fontWeight: 600, fontSize: '1rem' }}>📋 Log HCP Interaction</div>
        <div style={{ color: '#bfdbfe', fontSize: '0.75rem', marginTop: 2 }}>Form auto-populated by AI Assistant</div>
      </div>

      <div style={{ padding: '20px' }}>
        {/* Interaction Details */}
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Interaction Details</div>

          <Field label="HCP Name">
            <ReadInput value={form.hcpName} placeholder="Search or select HCP..." />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Interaction Type">
              <select disabled value={form.interactionType || ''} style={{ ...fieldStyle, cursor: 'default' }}>
                <option value="">Select type...</option>
                {['Meeting', 'Call', 'Email', 'Conference/Event'].map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </Field>
            <Field label="Date">
              <ReadInput value={form.date} placeholder="MM/DD/YYYY" />
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Time">
              <ReadInput value={form.time} placeholder="HH:MM AM/PM" />
            </Field>
            <Field label="Attendees">
              <ReadInput value={form.attendees} placeholder="Enter names or search..." />
            </Field>
          </div>

          <Field label="Topics Discussed">
            <ReadTextarea value={form.topicsDiscussed} placeholder="Enter key discussion points..." rows={3} />
            <button disabled style={{ marginTop: 6, background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.8rem', cursor: 'not-allowed', padding: 0 }}>
              🎙 Summarize from Voice Note (Requires Consent)
            </button>
          </Field>
        </div>

        {/* Materials & Samples */}
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Materials Shared / Samples Distributed</div>

          <Field label="Materials Shared">
            <div style={{ ...fieldStyle, minHeight: 60, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {form.materialsShared
                ? form.materialsShared.split(',').map((m, i) => (
                    <span key={i} style={{ background: '#dbeafe', color: '#1e40af', borderRadius: 4, padding: '2px 8px', fontSize: '0.8rem', display: 'inline-block' }}>
                      📄 {m.trim()}
                    </span>
                  ))
                : <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>No materials added.</span>
              }
            </div>
            <button disabled style={{ marginTop: 6, background: 'none', border: '1px solid #e2e8f0', borderRadius: 6, color: '#64748b', fontSize: '0.8rem', padding: '4px 10px', cursor: 'not-allowed' }}>
              🔍 Search/Add
            </button>
          </Field>

          <Field label="Samples Distributed">
            <div style={{ ...fieldStyle, minHeight: 60, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {form.samplesDistributed
                ? form.samplesDistributed.split(',').map((s, i) => (
                    <span key={i} style={{ background: '#dcfce7', color: '#14532d', borderRadius: 4, padding: '2px 8px', fontSize: '0.8rem', display: 'inline-block' }}>
                      💊 {s.trim()}
                    </span>
                  ))
                : <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>No samples added.</span>
              }
            </div>
            <button disabled style={{ marginTop: 6, background: 'none', border: '1px solid #e2e8f0', borderRadius: 6, color: '#64748b', fontSize: '0.8rem', padding: '4px 10px', cursor: 'not-allowed' }}>
              ＋ Add Sample
            </button>
          </Field>
        </div>

        {/* Sentiment */}
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Observed / Inferred HCP Sentiment</div>
          <div style={{ display: 'flex', gap: 12 }}>
            {SENTIMENT_OPTIONS.map(({ value, emoji }) => (
              <label key={value} style={{
                display: 'flex', alignItems: 'center', gap: 6, cursor: 'default',
                padding: '8px 14px', borderRadius: 8, border: '2px solid',
                borderColor: form.sentiment === value ? '#2563eb' : '#e2e8f0',
                background: form.sentiment === value ? '#eff6ff' : '#f8fafc',
                fontSize: '0.875rem', fontWeight: form.sentiment === value ? 600 : 400,
                color: form.sentiment === value ? '#1e40af' : '#64748b',
                transition: 'all 0.15s',
              }}>
                <input type="radio" readOnly checked={form.sentiment === value} style={{ display: 'none' }} />
                {emoji} {value}
              </label>
            ))}
          </div>
        </div>

        {/* Outcomes */}
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Outcomes</div>
          <Field label="Outcomes">
            <ReadTextarea value={form.outcomes} placeholder="Key outcomes or agreements..." rows={3} />
          </Field>
        </div>

        {/* Follow-up Actions */}
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Follow-up Actions</div>
          {form.followUps.length === 0 ? (
            <div style={{ color: '#94a3b8', fontSize: '0.85rem', padding: '12px', background: '#f8fafc', borderRadius: 8, border: '1px dashed #e2e8f0' }}>
              No follow-up actions scheduled yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {form.followUps.map((fu, i) => (
                <div key={i} style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 14px' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#92400e' }}>📅 {fu.type || 'Follow-up'}</div>
                  <div style={{ fontSize: '0.8rem', color: '#78350f', marginTop: 2 }}>{fu.description}</div>
                  {fu.due_date && <div style={{ fontSize: '0.75rem', color: '#a16207', marginTop: 4 }}>Due: {fu.due_date}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
