import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Upload, CreditCard, Send, Loader2, X, Mail, MessageCircle, CheckCircle, Copy } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import jagoLogo from '../assets/jago.png'

export default function UploadPaymentPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const registrationId = location.state?.registrationId

  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [copied, setCopied] = useState(false)
  const [regData, setRegData] = useState<{ ticket_count: number; total_amount: number; holder_names: string[] | null } | null>(null)

  useEffect(() => {
    if (registrationId) {
      supabase.from('registrations').select('ticket_count, total_amount, holder_names').eq('id', registrationId).single()
        .then(({ data }) => { if (data) setRegData(data) })
    }
  }, [registrationId])

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

  const compressImage = (file: File, maxW = 1200, quality = 0.7): Promise<File> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let w = img.width, h = img.height
        if (w > maxW) { h = (maxW / w) * h; w = maxW }
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, w, h)
        canvas.toBlob(
          (blob) => resolve(new File([blob!], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' })),
          'image/jpeg',
          quality
        )
      }
      img.src = URL.createObjectURL(file)
    })
  }

  const handleUpload = async () => {
    if (!file) return
    setLoading(true)

    const compressed = file.type.startsWith('image/') ? await compressImage(file) : file
    const fileExt = compressed.name.split('.').pop()
    const fileName = `${registrationId}_${Date.now()}.${fileExt}`
    const filePath = `payment-proofs/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('payments')
      .upload(filePath, compressed, { upsert: true })

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

    setLoading(false)
    setShowSuccess(true)
  }

  const copyAccount = () => {
    navigator.clipboard.writeText('103875464247')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
            <span className="font-semibold text-[#D4AF37]">Payment Information</span>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
              <img src={jagoLogo} alt="Bank Jago" className="w-10 h-10 rounded-lg object-contain bg-white p-1" />
              <div className="flex-1 min-w-0">
                <p className="text-white/50 text-xs">Bank</p>
                <p className="text-white font-medium">Bank Jago <span className="text-white/40 text-xs">(542)</span></p>
              </div>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-white/50 text-xs mb-1">Account Number</p>
              <div className="flex items-center justify-between">
                <p className="text-white font-mono text-lg tracking-wider">103875464247</p>
                <button
                  onClick={copyAccount}
                  className="p-1.5 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] hover:bg-[#D4AF37]/20 transition-colors"
                  title="Copy"
                >
                  {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Status</span>
              <span className="text-yellow-400">Awaiting Payment</span>
            </div>
          </div>
          {regData && (
            <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
              <p className="text-[#D4AF37] text-xs font-semibold mb-2">Your Order</p>
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Tickets</span>
                <span className="text-white">{regData.ticket_count}x</span>
              </div>
              {regData.holder_names && regData.holder_names.map((name, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-white/50">Ticket {i + 1}</span>
                  <span className="text-white/80">{name}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm pt-2 border-t border-white/5">
                <span className="text-white/50">Total to Pay</span>
                <span className="text-[#D4AF37] font-semibold">Rp {regData.total_amount.toLocaleString('id-ID')}</span>
              </div>
            </div>
          )}
          <p className="text-white/40 text-xs mt-4">
            * Transfer the exact amount and upload payment proof below
          </p>
          <div className="mt-3 bg-red-400/5 border border-red-400/20 rounded-lg p-3 text-center">
            <p className="text-red-400/80 text-xs font-medium">⚠ No Refund — All payments are non-refundable</p>
          </div>
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
              Uploading...
            </>
          ) : (
            <>
              <Send size={20} />
              Submit Payment Proof
            </>
          )}
        </motion.button>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
            onClick={() => { setShowSuccess(false); navigate('/status', { state: { registrationId } }) }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card rounded-2xl p-6 max-w-sm w-full text-center"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-16 h-16 rounded-full bg-green-400/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-400" />
              </div>
              <h3 className="font-serif text-xl gold-text-gradient mb-2">Payment Proof Sent!</h3>
              <p className="text-white/60 text-sm mb-4">Your payment proof has been submitted. Admin will verify your payment shortly.</p>
              <div className="bg-white/5 rounded-lg p-4 mb-4 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail size={16} className="text-[#D4AF37] shrink-0" />
                  <span className="text-white/70">Check your Gmail regularly for ticket confirmation</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MessageCircle size={16} className="text-[#D4AF37] shrink-0" />
                  <span className="text-white/70">Contact admin if you need help</span>
                </div>
              </div>
              <button
                onClick={() => { setShowSuccess(false); navigate('/status', { state: { registrationId } }) }}
                className="w-full gold-gradient text-[#050505] font-bold py-3 rounded-xl"
              >
                View Status
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
