"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Container, TextField, Button, Typography, Box } from "@mui/material";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Predefined users
  const users = [
    { username: "test", password: "nml123" },
    { username: "test2", password: "nml123" },
    { username: "admin", password: "nml123" },
  
    { username: "alice", password: "p4sWd" },
    { username: "brian", password: "x7Lm9" },
    { username: "carol", password: "a9K3b" },
    { username: "derek", password: "z2vJ8" },
    { username: "ellen", password: "r1wYe" },
    { username: "floyd", password: "t3B8q" },

    { username: "grace", password: "m5T2k" },
    { username: "helen", password: "j8Hq9" },
    { username: "irene", password: "c2Xy7" },
    { username: "jason", password: "v4Rk1" },
    { username: "kevin", password: "n7Fp3" },
    { username: "leona", password: "h6D2m" },

    { username: "maria", password: "u3Ez1" },
    { username: "nolan", password: "b5Tpq" },
    { username: "olive", password: "w9Mk2" },
    { username: "paula", password: "k7Grt" },
    { username: "quent", password: "f3Pz6" },
    { username: "ricky", password: "x2Wb1" },

    { username: "sarah", password: "d5Qv7" },
    { username: "tanya", password: "z1P8e" },
    { username: "ursla", password: "m6Nj9" },
    { username: "vince", password: "r3Lg4" },
    { username: "wendy", password: "s8Xq2" },
    { username: "xenia", password: "t2Mb7" },
    
    { username: "youse", password: "e9Ct5" },
    { username: "zelda", password: "g7Hv3" },
    { username: "reina", password: "n2Jq4" },
    { username: "daisy", password: "k5Wp6" },
    { username: "dylan", password: "a4Vz9" },
    { username: "erwin", password: "c2Hz8" },
  ];

  // Handle Login Button Click
  const handleLogin = async () => {
    const matchedUser = users.find(
      (user) => user.username === username && user.password === password
    );

    if (matchedUser) {
      // Save the username to localStorage
      localStorage.setItem("loggedInUser", matchedUser.username);

      // Check if the user exists in the MongoDB database
      try {
        const response = await fetch("http://127.0.0.1:5000/users/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: matchedUser.username }),
        });

        const data = await response.json();

        if (data.exists) {
          // If the user exists, redirect to the home page
          router.push("/");

          // Reload after redirection to ensure state updates
          setTimeout(() => {
            window.location.reload();
          }, 3000); // Slight delay to ensure redirection happens before reload
        } else {
          // If the user doesn't exist, redirect to the worldview questionnaire
          router.push("/worldview_questionnaire");

          // Reload after redirection to ensure state updates
          setTimeout(() => {
            window.location.reload();
          }, 3000); // Slight delay to ensure redirection happens before reload
        }
      } catch (error) {
        console.error("Error checking user in database:", error);
        setError("An error occurred. Please try again.");
      }
    } else {
      setError("Invalid username or password!");
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, p: 4, boxShadow: 3, borderRadius: 2, textAlign: "center" }}>
        <Typography variant="h4" gutterBottom>
          Login
        </Typography>

        <TextField
          label="Username"
          variant="outlined"
          fullWidth
          sx={{ mb: 2 }}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <TextField
          label="Password"
          type="password"
          variant="outlined"
          fullWidth
          sx={{ mb: 3 }}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

        <Button variant="contained" color="primary" fullWidth onClick={handleLogin}>
          Login
        </Button>
      </Box>
    </Container>
  );
}
