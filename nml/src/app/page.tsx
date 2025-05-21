"use client"; // Ensure this runs only on the client

import { Button, Typography, Container } from "@mui/material";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter(); // Hook for navigation

  return (
    <Container sx={{ textAlign: "center", marginTop: 5 }}>
      <Typography variant="h2" color="primary" gutterBottom>
        Welcome to Story Recommender!
      </Typography>
      <Button
        variant="contained"
        color="secondary"
        onClick={() => router.push("/questionnaire")} // Navigate to questionnaire
      >
        Get Recommendations
      </Button>
    </Container>
  );
}