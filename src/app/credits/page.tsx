"use client";
import { Box, Typography, Stack, Container } from "@mui/material";
import { IconHome } from "@tabler/icons-react";
import PageContainer from "@/app/(AdminLayout)/components/container/PageContainer";
import Link from "next/link";

const teamMembers = ["Jethro Salvio", "John Anthony Tolog", "Angel Donesa"];

const CreditsPage = () => {
  return (
    <PageContainer
      title="Credits"
      description="Meet the team behind ICT Support Technical Assistance"
    >
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#f8faff", // Clean light background
          py: 8,
        }}
      >
        <Container maxWidth="sm">
          <Stack spacing={4} alignItems="center" textAlign="center">
            {/* Heading Section */}
            <Box mb={2}>
              <Typography
                variant="h2"
                fontWeight="700"
                sx={{
                  color: "#003399", // Dark blue from image
                  lineHeight: 1.2,
                  mb: 1,
                }}
              >
                Designed and Developed by
              </Typography>
              <Typography
                variant="h2"
                fontWeight="700"
                sx={{
                  color: "#003399",
                  lineHeight: 1.2,
                }}
              >
                IT Students <br /> of <br /> Kabankalan Catholic College Inc.
              </Typography>
            </Box>

            {/* Team Members List */}
            <Stack spacing={1.5} mb={4}>
              {teamMembers.map((name, index) => (
                <Typography
                  key={index}
                  variant="h5"
                  fontWeight="500"
                  color="textPrimary"
                >
                  {name}
                </Typography>
              ))}
            </Stack>

            {/* Copyright Section */}
            <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
              © Copyright. All Rights Reserved 2026
            </Typography>

            {/* Go Back Link */}
            <Link
              href="/authentication/login"
              style={{ textDecoration: "none" }}
            >
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ color: "#4f6cf6" }}
              >
                <IconHome size={22} />
                <Typography variant="h6" fontWeight="600">
                  Go back
                </Typography>
              </Stack>
            </Link>
          </Stack>
        </Container>
      </Box>
    </PageContainer>
  );
};

export default CreditsPage;
