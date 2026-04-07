import React, { useState } from "react";
import {
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Button,
  Stack,
  Checkbox,
  Alert,
  TextField,
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/lib/auth/auth-context";
import { useEffect } from "react";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { IconButton } from "@mui/material";

import CustomTextField from "@/app/(AdminLayout)/components/forms/theme-elements/CustomTextField";

interface loginType {
  title?: string;
  subtitle?: React.ReactNode;
  subtext?: React.ReactNode;
}

const AuthLogin = ({ title, subtitle, subtext }: loginType) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show_password, setShow_password] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login, user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "Administrator") {
        router.push("/admin");
      } else {
        router.push("/User");
      }
    }
  }, [isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email.trim(), password);
      // Wait for user state to be updated or just check the result if login returned it
      // Since AuthContext sets user, we can assume it's available or we can use the logic from AuthContext
      // However, router.push is better handled here by checking the stored user or passing back role from login
    } catch (err: any) {
      setError(err.message || "Invalid email or password");
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

      <Stack spacing={3} mt={3}>
        {error && <Alert severity="error">{error}</Alert>}
        <Box>
          {/* <Typography
            variant="subtitle1"
            fontWeight={600}
            component="label"
            htmlFor="username"
            mb="5px"
          >
            Email Address
          </Typography> */}
          {/* <CustomTextField
            id="username"
            variant="outlined"
            fullWidth
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEmail(e.target.value)
            }
            required
          /> */}
          <TextField
            id="username"
            label="Email Address :"
            placeholder="Enter your email address"
            variant="outlined"
            fullWidth
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEmail(e.target.value)
            }
            InputLabelProps={{
              required: false, // removes the *
            }}
            required
          />
        </Box>
        <Box>
          {/* <Typography
            variant="subtitle1"
            fontWeight={600}
            component="label"
            htmlFor="password"
            mb="5px"
          >
            Password
          </Typography> */}
          {/* <CustomTextField
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
          /> */}
          <TextField
            id="password"
            label="Password :"
            placeholder="Enter your password"
            type={show_password ? "text" : "password"}
            variant="outlined"
            fullWidth
            value={password}
            InputLabelProps={{
              required: false, // removes the *
            }}
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
        </Box>
        {/* <Stack
          justifyContent="space-between"
          direction="row"
          alignItems="center"
          my={2}
        > */}
        {/* <FormGroup>
          <FormControlLabel
              control={<Checkbox defaultChecked />}
              label="Remember this Device"
            /> */}
        {/* </FormGroup> */}
        {/* <Typography
            component={Link}
            href="/"
            fontWeight="500"
            sx={{
              textDecoration: "none",
              color: "primary.main",
            }}
          >
            Forgot Password ?
          </Typography> */}
        {/* </Stack> */}
      </Stack>
      <Box mt={2}>
        <Button
          color="primary"
          variant="contained"
          size="large"
          fullWidth
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Signing In..." : "Sign In"}
        </Button>
      </Box>
      {subtitle}
    </form>
  );
};

export default AuthLogin;
