"use client";
export const dynamic = "force-dynamic";


import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Typography,
  Box,
  Button,
  Rating,
  Container,
} from "@mui/material";
import { checkUserRatingLimit } from "@/lib/userCheck";

interface Story {
  "": number; // ID
  Title: string;
  Author: string;
}

export default function RatingPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const router = useRouter();

  const [story, setStory] = useState<Story | null>(null);
  const [rating, setRating] = useState<number | null>(null);
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

  useEffect(() => {
    if (!id || limitExceeded) return;

    const parsedId = parseInt(id);
    if (isNaN(parsedId)) return;

    async function fetchStory() {
      try {
        const response = await fetch("/mock_data/short_stories.json");
        if (!response.ok) throw new Error("Failed to load stories");

        const data = await response.json();
        const storyData = data.find((story: Story) => story[""] === parsedId);

        if (storyData) {
          setStory(storyData);
        } else {
          console.error("Story not found.");
        }
      } catch (err) {
        console.error("Error fetching story:", err);
      }
    }

    fetchStory();
  }, [id, limitExceeded]);

  const handleRatingChange = (_event: any, newValue: number | null) => {
    setRating(newValue);
  };

  const handleSubmitRating = async () => {
    if (!rating || !username || !story) return;

    try {
      const response = await fetch("http://127.0.0.1:5000/interact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: username,
          action: "rate_story",
          value: {
            story_id: story[""],
            title: story.Title,
            rating: rating,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit rating");
      }

      console.log(`Rating submitted: ${rating}`);
      router.push("/");
    } catch (err) {
      console.error("Error submitting rating:", err);
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

  if (!story) return <Typography>Story not found.</Typography>;

  return (
    <Box sx={{ padding: 2, maxWidth: 600, margin: "0 auto" }}>
      <Typography variant="h3" gutterBottom>
        Rate "{story.Title}"
      </Typography>

      <Typography variant="h6" color="textSecondary" gutterBottom>
        By {story.Author}
      </Typography>

      <Box display="flex" justifyContent="center" marginTop={2}>
        <Typography variant="body1">Rate this story:</Typography>
        <Rating
          value={rating}
          onChange={handleRatingChange}
          precision={0.5}
          size="large"
          sx={{ marginLeft: 2 }}
        />
      </Box>

      <Box display="flex" justifyContent="center" marginTop={2}>
        <Button variant="contained" color="primary" onClick={handleSubmitRating}>
          Submit Rating
        </Button>
      </Box>
    </Box>
  );
}
