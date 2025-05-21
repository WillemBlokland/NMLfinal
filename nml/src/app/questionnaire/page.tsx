"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation"; // Import useRouter for navigation
import { 
  Container, Typography, FormControl, FormLabel, 
  FormGroup, FormControlLabel, Checkbox, Button, Box, TextField 
} from "@mui/material";

export default function Questionnaire() {
  const router = useRouter(); // Initialize router

  // State for selected genres
  const [selectedGenres1, setSelectedGenres1] = useState<string[]>([]);
  const [selectedGenres2, setSelectedGenres2] = useState<string[]>([]);
  const [interest, setInterest] = useState<string>(""); // Free-text field state

  // Handle checkbox selection
  const handleGenres1Change = (event: React.ChangeEvent<HTMLInputElement>) => {
    const genre = event.target.name;
    setSelectedGenres1((prev) =>
      prev.includes(genre) ? prev.filter((item) => item !== genre) : [...prev, genre]
    );
  };

  const handleGenres2Change = (event: React.ChangeEvent<HTMLInputElement>) => {
    const genre = event.target.name;
    setSelectedGenres2((prev) =>
      prev.includes(genre) ? prev.filter((item) => item !== genre) : [...prev, genre]
    );
  };

  // Handle form submission
  const handleSubmit = () => {
    console.log("Selected Genres for 'What are you interested in?':", selectedGenres1);
    console.log("Selected Genres for 'What are you interested in today?':", selectedGenres2);
    console.log("User's specific interest:", interest);

    // Redirect to recommendations page
    router.push("/recommendations");
  };

  return (
    <Container>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Questionnaire
        </Typography>

        {/* Question 1 */}
        <FormControl component="fieldset" fullWidth sx={{ mb: 4 }}>
          <FormLabel component="legend">What are you interested in?</FormLabel>
          <FormGroup>
            <FormControlLabel control={<Checkbox name="Drama" checked={selectedGenres1.includes("Drama")} onChange={handleGenres1Change} />} label="Drama" />
            <FormControlLabel control={<Checkbox name="Fantasy" checked={selectedGenres1.includes("Fantasy")} onChange={handleGenres1Change} />} label="Fantasy" />
            <FormControlLabel control={<Checkbox name="SciFi" checked={selectedGenres1.includes("SciFi")} onChange={handleGenres1Change} />} label="Sci-Fi" />
            <FormControlLabel control={<Checkbox name="Romantic" checked={selectedGenres1.includes("Romantic")} onChange={handleGenres1Change} />} label="Romantic" />
          </FormGroup>
        </FormControl>

        {/* Question 2 */}
        <FormControl component="fieldset" fullWidth sx={{ mb: 4 }}>
          <FormLabel component="legend">What are you interested in today?</FormLabel>
          <FormGroup>
            <FormControlLabel control={<Checkbox name="Drama" checked={selectedGenres2.includes("Drama")} onChange={handleGenres2Change} />} label="Drama" />
            <FormControlLabel control={<Checkbox name="Fantasy" checked={selectedGenres2.includes("Fantasy")} onChange={handleGenres2Change} />} label="Fantasy" />
            <FormControlLabel control={<Checkbox name="SciFi" checked={selectedGenres2.includes("SciFi")} onChange={handleGenres2Change} />} label="Sci-Fi" />
            <FormControlLabel control={<Checkbox name="Romantic" checked={selectedGenres2.includes("Romantic")} onChange={handleGenres2Change} />} label="Romantic" />
          </FormGroup>
        </FormControl>

        {/* Free-Text Question Box */}
        <Box sx={{ mt: 4, mb: 4, p: 2, border: "1px solid #ccc", borderRadius: "8px" }}>
          <FormLabel component="legend">Are you interested in anything in particular?</FormLabel>
          <TextField
            variant="outlined"
            fullWidth
            sx={{ mt: 1 }}
            value={interest}
            onChange={(e) => setInterest(e.target.value)}
          />
        </Box>

        {/* Submit Button */}
        <Box sx={{ mt: 3 }}>
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            Submit
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
