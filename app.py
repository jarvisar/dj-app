from flask import Flask, render_template, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO, emit
from dotenv import load_dotenv
import random
import string
import requests
import os

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
db = SQLAlchemy(app)

SPOTIFY_SEARCH_API = 'https://api.spotify.com/v1/search'

AUTH_HEADER = None

load_dotenv(dotenv_path='./spotify_client.env')

CLIENT_ID = os.getenv('SPOTIFY_CLIENT_ID')
CLIENT_SECRET = os.getenv('SPOTIFY_CLIENT_SECRET')

# import models after db is defined
socketio = SocketIO(app)
socketio.init_app(app, cors_allowed_origins="*")

# Get authorization header
def get_auth_header():
    global AUTH_HEADER
    if AUTH_HEADER is None:
        url = "https://accounts.spotify.com/api/token"
        data = {"grant_type": "client_credentials"}
        response = requests.post(url, auth=(CLIENT_ID, CLIENT_SECRET), data=data)
        if response.status_code != 200:
            print(f"Error getting token: {response.json()}")
            return None
        AUTH_HEADER = {"Authorization": "Bearer " + response.json()["access_token"]}
    return AUTH_HEADER

# define SQLite schema
class Queue(db.Model):
    queue_id = db.Column(db.Integer, primary_key=True)
    queue_name = db.Column(db.String(100))
    queue_code = db.Column(db.String(4), unique=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    creator_session_id = db.Column(db.String(32), nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())  # add this line
    songs = db.relationship('QueueSong', backref='queue')

class Song(db.Model):
    track_id = db.Column(db.Integer, primary_key=True)
    song_name = db.Column(db.String(100))
    artist_name = db.Column(db.String(100))
    album_name = db.Column(db.String(100))
    queue_songs = db.relationship('QueueSong', backref='song')

class QueueSong(db.Model):
    queue_id = db.Column(db.Integer, db.ForeignKey('queue.queue_id'), primary_key=True)
    track_id = db.Column(db.Integer, db.ForeignKey('song.track_id'), primary_key=True)
    request_count = db.Column(db.Integer, default=1)


def generate_code():
    code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return code

# Return index html if user visits root
@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('create')
def create_queue():
    code = generate_code()
    queue_name = "My Queue"
    queue = Queue(queue_name=queue_name, queue_code=code, creator_session_id=request.sid) # Record creators session ID
    db.session.add(queue)
    db.session.commit()
    emit('queue_created', {'code': code})

# HTTP request for debugging
@app.route('/create', methods=['POST'])
def create_queue_api():
    code = generate_code()
    queue_name = "Test"
    queue = Queue(queue_name=queue_name, queue_code=code, creator_session_id="omuxrmt33mnetsfirxi2sdsfh4j1c2kv") # Hardcoded session ID for testing
    db.session.add(queue)
    db.session.commit()
    return jsonify({'code': code}), 201

@socketio.on('join')
def join_queue(data):
    code = data['code']
    queue = Queue.query.filter_by(queue_code=code).first()
    if queue:
        song_list = [{'id': queue_song.song.track_id, 'name': queue_song.song.song_name, 'artist': queue_song.song.artist_name, 'count': queue_song.request_count} for queue_song in queue.queue_songs]
        emit('queue_joined', {'code': code, 'songs': song_list})
    else:
        emit('invalid_code')

@socketio.on('add_song')
def add_song(data):
    code = data['code']
    song_name = data['name']
    song_artist = data['artist']
    track_id = data['track_id']
    queue = Queue.query.filter_by(queue_code=code).first()
    if queue:
        song = Song.query.filter_by(song_name=song_name, artist_name=song_artist).first()
        if song:
            queue_song = QueueSong.query.filter_by(queue_id=queue.queue_id, track_id=song.track_id).first()
            if queue_song:
                queue_song.request_count += 1
            else:
                queue_song = QueueSong(queue_id=queue.queue_id, track_id=song.track_id)
                db.session.add(queue_song)
        else:
            song = Song(song_name=song_name, artist_name=song_artist, spotify_uri=spotify_uri, image_url=image_url)
            db.session.add(song)
            queue_song = QueueSong(queue_id=queue.queue_id, track_id=song.track_id)
            db.session.add(queue_song)
        db.session.commit()
        song_list = [{'id': queue_song.song.track_id, 'name': queue_song.song.song_name, 'artist': queue_song.song.artist_name, 'count': queue_song.request_count} for queue_song in queue.queue_songs]
       

        emit('song_added', {'code': code, 'songs': song_list}, broadcast=True)
    else:
        emit('invalid_code')

@socketio.on('delete_song')
def delete_song(data):
    code = data['code']
    song_id = data['song_id']
    queue = Queue.query.filter_by(queue_code=code).first()
    if queue and queue.creator_session_id == request.sid: # Only queue creator can delete songs
        queue_song = QueueSong.query.filter_by(queue_id=queue.queue_id, song_id=song_id).first()
        if queue_song:
            db.session.delete(queue_song)
            db.session.commit()
            song_list = [{'id': queue_song.song.song_id, 'name': queue_song.song.song_name, 'artist': queue_song.song.artist_name, 'count': queue_song.request_count} for queue_song in queue.queue_songs]
            emit('song_deleted', {'code': code, 'songs': song_list}, broadcast=True)
        else:
            emit('invalid_song')
    else:
        emit('invalid_code')

@socketio.on('delete_queue')
# Users can only delete queues they created
def delete_queue():
    queue = Queue.query.filter_by(creator_session_id=request.sid).first()
    if queue:
        db.session.delete(queue)
        db.session.commit()
        emit('queue_deleted', {'code': queue.queue_code}, broadcast=True)
    else:
        emit('invalid_delete')

# HTTP Search Endpoint
@app.route('/search', methods=['GET'])
def search():
    query = request.args.get('query')
    if not query:
        return 'No query parameter provided', 400

    # Query parameters for searching songs
    params = {
        'q': query,
        'type': 'track',
        'limit': 10
    }

    # Make a GET request to the Spotify API
    response = requests.get(SPOTIFY_SEARCH_API, params=params, headers=AUTH_HEADER)
    if response.status_code != 200:
        return 'Failed to retrieve search results', 500

    # Extract the relevant information from the response
    results = response.json()['tracks']['items']
    tracks = []
    for result in results:
        # Only include tracks in the search results
        if result['type'] == 'track':
            track = {
                'song_name': result['name'],
                'artist_name': result['artists'][0]['name'],
                'album_name': result['album']['name'],
                'track_id': result['id']
            }
            tracks.append(track)

    return jsonify(tracks)

@app.route('/get_track_data', methods=['GET'])
def get_tracks_data():
    track_ids = request.args.getlist('track_id')
    track_data = []
    for track_id in track_ids:
        params = {'ids': track_id}
        response = requests.get(f'https://api.spotify.com/v1/tracks/{track_id}', headers=AUTH_HEADER)
        if response.status_code == 200:
            track_data.append(response.json())
    return jsonify(track_data)

if __name__ == '__main__':
    get_auth_header()
    with app.app_context():
        db.create_all()
    socketio.run(app)
    
