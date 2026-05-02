import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { supabase, type Registration } from '../lib/supabase'

export default function StatusPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const registrationId = location.state?.registrationId

  const [registration, setRegistration] = useState<Registration | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!registrationId) return

    const fetchData = async () => {
      const { data } = await supabase
        .from('registrations')
        .select('*')
        .eq('id', registrationId)
        .single()

      if (data) setRegistration(data)
      setLoading(false)
    }

    fetchData()

    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [registrationId])

  if (!registrationId) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/60 mb-4">Data tidak ditemukan</p>
          <button
            onClick={() => navigate('/')}
            className="gold-gradient text-[#050505] font-bold px-6 py-3 rounded-full"
          >
            Ke Beranda
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
      </div>
    )
  }

  if (!registration) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <p className="text-white/60">Data registrasi tidak ditemukan</p>
      </div>
    )
  }

  const statusConfig = {
    menunggu: {
      icon: Clock,
      color: 'text-yellow-400',
      bg: 'bg-yellow-400/10',
      border: 'border-yellow-400/30',
      title: 'Menunggu Verifikasi',
      desc: 'Admin sedang memverifikasi pembayaran Anda. Mohon tunggu.',
    },
    diterima: {
      icon: CheckCircle,
      color: 'text-green-400',
      bg: 'bg-green-400/10',
      border: 'border-green-400/30',
      title: 'Pembayaran Diterima',
      desc: 'Tiket digital akan dikirim ke email Anda segera.',
    },
    ditolak: {
      icon: XCircle,
      color: 'text-red-400',
      bg: 'bg-red-400/10',
      border: 'border-red-400/30',
      title: 'Pembayaran Ditolak',
      desc: 'Bukti pembayaran tidak valid. Silakan hubungi admin.',
    },
  }

  const status = statusConfig[registration.status]
  const StatusIcon = status.icon

  return (
    <div className="min-h-screen bg-[#050505] text-white px-4 py-8">
      <div className="max-w-lg mx-auto">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-white/60 hover:text-[#D4AF37] transition-colors mb-8"
        >
          <ArrowLeft size={20} />
          <span>Kembali ke Beranda</span>
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="font-serif text-3xl md:text-4xl gold-text-gradient mb-2">
            Status Registrasi
          </h1>
          <p className="text-white/50 text-sm">
            Pantau status pembayaran dan tiket Anda
          </p>
        </motion.div>

        {/* Status Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className={`glass-card rounded-2xl p-8 text-center mb-6 ${status.border}`}
        >
          <div className={`w-20 h-20 rounded-full ${status.bg} flex items-center justify-center mx-auto mb-4`}>
            <StatusIcon size={40} className={status.color} />
          </div>
          <h2 className={`font-serif text-2xl ${status.color} mb-2`}>
            {status.title}
          </h2>
          <p className="text-white/60 text-sm">{status.desc}</p>
        </motion.div>

        {/* Registration Details */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-xl p-6"
        >
          <h3 className="font-serif text-lg text-[#D4AF37] mb-4">Detail Registrasi</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between gap-2">
              <span className="text-white/50 shrink-0">Nama</span>
              <span className="text-white text-right">{registration.name}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-white/50 shrink-0">Email</span>
              <span className="text-white text-right break-all">{registration.email}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-white/50 shrink-0">WhatsApp</span>
              <span className="text-white text-right">{registration.whatsapp}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-white/50 shrink-0">Jumlah Tiket</span>
              <span className="text-white">{registration.ticket_count}</span>
            </div>
            <div className="border-t border-white/10 pt-3 flex justify-between gap-2">
              <span className="text-white/50 shrink-0">Total</span>
              <span className="font-serif text-lg gold-text-gradient">
                Rp {registration.total_amount.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </motion.div>

        <p className="text-center text-white/30 text-xs mt-6">
          Halaman ini diperbarui otomatis setiap 5 detik
        </p>
      </div>
    </div>
  )
}
