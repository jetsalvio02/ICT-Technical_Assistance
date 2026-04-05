import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  Alert,
  IconButton,
  Grid,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import Link from "next/link";

import CustomTextField from "@/app/(AdminLayout)/components/forms/theme-elements/CustomTextField";

interface registerType {
  title?: string;
  subtitle?: React.ReactNode;
  subtext?: React.ReactNode;
}

const AuthRegister = ({ title, subtitle, subtext }: registerType) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [office, setOffice] = useState("");
  const [password, setPassword] = useState("");
  const [show_password, setShow_password] = useState(false);
  const [confirm_password, setConfirm_password] = useState("");
  const [show_confirm_password, setShow_confirm_password] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      if (password !== confirm_password) {
        setError("Passwords do not match");
        return;
      }

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          office,
          role: "User",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Registration failed");
      }

      setSuccess(
        result.message ||
          "Registration successful! Your account is pending admin approval.",
      );
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {title ? (
        <Typography fontWeight="700" variant="h2" mb={1}>
          {title}
        </Typography>
      ) : null}

      {subtext}

      {success ? (
        <Stack spacing={2} sx={{ mt: 2 }}>
          <Alert severity="success">{success}</Alert>
          <Typography
            component={Link}
            href="/authentication/login"
            fontWeight="500"
            sx={{
              textDecoration: "none",
              color: "primary.main",
              textAlign: "center",
            }}
          >
            Go to Login
          </Typography>
        </Stack>
      ) : (
        <>
          <Box mt={3}>
            <Grid container spacing={3} mb={3}>
              {error && (
                <Grid size={{ xs: 12 }}>
                  <Alert severity="error">{error}</Alert>
                </Grid>
              )}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography
                  variant="subtitle1"
                  fontWeight={600}
                  component="label"
                  htmlFor="firstName"
                  mb="5px"
                  display="block"
                >
                  First Name
                </Typography>
                <CustomTextField
                  id="firstName"
                  variant="outlined"
                  fullWidth
                  value={firstName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFirstName(e.target.value)
                  }
                  required
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography
                  variant="subtitle1"
                  fontWeight={600}
                  component="label"
                  htmlFor="lastName"
                  mb="5px"
                  display="block"
                >
                  Last Name
                </Typography>
                <CustomTextField
                  id="lastName"
                  variant="outlined"
                  fullWidth
                  value={lastName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setLastName(e.target.value)
                  }
                  required
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Typography
                  variant="subtitle1"
                  fontWeight={600}
                  component="label"
                  htmlFor="email"
                  mb="5px"
                  display="block"
                >
                  Email Address
                </Typography>
                <CustomTextField
                  id="email"
                  variant="outlined"
                  fullWidth
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEmail(e.target.value)
                  }
                  required
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography
                  variant="subtitle1"
                  fontWeight={600}
                  component="label"
                  htmlFor="password"
                  mb="5px"
                  display="block"
                >
                  Password
                </Typography>
                <CustomTextField
                  id="password"
                  type={show_password ? "text" : "password"}
                  variant="outlined"
                  fullWidth
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setPassword(e.target.value)
                  }
                  required
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        onClick={() => setShow_password(!show_password)}
                        edge="end"
                      >
                        {show_password ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    ),
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography
                  variant="subtitle1"
                  fontWeight={600}
                  component="label"
                  htmlFor="confirm_password"
                  mb="5px"
                  display="block"
                >
                  Confirm Password
                </Typography>
                <CustomTextField
                  id="confirm_password"
                  type={show_confirm_password ? "text" : "password"}
                  variant="outlined"
                  fullWidth
                  value={confirm_password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setConfirm_password(e.target.value)
                  }
                  required
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        onClick={() =>
                          setShow_confirm_password(!show_confirm_password)
                        }
                        edge="end"
                      >
                        {show_confirm_password ? (
                          <Visibility />
                        ) : (
                          <VisibilityOff />
                        )}
                      </IconButton>
                    ),
                  }}
                />
              </Grid>
            </Grid>
            <Button
              color="primary"
              variant="contained"
              size="large"
              fullWidth
              type="submit"
              disabled={isLoading}
              sx={{ py: 1.5, fontSize: "1rem", fontWeight: "bold" }}
            >
              {isLoading ? "Signing Up..." : "Sign Up"}
            </Button>
          </Box>
          {subtitle}
        </>
      )}
    </form>
  );
};

export default AuthRegister;
