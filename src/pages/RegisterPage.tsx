import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Ticket, Minus, Plus, Send } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [ticketCount, setTicketCount] = useState(1)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [loading, setLoading] = useState(false)

  const totalAmount = ticketCount * 85000

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !whatsapp) return
    setLoading(true)

    const { data, error } = await supabase
      .from('registrations')
      .insert({
        name,
        email,
        whatsapp,
        ticket_count: ticketCount,
        total_amount: totalAmount,
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
            Registrasi Prom Night
          </h1>
          <p className="text-white/50 text-sm">
            Isi data diri untuk memesan tiket
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Ticket Count */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <label className="block text-white/70 text-sm mb-3">Jumlah Tiket</label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
                className="w-10 h-10 rounded-lg bg-[#111] border border-[#1F1F1F] flex items-center justify-center hover:border-[#D4AF37] transition-colors"
              >
                <Minus size={18} className="text-[#D4AF37]" />
              </button>
              <div className="flex items-center gap-2 text-xl font-semibold">
                <Ticket size={20} className="text-[#D4AF37]" />
                <span>{ticketCount}</span>
              </div>
              <button
                type="button"
                onClick={() => setTicketCount(Math.min(10, ticketCount + 1))}
                className="w-10 h-10 rounded-lg bg-[#111] border border-[#1F1F1F] flex items-center justify-center hover:border-[#D4AF37] transition-colors"
              >
                <Plus size={18} className="text-[#D4AF37]" />
              </button>
            </div>
          </motion.div>

          {/* Name */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <label className="block text-white/70 text-sm mb-2">Nama Lengkap</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masukkan nama lengkap"
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
            <label className="block text-white/70 text-sm mb-2">Nomor WhatsApp</label>
            <input
              type="tel"
              required
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="081234567890"
              className="w-full"
            />
          </motion.div>

          {/* Total */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card rounded-xl p-5"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-white/60 text-sm">{ticketCount} Tiket x Rp 85.000</span>
            </div>
            <div className="border-t border-white/10 pt-3 flex justify-between items-center">
              <span className="text-white/70">Total Pembayaran</span>
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
                Lanjutkan ke Pembayaran
              </>
            )}
          </motion.button>
        </form>
      </div>
    </div>
  )
}
