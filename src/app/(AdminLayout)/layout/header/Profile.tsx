"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Avatar,
  Box,
  Menu,
  Button,
  IconButton,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
} from "@mui/material";
import { IconUser, IconLogout } from "@tabler/icons-react";
import { useAuth } from "@/app/lib/auth/auth-context";

const Profile = () => {
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
    window.location.href = "/authentication/login";
  };

  return (
    <Box>
      <IconButton size="large" onClick={handleOpen}>
        <Avatar
          sx={{
            width: 35,
            height: 35,
            bgcolor: "primary.main",
            fontSize: 14,
          }}
        >
          {user ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}` : "?"}
        </Avatar>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        sx={{
          "& .MuiMenu-paper": {
            width: "220px",
          },
        }}
      >
        {user && (
          <Box px={2} py={1}>
            <Typography variant="subtitle1" fontWeight={600}>
              {user.firstName} {user.lastName}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {user.role}
            </Typography>
          </Box>
        )}
        <Divider />
        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <IconUser width={20} />
          </ListItemIcon>
          <ListItemText>My Profile</ListItemText>
        </MenuItem>
        <Divider />
        <Box px={2} py={1}>
          <Button
            variant="outlined"
            color="primary"
            fullWidth
            startIcon={<IconLogout size={18} />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>
      </Menu>
    </Box>
  );
};

export default Profile;
