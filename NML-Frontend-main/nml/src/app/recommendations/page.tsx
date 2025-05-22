"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button, Card, CardContent, Typography, Box, Container } from "@mui/material";
import { useRouter } from "next/navigation";
import { getRecommendedStories, Preferences } from "@/lib/recommendations";
import { checkUserRatingLimit } from "@/lib/userCheck";

interface Story {
  "": number;
  Title: string;
  Author: string;
  Img: string;
  Rating: number;
  Minutes: number;
  Genres: string;
}

export default function Recommendations() {
  const [allStories, setAllStories] = useState<Story[]>([]);
  const [displayedStories, setDisplayedStories] = useState<Story[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [limitExceeded, setLimitExceeded] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const storiesPerPage = 5;

  const logInteraction = async (action: string, storyIds: number[]) => {
    if (!username) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/interact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: username,
          action,
          value: storyIds,
        }),
      });
    } catch (err) {
      console.error("Failed to log interaction:", err);
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
    if (!username || limitExceeded) return;

    async function fetchRecommendedStories() {
      setLoading(true);
      setError(null);

      try {
        const storedPrefs = localStorage.getItem("userPreferences");
        if (!storedPrefs) {
          setError("No preferences found.");
          setLoading(false);
          return;
        }

        const preferences: Preferences = JSON.parse(storedPrefs);

        // Use non-null assertion since username is checked above
        preferences.username = username!;

        // Call async API function
        const recommended = await getRecommendedStories([], [], preferences);

        setAllStories(recommended);
        setDisplayedStories(recommended.slice(0, storiesPerPage));

        const initialIds = recommended.slice(0, storiesPerPage).map((s) => s[""]);
        await logInteraction("initial_stories", initialIds);
      } catch (err) {
        console.error("Error loading stories:", err);
        setError("Failed to load stories. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendedStories();
  }, [username, limitExceeded]);

  const handleLoadMore = () => {
    const nextStories = allStories.slice(displayedStories.length, displayedStories.length + storiesPerPage);
    setDisplayedStories((prev) => [...prev, ...nextStories]);

    const nextIds = nextStories.map((s) => s[""]);
    logInteraction("load_more", nextIds);
  };

  const goToQuestionnaire = () => {
    router.push("/questionnaire");
  };

  if (error) return <p>{error}</p>;

  if (limitExceeded) {
    return (
      <Container sx={{ mt: 5 }}>
        <Typography variant="h5" color="textSecondary" align="center">
          You have already read enough stories. Please come back on the 1st of June to complete this user study.
        </Typography>
      </Container>
    );
  }

  if (loading) {
    return <p>Loading recommended stories...</p>;
  }

  return (
    <div>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Recommended Stories</Typography>
      </Box>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {displayedStories.length > 0 ? (
          displayedStories.map((story) => (
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
          <p>No stories found.</p>
        )}
      </div>

      <Box display="flex" justifyContent="space-between" alignItems="center" mt={4}>
        <Button variant="outlined" onClick={goToQuestionnaire}>
          Go Back to Questionnaire
        </Button>

        {displayedStories.length < allStories.length && (
          <Button variant="contained" onClick={handleLoadMore}>
            Load More
          </Button>
        )}
      </Box>
    </div>
  );
}
