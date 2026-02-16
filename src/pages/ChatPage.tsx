import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { useChat } from "@/hooks/use-chat";
import { ChatBubble } from "@/components/ChatBubble";
import { ChatInput } from "@/components/ChatInput";
import { MoodCheckIn } from "@/components/MoodCheckIn";

export default function ChatPage() {
  const { messages, isLoading, send, reset } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleMoodSelect = (value: string, label: string) => {
    setStarted(true);
    send(`I'm feeling ${label.toLowerCase()} right now.`);
  };

  const handleDirectStart = () => {
    setStarted(true);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-background/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full gradient-warm flex items-center justify-center">
            <span className="text-sm font-bold text-primary-foreground">A</span>
          </div>
          <div>
            <h1 className="font-display text-sm font-semibold text-foreground">Adove</h1>
            <p className="text-[10px] text-muted-foreground">your safe space 🌿</p>
          </div>
        </div>
        {messages.length > 0 && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => { reset(); setStarted(false); }}
            className="p-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground"
          >
            <RotateCcw className="w-4 h-4" />
          </motion.button>
        )}
      </header>

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto chat-scrollbar px-4 py-6">
        <AnimatePresence mode="wait">
          {!started ? (
            <motion.div
              key="welcome"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center h-full gap-8"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-3xl gradient-warm mx-auto mb-4 flex items-center justify-center animate-float glow-primary">
                  <span className="text-2xl">🌿</span>
                </div>
                <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                  Hey, I'm <span className="text-gradient-warm">Adove</span>
                </h1>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                  Your AI companion for when life gets heavy. No judgment, just good vibes and real talk.
                </p>
              </motion.div>

              <MoodCheckIn onSelect={handleMoodSelect} />

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                onClick={handleDirectStart}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
              >
                or just start talking
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-2xl mx-auto"
            >
              {messages.length === 0 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-muted-foreground text-sm py-12"
                >
                  What's on your mind? I'm here for you 💛
                </motion.p>
              )}
              {messages.map((msg, i) => (
                <ChatBubble
                  key={i}
                  message={msg}
                  isLatest={i === messages.length - 1}
                />
              ))}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex justify-start mb-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-2 mt-1">
                    <span className="text-sm">🌿</span>
                  </div>
                  <div className="bg-bubble-ai px-4 py-3 rounded-2xl rounded-bl-md">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-primary/50 animate-pulse-glow" />
                      <span className="w-2 h-2 rounded-full bg-primary/50 animate-pulse-glow [animation-delay:0.3s]" />
                      <span className="w-2 h-2 rounded-full bg-primary/50 animate-pulse-glow [animation-delay:0.6s]" />
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      {started && <ChatInput onSend={send} disabled={isLoading} />}
    </div>
  );
}
