import { AppLayoutClient } from "./app-layout-client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppLayoutClient>{children}</AppLayoutClient>;
}
