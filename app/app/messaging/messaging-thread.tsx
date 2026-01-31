"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendMessageAction } from "./actions";

export function MessagingThread({
  matchId,
  workspaceId,
}: {
  matchId: string;
  workspaceId: string;
}) {
  const [messages, setMessages] = useState<{ id: string; body: string; sender_type: string; created_at: string }[]>([]);
  const [body, setBody] = useState("");
  const supabase = createClient();

  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("id, body, sender_type, created_at")
        .eq("match_id", matchId)
        .order("created_at", { ascending: true });
      setMessages(data ?? []);
    };
    fetchMessages();
    const channel = supabase
      .channel("messages-" + matchId)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `match_id=eq.${matchId}` }, () => {
        fetchMessages();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, supabase]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    await sendMessageAction(matchId, workspaceId, body.trim());
    setBody("");
  }

  return (
    <div className="flex flex-col h-[400px]">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`rounded-lg p-2 text-sm ${m.sender_type === "investor" ? "ml-8 bg-primary text-primary-foreground" : "mr-8 bg-muted"}`}
          >
            <span className="text-xs opacity-80">{m.sender_type}</span>
            <p>{m.body}</p>
            <span className="text-xs opacity-70">{new Date(m.created_at).toLocaleString()}</span>
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} className="flex gap-2 p-4 border-t">
        <Input value={body} onChange={(e) => setBody(e.target.value)} placeholder="Type a message..." />
        <Button type="submit">Send</Button>
      </form>
    </div>
  );
}
