"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Typography,
  Box,
  CircularProgress,
  Button,
  Container,
} from "@mui/material";
import { checkUserRatingLimit } from "@/lib/userCheck";

interface StoryMeta {
  "": number;
  Title: string;
  Author: string;
}

export default function TextPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const router = useRouter();

  const [title, setTitle] = useState<string | null>(null);
  const [author, setAuthor] = useState<string | null>(null);
  const [text, setText] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
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
    const checkLimit = async () => {
      if (username) {
        const exceeded = await checkUserRatingLimit(username);
        setLimitExceeded(exceeded);
      }
    };

    checkLimit();
  }, [username]);

  useEffect(() => {
    if (!id || !username || limitExceeded) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [textRes, metaRes] = await Promise.all([
          fetch(`/mock_data/story_texts/${id}.txt`),
          fetch("/mock_data/short_stories.json"),
        ]);

        if (!textRes.ok || !metaRes.ok) {
          throw new Error("Failed to fetch story or metadata.");
        }

        const textData = await textRes.text();
        const metaData: StoryMeta[] = await metaRes.json();
        const parsedId = parseInt(id);
        const storyMeta = metaData.find((s) => s[""] === parsedId);

        if (!storyMeta) {
          throw new Error("Story metadata not found.");
        }

        setTitle(storyMeta.Title);
        setAuthor(storyMeta.Author);
        setText(textData);
      } catch (err) {
        console.error("Error loading story:", err);
        setError("Failed to load story.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, username, limitExceeded]);

  const handleDone = () => {
    router.push(`/rating?id=${id}`);
  };

  if (loading) return <CircularProgress />;
  if (limitExceeded) {
    return (
      <Container sx={{ mt: 5 }}>
        <Typography variant="h5" color="textSecondary" align="center">
          You have already read enough stories. Please come back on the 1st of June to complete this user study.
        </Typography>
      </Container>
    );
  }
  if (error) return <Typography color="error">{error}</Typography>;
  if (!text) return <Typography>Story not found.</Typography>;

  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !(line.startsWith("│") && line.endsWith("│")));

  return (
    <Box sx={{ padding: 2, maxWidth: 600, margin: "0 auto" }}>
      <Typography variant="h4" gutterBottom>
        {title ?? `Story #${id}`}
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" gutterBottom>
        By {author ?? "Unknown Author"}
      </Typography>

      {lines.map((line, idx) => (
        <Typography key={idx} variant="body1" paragraph>
          {line}
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
