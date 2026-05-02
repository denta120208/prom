import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Lock, CheckCircle, XCircle, Send,
  Loader2, Search, Filter, QrCode, Eye, User, Mail, Phone,
  Image, X,
} from 'lucide-react'
import { supabase, type Registration, type Ticket } from '../lib/supabase'
import { QRCodeSVG } from 'qrcode.react'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [session, setSession] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [tickets, setTickets] = useState<Record<string, Ticket[]>>({})
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'menunggu' | 'diterima' | 'ditolak'>('all')
  const [search, setSearch] = useState('')

  const [selectedReg, setSelectedReg] = useState<Registration | null>(null)
  const [showTickets, setShowTickets] = useState(false)
  const [showQR, setShowQR] = useState<string | null>(null)
  const [showProof, setShowProof] = useState<string | null>(null)
  const [proofZoom, setProofZoom] = useState(1)
  const [proofPan, setProofPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) return
    fetchRegistrations()
  }, [session])

  const fetchRegistrations = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('registrations')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) setRegistrations(data)
    setLoading(false)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoginLoading(false)
    if (error) alert('Login gagal: ' + error.message)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const updateStatus = async (id: string, status: 'diterima' | 'ditolak') => {
    const { error } = await supabase
      .from('registrations')
      .update({ status })
      .eq('id', id)

    if (error) {
      alert('Gagal: ' + error.message)
      return
    }

    setRegistrations(prev =>
      prev.map(r => r.id === id ? { ...r, status } : r)
    )
  }

  const sendBarcode = async (reg: Registration) => {
    if (!confirm(`Kirim ${reg.ticket_count} barcode ke ${reg.email}?`)) return

    setLoading(true)

    const existing = await supabase
      .from('tickets')
      .select('*')
      .eq('registration_id', reg.id)

    let ticketsToSend: Ticket[] = []

    if (existing.data && existing.data.length > 0) {
      ticketsToSend = existing.data
    } else {
      const generated: Ticket[] = []
      for (let i = 0; i < reg.ticket_count; i++) {
        const barcode = `PROM2026-${reg.id.slice(0, 8)}-${String(i + 1).padStart(3, '0')}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
        const holderName = reg.ticket_count > 1 ? `${reg.name} - Tiket ${i + 1}` : reg.name

        const { data, error } = await supabase
          .from('tickets')
          .insert({
            registration_id: reg.id,
            barcode,
            holder_name: holderName,
            email: reg.email,
            used: false,
          })
          .select()
          .single()

        if (!error && data) generated.push(data)
      }
      ticketsToSend = generated
    }

    setTickets(prev => ({ ...prev, [reg.id]: ticketsToSend }))
    setSelectedReg(reg)
    setShowTickets(true)

    // Send email via Edge Function
    try {
      const { data, error: fnError } = await supabase.functions.invoke('send-barcode', {
        body: {
          to: reg.email,
          name: reg.name,
          tickets: ticketsToSend.map(t => ({ barcode: t.barcode, holder_name: t.holder_name })),
        },
      })

      if (fnError) {
        alert(`⚠️ Tiket digenerate tapi gagal kirim email: ${fnError.message}`)
      } else if (data?.success) {
        alert(`✅ Tiket berhasil dikirim ke ${reg.email}`)
      } else {
        alert(`⚠️ Tiket digenerate tapi gagal kirim email: ${data?.error || 'Unknown error'}`)
      }
    } catch (err) {
      alert(`⚠️ Tiket digenerate tapi gagal kirim email. Cek koneksi.`)
    }

    setLoading(false)
  }

  const viewTickets = async (reg: Registration) => {
    setLoading(true)
    const { data } = await supabase
      .from('tickets')
      .select('*')
      .eq('registration_id', reg.id)

    if (data) setTickets(prev => ({ ...prev, [reg.id]: data }))
    setSelectedReg(reg)
    setShowTickets(true)
    setLoading(false)
  }

  const filtered = registrations.filter(r => {
    if (filter !== 'all' && r.status !== filter) return false
    if (search) {
      const s = search.toLowerCase()
      return r.name.toLowerCase().includes(s) || r.email.toLowerCase().includes(s) || r.whatsapp.includes(s)
    }
    return true
  })

  const statusBadge = (status: string) => {
    const map: Record<string, { text: string; color: string; bg: string }> = {
      menunggu: { text: 'Menunggu', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
      diterima: { text: 'Diterima', color: 'text-green-400', bg: 'bg-green-400/10' },
      ditolak: { text: 'Ditolak', color: 'text-red-400', bg: 'bg-red-400/10' },
    }
    const s = map[status] || map.menunggu
    return <span className={`text-xs px-2 py-1 rounded-full ${s.bg} ${s.color}`}>{s.text}</span>
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <div className="text-center mb-8">
            <Lock size={48} className="text-[#D4AF37] mx-auto mb-4" />
            <h1 className="font-serif text-3xl gold-text-gradient">Admin Login</h1>
            <p className="text-white/50 text-sm mt-2">Dashboard Manajemen Prom Night</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-white/70 text-sm mb-2">Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full" />
            </div>
            <div>
              <label className="block text-white/70 text-sm mb-2">Password</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full" />
            </div>
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full gold-gradient text-[#050505] font-bold py-3 rounded-xl disabled:opacity-50"
            >
              {loginLoading ? 'Masuk...' : 'Masuk'}
            </button>
          </form>

          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-white/40 hover:text-white/60 text-sm mt-6 mx-auto"
          >
            <ArrowLeft size={16} />
            Kembali ke Beranda
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white px-4 py-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-2xl md:text-3xl gold-text-gradient">Admin Dashboard</h1>
            <p className="text-white/50 text-sm">Kelola registrasi dan tiket Prom Night</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/scan')}
              className="flex items-center gap-2 bg-[#111] border border-[#1F1F1F] hover:border-[#D4AF37] text-white/70 hover:text-[#D4AF37] px-4 py-2 rounded-lg transition-colors text-sm"
            >
              <QrCode size={16} />
              Scan
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500/10 text-red-400 hover:bg-red-500/20 px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Keluar
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total', count: registrations.length, color: 'text-white' },
            { label: 'Menunggu', count: registrations.filter(r => r.status === 'menunggu').length, color: 'text-yellow-400' },
            { label: 'Diterima', count: registrations.filter(r => r.status === 'diterima').length, color: 'text-green-400' },
            { label: 'Ditolak', count: registrations.filter(r => r.status === 'ditolak').length, color: 'text-red-400' },
          ].map((s, i) => (
            <div key={i} className="glass-card rounded-xl p-4 text-center">
              <p className={`font-serif text-2xl ${s.color}`}>{s.count}</p>
              <p className="text-white/50 text-xs">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              placeholder="Cari nama, email, atau WhatsApp..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={16} className="text-white/30" />
            {(['all', 'menunggu', 'diterima', 'ditolak'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs capitalize transition-colors ${
                  filter === f ? 'bg-[#D4AF37] text-[#050505] font-semibold' : 'bg-[#111] text-white/50 hover:text-white'
                }`}
              >
                {f === 'all' ? 'Semua' : f}
              </button>
            ))}
          </div>
        </div>

        {/* Registrations List */}
        <div className="space-y-3">
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 size={32} className="text-[#D4AF37] animate-spin mx-auto" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="glass-card rounded-xl p-12 text-center text-white/40">Tidak ada data</div>
          ) : (
            filtered.map(reg => (
              <div key={reg.id} className="glass-card rounded-xl p-4">
                {/* Top row: Name + Status */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <User size={16} className="text-[#D4AF37] shrink-0" />
                    <div className="min-w-0">
                      <p className="text-white font-medium text-sm truncate">{reg.name}</p>
                      <p className="text-white/40 text-xs truncate">{reg.email}</p>
                    </div>
                  </div>
                  <div className="shrink-0 ml-2">{statusBadge(reg.status)}</div>
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs mb-3">
                  <div>
                    <p className="text-white/40">WhatsApp</p>
                    <p className="text-white/70 truncate">{reg.whatsapp}</p>
                  </div>
                  <div>
                    <p className="text-white/40">Tiket</p>
                    <p className="text-white/70">{reg.ticket_count}</p>
                  </div>
                  <div>
                    <p className="text-white/40">Total</p>
                    <p className="text-[#D4AF37] font-medium">Rp {reg.total_amount.toLocaleString('id-ID')}</p>
                  </div>
                  <div>
                    <p className="text-white/40">Bukti</p>
                    {reg.payment_proof_url ? (
                      <button
                        onClick={() => { setShowProof(reg.payment_proof_url); setProofZoom(1); setProofPan({ x: 0, y: 0 }) }}
                        className="flex items-center gap-1 text-[#D4AF37] hover:underline"
                      >
                        <Image size={12} />
                        Lihat
                      </button>
                    ) : (
                      <span className="text-white/30">Belum ada</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-1 pt-3 border-t border-white/5">
                  {reg.status === 'menunggu' && (
                    <>
                      <button
                        onClick={() => updateStatus(reg.id, 'diterima')}
                        className="p-2 rounded-lg bg-green-400/10 text-green-400 hover:bg-green-400/20 transition-colors"
                        title="Terima"
                      >
                        <CheckCircle size={18} />
                      </button>
                      <button
                        onClick={() => updateStatus(reg.id, 'ditolak')}
                        className="p-2 rounded-lg bg-red-400/10 text-red-400 hover:bg-red-400/20 transition-colors"
                        title="Tolak"
                      >
                        <XCircle size={18} />
                      </button>
                    </>
                  )}
                  {reg.status === 'diterima' && (
                    <button
                      onClick={() => sendBarcode(reg)}
                      className="p-2 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] hover:bg-[#D4AF37]/20 transition-colors flex items-center gap-1"
                      title="Kirim Barcode"
                    >
                      <Send size={16} />
                      <span className="text-xs">Kirim</span>
                    </button>
                  )}
                  <button
                    onClick={() => viewTickets(reg)}
                    className="p-2 rounded-lg bg-white/5 text-white/50 hover:text-white/80 transition-colors"
                    title="Lihat Tiket"
                  >
                    <Eye size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Tickets Modal */}
      <AnimatePresence>
        {showTickets && selectedReg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4"
            onClick={() => setShowTickets(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#0A0A0A] border border-[#D4AF37]/20 rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
            >
              <h2 className="font-serif text-xl gold-text-gradient mb-1">
                Tiket Digital
              </h2>
              <p className="text-white/50 text-sm mb-6">
                {selectedReg.name} — {selectedReg.ticket_count} tiket
              </p>

              <div className="space-y-4">
                {(tickets[selectedReg.id] || []).map((ticket) => (
                  <div key={ticket.id} className="glass-card rounded-xl p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-white font-medium text-sm">{ticket.holder_name}</p>
                        <p className="text-white/40 text-xs font-mono mt-1">{ticket.barcode}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        ticket.used ? 'bg-red-400/10 text-red-400' : 'bg-green-400/10 text-green-400'
                      }`}>
                        {ticket.used ? 'Digunakan' : 'Aktif'}
                      </span>
                    </div>
                    <button
                      onClick={() => setShowQR(ticket.barcode)}
                      className="w-full py-2 bg-[#111] border border-[#1F1F1F] hover:border-[#D4AF37] rounded-lg text-xs text-[#D4AF37] flex items-center justify-center gap-2 transition-colors"
                    >
                      <QrCode size={14} />
                      Lihat QR Code
                    </button>
                  </div>
                ))}

                {(!tickets[selectedReg.id] || tickets[selectedReg.id].length === 0) && (
                  <p className="text-center text-white/40 py-8">Belum ada tiket yang digenerate</p>
                )}
              </div>

              <button
                onClick={() => setShowTickets(false)}
                className="w-full mt-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm transition-colors"
              >
                Tutup
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR Modal */}
      <AnimatePresence>
        {showQR && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center px-4"
            onClick={() => setShowQR(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl p-8 text-center"
            >
              <QRCodeSVG value={showQR} size={240} />
              <p className="text-[#050505] font-mono text-sm mt-4 break-all max-w-[240px]">{showQR}</p>
              <button
                onClick={() => setShowQR(null)}
                className="mt-4 text-[#050505]/60 text-sm hover:text-[#050505]"
              >
                Tutup
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Proof Modal */}
      <AnimatePresence>
        {showProof && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-[70] flex flex-col"
          >
            {/* Top bar */}
            <div className="flex items-center justify-between p-4 shrink-0">
              <span className="text-white/60 text-sm">Bukti Pembayaran</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setProofZoom(z => Math.max(0.5, z - 0.25)); setProofPan({ x: 0, y: 0 }) }}
                  className="w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center text-lg font-bold hover:bg-white/20"
                >
                  −
                </button>
                <span className="text-white/60 text-xs min-w-[3rem] text-center">{Math.round(proofZoom * 100)}%</span>
                <button
                  onClick={() => { setProofZoom(z => Math.min(4, z + 0.25)); setProofPan({ x: 0, y: 0 }) }}
                  className="w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center text-lg font-bold hover:bg-white/20"
                >
                  +
                </button>
                <button
                  onClick={() => { setProofZoom(1); setProofPan({ x: 0, y: 0 }) }}
                  className="text-white/50 text-xs hover:text-white"
                >
                  Reset
                </button>
                <button
                  onClick={() => { setShowProof(null); setProofZoom(1); setProofPan({ x: 0, y: 0 }) }}
                  className="text-white/60 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            {/* Image area */}
            <div
              className="flex-1 overflow-auto cursor-grab active:cursor-grabbing"
              onMouseDown={(e) => { setIsDragging(true); setDragStart({ x: e.clientX - proofPan.x, y: e.clientY - proofPan.y }) }}
              onMouseMove={(e) => { if (isDragging) setProofPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }) }}
              onMouseUp={() => setIsDragging(false)}
              onMouseLeave={() => setIsDragging(false)}
              onWheel={(e) => {
                e.preventDefault()
                setProofZoom(z => Math.min(4, Math.max(0.5, z - e.deltaY * 0.001)))
              }}
              onTouchStart={(e) => {
                if (e.touches.length === 1) {
                  setIsDragging(true)
                  setDragStart({ x: e.touches[0].clientX - proofPan.x, y: e.touches[0].clientY - proofPan.y })
                }
              }}
              onTouchMove={(e) => {
                if (isDragging && e.touches.length === 1) {
                  setProofPan({ x: e.touches[0].clientX - dragStart.x, y: e.touches[0].clientY - dragStart.y })
                }
                if (e.touches.length === 2) {
                  const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY)
                  setProofZoom(z => Math.min(4, Math.max(0.5, z * (dist > 0 ? 1.01 : 0.99))))
                }
              }}
              onTouchEnd={() => setIsDragging(false)}
              onClick={(e) => {
                if (proofZoom === 1 && !isDragging) {
                  setShowProof(null)
                  setProofZoom(1)
                  setProofPan({ x: 0, y: 0 })
                }
              }}
            >
              <div className="min-h-full min-w-full flex items-center justify-center p-4">
                <img
                  src={showProof}
                  alt="Bukti Pembayaran"
                  className="rounded-xl transition-transform"
                  style={{
                    transform: `scale(${proofZoom}) translate(${proofPan.x / proofZoom}px, ${proofPan.y / proofZoom}px)`,
                    transformOrigin: 'center center',
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.onerror = null
                    target.src = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22><rect fill=%22%23111%22 width=%22400%22 height=%22300%22/><text x=%22200%22 y=%22150%22 fill=%22%23666%22 text-anchor=%22middle%22>Gagal memuat gambar</text></svg>'
                  }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
