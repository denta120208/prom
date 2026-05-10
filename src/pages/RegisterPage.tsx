import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Ticket, Send, User, Users, PartyPopper } from 'lucide-react'
import { supabase } from '../lib/supabase'

const PACKAGES = {
  single: { count: 1, price: 85000, label: 'Single', icon: User, desc: '1 Person' },
  couple: { count: 2, price: 160000, label: 'Couple', icon: Users, desc: '2 People' },
  squad:  { count: 4, price: 300000, label: 'Squad', icon: PartyPopper, desc: '4 People' },
} as const

type PackageKey = keyof typeof PACKAGES

export default function RegisterPage() {
  const navigate = useNavigate()
  const [ticketType, setTicketType] = useState<PackageKey>('single')
  const [ticketCount, setTicketCount] = useState(1)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [holderNames, setHolderNames] = useState<string[]>([''])
  const [loading, setLoading] = useState(false)

  const pkg = PACKAGES[ticketType]
  const totalAmount = pkg.price

  const selectPackage = (type: PackageKey) => {
    setTicketType(type)
    setTicketCount(PACKAGES[type].count)
    setHolderNames(Array(PACKAGES[type].count).fill(''))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !whatsapp) return

    const filledHolders = holderNames.map((h, i) => h.trim() || (ticketCount > 1 ? `${name} - Tiket ${i + 1}` : name))
    if (filledHolders.some(h => !h)) {
      alert('Isi nama pemilik untuk semua tiket')
      return
    }

    setLoading(true)

    const { data, error } = await supabase
      .from('registrations')
      .insert({
        name,
        email,
        whatsapp,
        ticket_type: ticketType,
        ticket_count: ticketCount,
        total_amount: totalAmount,
        holder_names: filledHolders,
        status: 'menunggu',
      })
      .select()
      .single()

    setLoading(false)

    if (error) {
      alert('Gagal menyimpan data: ' + error.message)
      return
    }

    navigate('/upload-bukti', { state: { registrationId: data.id } })
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white px-4 py-8">
      <div className="max-w-lg mx-auto">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-white/60 hover:text-[#D4AF37] transition-colors mb-8"
        >
          <ArrowLeft size={20} />
          <span>Kembali</span>
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-serif text-3xl md:text-4xl gold-text-gradient mb-2">
            Ticket Registration
          </h1>
          <p className="text-white/50 text-sm">
            Fill in your details to order tickets
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Package Selection */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-3"
          >
            <label className="block text-white/70 text-sm mb-3">Choose Ticket Package</label>
            <div className="grid grid-cols-3 gap-3">
              {(['single', 'couple', 'squad'] as PackageKey[]).map((key) => {
                const p = PACKAGES[key]
                const Icon = p.icon
                const isActive = ticketType === key
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => selectPackage(key)}
                    className={`relative rounded-xl p-4 border transition-all duration-200 text-left ${
                      isActive
                        ? 'border-[#D4AF37] bg-[#D4AF37]/10 shadow-[0_0_20px_rgba(212,175,55,0.15)]'
                        : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#D4AF37] rounded-full flex items-center justify-center">
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1.5" stroke="#050505" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                    )}
                    <Icon size={20} className={isActive ? 'text-[#D4AF37]' : 'text-white/40'} />
                    <p className="text-white font-semibold text-sm mt-2">{p.label}</p>
                    <p className="text-white/40 text-xs">{p.desc}</p>
                    <p className="text-[#D4AF37] font-semibold text-sm mt-1">Rp {p.price.toLocaleString('id-ID')}</p>
                  </button>
                )
              })}
            </div>
          </motion.div>

          {/* Name */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <label className="block text-white/70 text-sm mb-2">Full Name (PIC)</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full"
            />
          </motion.div>

          {/* Email */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label className="block text-white/70 text-sm mb-2">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="w-full"
            />
          </motion.div>

          {/* WhatsApp */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <label className="block text-white/70 text-sm mb-2">WhatsApp Number</label>
            <input
              type="tel"
              required
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="081234567890"
              className="w-full"
            />
          </motion.div>

          {/* Ticket Holder Names */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <label className="block text-white/70 text-sm">
              {ticketType === 'single' ? 'Ticket Holder Name' : 'Ticket Holder Names'}
              <span className="text-[#D4AF37] text-xs ml-2">
                {ticketType === 'single' ? '(1 name required)' : `(${pkg.count} names required)`}
              </span>
            </label>
            {holderNames.map((h, i) => (
              <div key={i}>
                <div className="flex items-center gap-2 mb-1">
                  <Ticket size={14} className="text-[#D4AF37]" />
                  <span className="text-white/50 text-xs">
                    {pkg.count === 1 ? 'Ticket Holder' : `Ticket ${i + 1}`}
                  </span>
                </div>
                <input
                  type="text"
                  value={h}
                  required
                  onChange={(e) => {
                    const next = [...holderNames]
                    next[i] = e.target.value
                    setHolderNames(next)
                  }}
                  placeholder={ticketType === 'single' ? 'Full name' : `Ticket holder name ${i + 1}`}
                  className="w-full text-sm"
                />
              </div>
            ))}
          </motion.div>

          {/* Total */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card rounded-xl p-5"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-white/60 text-sm capitalize">{pkg.label} Package — {pkg.desc}</span>
            </div>
            <div className="border-t border-white/10 pt-3 flex justify-between items-center">
              <span className="text-white/70">Total Payment</span>
              <span className="font-serif text-2xl gold-text-gradient">
                Rp {totalAmount.toLocaleString('id-ID')}
              </span>
            </div>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full gold-gradient text-[#050505] font-bold text-lg py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Menyimpan...' : (
              <>
                <Send size={20} />
                Continue to Payment
              </>
            )}
          </motion.button>
        </form>
      </div>
    </div>
  )
}
