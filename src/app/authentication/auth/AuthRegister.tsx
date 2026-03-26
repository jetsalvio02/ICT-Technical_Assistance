import React, { useState } from "react";
import { Box, Typography, Button, Stack, Alert } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/lib/auth/auth-context";
import {
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";

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
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("User");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Basic name splitting for mock user
    // const [firstName = "", ...lastNameParts] = name.split(" ");
    // const lastName = lastNameParts.join(" ") || "User";

    try {
      await register({
        firstName,
        lastName,
        email,
        password,
        office: "General Office",
        role,
      });
      if (role === "Administrator") {
        router.push("/dashboard");
      } else {
        router.push("/User");
      }
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

      <Box>
        <Stack spacing={3} mb={3}>
          {error && <Alert severity="error">{error}</Alert>}
          <Box>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              component="label"
              htmlFor="firstName"
              mb="5px"
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
          </Box>

          <Box>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              component="label"
              htmlFor="lastName"
              mb="5px"
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
          </Box>

          <Box>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              component="label"
              htmlFor="email"
              mb="5px"
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
          </Box>

          <Box>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              component="label"
              htmlFor="password"
              mb="5px"
            >
              Password
            </Typography>
            <CustomTextField
              id="password"
              type="password"
              variant="outlined"
              fullWidth
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
              required
            />
          </Box>

          {/* <Box>
            <FormControl component="fieldset">
              <FormLabel component="legend" sx={{ fontWeight: 600, mb: 1 }}>
                Role
              </FormLabel>
              <RadioGroup
                row
                aria-label="role"
                name="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <FormControlLabel
                  value="User"
                  control={<Radio />}
                  label="User"
                />
                <FormControlLabel
                  value="Administrator"
                  control={<Radio />}
                  label="Admin"
                />
              </RadioGroup>
            </FormControl>
          </Box> */}
        </Stack>
        <Button
          color="primary"
          variant="contained"
          size="large"
          fullWidth
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Signing Up..." : "Sign Up"}
        </Button>
      </Box>
      {subtitle}
    </form>
  );
};

export default AuthRegister;
