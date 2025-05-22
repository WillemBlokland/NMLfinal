import pandas as pd
import matplotlib.pyplot as plt

df = pd.read_csv('nml_data/data/short_stories.csv', index_col=0)

fig, ax = plt.subplots(nrows=1, ncols=3, figsize=(12, 5))

ax[0].hist(df['Rating'])
ax[0].set_ylabel('Amount')
ax[0].set_xlabel('Rating')
ax[0].set_title('Rating per story')

ax[1].hist(df['Year'][df['Year'] > 0], bins=25)
ax[1].set_ylabel('Amount')
ax[1].set_xlabel('Year')
ax[1].set_title('Stories per year')
ax[1].set_xlim([1700, 2025])

ax[2].hist(df['Minutes'], bins=25)
ax[2].set_ylabel('Amount')
ax[2].set_xlabel('Time (min)')
ax[2].set_title('Minutes per story')

plt.show()

fig = plt.figure(figsize=(12, 10))

genres = []
for genre in df['Genres'].str.split(';'):
    for g in genre:
        genres.append(g)

plt.hist(genres, bins=len(genres))
plt.xlabel('Genres')
plt.ylabel('Amount')
plt.title('Genres of the stories')
plt.show()

print(df.describe())
