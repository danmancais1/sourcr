"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PropIxLogo } from "@/components/PropIxLogo";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function AppSidebar({
  children,
  logoHref,
}: {
  children: React.ReactNode;
  logoHref: string;
}) {
  const [open, setOpen] = useState(false);

  const sidebar = (
    <div className="flex h-full flex-col p-4">
      <div className="flex items-center justify-between md:justify-start md:gap-0">
        <PropIxLogo href={logoHref} size="sm" />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="md:hidden shrink-0"
          onClick={() => setOpen(false)}
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      <div className="mt-6 flex-1 overflow-auto">{children}</div>
    </div>
  );

  return (
    <>
      {/* Mobile menu button */}
      <div className="fixed left-4 top-4 z-40 md:hidden">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="h-10 w-10 touch-manipulation"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden w-64 flex-shrink-0 border-r border-deep-teal-800 bg-deep-teal-950 md:block",
          "sticky top-0 h-screen"
        )}
      >
        {sidebar}
      </aside>

      {/* Mobile overlay */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/60 md:hidden"
            aria-hidden
            onClick={() => setOpen(false)}
          />
          <aside
            className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] border-r border-deep-teal-800 bg-deep-teal-950 md:hidden"
            role="dialog"
            aria-label="Menu"
          >
            {sidebar}
          </aside>
        </>
      )}
    </>
  );
}
