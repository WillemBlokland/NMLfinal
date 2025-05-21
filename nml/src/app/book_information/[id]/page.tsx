"use client"; // Ensures this runs only on the client

import { useEffect, useState } from "react";
import { useParams } from "next/navigation"; // Use useParams for dynamic routes
import { Button, Card, CardContent, Typography, Link, Box } from "@mui/material";
import Image from "next/image";
import { Star as StarIcon } from "@mui/icons-material";

// Interface for the Story data
interface Story {
  "": number; // ID
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
  const { id } = useParams(); // Get the id from the URL params
  const [story, setStory] = useState<Story | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Make sure id exists before fetching
    if (!id) return;

    async function fetchStory() {
      try {
        const response = await fetch("/mock_data/short_stories.json");
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        const storyData = data.find((story: Story) => story[""] === parseInt(id as string));

        if (storyData) {
          setStory(storyData);
        } else {
          setError("Story not found.");
        }
      } catch (err) {
        console.error("Error loading story:", err);
        setError("Failed to load story. Please try again later.");
      }
    }

    fetchStory();
  }, [id]); // Re-run the effect if the id changes

  if (error) return <p>{error}</p>;
  if (!story) return <p>Loading...</p>;

  return (
    <div>
      <h1>{story.Title}</h1>
      <div style={{ display: "flex", gap: "20px" }}>
        <Image src={story.Img} alt={story.Title} width={300} height={450} />
        <Card sx={{ width: "100%" }}>
          <CardContent>
            {/* Title */}
            <Typography variant="h4" component="h2" gutterBottom>
              {story.Title}
            </Typography>

            {/* Author */}
            <Typography variant="h6" color="textSecondary" gutterBottom>
              By {story.Author}
            </Typography>

            {/* Rating with Stars */}
            <Box display="flex" alignItems="center" gap="5px">
              {[...Array(5)].map((_, index) => (
                <StarIcon
                  key={index}
                  style={{
                    color: index < story.Rating ? "#FFD700" : "#e0e0e0", // Gold if rated
                  }}
                />
              ))}
            </Box>

            {/* Year */}
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Year: {story.Year}
            </Typography>

            {/* Words and Reading Duration */}
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Words: {story.Words} | Reading Duration: {story.Minutes} min
            </Typography>

            {/* Genres */}
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Genres: {story.Genres}
            </Typography>

            {/* Description */}
            <Typography variant="body1" paragraph>
              {story.Description}
            </Typography>

            {/* Blurb */}
            <Typography variant="body2" paragraph>
             {story.Blurb}
            </Typography>

            {/* Go Back Button and Links on Same Line */}
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Button variant="contained" color="primary" onClick={() => window.history.back()}>
                Go Back
              </Button>

              <Box display="flex" gap="10px">
                <Typography variant="body2">
                  <strong>Read Online:</strong>{" "}
                  <Link href={story.Read} target="_blank" rel="noopener">
                    Read Online
                  </Link>
                </Typography>
                <Typography variant="body2">
                    <strong>Read Locally:</strong>{" "}
                    <Link href={`/text?id=${story[""]}`}>
                        Read Here
                    </Link>
                    </Typography>
                <Typography variant="body2">
                  <strong>EPUB:</strong>{" "}
                  <Link href={story.Epub} target="_blank" rel="noopener">
                    Download EPUB
                  </Link>
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

