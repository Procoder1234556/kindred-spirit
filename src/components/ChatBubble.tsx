import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import type { Message } from "@/hooks/use-chat";

interface ChatBubbleProps {
  message: Message;
  isLatest?: boolean;
}

export function ChatBubble({ message, isLatest }: ChatBubbleProps) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-2 mt-1 shrink-0">
          <span className="text-sm">🌿</span>
        </div>
      )}
      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? "bg-bubble-user text-primary-foreground rounded-br-md"
            : "bg-bubble-ai text-foreground rounded-bl-md"
        }`}
      >
        {isUser ? (
          <p>{message.content}</p>
        ) : (
          <div className="prose prose-sm prose-invert max-w-none [&>p]:mb-2 [&>p:last-child]:mb-0">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
        {isLatest && !isUser && !message.content && (
          <div className="flex gap-1 py-1">
            <span className="w-2 h-2 rounded-full bg-primary/50 animate-pulse-glow" />
            <span className="w-2 h-2 rounded-full bg-primary/50 animate-pulse-glow [animation-delay:0.3s]" />
            <span className="w-2 h-2 rounded-full bg-primary/50 animate-pulse-glow [animation-delay:0.6s]" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
