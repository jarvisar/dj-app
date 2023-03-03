# dj-app

This app is a collaborative queue management system designed for DJs at parties. Using the app, DJs can create a new "queue" from a mobile device or web browser and receive a unique four-digit code. Partygoers can join the queue using their phone or browser by entering the code on the app and searching for songs through the Spotify API. The app tracks the number of requests for each song, creating a crowd-sourced playlist for the DJ to play sorted by the number of requests.

When a user requests a song, the Flask Python backend adds it to the queue stored in a SQLite database. The DJ can view a list of songs sorted by the number of requests, and after playing a song, they can remove it from the queue to prevent replays. The app also allows the DJ to reset the number of requests for a song, moving it to the bottom of the queue.

To search for songs, the app utilizes Spotify's API and searches using various keywords such as song name, artist, and album name. When a song is requested, the app sends the trackId and song information to the backend. This enables the app to retrieve song info (such as album art and genres) later on, when the DJ views the playlist.

To ensure that only the creator of a queue can delete the queue or its songs, the app generates a random string, which is stored in local storage and passed to the backend. This string is then stored in the SQL database as the creatorID. When the backend sends a specific queue's data to the user's app, the app verifies the user as the queue owner by matching the string in the local storage to the creatorID. This enables the app to conditionally render HTML elements such as "Delete Song" and "Delete Queue" to the queue owner.

The web app was built using the Angular framework.

Still need a name. Current possible names:

* PartyLine
* DJProQ
* PartyQ
* QuedUp

TODO:

* Add "remove song" and "delete queue" buttons for queue creators
* Add error handling for when the backend server is down or unable to connect
* Add backup code for queue creators to use if sessionID doesn't work (generate extra four digit code for every queue; optional for users)
* Add private queue feature; need another four digit code to join?
* Split up code into components instead of using app component for everything
* Work on mobile app
