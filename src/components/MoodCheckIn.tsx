import { motion } from "framer-motion";

const moods = [
  { emoji: "😊", label: "Good vibes", value: "good" },
  { emoji: "😐", label: "Meh", value: "okay" },
  { emoji: "😔", label: "Low key sad", value: "sad" },
  { emoji: "😤", label: "Frustrated", value: "frustrated" },
  { emoji: "😰", label: "Anxious", value: "anxious" },
];

interface MoodCheckInProps {
  onSelect: (mood: string, label: string) => void;
}

export function MoodCheckIn({ onSelect }: MoodCheckInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="text-center px-6"
    >
      <h2 className="font-display text-xl text-foreground mb-2">How's the vibe today?</h2>
      <p className="text-sm text-muted-foreground mb-6">No judgment, just checking in 💛</p>
      <div className="flex justify-center gap-3 flex-wrap">
        {moods.map((mood, i) => (
          <motion.button
            key={mood.value}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.3 + i * 0.08 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(mood.value, mood.label)}
            className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-secondary hover:bg-secondary/80 transition-colors min-w-[72px]"
          >
            <span className="text-2xl">{mood.emoji}</span>
            <span className="text-[11px] text-muted-foreground">{mood.label}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
