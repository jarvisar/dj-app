# PartyLine: DJ-App

This app is a collaborative queue management system designed for DJs and hosts at parties. It utilizes Flask Python backend, SQLite database, SocketIO websockets for connections, and Angular for the front-end framework. The app also integrates with the Spotify API to allow users to search for and add songs to the queue.

Check out the `backend` branch to see the current backend code and to-do list.

## Features

- Collaborative queue management
- Unique four-digit queue codes
- Song requests from mobile app or web browser
- Spotify API integration for song search
- Tracks number of requests for each song
- Creates a crowd-sourced playlist for the DJ to play
- Allows for song removal to prevent replays
- Conditional HTML rendering based on user status
- Support for multiple devices using backup codes 

## Stack

- Flask
- Python
- SQLAlchemy
- SQLite
- Socket.IO
- Angular (front-end)

## Usage

1. Create a new queue from a web browser to receive a unique four-digit code
2. Partygoers can join the queue by entering the code on the app and search for songs through the Spotify API
3. The app tracks the number of requests for each song, creating a crowd-sourced playlist for the DJ to play sorted by the number of requests
4. The DJ can view a list of songs sorted by the number of requests and remove songs after playing them to prevent replays
5. The app also allows the DJ to reset the number of requests for a song, moving it to the bottom of the queue

## Known Issues

This application is still very early in development and is subject to drastic changes. 

## Screenshots (updated 4/1/23)

<p float="left">
  <img src="https://i.imgur.com/kPpDz2b.png" width="250" />
  <img src="https://i.imgur.com/wDEUlZl.png" width="250" /> 
  <img src="https://i.imgur.com/bvN4pg7.png" width="250" />
</p>

Quick demo available here: https://i.imgur.com/YybcWVP.mp4
