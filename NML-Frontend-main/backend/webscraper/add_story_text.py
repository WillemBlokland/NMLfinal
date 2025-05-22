import pandas as pd
import requests
from pdfreader import SimplePDFViewer
import re


df = pd.read_csv('nml_data/data/short_stories.csv', index_col=0)
stories = []

for id, url in zip(df.index, df['PDF']):
    response = requests.get(url)
    if response.status_code >= 400:
        stories.append([id, 'PDF not found'])
        print(f'PDF not found for {df["Title"][id]}')
        continue
    viewer = SimplePDFViewer(response.content)
    text = []
    for canvas in viewer:
        text.extend(canvas.strings)

    string = ' '
    for line in text:
        if line[0] == '‘':
            if string[-1] != '\n':
                string += '\n\n'
            string += f'{line}\n\n'
        else:
            string += line

    string = string.replace('Downloaded from www.libraryofshortstories.comThis work is in the public domain of Australia. Please check your local copyright laws if you live elsewhere.', 
                            '\n\nDownloaded from www.libraryofshortstories.com')
    string = string.replace(f'{df['Title'][id]}{df['Author'][id]}', f'{df['Title'][id]}\n{df['Author'][id]}\n\n')
    string = re.sub('([.!?])(?!\s)', '\1 ', string)

    stories.append([id, string[1:]])
    print(f'{id}/{len(df)} - {df['Title'][id]}')

df2 = pd.DataFrame(data=stories, columns=['Id','Text'])
df2.to_json('nml_data/data/short_stories_text.json', orient='records', indent=2)
    