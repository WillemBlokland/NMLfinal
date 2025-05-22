import os
import openai
import pandas as pd
from pathlib import Path
from dotenv import load_dotenv


load_dotenv()

openai.api_key = os.getenv('OPENAI_API_KEY')

MODEL = os.getenv("MODEL")
CLIENT = openai.OpenAI()

WORLDVIEW_KEYWORDS = [
    "Libertarianism",
    "Traditionalism",
    "Nationalism",
    "Feminism",
    "Underdog Empowerment",
    "Anti-Establishment",
    "Community Solidarity",
    "Justice and Accountability",
    "Inclusivity",
    "Survival and Resilience"
]


def get_keywords(text):
    """Takes a text and uses the current model to extract keywords from it.
    
    Args:
        text (str): The text to extract keywords from.
    
    Returns:
        set[str]: A set of extracted keywords.
    """
    response = CLIENT.responses.create(
        input = f'Extract keywords from this text:\n{text}',
        model = MODEL,
        instructions = 'Only ouput lemmatized keywords, seperated by a comma',
        store = False
    )
    return set(response.output_text.split(', '))


def get_keywords_worldview(text):
    """Takes a text and uses the current model to extract the three most relevant
    worldview keywords from it.
    
    Args:
        text (str): The text to extract keywords from.
    
    Returns:
        list[str]: A list of the three most relevant extracted worldview keywords.
    """
    response = CLIENT.responses.create(
        input = f"Given the following text: {text}. Which three keywords of the following list matches the story the best?" + str(WORLDVIEW_KEYWORDS),
        model = MODEL,
        instructions = 'Only ouput the 3 most relevant keywords, seperated by a comma.'
    )

    output = response.output_text.split(', ')
    assert len(output) == 3, 'GPT output is not 3 keywords'
    for keyword in output:
        assert keyword in WORLDVIEW_KEYWORDS, 'GPT output is not a worldview keyword'
    return output


def get_input():
    """Returns:
        str: The user's description of the story they are looking for.
    """
    return input('What kind of story are you looking for? Describe it here:\n>> ')


def get_score(text_keywords, story_keywords):
    """Calculate the similarity score between two sets of keywords.

    Args:
        text_keywords (set): A set of keywords from a user's input text.
        story_keywords (iterable): A set of keywords from a story.

    Returns:
        float: The similarity score as a ratio of the intersection size to the size of text_keywords.
    """
    story_keywords = set(story_keywords)
    return len(text_keywords & story_keywords) / len(text_keywords)


def get_matches(ids, text_keywords, stories_keywords):
    """Sorts and returns a list of story IDs based on their similarity to a set of text keywords.

    Args:
        ids (List[int]): A list of story IDs to be sorted.
        text_keywords (set): A set of keywords extracted from a user's input text.
        stories_keywords (pd.DataFrame): A DataFrame containing keywords for each story, indexed by story ID.

    Returns:
        List[int]: A list of story IDs sorted by their similarity score in descending order.
    """

    ids.sort(key=lambda i: get_score(text_keywords, stories_keywords['Keywords'][i]), reverse=True)
    return ids


def filter_stories(stories, genres, min_length=0, max_length=100):
    """Filters a DataFrame of stories based on length and genre criteria.

    Args:
        stories (pd.DataFrame): A DataFrame containing short stories.
        min_length (int): Minimum length of the story in minutes.
        max_length (int): Maximum length of the story in minutes.
        genres (list[str]): List of genres to filter stories by.

    Returns:
        pd.DataFrame: A DataFrame of stories that match the length and genre criteria.
    """
    def has_target_genre(genre_string):
        """Checks if any of the story's genres match the target genres.

        Args:
            genre_string (str): A semicolon-separated string of genres for a story.

        Returns:
            bool: True if any genre in the genre_string matches the target genres, False otherwise.
        """
        story_genres = genre_string.split(';')
        return any(genre in genres for genre in story_genres)

    filtered_stories = stories[(stories['Minutes'] >= min_length) & (stories['Minutes'] <= max_length)]
    filtered_stories = filtered_stories[filtered_stories['Genres'].apply(has_target_genre)]
    return filtered_stories["Id"]


def load_data(path_stories=None, path_worldview_keywords=None, path_keywords=None):
    """Loads data from JSON files into DataFrames.

    Args:
        path_stories (str, optional): Path to a JSON file containing story data.
        path_worldview_keywords (str, optional): Path to a JSON file containing worldview keywords.
        path_keywords (str, optional): Path to a JSON file containing story keywords.

    Returns:
        tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]: A tuple containing DataFrames for stories, worldview keywords, and story keywords, respectively.
    """
    if path_stories is not None:
        stories = pd.read_json(path_stories)
    if path_worldview_keywords is not None:
        worldview_keywords = pd.read_json(path_worldview_keywords)
    if path_keywords is not None:
        keywords = pd.read_json(path_keywords)

    return stories, worldview_keywords, keywords


stories, stories_worldview_keywords, stories_keywords = load_data('data/short_stories.json', 'data/stories_worldview_keywords.json', 'data/stories_keywords.json')
genres = ['Horror', 'Sci-fi']
text_keywords = get_keywords(get_input())
fildered_ids = filter_stories(stories, text_keywords, min_length=15, max_length=20)
matches = get_matches(fildered_ids, text_keywords, stories_worldview_keywords)
