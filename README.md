# dj-app

The app serves as a collaborative queue management system for DJs at parties, allowing them to create a new "queue" from a browser or mobile and receive a unique four-digit code. Partygoers can join the queue on their phones (or in a browser) by entering the code on their app and use the Spotify API to search and add songs to the queue. The app keeps track of the number of requests for each song, creating a crowd-sourced playlist for the DJ to play. 

When a user requests a song on the app, the Flask python backend will add the song to the queue stored in a SQLite database. When the DJ views the queue, they will see a sorted list of songs by number of requests. Also, after playing a song, the DJ will have the ability to remove a song from the queue to avoid replays (possibly will add a feature to reset number of requests for that song, so song will stay in queue but will be moved to bottom). 

To search for the songs, the app will use Spotify's API to search for songs using different keywords such as song name, artist, album name, etc. After requesting a song, the app will send the song and the trackId to the backend so the app can retrieve info about the track later after retrieving from backend (such as when the DJ views the playlist; want to show album art, genres, etc).
