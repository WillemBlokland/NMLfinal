"use client"; // Ensures this runs only on the client

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button, Card, CardContent, Typography } from "@mui/material";

interface Story {
  "": number; // ID
  Title: string;
  Author: string;
  Img: string;
}

export default function Recommendations() {
  const [stories, setStories] = useState<Story[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStories() {
      try {
        const response = await fetch("/mock_data/short_stories.json");
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        setStories(data.slice(0, 5)); // Show only the first 5 stories
      } catch (err) {
        console.error("Error loading stories:", err);
        setError("Failed to load stories. Please try again later.");
      }
    }

    fetchStories();
  }, []);

  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>Recommended Stories</h1>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {stories.length > 0 ? (
          stories.map((story) => (
            <Card key={story[""]} sx={{ width: 200 }}>
              <Image src={story.Img} alt={story.Title} width={200} height={300} />
              <CardContent>
                <Typography variant="h6">{story.Title}</Typography>
                <Typography variant="body2">By {story.Author}</Typography>
                <Button component={Link} href={`/book_information/${story[""]}`} sx={{ mt: 1 }}>
                  Read More
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
}
