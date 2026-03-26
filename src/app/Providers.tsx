"use client";

import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { baselightTheme } from "@/utils/theme/DefaultColors";
import { AuthProvider } from "@/app/lib/auth/auth-context";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter"; // MUI v6+ App Router support
import QueryProvider from "@/app/lib/QueryProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider>
      <QueryProvider>
        <AuthProvider>
          <ThemeProvider theme={baselightTheme}>
            <CssBaseline />
            {children}
          </ThemeProvider>
        </AuthProvider>
      </QueryProvider>
    </AppRouterCacheProvider>
  );
}
