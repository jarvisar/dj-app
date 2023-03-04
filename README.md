# DJ-App

This app is a collaborative queue management system designed for DJs and hosts at parties. It utilizes Flask Python backend, SQLite database, and SocketIO websockets for connections. The app also integrates with the Spotify API to allow users to search for and add songs to the queue.

## Features

- Collaborative queue management
- Unique four-digit queue codes
- Song requests from mobile or web browser
- Spotify API integration for song search
- Tracks number of requests for each song
- Creates a crowd-sourced playlist for the DJ to play
- Allows for song removal to prevent replays
- Conditional HTML rendering based on user status
- Support for multiple devices using backup codes (plan to implement)

## Technologies Used

- Flask
- Python
- SQLAlchemy
- SQLite
- Socket.IO
- Angular (front-end)

## Usage

1. Create a new queue from a web browser to receive a unique four-digit code
2. Partygoers can join the queue by entering the code on the app and searching for songs through the Spotify API
3. The app tracks the number of requests for each song, creating a crowd-sourced playlist for the DJ to play sorted by the number of requests
4. The DJ can view a list of songs sorted by the number of requests and remove songs after playing them to prevent replays
5. The app also allows the DJ to reset the number of requests for a song, moving it to the bottom of the queue

## Known Issues

This application is still very early in development and is subject to drastic changes. 
