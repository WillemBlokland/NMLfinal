"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Typography, Box, CircularProgress, Button } from "@mui/material";

interface StoryText {
  Id: number;
  Text: string;
}

export default function TextPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [story, setStory] = useState<StoryText | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!id) {
      setError("No story ID provided.");
      setLoading(false);
      return;
    }

    const parsedId = parseInt(id);

    async function fetchStory() {
      setLoading(true);
      try {
        const response = await fetch("/mock_data/short_stories_text.json");
        if (!response.ok) throw new Error("Failed to load story text.");

        const data: StoryText[] = await response.json();
        const storyData = data.find((story) => story.Id === parsedId);

        if (storyData) {
          setStory(storyData);
        } else {
          setError("Story not found.");
        }
      } catch (err) {
        console.error("Error fetching story:", err);
        setError("Failed to load story.");
      } finally {
        setLoading(false);
      }
    }

    fetchStory();
  }, [id]);

  const handleDone = () => {
    router.push(`/rating?id=${id}`);
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!story) return <Typography>Story not found.</Typography>;

  // Clean up unwanted characters and remove the footer
  const cleanedText = story.Text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // Remove control characters
    .replace(/Downloaded from www libraryofshortstories com\s*$/i, ""); // Remove footer

  const lines = cleanedText.split("\n").filter((line) => line.trim().length > 0);
  const title = lines[0] || `Story #${story.Id}`;
  const author = lines[1] || "Unknown Author";
  const storyBody = lines.slice(2);

  return (
    <Box sx={{ padding: 2, maxWidth: 600, margin: "0 auto" }}>
      <Typography variant="h4" gutterBottom>
        {title}
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" gutterBottom>
        By {author}
      </Typography>

      {storyBody.map((para, idx) => (
        <Typography variant="body1" paragraph key={idx}>
          {para}
        </Typography>
      ))}

      <Box display="flex" justifyContent="center" marginTop={2}>
        <Button variant="contained" color="primary" onClick={handleDone}>
          Done
        </Button>
      </Box>
    </Box>
  );
}
