import { ConversationGlobalStatusBar } from "@/components/layout/conversation-global-status-bar";
import { ThreeColumnWorkspace } from "@/components/layout/three-column-workspace";
import { TopStatusBar } from "@/components/layout/top-status-bar";

export function AppShell() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(to_bottom,#f3f6fb_0%,#f6f8fb_36%,#f7f9fc_100%)] text-slate-900">
      <div className="pointer-events-none absolute inset-0 opacity-50">
        <div className="absolute top-[-120px] left-[18%] h-[280px] w-[280px] rounded-full bg-blue-100/20 blur-3xl" />
        <div className="absolute top-[-80px] right-[14%] h-[240px] w-[240px] rounded-full bg-slate-200/20 blur-3xl" />
      </div>
      <TopStatusBar />
      <ConversationGlobalStatusBar />
      <ThreeColumnWorkspace />
    </div>
  );
}
