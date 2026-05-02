import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Upload, CreditCard, Send, Loader2, X } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function UploadPaymentPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const registrationId = location.state?.registrationId

  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (!registrationId) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/60 mb-4">Data registrasi tidak ditemukan</p>
          <button
            onClick={() => navigate('/daftar')}
            className="gold-gradient text-[#050505] font-bold px-6 py-3 rounded-full"
          >
            Daftar Ulang
          </button>
        </div>
      </div>
    )
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) {
      if (selected.size > 5 * 1024 * 1024) {
        alert('Ukuran file maksimal 5MB')
        return
      }
      setFile(selected)
      const reader = new FileReader()
      reader.onloadend = () => setPreview(reader.result as string)
      reader.readAsDataURL(selected)
    }
  }

  const handleUpload = async () => {
    if (!file) return
    setLoading(true)

    const fileExt = file.name.split('.').pop()
    const fileName = `${registrationId}_${Date.now()}.${fileExt}`
    const filePath = `payment-proofs/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('payments')
      .upload(filePath, file, { upsert: true })

    if (uploadError) {
      setLoading(false)
      alert('Gagal upload: ' + uploadError.message)
      return
    }

    const { data: urlData } = supabase.storage.from('payments').getPublicUrl(filePath)

    const { error: updateError } = await supabase
      .from('registrations')
      .update({ payment_proof_url: urlData.publicUrl })
      .eq('id', registrationId)

    setLoading(false)

    if (updateError) {
      alert('Gagal menyimpan: ' + updateError.message)
      return
    }

    navigate('/status', { state: { registrationId } })
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white px-4 py-8">
      <div className="max-w-lg mx-auto">
        <button
          onClick={() => navigate('/daftar')}
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
            Upload Bukti Pembayaran
          </h1>
          <p className="text-white/50 text-sm">
            Transfer ke rekening admin dan upload bukti pembayaran
          </p>
        </motion.div>

        {/* Payment Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-xl p-5 mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <CreditCard size={20} className="text-[#D4AF37]" />
            <span className="font-semibold text-[#D4AF37]">Informasi Pembayaran</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/50">Bank</span>
              <span className="text-white">Transfer (konfirmasi ke admin)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Status</span>
              <span className="text-yellow-400">Menunggu Pembayaran</span>
            </div>
          </div>
          <p className="text-white/40 text-xs mt-4">
            * Hubungi admin untuk detail rekening pembayaran
          </p>
        </motion.div>

        {/* Upload Area */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <label className="block text-white/70 text-sm mb-3">Bukti Pembayaran</label>
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              preview ? 'border-[#D4AF37]/50 bg-[#D4AF37]/5' : 'border-white/20 hover:border-[#D4AF37]/40'
            }`}
          >
            {preview ? (
              <div className="relative">
                <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
                <button
                  type="button"
                  onClick={() => { setFile(null); setPreview(null) }}
                  className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label className="cursor-pointer block">
                <Upload size={40} className="text-[#D4AF37] mx-auto mb-3" />
                <p className="text-white/60 text-sm">Klik atau drag file ke sini</p>
                <p className="text-white/30 text-xs mt-1">JPG, PNG, PDF (max 5MB)</p>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleUpload}
          disabled={!file || loading}
          className="w-full gold-gradient text-[#050505] font-bold text-lg py-4 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Mengupload...
            </>
          ) : (
            <>
              <Send size={20} />
              Kirim Bukti Pembayaran
            </>
          )}
        </motion.button>
      </div>
    </div>
  )
}
