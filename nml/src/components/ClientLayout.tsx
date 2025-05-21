"use client"; // 👈 This tells Next.js it's a Client Component

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { AppBar, Toolbar, Button, Box, Container, ThemeProvider, CssBaseline } from "@mui/material";
import theme from "@/theme/theme"; // Ensure this path is correct

export default function ClientLayout({ children }: { children: React.ReactNode }) {
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
          {[
            { href: "/", label: "Home" },
            { href: "/about", label: "About" },
          ].map(({ href, label }) => (
            <Button
              key={href}
              component={Link}
              href={href}
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.background.default,
                mx: 1,
                "&:hover": { backgroundColor: theme.palette.primary.dark },
              }}
            >
              {label}
            </Button>
          ))}
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container sx={{ mt: 4 }}>
        <main>{children}</main>
      </Container>
    </ThemeProvider>
  );
}
