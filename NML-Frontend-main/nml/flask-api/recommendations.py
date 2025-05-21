import os
import openai
import pandas as pd
from pathlib import Path

openai_api_key = "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"
MODEL = "gpt-4o-mini-2024-07-18"
CLIENT = openai.OpenAI(api_key=openai_api_key)

WORLDVIEW_KEYWORDS = [
    "Libertarianism", "Traditionalism", "Nationalism", "Feminism",
    "Underdog Empowerment", "Anti-Establishment", "Community Solidarity",
    "Justice and Accountability", "Inclusivity", "Survival and Resilience"
]

LENGTH_RANGES = {
    "0 - 10 minutes": (0, 10),
    "10 - 20 minutes": (10, 20),
    "20 - 30 minutes": (20, 30),
    "30 - 45 minutes": (30, 45),
    "45 - 80 minutes": (45, 80),
}


def parse_length_range(length_range_str):
    return LENGTH_RANGES.get(length_range_str, (0, 100))


def get_keywords(text):
    response = CLIENT.responses.create(
        input=f'Assign up to three to this text asking a user what story they would be interested in:\n{text}',
        model=MODEL,
        instructions='Only output these keywords "Libertarianism", "Traditionalism", "Nationalism", "Feminism", "Underdog Empowerment", "Anti-Establishment", "Community Solidarity","Justice and Accountability", "Inclusivity", "Survival and Resilience", separated by a comma',
        store=False
    )
    return set(response.output_text.strip().split(', '))


def get_score(text_keywords, story_keywords):
    story_keywords = set(story_keywords)
    return len(text_keywords & story_keywords) / len(text_keywords) if text_keywords else 0


def filter_stories(stories, genres=None, min_length=0, max_length=100):
    genres = genres or []
    stories = stories.copy()

    # Ensure numeric minutes
    stories['Minutes'] = pd.to_numeric(stories['Minutes'], errors='coerce').fillna(0)

    def genre_match(story_genres):
        if not genres:
            return True
        story_set = set(g.strip() for g in str(story_genres).split(';'))
        return any(g in story_set for g in genres)

    mask = (stories['Minutes'] >= min_length) & (stories['Minutes'] <= max_length)
    if genres:
        mask &= stories['Genres'].apply(genre_match)

    return stories[mask]


def recommend_stories(stories, stories_keywords, description="", preferred_genres=None, min_length=0, max_length=100):
    preferred_genres = preferred_genres or []
    description = description.strip()

    # Apply filters
    filtered_df = filter_stories(stories, preferred_genres, min_length, max_length)
    filtered_ids = filtered_df.index.tolist()

    if not filtered_ids:
        return []

    if description == "":
        # Convert Rating column to numeric, replace non-numeric with 0
        ratings = pd.to_numeric(filtered_df['Rating'], errors='coerce').fillna(0)
        filtered_df = filtered_df.copy()
        filtered_df['RatingNumeric'] = ratings
        sorted_df = filtered_df.sort_values('RatingNumeric', ascending=False)
        return sorted_df.index.tolist()

    # Extract keywords from description
    text_keywords = get_keywords(description)

    # Rank filtered stories by similarity
    filtered_df['Score'] = filtered_df.index.map(
        lambda idx: get_score(text_keywords, stories_keywords.loc[idx, 'Keywords'])
    )
    return filtered_df.sort_values('Score', ascending=False).index.tolist()


def load_data(path_stories=None, path_worldview_keywords=None, path_keywords=None):
    stories, worldview_keywords, keywords = None, None, None
    if path_stories is not None:
        stories = pd.read_json(path_stories)
    if path_worldview_keywords is not None:
        worldview_keywords = pd.read_json(path_worldview_keywords)
    if path_keywords is not None:
        keywords = pd.read_json(path_keywords)
    return stories, worldview_keywords, keywords


#-------#

print(get_keywords("woman, hero"))


