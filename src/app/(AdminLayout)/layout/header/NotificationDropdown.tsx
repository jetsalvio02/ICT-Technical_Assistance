"use client";

import React, { useState, useEffect } from "react";
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  List,
  ListItemText,
  ListItemIcon,
  Button,
} from "@mui/material";
import { IconBellRinging, IconMessage2 } from "@tabler/icons-react";
import { useAuth } from "@/app/lib/auth/auth-context";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  request?: {
    id: string;
    requestNumber: string;
    status: string;
  };
}

const NotificationDropdown = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const fetchNotifications = async () => {
    if (!user?.id) return;
    try {
      const response = await fetch(`/api/notifications?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 1 minute
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = async () => {
    setAnchorEl(null);
    if (unreadCount > 0 && user?.id) {
      try {
        await fetch(`/api/notifications?userId=${user.id}`, {
          method: "PATCH",
        });
        // Update local state to mark as read
        setNotifications(
          notifications.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
        );
      } catch (error) {
        console.error("Error marking notifications as read:", error);
      }
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <>
      <IconButton
        size="large"
        aria-label="notifications"
        color="inherit"
        aria-controls={open ? "notification-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
      >
        <Badge variant="dot" color="primary" invisible={unreadCount === 0}>
          <IconBellRinging size="21" stroke="1.5" />
        </Badge>
      </IconButton>
      <Menu
        id="notification-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
            mt: 1.5,
            width: { xs: "calc(100vw - 32px)", sm: 360 },
            maxWidth: 360,
            maxHeight: 450,
            "& .MuiAvatar-root": {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            "&:before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: "background.paper",
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <Box px={2} py={1} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Notifications</Typography>
          {unreadCount > 0 && (
            <Badge badgeContent={unreadCount} color="primary" sx={{ mr: 1 }} />
          )}
        </Box>
        <Divider />
        {notifications.length === 0 ? (
          <Box p={3} textAlign="center">
            <Typography variant="body2" color="textSecondary">
              No new notifications
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0, maxHeight: 350, overflow: "auto" }}>
            {notifications.map((notification) => (
              <MenuItem key={notification.id} onClick={handleClose} sx={{ py: 1.5, px: 2, whiteSpace: "normal" }}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <IconMessage2 size="20" color={notification.isRead ? "gray" : "#5d87ff"} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography
                      component="span"
                      variant="subtitle2"
                      fontWeight={notification.isRead ? 400 : 700}
                    >
                      {notification.title}
                    </Typography>
                  }
                  primaryTypographyProps={{ component: "div" }}
                  secondary={
                    <Box component="span" sx={{ display: "block" }}>
                      <Typography
                        component="span"
                        variant="body2"
                        color="textSecondary"
                        sx={{ display: "block", mb: 0.5 }}
                      >
                        {notification.message}
                      </Typography>
                      <Typography component="span" variant="caption" color="textSecondary">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </Typography>
                    </Box>
                  }
                  secondaryTypographyProps={{ component: "div" }}
                />
              </MenuItem>
            ))}
          </List>
        )}
        <Divider />
        <Box p={1} textAlign="center">
          <Button fullWidth color="primary" onClick={handleClose}>
            Close
          </Button>
        </Box>
      </Menu>
    </>
  );
};

export default NotificationDropdown;
