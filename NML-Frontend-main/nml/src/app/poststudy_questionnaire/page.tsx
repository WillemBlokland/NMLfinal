"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  Button,
  Paper,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useRouter } from "next/navigation";

const postStudyItems = [
  "I often have tender, concerned feelings for people less fortunate than me.",
  'I sometimes find it difficult to see things from the "other guy\'s" point of view.',
  "Sometimes I don't feel very sorry for other people when they are having problems.",
  "I try to look at everybody's side of a disagreement before I make a decision.",
  "When I see someone being taken advantage of, I feel kind of protective towards them.",
  "I sometimes try to understand my friends better by imagining how things look from their perspective.",
  "Other people's misfortunes do not usually disturb me a great deal.",
  "If I'm sure I'm right about something, I don't waste much time listening to other people's arguments.",
  "When I see someone being treated unfairly, I sometimes don't feel very much pity for them.",
  "I am often quite touched by things that I see happen.",
  "I believe that there are two sides to every question and try to look at them both.",
  "I would describe myself as a pretty soft-hearted person.",
  "When I'm upset at someone, I usually try to 'put myself in his shoes' for a while.",
  "Before criticizing somebody, I try to imagine how I would feel if I were in their place.",
  "I really get involved with the feelings of the characters in a novel.",
  "I am usually objective when I read a story, and I don't often get completely caught up in it.",
  "Becoming extremely involved in a good story is somewhat rare for me.",
  "After reading a story, I have felt as though I were one of the characters.",
  "When I read a story, I can very easily put myself in the place of a leading character.",
  "When I am reading an interesting story or novel, I imagine how I would feel if the events in the story were happening to me.",
];

export default function PostStudyQuestionnairePage() {
  const [responses, setResponses] = useState<{ [key: string]: number | null }>(
    Object.fromEntries(postStudyItems.map((item) => [item, null]))
  );
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("loggedInUser");
    if (!storedUser) {
      router.push("/login");
      return;
    }
    setUsername(storedUser);
    setLoading(false);
  }, [router]);

  const handleChange = (item: string, value: number) => {
    setResponses((prev) => ({ ...prev, [item]: value }));
  };

  const isComplete = Object.values(responses).every((v) => v !== null);

  const handleSubmit = async () => {
    if (!isComplete || !username) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/poststudy_questionnaire`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username,
          poststudy_questionnaire: responses,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit poststudy questionnaire");
      }

      console.log("Poststudy questionnaire submitted:", responses);
      setOpenDialog(true); // Show thank-you dialog
    } catch (err) {
      console.error("Error submitting poststudy questionnaire:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    router.push("/login");
    window.location.reload(); // Force refresh
  };  

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 700, mx: "auto", p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Post-Study Questionnaire
      </Typography>
      <Typography variant="body1" gutterBottom>
        The following statements inquire about your thoughts and feelings in a variety of situations.
        For each item, indicate how well it describes you. Answer as honestly as you can.
      </Typography>
      <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>
        1 = Does not describe me well &nbsp;&nbsp;&nbsp;&nbsp; 5 = Describes me very well
      </Typography>

      <Box mt={4}>
        {postStudyItems.map((item) => (
          <Paper key={item} sx={{ p: 2, mb: 2 }}>
            <FormControl component="fieldset">
              <FormLabel component="legend">{item}</FormLabel>
              <RadioGroup
                row
                value={responses[item] ?? ""}
                onChange={(e) => handleChange(item, parseInt(e.target.value))}
              >
                {[1, 2, 3, 4, 5].map((val) => (
                  <FormControlLabel
                    key={val}
                    value={val}
                    control={<Radio />}
                    label={val.toString()}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </Paper>
        ))}
      </Box>

      <Box display="flex" justifyContent="center" mt={4}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={!isComplete}
        >
          Submit
        </Button>
      </Box>

      {/* Thank You Dialog */}
      <Dialog open={openDialog} onClose={handleLogout}>
        <DialogTitle>Thank You!</DialogTitle>
        <DialogContent>
          <Typography>
            Thanks for participating in our study. You can log out now.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLogout} color="primary" variant="contained">
            Log Out
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
