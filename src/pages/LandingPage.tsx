import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, MapPin, Ticket, Sparkles, Music, Gamepad2, PartyPopper, MessageCircle, User, Users } from 'lucide-react'
import promPoster from '../assets/prom.jpeg'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#D4AF37] opacity-[0.08] blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[#D4AF37] opacity-[0.05] blur-[100px]" />
        </div>

        {/* Hero Poster */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 mb-8"
        >
          <div className="relative">
            <img
              src={promPoster}
              alt="Prom Night Poster"
              className="w-full max-w-[320px] md:max-w-[400px] rounded-xl shadow-2xl animate-float"
              style={{ boxShadow: '0 0 40px rgba(212,175,55,0.25)' }}
            />
            
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-10 text-center mb-6"
        >
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl gold-text-gradient tracking-wider mb-2 text-glow">
            PROM NIGHT PARTY
          </h1>
          <h2 className="font-serif text-xl md:text-2xl text-[#D4AF37]/80 tracking-[0.3em] uppercase">
            Last Appearance
          </h2>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="relative z-10 text-center text-white/60 text-sm md:text-base mb-8 max-w-md"
        >
          A Night of The Last Appearance — Midnight Glams
        </motion.p>

        {/* Event Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="relative z-10 flex flex-wrap justify-center gap-4 md:gap-6 mb-10"
        >
          <div className="flex items-center gap-2 text-white/80 text-sm">
            <Calendar size={18} className="text-[#D4AF37]" />
            <span>June 6, 2026 — 19:00</span>
          </div>
          <div className="flex items-center gap-2 text-white/80 text-sm">
            <MapPin size={18} className="text-[#D4AF37]" />
            <span>Waterland</span>
          </div>
          <div className="flex items-center gap-2 text-white/80 text-sm">
            <Sparkles size={18} className="text-[#D4AF37]" />
            <span>Dress Code: Hollywood Glam</span>
          </div>
        </motion.div>

        {/* Ticket Packages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="relative z-10 w-full max-w-lg mb-10"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Ticket size={20} className="text-[#D4AF37]" />
            <span className="text-[#D4AF37] font-semibold tracking-wide">PRESALE ONLY</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: User, label: 'Single', price: 'Rp 85.000', people: '1 Person', highlight: false },
              { icon: Users, label: 'Couple', price: 'Rp 160.000', people: '2 People', highlight: true },
              { icon: PartyPopper, label: 'Squad', price: 'Rp 300.000', people: '4 People', highlight: true },
            ].map((pkg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.1 }}
                className={`glass-card rounded-xl p-4 text-center ${pkg.highlight ? 'border-[#D4AF37]/30' : 'border-white/10'}`}
              >
                {pkg.highlight && (
                  <span className="inline-block text-[10px] bg-[#D4AF37]/20 text-[#D4AF37] px-2 py-0.5 rounded-full mb-2">Best Deal</span>
                )}
                <pkg.icon size={24} className="text-[#D4AF37] mx-auto mb-2" />
                <p className="text-white font-semibold text-sm">{pkg.label}</p>
                <p className="text-white/40 text-xs">{pkg.people}</p>
                <p className="text-[#D4AF37] font-semibold text-sm mt-1">{pkg.price}</p>
              </motion.div>
            ))}
          </div>
          <p className="text-white/50 text-xs text-center mt-3">Only 60 Tickets Available</p>
        </motion.div>

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/daftar')}
          className="relative z-10 gold-gradient text-[#050505] font-bold text-lg px-10 py-4 rounded-full tracking-wide animate-pulse-gold"
        >
          Register Now
        </motion.button>
      </section>

      {/* Event Info Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-serif text-3xl md:text-4xl gold-text-gradient mb-4">
              Event Details
            </h2>
            <p className="text-white/60 max-w-lg mx-auto">
              A night of glamour and final memories together. Celebrate this special moment in a luxurious Hollywood atmosphere.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {[
              { icon: Calendar, title: 'Date & Time', desc: 'June 6, 2026\n19:00 - Until End' },
              { icon: MapPin, title: 'Venue', desc: 'Waterland\nWhere memories gather' },
              { icon: Sparkles, title: 'Dress Code', desc: 'Hollywood Glam\nShine all night long' },
              { icon: PartyPopper, title: 'Fireworks', desc: 'Spectacular fireworks\nLight up the night sky' },
              { icon: Music, title: 'Live Music', desc: 'Live performance\nFeel the rhythm all night' },
              { icon: Gamepad2, title: 'Games', desc: 'Fun party games\nPlay and win prizes' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card rounded-xl p-6 text-center"
              >
                <item.icon size={32} className="text-[#D4AF37] mx-auto mb-4" />
                <h3 className="font-serif text-lg text-[#D4AF37] mb-2">{item.title}</h3>
                <p className="text-white/60 text-sm whitespace-pre-line">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Admin */}
      <section className="py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-md mx-auto text-center"
        >
          <h2 className="font-serif text-xl text-[#D4AF37] mb-3">Need Help?</h2>
          <p className="text-white/50 text-sm mb-4">Contact admin if you have any questions or issues</p>
          <a
            href="https://wa.me/628161984575"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 glass-card rounded-xl px-6 py-3 text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors"
          >
            <MessageCircle size={18} />
            <span className="text-sm font-medium">Chat Admin on WhatsApp</span>
          </a>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-white/30 text-sm border-t border-white/5">
        <p>Prom Night 2026 — Last Appearance</p>
      </footer>
    </div>
  )
}
