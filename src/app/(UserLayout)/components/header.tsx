"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/app/lib/auth/auth-context";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Menu } from "lucide-react";

interface HeaderProps {
  onMenuClick?: () => void;
  isMobile?: boolean;
}

export function Header({ onMenuClick, isMobile }: HeaderProps) {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <header className="border-b border-border bg-card shadow-sm sticky top-0 z-40">
      <div className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-6">
        {/* Left side - Logo and Mobile Menu */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className="md:hidden h-9 w-9 p-0"
            >
              <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          )}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg flex-shrink-0">
              <span className="text-primary-foreground font-bold text-xs sm:text-sm">
                ICT
              </span>
            </div>
            <div className="min-w-0 hidden sm:block">
              <h1 className="text-sm sm:text-lg font-bold text-foreground truncate">
                ICT Support
              </h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                Technical Assistance
              </p>
            </div>
          </div>
        </div>

        {/* Right side - User Menu */}
        <div className="flex items-center gap-2 sm:gap-4">
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 h-9 px-2 sm:px-4">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-accent rounded-full flex items-center justify-center text-accent-foreground text-xs sm:text-sm font-semibold flex-shrink-0">
                    {user.firstName.charAt(0)}
                    {user.lastName.charAt(0)}
                  </div>
                  <span className="hidden sm:inline text-xs sm:text-sm font-medium text-foreground truncate">
                    {user.firstName} {user.lastName}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 sm:w-56 shadow-xl border-border/50 bg-popover"
              >
                <DropdownMenuLabel>
                  <div>
                    <p className="font-semibold text-sm">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/User/profile")}>
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/User/history")}>
                  Appointment History
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive cursor-pointer"
                >
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
