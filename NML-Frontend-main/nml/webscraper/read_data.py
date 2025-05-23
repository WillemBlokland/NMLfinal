from bs4 import BeautifulSoup
import pandas as pd
import regex as re

with open("short_stories.html", "r", encoding="utf-8") as f:
    soup = BeautifulSoup(f.read(), "html.parser")

results = soup.find_all("div", class_="story_tile_cluster")
features = ['Title', 'Author', 'Rating', 'Img', 'Img_description', 'Year', 'Words', 'Minutes',
            'Description', 'Genres', 'Blurb', 'PDF', 'Epub', 'Read']
all_stories = []

for result in results:
    story = []
    story.append(result.find('div', class_="story_tile_title").text) # Title
    print(story[0])
    story.append(result.find('div', class_="story_tile_author").text) # Author

    # Rating
    stars = result.find('div', class_='stars')
    if stars:
        story.append(len(stars.find_all('svg')))
    else:
        story.append(None)

    # Image and description
    story.append(result.find('img')['src'])
    story.append(result.find('img')['alt'])

    # Publish date
    publish_date = result.find('div', class_="story_tile_publish_date")
    if publish_date:
        year = re.search('\d{4}|400 BCE', publish_date.text).group(0)
        if 'BCE' in year:
            story.append(-400)
        else:
            story.append(int(year))
    else:
        story.append(None)

    # Story length
    words, minutes = re.findall('\d+,?\d*', result.find('div', class_="story_tile_length").text)
    story.append(int(re.sub(',', '', words)))
    story.append(int(minutes))

    story.append(result.find('div', class_="story_tile_description").text) # Description
    
    # Genres
    genres = [r.text for r in result.find_all('div', class_="genre_section")]
    story.append(';'.join(genres))
    
    story.append(result.find('div', class_="story_tile_blurb").text) # Blurb
    story.append('https://www.libraryofshortstories.com' + result.find('a', class_="doc_button pdf_button")['href']) # PDF
    story.append('https://www.libraryofshortstories.com' + result.find('a', class_="doc_button epub_button")['href']) # Epub
    story.append('https://www.libraryofshortstories.com' + result.find('a', class_="read_button fake_link")['href']) # Read
    all_stories.append(story)

# Convert to csv
df = pd.DataFrame(data=all_stories, columns=features)
df.to_csv('short_stories.csv')
print(df.head())
