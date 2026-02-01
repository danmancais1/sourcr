"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/app/dashboard", label: "Dashboard" },
  { href: "/app/leads", label: "Leads" },
  { href: "/app/pipeline", label: "Pipeline" },
  { href: "/app/campaigns", label: "Campaigns" },
  { href: "/app/templates", label: "Templates" },
  { href: "/app/direct-sellers", label: "Direct Sellers" },
  { href: "/app/messaging", label: "Messaging" },
  { href: "/app/settings", label: "Settings" },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/app/dashboard" && pathname.startsWith(item.href));
        return (
          <Link key={item.href} href={item.href}>
            <Button
              variant="ghost"
              size="sm"
              className={`w-full justify-start rounded-lg ${
                isActive
                  ? "border-l-4 border-l-deep-teal-500 bg-deep-teal-800 pl-4 text-deep-teal-50"
                  : "text-deep-teal-200 hover:bg-deep-teal-800 hover:text-deep-teal-50 pl-4 border-l-4 border-l-transparent"
              }`}
            >
              {item.label}
            </Button>
          </Link>
        );
      })}
    </nav>
  );
}
