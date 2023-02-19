# dj-app

This app is a collaborative queue management system designed for DJs at parties. Using the app, DJs can create a new "queue" from a mobile device or web browser and receive a unique four-digit code. Partygoers can join the queue using their phone or browser by entering the code on the app and searching for songs through the Spotify API. The app tracks the number of requests for each song, creating a crowd-sourced playlist for the DJ to play.

When a user requests a song, the Flask Python backend adds it to the queue stored in a SQLite database. The DJ can view a sorted list of songs by the number of requests, and after playing a song, they can remove it from the queue to prevent replays. The app also allows the DJ to reset the number of requests for a song, moving it to the bottom of the queue.

To search for songs, the app utilizes Spotify's API and searches using various keywords such as song name, artist, and album name. When a song is requested, the app sends the trackId and song information to the backend. This enables the app to retrieve song info (such as album art and genres) later on, when the DJ views the playlist.

To ensure users can only delete queues and songs from queues they've created, the app generates a random string and stores it in local storage and passes it to the backend and is stored in the SQL database as creatorID. Then, when the backend sends a specific queue's data to the user's app, if the string in the local storage matches the creator ID, the user is verified as the queue owner and HTML elements such as "Delete Song" and "Delete Queue" are conditionally rendered.
