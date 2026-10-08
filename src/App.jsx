import { useState } from 'react'
import withOasSpec from './specs/with-oas.json'
import withoutOasSpec from './specs/without-oas.json'
import './App.css'

// ── Data ─────────────────────────────────────────────────────────
const CONNECTORS = [
  {
    id: 'mailchimp',
    name: 'Mailchimp Connector',
    icon: 'M',
    category: 'Marketing',
    instances: [
      { id: 'with-oas',    name: 'Mailchimp — Create Campaign — With OAS',    hasOas: true,  spec: withOasSpec },
      { id: 'without-oas', name: 'Mailchimp — Create Campaign — Without OAS', hasOas: false, spec: withoutOasSpec },
    ],
  },
]

const MOCK_RESPONSE = {
  id: '6b21cee924',
  web_id: 7068199,
  type: 'regular',
  status: 'save',
  create_time: '2026-10-07T08:01:25+00:00',
  emails_sent: 0,
  content_type: 'template',
  recipients: { list_id: '12f283db3b', list_name: 'SAP-Mailchimp-Validations', recipient_count: 1 },
  settings: { subject_line: 'Automation Test Campaign', from_name: 'SAP-Mailchimp-Validations', reply_to: 'proj-aif-sapintegrations-validation@wisertech.com' },
}

const PRE_FILL = {
  type: 'regular',
  'recipients.list_id': '12f283db3b',
  'settings.subject_line': 'Automation Test Campaign',
  'settings.from_name': 'SAP-Mailchimp-Validations',
  'settings.reply_to': 'proj-aif-sapintegrations-validation@wisertech.com',
  'settings.title': 'Automation Test Campaign',
}

// ── Helpers ───────────────────────────────────────────────────────
function AdvancedGroup({ group, values, onChange }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="adv-group">
      <button type="button" className="adv-group-toggle" onClick={() => setOpen(o => !o)}>
        <span className="adv-arrow">{open ? '▾' : '▸'}</span>
        <span className="adv-group-label">{group.label}</span>
        {group.description && <span className="adv-group-desc">{group.description}</span>}
      </button>
      {open && (
        <div className="adv-group-body">
          {group.fields.map(f => (
            <div key={f.name} className="field-row">
              <label className="field-label" htmlFor={f.name}>
                {f.label}{f.required && <span className="req"> *</span>}
              </label>
              {f.type === 'select' ? (
                <select id={f.name} className="field-input" value={values[f.name] || ''} onChange={e => onChange(f.name, e.target.value)}>
                  <option value="">Select</option>
                  {f.options.map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
                </select>
              ) : (
                <input id={f.name} type="text" className="field-input" placeholder={f.placeholder} value={values[f.name] || ''} onChange={e => onChange(f.name, e.target.value)} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ResponseTable({ data, prefix }) {
  return Object.entries(data).map(([k, v]) => {
    const key = prefix ? `${prefix}.${k}` : k
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      return <ResponseTable key={key} data={v} prefix={key} />
    }
    return (
      <tr key={key}>
        <td className="resp-key">{key}</td>
        <td className="resp-val">{Array.isArray(v) ? JSON.stringify(v) : String(v)}</td>
      </tr>
    )
  })
}

// ── Request panel (left) ──────────────────────────────────────────
function RequestPanel({ spec, hasOas, onSubmit }) {
  const [values, setValues] = useState(hasOas ? PRE_FILL : {})
  const handleChange = (name, val) => setValues(p => ({ ...p, [name]: val }))

  if (!hasOas) {
    return (
      <div className="panel">
        <div className="panel-head">
          <span className="badge">No API Spec</span>
          <span className="panel-name">Request</span>
        </div>
        <div className="panel-body panel-empty">
          <div className="empty-inner">
            <TreeNode label="body" hint="No schema — expand to add payload manually">
              <textarea className="raw-input" placeholder='{ "type": "regular", "recipients": { "list_id": "..." }, ... }' readOnly />
            </TreeNode>
            <TreeNode label="configure" hint="No configure schema available" />
          </div>
          <div className="form-footer">
            <button className="btn-primary btn-disabled" disabled>Run</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="panel">
      <div className="panel-head">
        <span className="badge">API Spec Provided</span>
        <span className="panel-name">Request</span>
      </div>
      <form className="panel-body panel-form" onSubmit={e => { e.preventDefault(); onSubmit() }} noValidate>
        <div className="form-fields">
          {spec.fields.map(f => (
            <div key={f.name} className="field-row">
              <label className="field-label" htmlFor={f.name}>
                {f.label}{f.required && <span className="req"> *</span>}
              </label>
              {f.type === 'select' ? (
                <select id={f.name} className="field-input" value={values[f.name] || ''} onChange={e => handleChange(f.name, e.target.value)}>
                  <option value="">Select</option>
                  {f.options.map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
                </select>
              ) : (
                <input id={f.name} type="text" className="field-input" placeholder={f.placeholder} value={values[f.name] || ''} onChange={e => handleChange(f.name, e.target.value)} />
              )}
            </div>
          ))}
          {spec.advancedGroups && (() => {
            const selectedType = values['type']
            const visible = spec.advancedGroups.filter(g =>
              !g.showFor || !selectedType || g.showFor.includes(selectedType)
            )
            if (visible.length === 0) return null
            return (
              <div className="adv-section">
                <div className="adv-section-label">Advanced</div>
                {visible.map(g => (
                  <AdvancedGroup key={g.key} group={g} values={values} onChange={handleChange} />
                ))}
              </div>
            )
          })()}
        </div>
        <div className="form-footer">
          <button type="submit" className="btn-primary">Run</button>
        </div>
      </form>
    </div>
  )
}

// ── Tree node (for Without OAS collapsible nodes) ─────────────────
function TreeNode({ label, hint, children }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="tree-node">
      <button type="button" className="tree-node-toggle" onClick={() => setOpen(o => !o)}>
        <span className="adv-arrow">{open ? '▾' : '▸'}</span>
        <span className="tree-node-label">{label}</span>
        {!open && hint && <span className="tree-node-hint">{hint}</span>}
      </button>
      {open && (
        <div className="tree-node-body">
          {children || <span className="tree-empty">No schema defined</span>}
        </div>
      )}
    </div>
  )
}

// ── Response panel (right) ────────────────────────────────────────
function ResponsePanel({ submitted, onReset }) {
  return (
    <div className="panel panel-response">
      <div className="panel-head">
        <span className="badge">Response</span>
      </div>
      {!submitted ? (
        <div className="resp-empty">
          <div className="resp-empty-icon">◎</div>
          <div>Run the request to see the response</div>
        </div>
      ) : (
        <div className="panel-body">
          <div className="resp-status">
            <span className="resp-dot" />
            200 OK — Campaign created successfully
          </div>
          <table className="resp-table">
            <tbody><ResponseTable data={MOCK_RESPONSE} /></tbody>
          </table>
          <button className="btn-ghost" onClick={onReset}>Try Again</button>
        </div>
      )}
    </div>
  )
}

// ── App ───────────────────────────────────────────────────────────
const CONNECTOR = CONNECTORS[0]

export default function App() {
  const [selectedInst, setSelectedInst] = useState(null)
  const [submitted, setSubmitted] = useState(false)

  const selectInst = (inst) => { setSelectedInst(inst); setSubmitted(false) }

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner"></div>
      </header>

      <main className="app-main">
        {/* Step 1: Select Connector Instance */}
        <div className="step-card">
          <div className="step-card-header">
            <div className="step-number">1</div>
            <span>Select Connector Instance</span>
          </div>
          <table className="inst-table">
            <thead>
              <tr>
                <th>Instance Name</th>
                <th>Operation</th>
                <th>API Spec</th>
              </tr>
            </thead>
            <tbody>
              {CONNECTOR.instances.map(inst => (
                <tr
                  key={inst.id}
                  className={`inst-row-clickable ${selectedInst?.id === inst.id ? 'inst-row-selected' : ''}`}
                  onClick={() => selectInst(inst)}
                >
                  <td className="inst-name">{inst.name}</td>
                  <td><span className="method-badge method-post">POST</span> Create Campaign</td>
                  <td><span className="badge">{inst.hasOas ? 'Provided' : 'Not Provided'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Step 2: Invoke */}
        {selectedInst && (
          <div className="step-card">
            <div className="step-card-header">
              <div className="step-number">2</div>
              <span>Invoke — {selectedInst.name}</span>
            </div>
            <div className="invoke-layout">
              <div className="invoke-col">
                <div className="invoke-col-label">Request</div>
                <RequestPanel
                  key={selectedInst.id}
                  spec={selectedInst.spec}
                  hasOas={selectedInst.hasOas}
                  onSubmit={() => setSubmitted(true)}
                />
              </div>
              <div className="invoke-col">
                <div className="invoke-col-label">Response</div>
                <ResponsePanel submitted={submitted} onReset={() => setSubmitted(false)} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
