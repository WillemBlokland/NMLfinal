"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Typography,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  Box,
  RadioGroup,
  Radio,
  TextField,
} from "@mui/material";
import { checkUserRatingLimit } from "@/lib/userCheck";

export default function SpecificQuestionnaire() {
  const router = useRouter();
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [storyLength, setStoryLength] = useState<string>("");
  const [specificInterest, setSpecificInterest] = useState<string>("");
  const [username, setUsername] = useState<string | null>(null);
  const [limitExceeded, setLimitExceeded] = useState<boolean>(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("loggedInUser");
    if (!storedUser) {
      router.push("/login");
    } else {
      setUsername(storedUser);
    }
  }, [router]);

  useEffect(() => {
    if (!username) return;

    const checkLimit = async () => {
      const exceeded = await checkUserRatingLimit(username);
      setLimitExceeded(exceeded);
    };

    checkLimit();
  }, [username]);

  const handleGenreChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const genre = event.target.name;
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleLengthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStoryLength(event.target.value);
  };

  const handleSubmit = async () => {
    if (!username || limitExceeded) return;

    const data = {
      name: username,
      action: "specific_questionnaire",
      value: {
        preferredGenres: selectedGenres,
        preferredLength: storyLength,
        specificInterest,
      },
    };

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/interact`, {

        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        console.error("Failed to save specific questionnaire");
        return;
      }

      localStorage.setItem("userPreferences", JSON.stringify(data.value));
      console.log("Specific questionnaire submitted:", data);
      router.push("/recommendations");
    } catch (error) {
      console.error("Error submitting:", error);
    }
  };

  if (limitExceeded) {
    return (
      <Container sx={{ mt: 5 }}>
        <Typography variant="h5" color="textSecondary" align="center">
          You have already read enough stories. Please come back on the 1st of June to complete this user study.
        </Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          What are you in the mood for?
        </Typography>

        <FormControl component="fieldset" fullWidth sx={{ mb: 4 }}>
          <FormLabel>Preferred Genres</FormLabel>
          <FormGroup>
            {[
              "Adventure", "Childrens", "Fantasy", "Gothic", "Horror",
              "Literary", "Mystery", "Poetry", "Quirky", "Sci-fi",
              "Tragedy", "War"
            ].map((genre) => (
              <FormControlLabel
                key={genre}
                control={
                  <Checkbox
                    name={genre}
                    checked={selectedGenres.includes(genre)}
                    onChange={handleGenreChange}
                  />
                }
                label={genre}
              />
            ))}
          </FormGroup>
        </FormControl>

        <FormControl component="fieldset" fullWidth sx={{ mb: 4 }}>
          <FormLabel>Story Length</FormLabel>
          <RadioGroup value={storyLength} onChange={handleLengthChange}>
            {[
              "0 - 10 minutes",
              "10 - 20 minutes",
              "20 - 30 minutes",
              "30 - 45 minutes",
              "45 - 80 minutes"
            ].map((length) => (
              <FormControlLabel
                key={length}
                value={length}
                control={<Radio />}
                label={length}
              />
            ))}
          </RadioGroup>
        </FormControl>

        <Box sx={{ mt: 4, mb: 4 }}>
          <FormLabel>Specific Interests</FormLabel>
          <TextField
            variant="outlined"
            fullWidth
            placeholder="e.g. dragons, space travel, heartbreak..."
            sx={{ mt: 1 }}
            value={specificInterest}
            onChange={(e) => setSpecificInterest(e.target.value)}
          />
        </Box>

        <Box sx={{ mt: 3 }}>
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            Submit
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
