import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Heart, Shield, Brain, MessageCircle } from "lucide-react";

const features = [
  { icon: MessageCircle, title: "Active Listening", desc: "Vent without getting unsolicited advice" },
  { icon: Brain, title: "Mindset Hacks", desc: "CBT-powered reframes that actually make sense" },
  { icon: Shield, title: "100% Private", desc: "Your thoughts stay yours. Always." },
  { icon: Heart, title: "Emotionally Aware", desc: "An AI that actually gets how you feel" },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl gradient-warm flex items-center justify-center">
            <span className="text-sm font-bold text-primary-foreground">A</span>
          </div>
          <span className="font-display font-bold text-foreground">Adove</span>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/chat")}
          className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium"
        >
          Start talking
        </motion.button>
      </nav>

      {/* Hero */}
      <section className="relative px-6 pt-20 pb-32 max-w-5xl mx-auto text-center">
        <div className="absolute inset-0 gradient-hero rounded-3xl opacity-50" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10"
        >
          <div className="w-20 h-20 rounded-3xl gradient-warm mx-auto mb-6 flex items-center justify-center animate-float glow-primary">
            <span className="text-3xl">🌿</span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-foreground mb-4 leading-tight">
            Your AI friend for<br />
            <span className="text-gradient-warm">the heavy days</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto mb-8">
            Not a therapist. Not a chatbot. Just someone who listens, understands, and helps you feel a little lighter.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/chat")}
            className="px-8 py-3.5 rounded-full gradient-warm text-primary-foreground font-semibold text-base glow-primary transition-shadow hover:shadow-lg"
          >
            Talk to Adove — it's free
          </motion.button>
        </motion.div>
      </section>

      {/* Features */}
      <section className="px-6 pb-24 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors"
            >
              <f.icon className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-display font-semibold text-foreground mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <footer className="px-6 pb-12 text-center">
        <p className="text-xs text-muted-foreground max-w-md mx-auto">
          Adove is an AI companion and is not a substitute for professional mental health care.
          If you're in crisis, please call <strong>988</strong> or text HOME to <strong>741741</strong>.
        </p>
      </footer>
    </div>
  );
}
