"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardData, syncCheckoutSession, type DashboardData } from "./actions";

export function DashboardClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [data, setData] = useState<DashboardData | null>(null);
  const [syncing, setSyncing] = useState(!!sessionId);

  useEffect(() => {
    if (sessionId) {
      syncCheckoutSession(sessionId).then(() => {
        setSyncing(false);
        router.replace("/app/dashboard");
      }).catch(() => setSyncing(false));
      return;
    }
    getDashboardData()
      .then((res) => {
        setData(res);
        if (!res.workspace) {
          router.replace("/app/onboarding");
        }
      })
      .catch(() => setData({ workspace: null, leadsCount: 0, campaignsCount: 0 }));
  }, [sessionId, router]);

  if (syncing || (sessionId && !data)) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-deep-teal-200">Loading…</p>
      </div>
    );
  }

  if (!data || !data.workspace) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-deep-teal-200">Redirecting…</p>
      </div>
    );
  }

  const ws = data.workspace;
  const leadsCount = data.leadsCount;
  const campaignsCount = data.campaignsCount;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-display text-deep-teal-50">Dashboard</h1>
        <p className="text-body text-deep-teal-200">
          Welcome back. Workspace: {ws.name}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-label font-semibold text-deep-teal-50">Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-section font-bold text-deep-teal-50">{leadsCount}</p>
            <div className="mt-2 h-1.5 w-full rounded-full bg-deep-teal-800 overflow-hidden">
              <div className="progress-bar-gradient h-full rounded-full" style={{ width: `${Math.min(100, (leadsCount / 50) * 100)}%` }} />
            </div>
            <Link href="/app/leads" className="mt-2 inline-block">
              <Button variant="link" className="p-0 h-auto text-deep-teal-400">View leads</Button>
            </Link>
          </CardContent>
        </Card>
        <Card className="p-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-label font-semibold text-deep-teal-50">Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-section font-bold text-deep-teal-50">{campaignsCount}</p>
            <div className="mt-2 h-1.5 w-full rounded-full bg-deep-teal-800 overflow-hidden">
              <div className="progress-bar-gradient h-full rounded-full" style={{ width: `${Math.min(100, (campaignsCount / 20) * 100)}%` }} />
            </div>
            <Link href="/app/campaigns" className="mt-2 inline-block">
              <Button variant="link" className="p-0 h-auto text-deep-teal-400">View campaigns</Button>
            </Link>
          </CardContent>
        </Card>
        <Card className="p-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-label font-semibold text-deep-teal-50">Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-deep-teal-50 capitalize">{ws.plan}</p>
            <Link href="/app/settings#billing" className="mt-2 inline-block">
              <Button variant="link" className="p-0 h-auto text-deep-teal-400">Manage billing</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
            <CardDescription>Common tasks</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Link href="/app/leads?action=import">
              <Button variant="outline">Import leads (CSV)</Button>
            </Link>
            <Link href="/app/campaigns?action=new">
              <Button variant="outline">New campaign</Button>
            </Link>
            <Link href="/app/direct-sellers">
              <Button variant="outline">Direct Sellers inbox</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
