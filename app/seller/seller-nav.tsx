"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/seller/dashboard", label: "Dashboard" },
  { href: "/seller/submit", label: "Submit Property" },
  { href: "/seller/messaging", label: "Messages" },
];

export function SellerNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
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
