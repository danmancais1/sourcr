"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardData, type DashboardData } from "./actions";

const POLL_INTERVAL_MS = 2000;
const POLL_MAX_ATTEMPTS = 10;

export function DashboardClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [data, setData] = useState<DashboardData | null>(null);
  const [waitingForWorkspace, setWaitingForWorkspace] = useState(!!sessionId);
  const pollAttempts = useRef(0);

  useEffect(() => {
    if (sessionId) {
      const poll = () => {
        pollAttempts.current += 1;
        getDashboardData()
          .then((res) => {
            if (res.workspace) {
              setData(res);
              setWaitingForWorkspace(false);
              router.replace("/app/leads");
              return;
            }
            if (pollAttempts.current >= POLL_MAX_ATTEMPTS) {
              setWaitingForWorkspace(false);
              router.replace("/app/onboarding");
              return;
            }
            setTimeout(poll, POLL_INTERVAL_MS);
          })
          .catch(() => {
            setWaitingForWorkspace(false);
            router.replace("/app/onboarding");
          });
      };
      poll();
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

  if (waitingForWorkspace) {
    return (
      <div className="flex flex-col items-center justify-center p-8 gap-4">
        <p className="text-deep-teal-200">Setting up your workspace…</p>
        <p className="text-body-sm text-deep-teal-400">This usually takes a few seconds.</p>
      </div>
    );
  }

  if (sessionId && !data?.workspace) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-deep-teal-200">Redirecting…</p>
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-display text-deep-teal-50">Dashboard</h1>
        <p className="text-body text-deep-teal-200">
          Welcome back. Workspace: {ws.name}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-label font-semibold text-deep-teal-50">Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-section font-bold text-deep-teal-50">{leadsCount}</p>
            <Link href="/app/leads" className="mt-2 inline-block">
              <Button variant="link" className="p-0 h-auto text-deep-teal-400">View leads</Button>
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

      <Card>
        <CardHeader>
          <CardTitle>Quick actions</CardTitle>
          <CardDescription>Browse opportunities and landlords</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Link href="/app/leads">
            <Button variant="outline">Leads</Button>
          </Link>
          <Link href="/app/sellers">
            <Button variant="outline">Sellers</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
