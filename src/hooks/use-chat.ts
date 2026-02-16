import { useState, useCallback } from "react";
import { streamChat } from "@/lib/chat-stream";
import { toast } from "@/hooks/use-toast";

export type Message = { role: "user" | "assistant"; content: string };

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const send = useCallback(async (input: string) => {
    const userMsg: Message = { role: "user", content: input };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsLoading(true);

    let assistantSoFar = "";
    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      await streamChat({
        messages: updatedMessages,
        onDelta: upsertAssistant,
        onDone: () => setIsLoading(false),
        onError: (error) => {
          toast({ title: "Oops", description: error, variant: "destructive" });
          setIsLoading(false);
        },
      });
    } catch {
      setIsLoading(false);
      toast({ title: "Connection lost", description: "Let's try that again.", variant: "destructive" });
    }
  }, [messages]);

  const reset = useCallback(() => setMessages([]), []);

  return { messages, isLoading, send, reset };
}
