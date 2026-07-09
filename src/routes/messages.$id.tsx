import { createFileRoute, Link, notFound, Outlet } from "@tanstack/react-router";
import { useState } from "react";
import { Header } from "@/components/site/Header";
import { BottomNav } from "@/components/site/BottomNav";
import { getAgent } from "@/lib/mock-data";
import { ArrowLeft, Send, Paperclip, Mic, Check, CheckCheck } from "lucide-react";

export const Route = createFileRoute("/messages/$id")({
  loader: ({ params }) => {
    const agent = getAgent(params.id);
    if (!agent) throw notFound();
    return { agent };
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `Chat with ${loaderData?.agent.name ?? "agent"} — Dejedy` }],
  }),
  notFoundComponent: () => <div className="p-8">Agent not found.</div>,
  component: Chat,
});

type Msg = { id: string; from: "me" | "them"; text: string; time: string; status?: "sent" | "delivered" | "read" };

function Chat() {
  const { agent } = Route.useLoaderData();
  const [text, setText] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: "1", from: "them", text: `Hi! This is ${agent.name}. How can I help?`, time: "10:24" },
    { id: "2", from: "me", text: "Is the Lekki mansion still available?", time: "10:26", status: "read" },
    { id: "3", from: "them", text: "Yes, we have a viewing slot tomorrow at 2 PM. Would that work?", time: "10:27" },
  ]);

  function send() {
    if (!text.trim()) return;
    setMsgs((m) => [...m, { id: crypto.randomUUID(), from: "me", text: text.trim(), time: "now", status: "sent" }]);
    setText("");
  }

  return (
    <div className="flex min-h-screen flex-col bg-navy-50">
      <Header />
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-4 md:px-6">
        <div className="mb-3 flex items-center gap-3 rounded-3xl bg-white p-4 ring-1 ring-black/5">
          <Link to="/messages" className="text-navy-700"><ArrowLeft className="size-4" /></Link>
          <div className="grid size-10 place-items-center rounded-full bg-navy-950 font-display text-sm font-semibold text-white">
            {agent.avatarInitials}
          </div>
          <div className="flex-1">
            <p className="font-display font-semibold text-navy-950">{agent.name}</p>
            <p className="text-[11px] text-emerald-600">Online</p>
          </div>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto rounded-3xl bg-white p-4 ring-1 ring-black/5">
          {msgs.map((m) => (
            <div key={m.id} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${m.from === "me" ? "bg-navy-950 text-white" : "bg-navy-50 text-navy-950"}`}>
                <p>{m.text}</p>
                <div className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${m.from === "me" ? "text-white/60" : "text-navy-700"}`}>
                  <span>{m.time}</span>
                  {m.from === "me" && (m.status === "read" ? <CheckCheck className="size-3 text-sky-300" /> : <Check className="size-3" />)}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-center gap-2 rounded-full bg-white p-2 ring-1 ring-black/5">
          <button className="rounded-full p-2 text-navy-700 hover:bg-navy-50"><Paperclip className="size-4" /></button>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Type a message"
            className="flex-1 bg-transparent px-2 text-sm outline-none"
          />
          {text ? (
            <button onClick={send} className="rounded-full bg-navy-950 p-2.5 text-white">
              <Send className="size-4" />
            </button>
          ) : (
            <button className="rounded-full p-2 text-navy-700 hover:bg-navy-50"><Mic className="size-4" /></button>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
