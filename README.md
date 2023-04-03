# dj-app

This app is a collaborative queue management system designed for DJs at parties. Using the app, DJs can create a new "queue" from a mobile device or web browser and receive a unique four-digit code. Partygoers can join the queue using their phone or browser by entering the code on the app and searching for songs through the Spotify API. The app tracks the number of requests for each song, creating a crowd-sourced playlist for the DJ to play sorted by the number of requests.

### About

When a user requests a song, the Flask Python backend adds it to the queue stored in a SQLite database. The DJ can view a list of songs sorted by the number of requests, and after playing a song, they can remove it from the queue to prevent replays. The app also allows the DJ to reset the number of requests for a song, moving it to the bottom of the queue.

To search for songs, the app utilizes Spotify's API and searches using various keywords such as song name, artist, and album name. When a song is requested, the app sends the trackId and song information to the backend. This enables the app to retrieve song info (such as album art and genres) later on, when the DJ views the playlist.

### Authentication

To ensure that only the creator of a queue can delete the queue or its songs, the app generates a random string, which is stored in local storage and passed to the backend. This string is then stored in the SQL database as the creatorID. When the backend sends a specific queue's data to the user's app, the app verifies the user as the queue owner by matching the string in the local storage to the creatorID. This enables the app to conditionally render HTML elements such as "Delete Song" and "Delete Queue" to the queue owner.

The web app was built using the Angular framework.

### To-Do

Still need a name. Current possible names:

* PartyLine
* DJProQ
* PartyQ
* QuedUp

TODO:

* Add "remove song" and "delete queue" buttons for queue creators
* Add backup code for queue creators to use if sessionID doesn't work (generate extra four digit code for every queue; optional for users)
* Add query parameters to URL to allow users to join queues by visiting a link (i.e. localhost:4200/?code=1111/ to automatically join queue 1111.)
* Allow queue creators to blacklist specific tracks so users cannot add it to the queue
* Add refresh button to queue view to reload queue song list (optimize so it only updates the counts of existing songs but gets Spotify track data for new songs? Can compare track IDs in current queue song list to updated queue song list)
* Create animations for routing between components
* Work on mobile app

Planning:

* Guest DJ feature? Queue creators can add other queue creators to queues and grant access? Can always just share backup code from above.
* Customizable queue settings. Allow queue creators to set max number of requested songs allowed, # of min requests needed, etc?
* Upvote/downvote songs instead of request? Can keep a score to let users upvote songs they like and downvote songs they dislike (maybe everybody can add up to two new songs to queues and then can upvote or downvote any song already in the queue instead of the current 5 request limit regardless if adding new song or requesting existing song)
* Add private queue feature; need another four digit code to join? Don't want to add too many four-character codes. Already one code for queue itself and another backup code, most likely want to avoid adding a third code.
* Song suggestions: Suggest similar songs based on the current song being played or based on the songs in the queue

I wanted to avoid using accounts and logins due to people most likely deleting the app as soon as they leave the party/event. Also don't want to force users to sign up for anything during a social gathering or event where this app might be used.
