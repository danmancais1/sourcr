"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLeadsFeed, type LeadsFeed, type LeadsFeedItem, type LeadsSubmissionItem } from "./leads-actions";
import { SOURCING_CATEGORIES } from "@/lib/sourcing-categories";

const POLL_INTERVAL_MS = 2000;
const POLL_MAX_ATTEMPTS = 10;

export function LeadsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const categoryParam = searchParams.get("category");
  const [feed, setFeed] = useState<LeadsFeed | null>(null);
  const [waitingForWorkspace, setWaitingForWorkspace] = useState(!!sessionId);
  const pollAttempts = useRef(0);

  const categoryId = categoryParam && SOURCING_CATEGORIES.some((c) => c.id === categoryParam)
    ? categoryParam
    : SOURCING_CATEGORIES[0].id;

  useEffect(() => {
    if (sessionId) {
      const poll = () => {
        pollAttempts.current += 1;
        getLeadsFeed(SOURCING_CATEGORIES[0].id)
          .then((res) => {
            if (res.workspaceId) {
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
    getLeadsFeed(categoryId)
      .then((res) => {
        setFeed(res);
        if (!res.workspaceId && res.leads.length === 0 && res.submissions.length === 0) {
          router.replace("/app/onboarding");
        }
      })
      .catch(() => router.replace("/app/onboarding"));
  }, [sessionId, categoryId, router]);

  if (waitingForWorkspace) {
    return (
      <div className="flex flex-col items-center justify-center p-8 gap-4">
        <p className="text-deep-teal-200">Setting up your workspace…</p>
        <p className="text-body-sm text-deep-teal-400">This usually takes a few seconds.</p>
      </div>
    );
  }

  if (!feed?.workspaceId) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-deep-teal-200">Redirecting…</p>
      </div>
    );
  }

  const currentCategory = SOURCING_CATEGORIES.find((c) => c.id === categoryId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-display text-deep-teal-50">Leads</h1>
      </div>

      <div className="flex flex-wrap gap-2">
        {SOURCING_CATEGORIES.map((cat) => (
          <Link key={cat.id} href={`/app/leads?category=${cat.id}`}>
            <Button
              variant={categoryId === cat.id ? "default" : "outline"}
              size="sm"
              className={categoryId === cat.id ? "border-deep-teal-500 bg-deep-teal-800" : ""}
            >
              {cat.label}
            </Button>
          </Link>
        ))}
      </div>

      {currentCategory && (
        <Card>
          <CardHeader>
            <CardTitle>{currentCategory.label}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {feed.leads.length > 0 && (
                <ul className="divide-y divide-deep-teal-800">
                  {feed.leads.map((item) => (
                    <LeadRow key={item.id} item={item} />
                  ))}
                </ul>
              )}
            </div>

            <div className="space-y-3">
              {feed.submissions.length > 0 && (
                <ul className="divide-y divide-deep-teal-800">
                  {feed.submissions.map((item) => (
                    <SubmissionRow key={item.id} item={item} />
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function LeadRow({ item }: { item: LeadsFeedItem }) {
  const prop = item.property;
  const owner = item.owner;
  return (
    <li className="py-3">
      <Link href={`/app/leads/${item.id}`} className="flex items-center justify-between hover:underline">
        <span>
          {item.title || (prop ? `${prop.address_line_1 ?? ""}, ${prop.postcode ?? ""}`.trim() : "Untitled lead")}
          {owner?.name && (
            <span className="ml-2 text-body-sm text-deep-teal-200">({owner.name})</span>
          )}
        </span>
        <span className="text-body-sm text-deep-teal-200">{item.pipeline_stage}</span>
      </Link>
    </li>
  );
}

function SubmissionRow({ item }: { item: LeadsSubmissionItem }) {
  return (
    <li className="py-3 flex items-center justify-between">
      <span>
        {item.address_line_1}, {item.postcode}
        {item.contact_name && (
          <span className="ml-2 text-body-sm text-deep-teal-200">({item.contact_name})</span>
        )}
      </span>
      <span className="text-body-sm text-deep-teal-200">{item.status}</span>
    </li>
  );
}
