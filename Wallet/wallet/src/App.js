import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'
import './App.css'

const ADMIN_PIN = '7057'

const Icon = ({ d, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
)
const Icons = {
  dashboard: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
  wallet: "M21 12V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2v-5m0 0h-7a2 2 0 000 4h7",
  ledger: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  personal: "M12 2a10 10 0 110 20A10 10 0 0112 2zm0 6v4l3 3",
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  logout: "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9",
  check: "M20 6L9 17l-5-5",
  trash: "M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6",
  arrow: "M5 12h14M12 5l7 7-7 7",
  tag: "M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01",
  user: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 110-8 4 4 0 010 8",
  search: "M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z",
  moon: "M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z",
  settings: "M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z",
  report: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8",
  calendar: "M3 4h18v18H3zM16 2v4M8 2v4M3 10h18",
  download: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3",
  alert: "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01",
  piggy: "M19 8a7 7 0 00-14 0c0 3.87 2.69 7.12 6.38 7.86L12 19l.62-3.14C16.31 15.12 19 11.87 19 8z",
  sun: "M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 5a7 7 0 100 14A7 7 0 0012 5z",
}

const fmt = (n) => `Rs ${Number(n).toLocaleString('en-PK')}`
const fmtDate = (d) => new Date(d).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })
const today = () => new Date().toISOString().split('T')[0]

function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

// LOGIN
function LoginScreen({ onAdminLogin, onUserLogin }) {
  const [mode, setMode] = useState('user')
  const [showAdminBtn, setShowAdminBtn] = useState(false)
  const [pin, setPin] = useState('')
  const [err, setErr] = useState('')
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    if (pin.length === 4 && !checking) {
      setChecking(true)
      if (mode === 'admin') {
        if (pin === ADMIN_PIN) { onAdminLogin() }
        else { setErr('Incorrect PIN'); setTimeout(() => { setPin(''); setErr(''); setChecking(false) }, 900) }
      } else {
        supabase.from('people').select('*').eq('pin', pin).single().then(({ data }) => {
          if (data) { onUserLogin(data) }
          else { setErr('Invalid PIN'); setTimeout(() => { setPin(''); setErr(''); setChecking(false) }, 900) }
        })
      }
    }
  }, [pin])

  const addDigit = (d) => { if (pin.length < 4 && !checking) setPin(p => p + d) }
  const delDigit = () => { if (!checking) setPin(p => p.slice(0, -1)) }

  const handleLogoTap = () => {
    setShowAdminBtn(true)
    setTimeout(() => setShowAdminBtn(false), 3000)
  }

  return (
    <div className="login-screen">
      <div className="login-logo" onClick={handleLogoTap} style={{cursor:'pointer', userSelect:'none'}}>
        <div className="logo-icon">W</div>
        <h1>Wallet</h1>
        <p>{mode === 'admin' ? 'Enter 4-digit admin PIN' : 'Enter your 4-digit PIN'}</p>
      </div>
      {mode === 'admin' && <div className="admin-badge">Admin Mode</div>}
      {showAdminBtn && mode !== 'admin' && (
        <button className="admin-hint-btn" onClick={() => { setMode('admin'); setPin(''); setErr(''); setShowAdminBtn(false) }}>
          Switch to Admin Login
        </button>
      )}
      <div className="pin-dots">
        {[0,1,2,3].map(i => <div key={i} className={`pin-dot ${pin.length > i ? 'filled' : ''} ${err ? 'shake' : ''}`} />)}
      </div>
      {err && <div className="login-err">{err}</div>}
      <div className="numpad">
        {[1,2,3,4,5,6,7,8,9].map(n => (
          <button key={n} className="num-btn" onClick={() => addDigit(String(n))}>{n}</button>
        ))}
        <button className="num-btn del" onClick={delDigit}>⌫</button>
        <button className="num-btn" onClick={() => addDigit('0')}>0</button>
        <div className="num-btn empty-btn" />
      </div>
      {mode === 'admin' && (
        <button className="back-btn" onClick={() => { setMode('user'); setErr(''); setPin('') }}>← Back</button>
      )}
    </div>
  )
}

// USER VIEW
function UserView({ user, onLogout }) {
  const [txns, setTxns] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('transactions').select('*').eq('person_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => { setTxns(data || []); setLoading(false) })
  }, [user.id])

  const balance = txns.reduce((sum, t) => t.type === 'deposit' ? sum + Number(t.amount) : sum - Number(t.amount), 0)

  return (
    <div className="user-view">
      <div className="user-header">
        <div className="user-avatar">{user.name.charAt(0).toUpperCase()}</div>
        <h2>{user.name}</h2>
        <button className="btn-icon logout" onClick={onLogout}><Icon d={Icons.logout} size={16} /></button>
      </div>
      <div className="balance-hero">
        <div className="balance-label">Current Balance</div>
        <div className="balance-amount">{fmt(balance)}</div>
      </div>
      <div className="user-txns">
        <h4>Transaction History</h4>
        {loading ? <div className="loading">Loading...</div> : txns.length === 0 ? (
          <div className="empty">No transactions yet</div>
        ) : txns.map(t => (
          <div key={t.id} className="txn-row">
            <div className={`txn-icon ${t.type}`}><Icon d={t.type === 'deposit' ? Icons.plus : Icons.minus} size={14} /></div>
            <div className="txn-info">
              <div className="txn-type">{t.type === 'deposit' ? 'Deposit' : 'Withdrawal'}</div>
              <div className="txn-meta">{fmtDate(t.created_at)}{t.note ? ` · ${t.note}` : ''}</div>
            </div>
            <div className={`txn-amount ${t.type}`}>{t.type === 'deposit' ? '+' : '-'}{fmt(t.amount)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// DASHBOARD
function Dashboard({ people, transactions, ledger, ledgerTxns, personalEntries }) {
  const totalWallet = people.reduce((sum, p) => {
    return sum + transactions.filter(t => t.person_id === p.id)
      .reduce((s, t) => t.type === 'deposit' ? s + Number(t.amount) : s - Number(t.amount), 0)
  }, 0)

  const getRemaining = (entry) => {
    const txns = ledgerTxns.filter(lt => lt.ledger_id === entry.id)
    const added = txns.filter(lt => lt.type === 'added').reduce((s, lt) => s + Number(lt.amount), 0)
    const paid = txns.filter(lt => lt.type === 'paid').reduce((s, lt) => s + Number(lt.amount), 0)
    return Number(entry.amount) + added - paid
  }

  const totalReceive = ledger.filter(l => l.type === 'owed' && l.status !== 'done').reduce((s, l) => s + Math.max(0, getRemaining(l)), 0)
  const totalPay = ledger.filter(l => l.type === 'owe' && l.status !== 'done').reduce((s, l) => s + Math.max(0, getRemaining(l)), 0)
  const totalIncome = personalEntries.filter(e => e.type === 'income').reduce((s,e) => s + Number(e.amount), 0)
  const totalExpense = personalEntries.filter(e => e.type === 'expense').reduce((s,e) => s + Number(e.amount), 0)
  const currentBalance = totalIncome - totalExpense

  const recentTxns = [...transactions].sort((a,b) => new Date(b.created_at) - new Date(a.created_at)).slice(0,5)

  return (
    <div className="section">
      <h2 className="section-title">Dashboard</h2>
      <div className="wallet-hero-card">
        <div className="wallet-hero-label">Total Wallet</div>
        <div className="wallet-hero-amount">{fmt(totalWallet)}</div>
      </div>
      <div className="stat-grid">
        <div className="stat-card success">
          <div className="stat-label">To Receive</div>
          <div className="stat-val">{fmt(totalReceive)}</div>
        </div>
        <div className="stat-card danger">
          <div className="stat-label">To Pay</div>
          <div className="stat-val">{fmt(totalPay)}</div>
        </div>
      </div>
      <h3 className="sub-title">Recent Transactions</h3>
      <div className="card">
        {recentTxns.length === 0 ? <div className="empty">No transactions yet</div> : recentTxns.map(t => {
          const person = people.find(p => p.id === t.person_id)
          return (
            <div key={t.id} className="txn-row">
              <div className={`txn-icon ${t.type}`}><Icon d={t.type === 'deposit' ? Icons.plus : Icons.minus} size={14} /></div>
              <div className="txn-info">
                <div className="txn-type">{person?.name || 'Unknown'}</div>
                <div className="txn-meta">{fmtDate(t.created_at)}{t.note ? ` · ${t.note}` : ''}</div>
              </div>
              <div className={`txn-amount ${t.type}`}>{t.type === 'deposit' ? '+' : '-'}{fmt(t.amount)}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// WALLET
function Wallet({ people, transactions, onRefresh }) {
  const [selected, setSelected] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [showTxn, setShowTxn] = useState(false)
  const [showPinChange, setShowPinChange] = useState(false)
  const [form, setForm] = useState({ name: '', pin: '' })
  const [txnForm, setTxnForm] = useState({ type: 'deposit', amount: '', note: '', txn_date: today() })
  const [pinForm, setPinForm] = useState({ newPin: '' })
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const getBalance = (personId) => transactions.filter(t => t.person_id === personId)
    .reduce((s, t) => t.type === 'deposit' ? s + Number(t.amount) : s - Number(t.amount), 0)

  const addPerson = async () => {
    if (!form.name.trim()) { setErr('Name required'); return }
    if (form.pin.length !== 4 || !/^\d+$/.test(form.pin)) { setErr('PIN must be 4 digits'); return }
    if (form.pin === ADMIN_PIN) { setErr('This PIN is reserved for admin'); return }
    const { data: existing } = await supabase.from('people').select('id').eq('pin', form.pin).single()
    if (existing) { setErr('PIN already in use'); return }
    setLoading(true)
    await supabase.from('people').insert({ name: form.name.trim(), pin: form.pin })
    await onRefresh(); setShowAdd(false); setForm({ name: '', pin: '' }); setErr(''); setLoading(false)
  }

  const addTxn = async () => {
    if (!txnForm.amount || Number(txnForm.amount) <= 0) { setErr('Valid amount required'); return }
    setLoading(true)
    await supabase.from('transactions').insert({ person_id: selected.id, type: txnForm.type, amount: Number(txnForm.amount), note: txnForm.note, created_at: new Date(txnForm.txn_date).toISOString() })
    await onRefresh(); setShowTxn(false); setTxnForm({ type: 'deposit', amount: '', note: '', txn_date: today() }); setErr(''); setLoading(false)
  }

  const changePin = async () => {
    if (pinForm.newPin.length !== 4 || !/^\d+$/.test(pinForm.newPin)) { setErr('PIN must be 4 digits'); return }
    if (pinForm.newPin === ADMIN_PIN) { setErr('This PIN is reserved for admin'); return }
    const { data: existing } = await supabase.from('people').select('id').eq('pin', pinForm.newPin).single()
    if (existing && existing.id !== selected.id) { setErr('PIN already in use'); return }
    setLoading(true)
    await supabase.from('people').update({ pin: pinForm.newPin }).eq('id', selected.id)
    await onRefresh()
    const { data } = await supabase.from('people').select('*').eq('id', selected.id).single()
    if (data) setSelected(data)
    setShowPinChange(false); setPinForm({ newPin: '' }); setErr(''); setLoading(false)
  }

  const deletePerson = async (id) => {
    if (!window.confirm('Delete this person and all their transactions?')) return
    await supabase.from('people').delete().eq('id', id)
    setSelected(null); await onRefresh()
  }

  const deleteTxn = async (id) => {
    if (!window.confirm('Delete this transaction?')) return
    await supabase.from('transactions').delete().eq('id', id)
    await onRefresh()
  }

  if (selected) {
    const ptxns = [...transactions.filter(t => t.person_id === selected.id)].sort((a,b) => new Date(b.created_at) - new Date(a.created_at))
    const bal = getBalance(selected.id)
    return (
      <div className="section">
        <button className="btn-back" onClick={() => setSelected(null)}>← Back to Wallet</button>
        <div className="person-header">
          <div className="person-avatar">{selected.name.charAt(0)}</div>
          <div style={{flex:1}}>
            <h2>{selected.name}</h2>
            <div className="person-pin" style={{display:'flex',alignItems:'center',gap:'8px'}}>
              PIN: {selected.pin}
              <button className="pin-change-inline" onClick={() => { setPinForm({newPin:''}); setErr(''); setShowPinChange(true) }}>Change PIN</button>
            </div>
          </div>
          <button className="btn-icon danger" onClick={() => deletePerson(selected.id)}><Icon d={Icons.trash} size={16} /></button>
        </div>
        <div className="balance-hero">
          <div className="balance-label">Balance</div>
          <div className="balance-amount">{fmt(bal)}</div>
        </div>
        <div style={{display:'flex',gap:'8px',marginBottom:'1.5rem'}}>
          <button className="btn-primary" onClick={() => { setTxnForm({type:'deposit',amount:'',note:'',txn_date:today()}); setShowTxn(true) }}>+ Deposit</button>
          <button className="btn-danger" onClick={() => { setTxnForm({type:'withdraw',amount:'',note:'',txn_date:today()}); setShowTxn(true) }}>- Withdraw</button>
        </div>
        <div className="card">
          {ptxns.length === 0 ? <div className="empty">No transactions</div> : ptxns.map(t => (
            <div key={t.id} className="txn-row">
              <div className={`txn-icon ${t.type}`}><Icon d={t.type === 'deposit' ? Icons.plus : Icons.minus} size={14} /></div>
              <div className="txn-info">
                <div className="txn-type">{t.type === 'deposit' ? 'Deposit' : 'Withdrawal'}</div>
                <div className="txn-meta">{fmtDate(t.created_at)}{t.note ? ` · ${t.note}` : ''}</div>
              </div>
              <div className={`txn-amount ${t.type}`}>{t.type === 'deposit' ? '+' : '-'}{fmt(t.amount)}</div>
              <button className="btn-icon sm" onClick={() => deleteTxn(t.id)}><Icon d={Icons.trash} size={13} /></button>
            </div>
          ))}
        </div>
        {showTxn && (
          <Modal title={txnForm.type === 'deposit' ? 'Add Deposit' : 'Add Withdrawal'} onClose={() => { setShowTxn(false); setErr('') }}>
            <div className="modal-body">
              <div className="field"><label>Type</label>
                <div className="toggle-row">
                  <button className={`toggle-btn ${txnForm.type === 'deposit' ? 'active' : ''}`} onClick={() => setTxnForm(f => ({...f, type:'deposit'}))}>Deposit</button>
                  <button className={`toggle-btn ${txnForm.type === 'withdraw' ? 'active danger' : ''}`} onClick={() => setTxnForm(f => ({...f, type:'withdraw'}))}>Withdraw</button>
                </div>
              </div>
              <div className="field"><label>Amount (Rs)</label>
                <input type="number" placeholder="0" value={txnForm.amount} onChange={e => setTxnForm(f => ({...f, amount: e.target.value}))} />
              </div>
              <div className="field"><label>Date</label>
                <input type="date" value={txnForm.txn_date} onChange={e => setTxnForm(f => ({...f, txn_date: e.target.value}))} />
              </div>
              <div className="field"><label>Note (optional)</label>
                <input type="text" placeholder="e.g. Monthly saving" value={txnForm.note} onChange={e => setTxnForm(f => ({...f, note: e.target.value}))} />
              </div>
              {err && <div className="form-err">{err}</div>}
              <button className="btn-primary full" onClick={addTxn} disabled={loading}>{loading ? 'Saving...' : 'Save Transaction'}</button>
            </div>
          </Modal>
        )}
        {showPinChange && (
          <Modal title="Change PIN" onClose={() => { setShowPinChange(false); setErr(''); setPinForm({newPin:''}) }}>
            <div className="modal-body">
              <div className="field"><label>New 4-Digit PIN for {selected.name}</label>
                <input type="number" placeholder="Enter new PIN" value={pinForm.newPin} onChange={e => setPinForm({newPin: e.target.value.slice(0,4)})} />
              </div>
              {err && <div className="form-err">{err}</div>}
              <button className="btn-primary full" onClick={changePin} disabled={loading}>{loading ? 'Saving...' : 'Change PIN'}</button>
            </div>
          </Modal>
        )}
      </div>
    )
  }

  return (
    <div className="section">
      <div className="section-header">
        <h2 className="section-title">Wallet</h2>
        <button className="btn-primary sm" onClick={() => setShowAdd(true)}>+ Add Person</button>
      </div>
      <div className="card">
        {people.length === 0 ? <div className="empty">No people added yet</div> : people.map(p => {
          const bal = getBalance(p.id)
          return (
            <div key={p.id} className="people-row" onClick={() => setSelected(p)}>
              <div className="people-avatar">{p.name.charAt(0)}</div>
              <div className="people-info">
                <div className="people-name">{p.name}</div>
                <div className="people-since">Joined {fmtDate(p.created_at)}</div>
              </div>
              <div className={`balance-pill ${bal >= 0 ? 'pos' : 'neg'}`}>{fmt(bal)}</div>
              <Icon d={Icons.arrow} size={16} />
            </div>
          )
        })}
      </div>
      {showAdd && (
        <Modal title="Add New Person" onClose={() => { setShowAdd(false); setErr(''); setForm({ name: '', pin: '' }) }}>
          <div className="modal-body">
            <div className="field"><label>Full Name</label>
              <input type="text" placeholder="Enter name" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
            </div>
            <div className="field"><label>4-Digit PIN</label>
              <input type="number" placeholder="e.g. 1234" value={form.pin} onChange={e => setForm(f => ({...f, pin: e.target.value.slice(0,4)}))} />
            </div>
            {err && <div className="form-err">{err}</div>}
            <button className="btn-primary full" onClick={addPerson} disabled={loading}>{loading ? 'Saving...' : 'Add Person'}</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

// LEDGER
function Ledger({ ledger, ledgerTxns, onRefresh }) {
  const [showAdd, setShowAdd] = useState(false)
  const [selected, setSelected] = useState(null)
  const [showTxn, setShowTxn] = useState(false)
  const [txnType, setTxnType] = useState('paid')
  const [tab, setTab] = useState('pending')
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ name: '', type: 'owed', amount: '', note: '', entry_date: today(), due_date: '' })
  const [txnForm, setTxnForm] = useState({ amount: '', note: '', entry_date: today() })
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const getRemaining = (entry) => {
    const txns = ledgerTxns.filter(lt => lt.ledger_id === entry.id)
    const added = txns.filter(lt => lt.type === 'added').reduce((s, lt) => s + Number(lt.amount), 0)
    const paid = txns.filter(lt => lt.type === 'paid').reduce((s, lt) => s + Number(lt.amount), 0)
    return Number(entry.amount) + added - paid
  }

  const isOverdue = (entry) => {
    if (!entry.due_date || entry.status === 'done') return false
    return new Date(entry.due_date) < new Date()
  }
  const getDaysLeft = (entry) => {
    if (!entry.due_date) return null
    return Math.ceil((new Date(entry.due_date) - new Date()) / (1000*60*60*24))
  }

  const addEntry = async () => {
    if (!form.name.trim()) { setErr('Name required'); return }
    if (!form.amount || Number(form.amount) <= 0) { setErr('Valid amount required'); return }
    setLoading(true)
    await supabase.from('ledger').insert({ name: form.name.trim(), type: form.type, amount: Number(form.amount), note: form.note, status: 'pending', created_at: new Date(form.entry_date).toISOString(), due_date: form.due_date || null })
    await onRefresh(); setShowAdd(false); setForm({ name: '', type: 'owed', amount: '', note: '', entry_date: today(), due_date: '' }); setErr(''); setLoading(false)
  }

  const addTransaction = async () => {
    if (!txnForm.amount || Number(txnForm.amount) <= 0) { setErr('Valid amount required'); return }
    const remaining = getRemaining(selected)
    if (txnType === 'paid' && Number(txnForm.amount) > remaining) { setErr(`Max is ${fmt(remaining)}`); return }
    setLoading(true)
    // Use upsert-safe insert with no type constraint issue
    const { error } = await supabase.from('ledger_transactions').insert({
      ledger_id: selected.id,
      type: txnType,
      amount: Number(txnForm.amount),
      note: txnForm.note,
      created_at: new Date(txnForm.entry_date).toISOString()
    })
    if (error) { setErr('Failed to save. Please try again.'); setLoading(false); return }
    if (txnType === 'paid') {
      const newRem = remaining - Number(txnForm.amount)
      if (newRem <= 0) await supabase.from('ledger').update({ status: 'done' }).eq('id', selected.id)
      else await supabase.from('ledger').update({ status: 'pending' }).eq('id', selected.id)
    } else if (txnType === 'added') {
      await supabase.from('ledger').update({ status: 'pending' }).eq('id', selected.id)
    }
    await onRefresh()
    const { data } = await supabase.from('ledger').select('*').eq('id', selected.id).single()
    if (data) setSelected(data)
    setShowTxn(false); setTxnForm({ amount: '', note: '', entry_date: today() }); setErr(''); setLoading(false)
  }

  const deleteEntry = async (id) => {
    if (!window.confirm('Delete this entry?')) return
    await supabase.from('ledger').delete().eq('id', id)
    setSelected(null); await onRefresh()
  }

  const deleteLedgerTxn = async (id) => {
    if (!window.confirm('Delete this record?')) return
    await supabase.from('ledger_transactions').delete().eq('id', id)
    await onRefresh()
    const { data } = await supabase.from('ledger').select('*').eq('id', selected.id).single()
    if (data) {
      const rem = getRemaining(data)
      if (rem > 0 && data.status === 'done') await supabase.from('ledger').update({ status: 'pending' }).eq('id', data.id)
      setSelected(data)
      await onRefresh()
    }
  }

  if (selected) {
    const payments = ledgerTxns.filter(lt => lt.ledger_id === selected.id).sort((a,b) => new Date(b.created_at) - new Date(a.created_at))
    const remaining = getRemaining(selected)
    const isReceive = selected.type === 'owed'

    return (
      <div className="section">
        <button className="btn-back" onClick={() => setSelected(null)}>← Back to Ledger</button>
        <div className="person-header">
          <div className={`person-avatar ${isReceive ? '' : 'red'}`}>{selected.name.charAt(0)}</div>
          <div style={{flex:1}}>
            <h2>{selected.name}</h2>
            <div className="person-pin">{isReceive ? 'To Receive' : 'To Pay'} · {fmtDate(selected.created_at)}</div>
          </div>
          <button className="btn-icon danger" onClick={() => deleteEntry(selected.id)}><Icon d={Icons.trash} size={16} /></button>
        </div>

        <div className={`balance-hero ${isReceive ? '' : 'red-hero'}`}>
          <div className="balance-label">Remaining Amount</div>
          <div className="balance-amount">{fmt(Math.max(0, remaining))}</div>
        </div>

        {selected.note && <div className="entry-note">📝 {selected.note}</div>}
        {remaining <= 0 && <div className="done-badge">✓ Fully Settled</div>}

        <div style={{display:'flex', gap:'8px', marginBottom:'1.5rem', flexWrap:'wrap'}}>
          <button className="btn-primary" onClick={() => { setTxnType('paid'); setTxnForm({ amount: '', note: '', entry_date: today() }); setShowTxn(true) }}>
            + {isReceive ? 'Payment Received' : 'Payment Made'}
          </button>
          <button className="btn-ghost sm" onClick={() => { setTxnType('added'); setTxnForm({ amount: '', note: '', entry_date: today() }); setShowTxn(true) }}>
            + Added
          </button>
        </div>

        <h4 className="sub-title">History</h4>
        <div className="card">
          {payments.length === 0 ? <div className="empty">No records yet</div> : payments.map(lt => (
            <div key={lt.id} className="txn-row">
              <div className={`txn-icon ${lt.type === 'paid' ? 'deposit' : 'withdraw'}`}>
                <Icon d={lt.type === 'paid' ? Icons.minus : Icons.plus} size={14} />
              </div>
              <div className="txn-info">
                <div className="txn-type">{lt.type === 'paid' ? (isReceive ? 'Received' : 'Paid') : 'Added'}</div>
                <div className="txn-meta">{fmtDate(lt.created_at)}{lt.note ? ` · ${lt.note}` : ''}</div>
              </div>
              <div className={`txn-amount ${lt.type === 'paid' ? 'deposit' : 'withdraw'}`}>
                {lt.type === 'paid' ? '-' : '+'}{fmt(lt.amount)}
              </div>
              <button className="btn-icon sm" onClick={() => deleteLedgerTxn(lt.id)}><Icon d={Icons.trash} size={13} /></button>
            </div>
          ))}
        </div>

        {showTxn && (
          <Modal title={txnType === 'added' ? 'Added Amount' : (isReceive ? 'Payment Received' : 'Payment Made')} onClose={() => { setShowTxn(false); setErr('') }}>
            <div className="modal-body">
              <div className="field">
                <label>Amount (Rs){txnType === 'paid' ? ` · Remaining: ${fmt(Math.max(0, remaining))}` : ''}</label>
                <input type="number" placeholder="0" value={txnForm.amount} onChange={e => setTxnForm(f => ({...f, amount: e.target.value}))} />
              </div>
              <div className="field"><label>Date</label>
                <input type="date" value={txnForm.entry_date} onChange={e => setTxnForm(f => ({...f, entry_date: e.target.value}))} />
              </div>
              <div className="field"><label>Note (optional)</label>
                <input type="text" placeholder="e.g. Partial payment" value={txnForm.note} onChange={e => setTxnForm(f => ({...f, note: e.target.value}))} />
              </div>
              {err && <div className="form-err">{err}</div>}
              <button className="btn-primary full" onClick={addTransaction} disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
            </div>
          </Modal>
        )}
      </div>
    )
  }

  const filtered = (tab === 'pending' ? ledger.filter(l => l.status !== 'done') : ledger.filter(l => l.status === 'done'))
    .filter(l => l.name.toLowerCase().includes(search.toLowerCase()))

  const toReceive = filtered.filter(l => l.type === 'owed')
  const toPay = filtered.filter(l => l.type === 'owe')
  const totalReceive = ledger.filter(l => l.type === 'owed' && l.status !== 'done').reduce((s,l) => s + Math.max(0, getRemaining(l)), 0)
  const totalPay = ledger.filter(l => l.type === 'owe' && l.status !== 'done').reduce((s,l) => s + Math.max(0, getRemaining(l)), 0)

  return (
    <div className="section">
      <div className="section-header">
        <h2 className="section-title">Ledger</h2>
        <button className="btn-primary sm" onClick={() => setShowAdd(true)}>+ Add Entry</button>
      </div>
      <div className="ledger-summary">
        <div className="ledger-stat success"><div className="ls-label">To Receive</div><div className="ls-val">{fmt(totalReceive)}</div></div>
        <div className="ledger-stat danger"><div className="ls-label">To Pay</div><div className="ls-val">{fmt(totalPay)}</div></div>
      </div>
      <div className="search-bar">
        <Icon d={Icons.search} size={16} />
        <input type="text" placeholder="Search by name..." value={search} onChange={e => setSearch(e.target.value)} />
        {search && <button onClick={() => setSearch('')} className="search-clear">✕</button>}
      </div>
      <div className="tabs">
        <button className={`tab ${tab === 'pending' ? 'active' : ''}`} onClick={() => setTab('pending')}>Pending</button>
        <button className={`tab ${tab === 'done' ? 'active' : ''}`} onClick={() => setTab('done')}>Completed</button>
      </div>

      {toReceive.length > 0 && <>
        <h4 className="ledger-group-title success">To Receive</h4>
        <div className="card">{toReceive.map(l => {
          const rem = getRemaining(l)
          const overdue = isOverdue(l)
          const daysLeft = getDaysLeft(l)
          return (
            <div key={l.id} className={`ledger-row${overdue ? ' overdue-row' : ''}`} style={{cursor:'pointer'}} onClick={() => setSelected(l)}>
              <div className="ledger-info">
                <div className="ledger-name">{l.name} {overdue && <span className="overdue-tag">Overdue</span>}</div>
                <div className="ledger-note">
                  {fmtDate(l.created_at)}
                  {l.due_date && <span className={daysLeft < 0 ? ' due-red' : daysLeft <= 3 ? ' due-orange' : ' due-gray'}> · Due: {fmtDate(l.due_date)}{daysLeft >= 0 ? ` (${daysLeft}d left)` : ''}</span>}
                  {l.note ? ` · ${l.note}` : ''}
                </div>
              </div>
              <div className="ledger-amount success">{fmt(Math.max(0, rem))}</div>
              <Icon d={Icons.arrow} size={15} />
            </div>
          )
        })}</div>
      </>}

      {toPay.length > 0 && <>
        <h4 className="ledger-group-title danger">To Pay</h4>
        <div className="card">{toPay.map(l => {
          const rem = getRemaining(l)
          const overdue = isOverdue(l)
          const daysLeft = getDaysLeft(l)
          return (
            <div key={l.id} className={`ledger-row${overdue ? ' overdue-row' : ''}`} style={{cursor:'pointer'}} onClick={() => setSelected(l)}>
              <div className="ledger-info">
                <div className="ledger-name">{l.name} {overdue && <span className="overdue-tag">Overdue</span>}</div>
                <div className="ledger-note">
                  {fmtDate(l.created_at)}
                  {l.due_date && <span className={daysLeft < 0 ? ' due-red' : daysLeft <= 3 ? ' due-orange' : ' due-gray'}> · Due: {fmtDate(l.due_date)}{daysLeft >= 0 ? ` (${daysLeft}d left)` : ''}</span>}
                  {l.note ? ` · ${l.note}` : ''}
                </div>
              </div>
              <div className="ledger-amount danger">{fmt(Math.max(0, rem))}</div>
              <Icon d={Icons.arrow} size={15} />
            </div>
          )
        })}</div>
      </>}

      {filtered.length === 0 && <div className="card"><div className="empty">{search ? 'No results found' : `No ${tab} entries`}</div></div>}

      {showAdd && (
        <Modal title="Add Ledger Entry" onClose={() => { setShowAdd(false); setErr(''); setForm({ name: '', type: 'owed', amount: '', note: '', entry_date: today(), due_date: '' }) }}>
          <div className="modal-body">
            <div className="field"><label>Name</label>
              <input type="text" placeholder="Enter name" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
            </div>
            <div className="field"><label>Type</label>
              <div className="toggle-row">
                <button className={`toggle-btn ${form.type === 'owed' ? 'active success' : ''}`} onClick={() => setForm(f => ({...f, type:'owed'}))}>To Receive</button>
                <button className={`toggle-btn ${form.type === 'owe' ? 'active danger' : ''}`} onClick={() => setForm(f => ({...f, type:'owe'}))}>To Pay</button>
              </div>
            </div>
            <div className="field"><label>Amount (Rs)</label>
              <input type="number" placeholder="0" value={form.amount} onChange={e => setForm(f => ({...f, amount: e.target.value}))} />
            </div>
            <div className="field"><label>Date</label>
              <input type="date" value={form.entry_date} onChange={e => setForm(f => ({...f, entry_date: e.target.value}))} />
            </div>
            <div className="field"><label>Due Date (optional)</label>
              <input type="date" value={form.due_date} onChange={e => setForm(f => ({...f, due_date: e.target.value}))} />
            </div>
            <div className="field"><label>Note (optional)</label>
              <input type="text" placeholder="e.g. April loan" value={form.note} onChange={e => setForm(f => ({...f, note: e.target.value}))} />
            </div>
            {err && <div className="form-err">{err}</div>}
            <button className="btn-primary full" onClick={addEntry} disabled={loading}>{loading ? 'Saving...' : 'Add Entry'}</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

// PERSONAL FINANCE
function Personal({ entries, categories, onRefresh }) {
  const [showAdd, setShowAdd] = useState(false)
  const [showCat, setShowCat] = useState(false)
  const [form, setForm] = useState({ type: 'expense', amount: '', category_id: '', note: '', entry_date: today() })
  const [catForm, setCatForm] = useState({ name: '' })
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const [month, setMonth] = useState(new Date().toISOString().slice(0,7))

  const monthEntries = entries.filter(e => e.entry_date && e.entry_date.slice(0,7) === month)
  const income = monthEntries.filter(e => e.type === 'income').reduce((s,e) => s + Number(e.amount), 0)
  const expense = monthEntries.filter(e => e.type === 'expense').reduce((s,e) => s + Number(e.amount), 0)
  const totalIncome = entries.filter(e => e.type === 'income').reduce((s,e) => s + Number(e.amount), 0)
  const totalExpense = entries.filter(e => e.type === 'expense').reduce((s,e) => s + Number(e.amount), 0)
  const totalSaving = totalIncome - totalExpense

  const catTotals = categories.map(c => ({
    ...c, total: monthEntries.filter(e => e.category_id === c.id && e.type === 'expense').reduce((s,e) => s + Number(e.amount), 0)
  })).filter(c => c.total > 0).sort((a,b) => b.total - a.total)

  const addEntry = async () => {
    if (!form.amount || Number(form.amount) <= 0) { setErr('Valid amount required'); return }
    setLoading(true)
    await supabase.from('personal_entries').insert({ type: form.type, amount: Number(form.amount), category_id: form.category_id || null, note: form.note, entry_date: form.entry_date })
    await onRefresh(); setShowAdd(false); setForm({ type: 'expense', amount: '', category_id: '', note: '', entry_date: today() }); setErr(''); setLoading(false)
  }

  const addCategory = async () => {
    if (!catForm.name.trim()) { setErr('Name required'); return }
    setLoading(true)
    await supabase.from('categories').insert({ name: catForm.name.trim() })
    await onRefresh(); setCatForm({ name: '' }); setErr(''); setLoading(false)
  }

  const deleteEntry = async (id) => {
    if (!window.confirm('Delete this entry?')) return
    await supabase.from('personal_entries').delete().eq('id', id); await onRefresh()
  }

  const deleteCategory = async (id) => {
    if (!window.confirm('Delete this category?')) return
    await supabase.from('categories').delete().eq('id', id); await onRefresh()
  }

  return (
    <div className="section">
      <div className="section-header">
        <h2 className="section-title">Personal Finance</h2>
        <div style={{display:'flex',gap:'6px'}}>
          <button className="btn-ghost sm" onClick={() => setShowCat(true)}>Categories</button>
          <button className="btn-primary sm" onClick={() => setShowAdd(true)}>+ Add</button>
        </div>
      </div>

      <div className="saving-banner">
        <div>
          <div className="saving-label">Current Balance</div>
          <div className={`saving-val ${totalSaving < 0 ? 'neg' : ''}`}>{fmt(totalSaving)}</div>
        </div>
      </div>

      <input type="month" value={month} onChange={e => setMonth(e.target.value)} className="month-picker" />

      <div className="stat-grid" style={{marginBottom:'1.5rem'}}>
        <div className="stat-card success"><div className="stat-label">Income</div><div className="stat-val">{fmt(income)}</div></div>
        <div className="stat-card danger"><div className="stat-label">Expenses</div><div className="stat-val">{fmt(expense)}</div></div>
        <div className="stat-card"><div className="stat-label">Net This Month</div><div className={`stat-val ${income-expense >= 0 ? 'success-text':'danger-text'}`}>{fmt(income-expense)}</div></div>
      </div>

      {catTotals.length > 0 && <>
        <h4 className="sub-title">Spending by Category</h4>
        <div className="card" style={{marginBottom:'1.5rem'}}>
          {catTotals.map(c => (
            <div key={c.id} className="cat-row">
              <div className="cat-name"><Icon d={Icons.tag} size={13} /> {c.name}</div>
              <div className="cat-bar-wrap"><div className="cat-bar" style={{width:`${Math.min(100,(c.total/expense)*100)}%`}} /></div>
              <div className="cat-total">{fmt(c.total)}</div>
            </div>
          ))}
        </div>
      </>}

      <h4 className="sub-title">Entries</h4>
      <div className="card">
        {monthEntries.length === 0 ? <div className="empty">No entries for this month</div>
          : [...monthEntries].sort((a,b) => new Date(b.entry_date)-new Date(a.entry_date)).map(e => {
          const cat = categories.find(c => c.id === e.category_id)
          return (
            <div key={e.id} className="txn-row">
              <div className={`txn-icon ${e.type==='income'?'deposit':'withdraw'}`}><Icon d={e.type==='income'?Icons.plus:Icons.minus} size={14} /></div>
              <div className="txn-info">
                <div className="txn-type">{cat ? cat.name : e.type==='income'?'Income':'Expense'}</div>
                <div className="txn-meta">{fmtDate(e.entry_date)}{e.note?` · ${e.note}`:''}</div>
              </div>
              <div className={`txn-amount ${e.type==='income'?'deposit':'withdraw'}`}>{e.type==='income'?'+':'-'}{fmt(e.amount)}</div>
              <button className="btn-icon sm" onClick={() => deleteEntry(e.id)}><Icon d={Icons.trash} size={13} /></button>
            </div>
          )
        })}
      </div>

      {showAdd && (
        <Modal title="Add Entry" onClose={() => { setShowAdd(false); setErr('') }}>
          <div className="modal-body">
            <div className="field"><label>Type</label>
              <div className="toggle-row">
                <button className={`toggle-btn ${form.type==='income'?'active success':''}`} onClick={() => setForm(f=>({...f,type:'income'}))}>Income</button>
                <button className={`toggle-btn ${form.type==='expense'?'active danger':''}`} onClick={() => setForm(f=>({...f,type:'expense'}))}>Expense</button>
              </div>
            </div>
            <div className="field"><label>Amount (Rs)</label><input type="number" placeholder="0" value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))} /></div>
            <div className="field"><label>Category</label>
              <select value={form.category_id} onChange={e=>setForm(f=>({...f,category_id:e.target.value}))}>
                <option value="">— No category —</option>
                {categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="field"><label>Date</label><input type="date" value={form.entry_date} onChange={e=>setForm(f=>({...f,entry_date:e.target.value}))} /></div>
            <div className="field"><label>Note (optional)</label><input type="text" placeholder="e.g. Grocery run" value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))} /></div>
            {err && <div className="form-err">{err}</div>}
            <button className="btn-primary full" onClick={addEntry} disabled={loading}>{loading?'Saving...':'Save'}</button>
          </div>
        </Modal>
      )}

      {showCat && (
        <Modal title="Manage Categories" onClose={() => { setShowCat(false); setErr('') }}>
          <div className="modal-body">
            <div className="field" style={{display:'flex',gap:'8px'}}>
              <input type="text" placeholder="Category name" value={catForm.name} onChange={e=>setCatForm({name:e.target.value})} style={{flex:1}} onKeyDown={e=>e.key==='Enter'&&addCategory()} />
              <button className="btn-primary" onClick={addCategory} disabled={loading}>Add</button>
            </div>
            {err && <div className="form-err">{err}</div>}
            <div style={{marginTop:'8px'}}>
              {categories.length===0?<div className="empty">No categories yet</div>:categories.map(c=>(
                <div key={c.id} className="ledger-row">
                  <div className="ledger-name" style={{flex:1}}>{c.name}</div>
                  <button className="btn-icon sm" onClick={()=>deleteCategory(c.id)}><Icon d={Icons.trash} size={13} /></button>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

// REPORT
function Report({ people, transactions, ledger, ledgerTxns, entries, categories }) {
  const [month, setMonth] = useState(new Date().toISOString().slice(0,7))

  const getRemaining = (entry) => {
    const txns = ledgerTxns.filter(lt => lt.ledger_id === entry.id)
    const added = txns.filter(lt => lt.type === 'added').reduce((s, lt) => s + Number(lt.amount), 0)
    const paid = txns.filter(lt => lt.type === 'paid').reduce((s, lt) => s + Number(lt.amount), 0)
    return Number(entry.amount) + added - paid
  }

  const monthEntries = entries.filter(e => e.entry_date && e.entry_date.slice(0,7) === month)
  const income = monthEntries.filter(e => e.type === 'income').reduce((s,e) => s + Number(e.amount), 0)
  const expense = monthEntries.filter(e => e.type === 'expense').reduce((s,e) => s + Number(e.amount), 0)

  const walletTxns = transactions.filter(t => {
    const d = new Date(t.created_at)
    const m = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
    return m === month
  })
  const deposits = walletTxns.filter(t => t.type === 'deposit').reduce((s,t) => s + Number(t.amount), 0)
  const withdrawals = walletTxns.filter(t => t.type === 'withdraw').reduce((s,t) => s + Number(t.amount), 0)

  const totalWallet = people.reduce((sum, p) => {
    return sum + transactions.filter(t => t.person_id === p.id)
      .reduce((s, t) => t.type === 'deposit' ? s + Number(t.amount) : s - Number(t.amount), 0)
  }, 0)

  const pendingReceive = ledger.filter(l => l.type === 'owed' && l.status !== 'done').reduce((s,l) => s + Math.max(0, getRemaining(l)), 0)
  const pendingPay = ledger.filter(l => l.type === 'owe' && l.status !== 'done').reduce((s,l) => s + Math.max(0, getRemaining(l)), 0)

  const catTotals = categories.map(c => ({
    ...c, total: monthEntries.filter(e => e.category_id === c.id && e.type === 'expense').reduce((s,e) => s + Number(e.amount), 0)
  })).filter(c => c.total > 0).sort((a,b) => b.total - a.total)

  const handlePrint = () => window.print()

  return (
    <div className="section" id="report-section">
      <div className="section-header">
        <h2 className="section-title">Monthly Report</h2>
        <button className="btn-primary sm" onClick={handlePrint}>
          <Icon d={Icons.download} size={14} /> Print / Save PDF
        </button>
      </div>

      <input type="month" value={month} onChange={e => setMonth(e.target.value)} className="month-picker" />

      <div className="report-block">
        <h3 className="report-heading">Personal Finance</h3>
        <div className="stat-grid">
          <div className="stat-card success"><div className="stat-label">Income</div><div className="stat-val">{fmt(income)}</div></div>
          <div className="stat-card danger"><div className="stat-label">Expenses</div><div className="stat-val">{fmt(expense)}</div></div>
          <div className="stat-card"><div className="stat-label">Net Saving</div><div className={`stat-val ${income-expense >= 0 ? 'success-text':'danger-text'}`}>{fmt(income-expense)}</div></div>
        </div>
        {catTotals.length > 0 && <>
          <h4 className="sub-title" style={{marginTop:'12px'}}>By Category</h4>
          <div className="card">
            {catTotals.map(c => (
              <div key={c.id} className="cat-row">
                <div className="cat-name">{c.name}</div>
                <div className="cat-bar-wrap"><div className="cat-bar" style={{width:`${Math.min(100,(c.total/expense)*100)}%`}} /></div>
                <div className="cat-total">{fmt(c.total)}</div>
              </div>
            ))}
          </div>
        </>}
      </div>

      <div className="report-block">
        <h3 className="report-heading">Wallet Activity</h3>
        <div className="stat-grid">
          <div className="stat-card success"><div className="stat-label">Deposits</div><div className="stat-val">{fmt(deposits)}</div></div>
          <div className="stat-card danger"><div className="stat-label">Withdrawals</div><div className="stat-val">{fmt(withdrawals)}</div></div>
          <div className="stat-card"><div className="stat-label">Total Wallet</div><div className="stat-val">{fmt(totalWallet)}</div></div>
        </div>
        {walletTxns.length > 0 && <>
          <h4 className="sub-title" style={{marginTop:'12px'}}>Transactions</h4>
          <div className="card">
            {walletTxns.sort((a,b) => new Date(b.created_at)-new Date(a.created_at)).map(t => {
              const person = people.find(p => p.id === t.person_id)
              return (
                <div key={t.id} className="txn-row">
                  <div className={`txn-icon ${t.type}`}><Icon d={t.type==='deposit'?Icons.plus:Icons.minus} size={14} /></div>
                  <div className="txn-info">
                    <div className="txn-type">{person?.name || 'Unknown'}</div>
                    <div className="txn-meta">{fmtDate(t.created_at)}{t.note?` · ${t.note}`:''}</div>
                  </div>
                  <div className={`txn-amount ${t.type}`}>{t.type==='deposit'?'+':'-'}{fmt(t.amount)}</div>
                </div>
              )
            })}
          </div>
        </>}
      </div>

      <div className="report-block">
        <h3 className="report-heading">Ledger Summary</h3>
        <div className="stat-grid">
          <div className="stat-card success"><div className="stat-label">To Receive</div><div className="stat-val">{fmt(pendingReceive)}</div></div>
          <div className="stat-card danger"><div className="stat-label">To Pay</div><div className="stat-val">{fmt(pendingPay)}</div></div>
        </div>
      </div>
    </div>
  )
}

// SETTINGS
function Settings({ dark, setDark, onLogout }) {
  const [showAdminPin, setShowAdminPin] = useState(false)
  const [adminPinForm, setAdminPinForm] = useState({ current: '', newPin: '', confirm: '' })
  const [err, setErr] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  // Admin PIN is stored in code — we store a custom one in supabase settings table if user changes it
  const changeAdminPin = async () => {
    if (adminPinForm.current !== ADMIN_PIN) { setErr('Current PIN is incorrect'); return }
    if (adminPinForm.newPin.length !== 4 || !/^\d+$/.test(adminPinForm.newPin)) { setErr('New PIN must be 4 digits'); return }
    if (adminPinForm.newPin !== adminPinForm.confirm) { setErr('PINs do not match'); return }
    setLoading(true)
    // Store in supabase as a settings row
    await supabase.from('app_settings').upsert({ key: 'admin_pin', value: adminPinForm.newPin }, { onConflict: 'key' })
    setErr(''); setSuccess('Admin PIN updated! Please note the new PIN.'); setLoading(false)
    setAdminPinForm({ current: '', newPin: '', confirm: '' })
    setTimeout(() => { setSuccess(''); setShowAdminPin(false) }, 3000)
  }

  return (
    <div className="section">
      <h2 className="section-title">Settings</h2>

      <h4 className="sub-title">Appearance</h4>
      <div className="card" style={{marginBottom:'20px'}}>
        <div className="settings-row">
          <div>
            <div className="settings-label">Dark Mode</div>
            <div className="settings-sub">Switch between light and dark theme</div>
          </div>
          <button className={`toggle-switch ${dark ? 'on' : ''}`} onClick={() => setDark(d => !d)}>
            <div className="toggle-knob" />
          </button>
        </div>
      </div>

      <h4 className="sub-title">Security</h4>
      <div className="card" style={{marginBottom:'20px'}}>
        <div className="settings-row" style={{cursor:'pointer'}} onClick={() => setShowAdminPin(!showAdminPin)}>
          <div>
            <div className="settings-label">Change Admin PIN</div>
            <div className="settings-sub">Update your 4-digit admin PIN</div>
          </div>
          <Icon d={Icons.arrow} size={16} />
        </div>
        {showAdminPin && (
          <div style={{padding:'12px 0', borderTop:'1px solid var(--border)', display:'flex', flexDirection:'column', gap:'12px'}}>
            <div className="field"><label>Current PIN</label>
              <input type="password" maxLength={4} placeholder="Current 4-digit PIN" value={adminPinForm.current} onChange={e => setAdminPinForm(f => ({...f, current: e.target.value}))} />
            </div>
            <div className="field"><label>New PIN</label>
              <input type="password" maxLength={4} placeholder="New 4-digit PIN" value={adminPinForm.newPin} onChange={e => setAdminPinForm(f => ({...f, newPin: e.target.value}))} />
            </div>
            <div className="field"><label>Confirm New PIN</label>
              <input type="password" maxLength={4} placeholder="Repeat new PIN" value={adminPinForm.confirm} onChange={e => setAdminPinForm(f => ({...f, confirm: e.target.value}))} />
            </div>
            {err && <div className="form-err">{err}</div>}
            {success && <div className="form-success">{success}</div>}
            <button className="btn-primary" onClick={changeAdminPin} disabled={loading}>{loading ? 'Saving...' : 'Update PIN'}</button>
          </div>
        )}
      </div>

      <h4 className="sub-title">Account</h4>
      <div className="card">
        <div className="settings-row" style={{cursor:'pointer'}} onClick={onLogout}>
          <div>
            <div className="settings-label" style={{color:'var(--red)'}}>Logout</div>
            <div className="settings-sub">Sign out of admin panel</div>
          </div>
          <Icon d={Icons.logout} size={16} />
        </div>
      </div>
    </div>
  )
}

// MAIN APP
export default function App() {
  const [auth, setAuth] = useState(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')
  const [data, setData] = useState({ people: [], transactions: [], ledger: [], ledgerTxns: [], personal: [], categories: [] })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const [p, t, l, lt, pe, c] = await Promise.all([
      supabase.from('people').select('*').order('created_at'),
      supabase.from('transactions').select('*').order('created_at', { ascending: false }),
      supabase.from('ledger').select('*').order('created_at', { ascending: false }),
      supabase.from('ledger_transactions').select('*').order('created_at', { ascending: false }),
      supabase.from('personal_entries').select('*').order('entry_date', { ascending: false }),
      supabase.from('categories').select('*').order('name'),
    ])
    setData({ people: p.data||[], transactions: t.data||[], ledger: l.data||[], ledgerTxns: lt.data||[], personal: pe.data||[], categories: c.data||[] })
    setLoading(false)
  }, [])

  useEffect(() => { if (auth === 'admin') fetchAll() }, [auth, fetchAll])

  if (!auth) return <LoginScreen onAdminLogin={() => setAuth('admin')} onUserLogin={(u) => setAuth(u)} />
  if (auth !== 'admin') return <UserView user={auth} onLogout={() => setAuth(null)} />

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon sm">W</div>
          <span>Wallet</span>
        </div>
        <nav className="sidebar-nav">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Icons.dashboard },
            { id: 'wallet', label: 'Wallet', icon: Icons.wallet },
            { id: 'ledger', label: 'Ledger', icon: Icons.ledger },
            { id: 'personal', label: 'Personal', icon: Icons.personal },
            { id: 'report', label: 'Report', icon: Icons.report },
            { id: 'settings', label: 'Settings', icon: Icons.settings },
          ].map(item => (
            <button key={item.id} className={`nav-item ${activeTab === item.id ? 'active' : ''}`} onClick={() => setActiveTab(item.id)}>
              <Icon d={item.icon} size={18} /><span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button className="nav-item logout" onClick={() => setAuth(null)}>
            <Icon d={Icons.logout} size={18} /><span>Logout</span>
          </button>
        </div>
      </aside>
      <main className="main">
        {loading && <div className="loading-bar" />}
        {activeTab === 'dashboard' && <Dashboard people={data.people} transactions={data.transactions} ledger={data.ledger} ledgerTxns={data.ledgerTxns} personalEntries={data.personal} />}
        {activeTab === 'wallet' && <Wallet people={data.people} transactions={data.transactions} onRefresh={fetchAll} />}
        {activeTab === 'ledger' && <Ledger ledger={data.ledger} ledgerTxns={data.ledgerTxns} onRefresh={fetchAll} />}
        {activeTab === 'personal' && <Personal entries={data.personal} categories={data.categories} onRefresh={fetchAll} />}
        {activeTab === 'report' && <Report people={data.people} transactions={data.transactions} ledger={data.ledger} ledgerTxns={data.ledgerTxns} entries={data.personal} categories={data.categories} />}
        {activeTab === 'settings' && <Settings dark={dark} setDark={setDark} onLogout={() => setAuth(null)} />}
      </main>
      <nav className="bottom-nav">
        {[
          { id: 'dashboard', label: 'Home', icon: Icons.dashboard },
          { id: 'wallet', label: 'Wallet', icon: Icons.wallet },
          { id: 'ledger', label: 'Ledger', icon: Icons.ledger },
          { id: 'personal', label: 'Personal', icon: Icons.personal },
          { id: 'report', label: 'Report', icon: Icons.report },
          { id: 'settings', label: 'Settings', icon: Icons.settings },
        ].map(item => (
          <button key={item.id} className={`bottom-nav-item ${activeTab === item.id ? 'active' : ''}`} onClick={() => setActiveTab(item.id)}>
            <Icon d={item.icon} size={20} /><span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
