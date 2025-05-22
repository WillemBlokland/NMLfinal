from flask import Flask, request, jsonify
import os
import openai
import pandas as pd
from dotenv import load_dotenv

app = Flask(__name__)
load_dotenv()

openai.api_key = os.getenv("OPENAI_API_KEY")
MODEL = os.getenv("MODEL")
CLIENT = openai.OpenAI()

# # Load your data once at startup
# DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')

# stories = pd.read_json(os.path.join(DATA_DIR, 'short_stories.json'))
# worldview_keywords = pd.read_json(os.path.join(DATA_DIR, 'stories_worldview_keywords.json'))
# keywords = pd.read_json(os.path.join(DATA_DIR, 'stories_keywords.json'))

import os

def load_data():
    """Loads story data from JSON files in the local data/ directory."""
    base_dir = os.path.dirname(__file__)
    data_dir = os.path.join(base_dir, "data")

    try:
        stories = pd.read_json(os.path.join(data_dir, 'short_stories.json'))
        worldview_keywords = pd.read_json(os.path.join(data_dir, 'stories_worldview_keywords.json'))
        keywords = pd.read_json(os.path.join(data_dir, 'stories_keywords.json'))
    except FileNotFoundError as e:
        print(f"[ERROR] Missing required data file: {e}")
        raise

    return stories, worldview_keywords, keywords


stories, stories_worldview_keywords, stories_keywords = load_data()


WORLDVIEW_KEYWORDS = [
    "Libertarianism", "Traditionalism", "Nationalism", "Feminism",
    "Underdog Empowerment", "Anti-Establishment", "Community Solidarity",
    "Justice and Accountability", "Inclusivity", "Survival and Resilience"
]

def get_keywords(text):
    response = CLIENT.responses.create(
        input=f"Extract keywords from this text:\n{text}",
        model=MODEL,
        instructions="Only output lemmatized keywords, separated by a comma",
        store=False
    )
    return set(response.output_text.split(', '))

def get_score(text_keywords, story_keywords):
    story_keywords = set(story_keywords)
    return len(text_keywords & story_keywords) / len(text_keywords)

def filter_stories(stories, genres, min_length=0, max_length=100):
    def has_genre(genre_str):
        return any(g in genre_str.split(';') for g in genres)

    filtered = stories[(stories['Minutes'] >= min_length) & (stories['Minutes'] <= max_length)]
    return filtered[filtered['Genres'].apply(has_genre)]["Id"]

def get_matches(ids, text_keywords, stories_keywords):
    ids.sort(key=lambda i: get_score(text_keywords, stories_keywords['Keywords'][i]), reverse=True)
    return ids

@app.route("/interact", methods=["POST"])
def interact():
    data = request.get_json()
    description = data.get("description", "")
    genres = data.get("genres", [])
    min_len = data.get("min_length", 0)
    max_len = data.get("max_length", 100)

    try:
        text_keywords = get_keywords(description)
        filtered_ids = filter_stories(stories, genres, min_len, max_len)
        matches = get_matches(filtered_ids, text_keywords, keywords)
        return jsonify({"matches": matches})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Gunicorn entrypoint
if __name__ == "__main__":
    app.run(debug=True)
