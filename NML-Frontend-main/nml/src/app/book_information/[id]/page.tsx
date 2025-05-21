"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, Card, CardContent, Typography, Box } from "@mui/material";
import Image from "next/image";
import { Star as StarIcon } from "@mui/icons-material";
import { checkUserRatingLimit } from "@/lib/userCheck";

interface Story {
  "": number;
  Title: string;
  Author: string;
  Rating: number;
  Img: string;
  Img_description: string;
  Year: number;
  Words: number;
  Minutes: number;
  Description: string;
  Genres: string;
  Blurb: string;
  PDF: string;
  Epub: string;
  Read: string;
}

export default function BookInformation() {
  const { id } = useParams();
  const [story, setStory] = useState<Story | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [limitExceeded, setLimitExceeded] = useState<boolean>(false);
  const router = useRouter();

  const logInteraction = async (action: string, storyId: number) => {
    if (!username) return;
    try {
      await fetch("http://localhost:5000/interact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: username,
          action,
          value: [storyId],
        }),
      });
    } catch (err) {
      console.error(`Failed to log interaction (${action}):`, err);
    }
  };

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
    if (!id || !username || limitExceeded) return;

    async function fetchStory() {
      try {
        const response = await fetch("/mock_data/short_stories.json");
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        const storyData = data.find((story: Story) => story[""] === parseInt(id as string));

        if (storyData) {
          setStory(storyData);
          logInteraction("book_opened", storyData[""]);
        } else {
          setError("Story not found.");
        }
      } catch (err) {
        console.error("Error loading story:", err);
        setError("Failed to load story. Please try again later.");
      }
    }

    fetchStory();
  }, [id, username, limitExceeded]);

  const handleGoBack = () => {
    if (story) logInteraction("book_go_back", story[""]);
    window.history.back();
  };

  const handleReadNow = () => {
    if (story) logInteraction("book_read_now", story[""]);
    router.push(`/text?id=${story?.[""]}`);
  };

  if (error) return <p>{error}</p>;
  if (limitExceeded) {
    return (
      <Box mt={5}>
        <Typography variant="h5" color="textSecondary" align="center">
          You have already read enough stories. Please come back on the 1st of June to complete this user study.
        </Typography>
      </Box>
    );
  }
  if (!story) return <p>Loading...</p>;

  return (
    <div>
      <h1>{story.Title}</h1>
      <div style={{ display: "flex", gap: "20px" }}>
        <Image src={story.Img} alt={story.Title} width={300} height={450} />
        <Card sx={{ width: "100%" }}>
          <CardContent>
            <Typography variant="h4" component="h2" gutterBottom>
              {story.Title}
            </Typography>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              By {story.Author}
            </Typography>

            <Box display="flex" alignItems="center" gap="5px">
              {[...Array(5)].map((_, index) => (
                <StarIcon
                  key={index}
                  style={{
                    color: index < story.Rating ? "#FFD700" : "#e0e0e0",
                  }}
                />
              ))}
            </Box>

            <Typography variant="body2" color="textSecondary" gutterBottom>
              Year: {story.Year}
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Words: {story.Words} | Reading Duration: {story.Minutes} min
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Genres: {story.Genres}
            </Typography>
            <Typography variant="body1" paragraph>
              {story.Description}
            </Typography>
            <Typography variant="body2" paragraph>
              {story.Blurb}
            </Typography>

            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Button variant="contained" color="primary" onClick={handleGoBack}>
                Go Back
              </Button>
              <Button variant="contained" color="secondary" onClick={handleReadNow}>
                Read Now
              </Button>
            </Box>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
