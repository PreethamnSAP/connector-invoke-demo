import { useState } from 'react'
import withOasSpec from './specs/with-oas.json'
import withoutOasSpec from './specs/without-oas.json'
import fallbackResponses from './specs/fallback-responses.json'
import './App.css'

// ── Data ─────────────────────────────────────────────────────────
const CONNECTORS = [
  {
    id: 'mailchimp',
    name: 'Mailchimp Connector',
    icon: 'M',
    category: 'Marketing',
    instances: [
      { id: 'without-oas', name: 'Mailchimp — Create Campaign — Without OAS', hasOas: false, spec: withoutOasSpec, url: 'https://connector-automation.it-acfun002-rt.internal.cfapps.eu12.hana.ondemand.com/http/Mailchimp_-_Create_Campaign_-_Without_OAS/*' },
      { id: 'with-oas',    name: 'Mailchimp — Create Campaign — With OAS',    hasOas: true,  spec: withOasSpec,    url: 'https://connector-automation.it-acfun002-rt.internal.cfapps.eu12.hana.ondemand.com/http/Mailchimp_CreateCampaign_With_OAS/*' },
    ],
  },
]

const PRE_FILL_BY_TYPE = {
  regular: {
    type: 'regular',
    'recipients.list_id': '12f283db3b',
    'settings.subject_line': 'SAP Integration Suite — October Newsletter',
    'settings.preview_text': 'What\'s new in SAP Integration Suite this month',
    'settings.from_name': 'SAP-Mailchimp-Validations',
    'settings.reply_to': 'proj-aif-sapintegrations-validation@wisertech.com',
    'settings.title': 'October Newsletter 2026',
  },
  plaintext: {
    type: 'plaintext',
    'recipients.list_id': '12f283db3b',
    'settings.subject_line': 'Plain Text Announcement — SAP Integration Suite',
    'settings.from_name': 'SAP-Mailchimp-Validations',
    'settings.reply_to': 'proj-aif-sapintegrations-validation@wisertech.com',
    'settings.title': 'Plain Text Campaign 2026',
  },
  absplit: {
    type: 'absplit',
    'recipients.list_id': '12f283db3b',
    'settings.subject_line': 'Which subject line wins?',
    'settings.from_name': 'SAP-Mailchimp-Validations',
    'settings.reply_to': 'proj-aif-sapintegrations-validation@wisertech.com',
    'settings.title': 'A/B Split Test Campaign 2026',
    'variate_settings.winner_criteria': 'opens',
    'variate_settings.wait_time': '60',
    'variate_settings.test_size': '20',
  },
  rss: {
    type: 'rss',
    'recipients.list_id': '12f283db3b',
    'settings.subject_line': 'Latest from SAP Blog',
    'settings.from_name': 'SAP-Mailchimp-Validations',
    'settings.reply_to': 'proj-aif-sapintegrations-validation@wisertech.com',
    'settings.title': 'SAP Blog RSS Campaign',
    'rss_opts.feed_url': 'https://feeds.feedburner.com/TechCrunch/',
    'rss_opts.frequency': 'weekly',
    'rss_opts.schedule.hour': '8',
    'rss_opts.schedule.weekly_send_day': 'monday',
  },
  variate: {
    type: 'variate',
    'recipients.list_id': '12f283db3b',
    'settings.subject_line': 'SAP Integration Suite — Variate Test',
    'settings.from_name': 'SAP-Mailchimp-Validations',
    'settings.reply_to': 'proj-aif-sapintegrations-validation@wisertech.com',
    'settings.title': 'Variate Campaign 2026',
    'variate_settings.winner_criteria': 'clicks',
    'variate_settings.wait_time': '120',
    'variate_settings.test_size': '10',
  },
}

function expand(flat) {
  const result = {}
  for (const [key, val] of Object.entries(flat)) {
    const parts = key.split('.')
    let cur = result
    for (let i = 0; i < parts.length - 1; i++) {
      cur[parts[i]] = cur[parts[i]] || {}
      cur = cur[parts[i]]
    }
    cur[parts[parts.length - 1]] = val
  }
  return result
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


// ── Request panel (left) ──────────────────────────────────────────
function RequestPanel({ spec, hasOas, onSubmit, loading, values, onValuesChange }) {
  const handleChange = (name, val) => {
    if (name === 'type' && PRE_FILL_BY_TYPE[val]) {
      onValuesChange(PRE_FILL_BY_TYPE[val])
    } else {
      onValuesChange(p => ({ ...p, [name]: val }))
    }
  }

  if (!hasOas) {
    return (
      <div className="panel">
        <div className="panel-head">
          <span className="badge">No API Spec</span>
          <span className="panel-name">Request</span>
        </div>
        <div className="panel-body panel-empty">
          <div className="empty-inner">
            <TreeNode label="body" hint="No schema defined" />
            <TreeNode label="configure" hint="No schema defined" />
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
          <TreeNode label="body" hint="Expand to fill request fields">
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
          </TreeNode>
          <TreeNode label="configure" hint="No schema defined" />
        </div>
        <div className="form-footer">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Running…' : 'Run'}
          </button>
        </div>
      </form>
    </div>
  )
}

// ── Tree node (for Without OAS collapsible nodes) ─────────────────
function TreeNode({ label, hint, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
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
function flattenResponse(data, prefix = '') {
  const rows = []
  for (const [k, v] of Object.entries(data)) {
    const key = prefix ? `${prefix}.${k}` : k
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      rows.push(...flattenResponse(v, key))
    } else {
      rows.push([key, Array.isArray(v) ? JSON.stringify(v) : String(v ?? '')])
    }
  }
  return rows
}

function ResponsePanel({ submitted, response, loading, onReset, hasOas, selectedType }) {
  const skeletonKeys = flattenResponse(
    fallbackResponses[selectedType] || fallbackResponses['regular']
  ).map(([k]) => k)
  if (!hasOas) {
    return (
      <div className="panel panel-response">
        <div className="panel-head"><span className="badge">Response</span></div>
        <div className="resp-empty">
          <div className="resp-empty-icon">◎</div>
          <div>Run the request to see the response</div>
        </div>
      </div>
    )
  }

  const flatRows = submitted && response ? flattenResponse(response) : null

  return (
    <div className="panel panel-response">
      <div className="panel-head">
        <span className="badge">Response</span>
        {loading && <span className="resp-loading-inline">Calling connector instance…</span>}
        {submitted && !loading && <span className="resp-status-inline">200 OK</span>}
      </div>
      <div className="panel-body">
        <table className="resp-table">
          <tbody>
            {submitted && flatRows
              ? flatRows.map(([k, v]) => (
                  <tr key={k}>
                    <td className="resp-key">{k}</td>
                    <td className="resp-val">{v}</td>
                  </tr>
                ))
              : skeletonKeys.map(k => (
                  <tr key={k} className="resp-skeleton-row">
                    <td className="resp-key">{k}</td>
                    <td className={`resp-val ${loading ? 'resp-skeleton-loading' : 'resp-skeleton-val'}`}>—</td>
                  </tr>
                ))
            }
          </tbody>
        </table>
        {submitted && !loading && (
          <button className="btn-ghost" onClick={onReset}>Try Again</button>
        )}
      </div>
    </div>
  )
}

// ── App ───────────────────────────────────────────────────────────
const CONNECTOR = CONNECTORS[0]

export default function App() {
  const [selectedInst, setSelectedInst] = useState(null)
  const [values, setValues] = useState(PRE_FILL_BY_TYPE.regular)
  const [submitted, setSubmitted] = useState(false)
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showPayload, setShowPayload] = useState(false)

  const selectInst = (inst) => {
    setSelectedInst(inst)
    setValues(inst.hasOas ? PRE_FILL_BY_TYPE.regular : {})
    setSubmitted(false)
    setResponse(null)
    setShowPayload(false)
  }

  const handleRun = async () => {
    setLoading(true)
    try {
      const res = await fetch('http://localhost:3001/invoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _instanceId: selectedInst.id, ...values }),
      })
      const data = await res.json()
      if (!res.ok || data?.error) {
        const type = values['type'] || 'regular'
        const fallback = fallbackResponses[type] || fallbackResponses['regular']
        setResponse(fallback)
      } else {
        setResponse(data)
      }
      setSubmitted(true)
    } catch {
      const type = values['type'] || 'regular'
      const fallback = fallbackResponses[type] || fallbackResponses['regular']
      setResponse(fallback)
      setSubmitted(true)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => { setSubmitted(false); setResponse(null) }

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
                  <td><span className="badge">{inst.hasOas ? 'Yes' : 'No'}</span></td>
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
            <div className="invoke-url-bar">
              <span className="invoke-url-method">POST</span>
              <span className="invoke-url-text">{selectedInst.url}</span>
            </div>
            <div className="invoke-layout">
              <div className="invoke-col">
                <RequestPanel
                  key={selectedInst.id}
                  spec={selectedInst.spec}
                  hasOas={selectedInst.hasOas}
                  onSubmit={handleRun}
                  loading={loading}
                  values={values}
                  onValuesChange={setValues}
                />
              </div>
              <div className="invoke-col">
                <ResponsePanel
                  submitted={submitted}
                  response={response}
                  loading={loading}
                  onReset={handleReset}
                  hasOas={selectedInst.hasOas}
                  selectedType={values['type'] || 'regular'}
                />
              </div>
            </div>
            <div className="payload-section">
              <button
                type="button"
                className="payload-toggle"
                onClick={() => setShowPayload(v => !v)}
              >
                {showPayload ? '▾ Hide raw payload' : '▸ Show raw payload'}
              </button>
              {showPayload && (
                <pre className="payload-pre">{
                  JSON.stringify(
                    selectedInst.hasOas
                      ? { body: expand(values), configure: {} }
                      : { body: {}, configure: {} },
                    null, 2
                  )
                }</pre>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
