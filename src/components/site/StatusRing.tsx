import type { Agent } from "@/lib/mock-data";

export function StatusRing({ agent }: { agent: Agent }) {
  const active = agent.hasStatus;
  return (
    <div className={`flex flex-col items-center gap-2 ${active ? "" : "opacity-50"}`}>
      <div
        className={`flex size-16 items-center justify-center rounded-full bg-white p-1 ring-2 ${
          active ? "ring-emerald-500" : "ring-zinc-200"
        }`}
      >
        <div className="grid size-full place-items-center rounded-full bg-navy-950 font-display text-sm font-semibold text-white">
          {agent.avatarInitials}
        </div>
      </div>
      <span className="max-w-[64px] truncate text-xs font-medium">{agent.name.split(" ")[0]}</span>
    </div>
  );
}
