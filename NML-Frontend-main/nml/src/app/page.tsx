"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Typography,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { checkUserRatingLimit } from "@/lib/userCheck";

export default function HomePage() {
  const router = useRouter();
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [adminCompletedPoststudy, setAdminCompletedPoststudy] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  useEffect(() => {
    async function checkAdminPoststudy() {
      try {
        // Call backend to check if admin completed poststudy_questionnaire
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/poststudy_questionnaire/check`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "admin" }),
        });

        if (!res.ok) throw new Error("Failed to fetch admin data");

        const data = await res.json();

        // Assume backend returns { has_filled_poststudy: boolean }
        setAdminCompletedPoststudy(data.has_filled_poststudy);
      } catch (error) {
        console.error("Error checking admin poststudy questionnaire:", error);
        setAdminCompletedPoststudy(false);
      } finally {
        setCheckingAdmin(false);
      }
    }

    checkAdminPoststudy();
  }, []);

  const handleCheckAccess = async () => {
    setLoading(true);
    const username = localStorage.getItem("loggedInUser");

    if (!username) {
      router.push("/login");
      return;
    }

    const hasExceededLimit = await checkUserRatingLimit(username);

    if (hasExceededLimit) {
      setOpenDialog(true);
    } else {
      router.push("/questionnaire");
    }
    setLoading(false);
  };

  // Show loading spinner while checking admin status
  if (checkingAdmin) {
    return (
      <Container sx={{ textAlign: "center", marginTop: 10 }}>
        <CircularProgress />
      </Container>
    );
  }

  // If admin completed poststudy questionnaire, show the new message & button for all users
  if (adminCompletedPoststudy) {
    return (
      <Container sx={{ textAlign: "center", marginTop: 5 }}>
        <Typography variant="h4" gutterBottom>
          Thanks for contributing to our study.
        </Typography>
        <Typography variant="body1" gutterBottom>
          Please fill out the final questionnaire.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => router.push("/poststudy_questionnaire")}
          sx={{ mt: 3 }}
        >
          Go to Final Questionnaire
        </Button>
      </Container>
    );
  }

  // Normal homepage for everyone else
  return (
    <Container sx={{ textAlign: "center", marginTop: 5 }}>
      <Typography variant="h2" color="primary" gutterBottom>
        Welcome to ShortReads!
      </Typography>
      <Button
        variant="contained"
        color="secondary"
        onClick={handleCheckAccess}
        disabled={loading}
      >
        {loading ? "Checking..." : "Get Recommendations"}
      </Button>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Thank you for participating!</DialogTitle>
        <DialogContent>
          <Typography>
            You have already read enough stories. Please come back on the 1st of June to complete this user study.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
