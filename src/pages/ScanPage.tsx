import { useState, useRef, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ScanLine, CheckCircle, XCircle, Loader2, Camera, Keyboard } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Html5Qrcode } from 'html5-qrcode'

export default function ScanPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [barcode, setBarcode] = useState(searchParams.get('code') || '')
  const [result, setResult] = useState<null | { type: 'valid' | 'used' | 'invalid'; name?: string; holder?: string; usedAt?: string }>(null)
  const [loading, setLoading] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [mode, setMode] = useState<'camera' | 'manual'>('camera')
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (barcode) handleScan()
  }, [])

  useEffect(() => {
    return () => {
      stopScanner()
    }
  }, [])

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop()
      } catch {}
      scannerRef.current = null
    }
    setScanning(false)
  }

  const startScanner = async () => {
    try {
      const scanner = new Html5Qrcode('qr-reader')
      scannerRef.current = scanner
      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 200, height: 200 },
        },
        (decodedText) => {
          setBarcode(decodedText)
          stopScanner()
          handleScanWithCode(decodedText)
        },
        () => {}
      )
      setScanning(true)
    } catch (err) {
      console.error('Camera error:', err)
      alert('Tidak bisa akses kamera. Gunakan input manual.')
      setMode('manual')
    }
  }

  const handleScan = async () => {
    if (!barcode.trim()) return
    setLoading(true)
    setResult(null)

    const { data, error } = await supabase
      .from('tickets')
      .select('*, registrations(name)')
      .eq('barcode', barcode.trim())
      .single()

    setLoading(false)

    if (error || !data) {
      setResult({ type: 'invalid' })
      return
    }

    if (data.used) {
      setResult({
        type: 'used',
        name: data.registrations?.name,
        holder: data.holder_name,
        usedAt: data.used_at,
      })
      return
    }

    const now = new Date().toISOString()
    await supabase
      .from('tickets')
      .update({ used: true, used_at: now })
      .eq('id', data.id)

    setResult({
      type: 'valid',
      name: data.registrations?.name,
      holder: data.holder_name,
    })
  }

  const handleScanWithCode = async (code: string) => {
    if (!code.trim()) return
    setLoading(true)
    setResult(null)

    const { data, error } = await supabase
      .from('tickets')
      .select('*, registrations(name)')
      .eq('barcode', code.trim())
      .single()

    setLoading(false)

    if (error || !data) {
      setResult({ type: 'invalid' })
      return
    }

    if (data.used) {
      setResult({
        type: 'used',
        name: data.registrations?.name,
        holder: data.holder_name,
        usedAt: data.used_at,
      })
      return
    }

    const now = new Date().toISOString()
    await supabase
      .from('tickets')
      .update({ used: true, used_at: now })
      .eq('id', data.id)

    setResult({
      type: 'valid',
      name: data.registrations?.name,
      holder: data.holder_name,
    })
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white px-4 py-8">
      <div className="max-w-lg mx-auto">
        <button
          onClick={() => { stopScanner(); navigate('/') }}
          className="flex items-center gap-2 text-white/60 hover:text-[#D4AF37] transition-colors mb-8"
        >
          <ArrowLeft size={20} />
          <span>Kembali</span>
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="font-serif text-3xl md:text-4xl gold-text-gradient mb-2">
            Scan Barcode
          </h1>
          <p className="text-white/50 text-sm">
            Scan barcode tiket dengan kamera atau input manual
          </p>
        </motion.div>

        {/* Mode Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 mb-6"
        >
          <button
            onClick={() => { stopScanner(); setMode('camera') }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-colors ${
              mode === 'camera' ? 'gold-gradient text-[#050505]' : 'bg-[#111] text-white/50 hover:text-white border border-[#1F1F1F]'
            }`}
          >
            <Camera size={18} />
            Kamera
          </button>
          <button
            onClick={() => { stopScanner(); setMode('manual') }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-colors ${
              mode === 'manual' ? 'gold-gradient text-[#050505]' : 'bg-[#111] text-white/50 hover:text-white border border-[#1F1F1F]'
            }`}
          >
            <Keyboard size={18} />
            Manual
          </button>
        </motion.div>

        {/* Camera Scanner */}
        {mode === 'camera' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div id="qr-reader" className="w-full rounded-xl overflow-hidden" />
            {!scanning && (
              <button
                onClick={startScanner}
                className="w-full py-4 glass-card rounded-xl flex items-center justify-center gap-3 text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors"
              >
                <Camera size={24} />
                <span className="font-medium">Mulai Scan Kamera</span>
              </button>
            )}
            {scanning && (
              <button
                onClick={stopScanner}
                className="w-full mt-3 py-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl text-sm transition-colors"
              >
                Stop Kamera
              </button>
            )}
          </motion.div>
        )}

        {/* Manual Input */}
        {mode === 'manual' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <div className="relative">
              <ScanLine size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37]" />
              <input
                ref={inputRef}
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                placeholder="Masukkan kode barcode..."
                className="w-full pl-12 pr-4"
                autoFocus
              />
            </div>
          </motion.div>
        )}

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleScan}
          disabled={loading || !barcode.trim()}
          className="w-full gold-gradient text-[#050505] font-bold text-lg py-4 rounded-xl disabled:opacity-40"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={20} className="animate-spin" />
              Memverifikasi...
            </span>
          ) : (
            'Verifikasi Tiket'
          )}
        </motion.button>

        {/* Result */}
        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8"
          >
            {result.type === 'valid' && (
              <div className="glass-card rounded-2xl p-8 text-center border-green-400/30 bg-green-400/5">
                <div className="w-20 h-20 rounded-full bg-green-400/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={40} className="text-green-400" />
                </div>
                <h2 className="font-serif text-2xl text-green-400 mb-2">
                  Tiket Valid
                </h2>
                <p className="text-white/70 text-sm mb-1">Selamat datang!</p>
                <div className="mt-4 space-y-2 text-sm">
                  <p className="text-white/60">Pemesan: <span className="text-white">{result.name}</span></p>
                  <p className="text-white/60">Pemilik Tiket: <span className="text-white">{result.holder}</span></p>
                  <p className="text-green-400/80 text-xs mt-2">Status: Hadir</p>
                </div>
              </div>
            )}

            {result.type === 'used' && (
              <div className="glass-card rounded-2xl p-8 text-center border-red-400/30 bg-red-400/5">
                <div className="w-20 h-20 rounded-full bg-red-400/10 flex items-center justify-center mx-auto mb-4">
                  <XCircle size={40} className="text-red-400" />
                </div>
                <h2 className="font-serif text-2xl text-red-400 mb-2">
                  Barcode Sudah Digunakan
                </h2>
                <p className="text-white/60 text-sm">
                  Tiket ini sudah discan sebelumnya pada {result.usedAt ? new Date(result.usedAt).toLocaleString('id-ID') : 'waktu lalu'}.
                </p>
                {result.holder && (
                  <p className="text-white/40 text-xs mt-2">Pemilik: {result.holder}</p>
                )}
              </div>
            )}

            {result.type === 'invalid' && (
              <div className="glass-card rounded-2xl p-8 text-center border-red-400/30 bg-red-400/5">
                <div className="w-20 h-20 rounded-full bg-red-400/10 flex items-center justify-center mx-auto mb-4">
                  <XCircle size={40} className="text-red-400" />
                </div>
                <h2 className="font-serif text-2xl text-red-400 mb-2">
                  Barcode Tidak Valid
                </h2>
                <p className="text-white/60 text-sm">
                  Kode barcode tidak ditemukan dalam sistem.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
