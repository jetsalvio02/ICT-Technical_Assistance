"use client";

import { useAuth } from "@/app/lib/auth/auth-context";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Plus,
  Clock,
  Settings,
  HelpCircle,
  FileText,
  User,
  X,
} from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  const navItems = [
    {
      label: "Dashboard",
      href: "/User",
      icon: LayoutDashboard,
    },
    {
      label: "New Appointment",
      href: "/User/appointments",
      icon: Plus,
    },
    {
      label: "Appointment History",
      href: "/User/history",
      icon: Clock,
    },
    {
      label: "Requests",
      href: "/User/requests",
      icon: FileText,
    },
  ];

  const bottomItems = [
    {
      label: "Profile",
      href: "/User/profile",
      icon: User,
    },
    {
      label: "Settings",
      href: "/User/settings",
      icon: Settings,
    },
    {
      label: "Help & Support",
      href: "/User/support",
      icon: HelpCircle,
    },
  ];

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-card transition-all duration-300 overflow-hidden flex flex-col md:relative md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <div className="flex flex-col h-full">
        {/* Sidebar Header with Mobile Close Button */}
        <div className="border-b border-border p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">
              ICT
            </div>
            <span className="font-bold text-foreground">User Panel</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="md:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* User Profile Section */}
        <div className="border-b border-border p-4 bg-muted/30">
          {user && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-accent-foreground font-semibold text-sm">
                  {user.firstName.charAt(0)}
                  {user.lastName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.role}
                  </p>
                </div>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p className="truncate">{user.office}</p>
                <p className="truncate">{user.email}</p>
              </div>
            </div>
          )}
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted",
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Navigation */}
        <div className="border-t border-border px-3 py-4 space-y-1">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted",
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
