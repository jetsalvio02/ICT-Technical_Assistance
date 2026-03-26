"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/lib/auth/auth-context";
import { Box, Typography, CircularProgress } from "@mui/material";

export default function Home() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/authentication/login");
      } else {
        // Redirect based on role
        if (user?.role === "Administrator" || user?.role === "Technician") {
          router.push("/admin");
        } else {
          router.push("/User");
        }
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100vh"
      gap={2}
    >
      <CircularProgress />
      <Typography variant="body2" color="textSecondary">
        Redirecting...
      </Typography>
    </Box>
  );
}
