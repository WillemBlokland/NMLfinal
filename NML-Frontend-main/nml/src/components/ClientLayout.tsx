"use client"; // 👈 This tells Next.js it's a Client Component

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AppBar, Toolbar, Button, Box, Container, ThemeProvider, CssBaseline } from "@mui/material";
import theme from "@/theme/theme"; // Ensure this path is correct
import { useRouter, usePathname } from "next/navigation";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [username, setUsername] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname(); // Use usePathname to get the current route

  // On mount, check if the user is logged in
  useEffect(() => {
    const loggedInUser = localStorage.getItem("loggedInUser");
    if (loggedInUser) {
      setUsername(loggedInUser);
    }
  }, []);

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem("loggedInUser"); // Remove user from localStorage
    setUsername(null); // Clear the username state
    router.push("/login"); // Redirect to login page after logout
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {/* Navbar */}
      <AppBar position="static" sx={{ backgroundColor: theme.palette.background.default, boxShadow: "none" }}>
        <Toolbar>
          <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
            <Image src="/logo.png" alt="University Logo" width={200} height={98} priority />
          </Box>

          {/* Navigation Links */}
          {pathname !== "/worldview_questionnaire" && (
            <>
              <Button
                component={Link}
                href="/"
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.background.default,
                  mx: 1,
                  "&:hover": { backgroundColor: theme.palette.primary.dark },
                }}
              >
                Home
              </Button>
              <Button
                component={Link}
                href="/about"
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.background.default,
                  mx: 1,
                  "&:hover": { backgroundColor: theme.palette.primary.dark },
                }}
              >
                About
              </Button>
            </>
          )}

          {/* User Button */}
          {username ? (
            <Button
              onClick={handleLogout}
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.background.default,
                mx: 1,
                "&:hover": { backgroundColor: theme.palette.primary.dark },
              }}
            >
              Logged in as: {username} (Logout)
            </Button>
          ) : (
            <Button
              component={Link}
              href="/login"
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.background.default,
                mx: 1,
                "&:hover": { backgroundColor: theme.palette.primary.dark },
              }}
            >
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container sx={{ mt: 4 }}>
        <main>{children}</main>
      </Container>
    </ThemeProvider>
  );
}
