"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

const POLL_INTERVAL_MS = 2000;
const POLL_MAX_ATTEMPTS = 10;

async function hasWorkspace(): Promise<boolean> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();
  return Boolean(data?.workspace_id);
}

export function SellerHubClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [ready, setReady] = useState(!sessionId);
  const [waitingForWorkspace, setWaitingForWorkspace] = useState(!!sessionId);
  const pollAttempts = useRef(0);

  useEffect(() => {
    if (sessionId) {
      const poll = () => {
        pollAttempts.current += 1;
        hasWorkspace()
          .then((ok) => {
            if (ok) {
              setWaitingForWorkspace(false);
              setReady(true);
              router.replace("/seller");
              return;
            }
            if (pollAttempts.current >= POLL_MAX_ATTEMPTS) {
              setWaitingForWorkspace(false);
              setReady(true);
              router.replace("/seller/onboarding");
              return;
            }
            setTimeout(poll, POLL_INTERVAL_MS);
          })
          .catch(() => {
            setWaitingForWorkspace(false);
            setReady(true);
            router.replace("/seller/onboarding");
          });
      };
      poll();
      return;
    }
    setReady(true);
  }, [sessionId, router]);

  if (waitingForWorkspace) {
    return (
      <div className="flex flex-col items-center justify-center p-8 gap-4">
        <p className="text-deep-teal-200">Setting up your account…</p>
        <p className="text-body-sm text-deep-teal-400">This usually takes a few seconds.</p>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-deep-teal-200">Loading…</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-display text-deep-teal-50">Welcome</h1>
        <p className="text-body text-deep-teal-200 mt-2">
          Choose how you&apos;d like to use the platform.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-deep-teal-700 hover:border-deep-teal-600 transition-colors">
          <CardHeader>
            <CardTitle className="text-deep-teal-50">Upload a property</CardTitle>
            <CardDescription className="text-deep-teal-200">
              Have a property to sell? Submit it and we&apos;ll match you with interested investors.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/seller/submit">
              <Button className="w-full premium-button">Upload property</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-deep-teal-700 hover:border-deep-teal-600 transition-colors">
          <CardHeader>
            <CardTitle className="text-deep-teal-50">Post an ad</CardTitle>
            <CardDescription className="text-deep-teal-200">
              Looking for an investor? Post an opportunity ad with details and let investors find you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/seller/post-ad">
              <Button className="w-full premium-button">Post an ad</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-deep-teal-700 hover:border-deep-teal-600 transition-colors">
          <CardHeader>
            <CardTitle className="text-deep-teal-50">See investors</CardTitle>
            <CardDescription className="text-deep-teal-200">
              Browse investors on the platform and their contact details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/seller/investors">
              <Button className="w-full premium-button">View investor list</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
