export interface Story {
  [""]: number; // ID
  Title: string;
  Author: string;
  Rating: number;
  Img: string;
  Minutes: number;
  Genres: string;
}

export interface Preferences {
  preferredGenres: string[];
  preferredLength: string;
  specificInterest?: string;
  username: string;
}

interface RecommendationResponse {
  matches: number[];
  stories: Story[];
}

function parseLengthRange(lengthRange?: string): { min_length: number; max_length: number } {
  if (!lengthRange) return { min_length: 0, max_length: 100 };
  const match = lengthRange.match(/(\d+)\s*-\s*(\d+)/);
  if (!match) return { min_length: 0, max_length: 100 };
  return { min_length: Number(match[1]), max_length: Number(match[2]) };
}

async function fetchRatedStoryIds(username: string): Promise<number[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/interact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: username, action: "get_interactions" }),
    });

    if (!res.ok) {
      throw new Error("Failed to fetch user interactions");
    }

    const data = await res.json();
    const interactions = data.interactions || [];

    const ratedStoryIds = interactions
      .filter((interaction: any) => interaction.action === "rate_story")
      .map((interaction: any) => interaction.value?.story_id)
      .filter((id: any) => typeof id === "number");

    return ratedStoryIds;
  } catch {
    return [];
  }
}

export async function getRecommendedStories(
  _allStories: Story[],
  _keywordsData: unknown,
  preferences: Preferences
): Promise<Story[]> {
  const { preferredGenres, preferredLength, specificInterest, username } = preferences;
  const { min_length, max_length } = parseLengthRange(preferredLength);

  const ratedStoryIds = await fetchRatedStoryIds(username);

  const requestBody = {
    description: specificInterest || "",
    genres: preferredGenres,
    min_length,
    max_length,
  };

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/recommend`, {

      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch recommendations: ${res.statusText}`);
    }

    const data: RecommendationResponse = await res.json();

    return data.stories.filter((story) => {
      const storyId = story[""];
      return !ratedStoryIds.includes(storyId);
    });
  } catch {
    return [];
  }
}
