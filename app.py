from flask import Flask, render_template, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO, emit
from flask_cors import CORS
from dotenv import load_dotenv
from flask_caching import Cache
import random
import string
import requests
import os
import time
import sched
import threading
import signal

app = Flask(__name__)
cache = Cache(app, config={'CACHE_TYPE': 'simple'})
CORS(app, resources={r"/*": {"origins": "*"}})
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
db = SQLAlchemy(app)

SPOTIFY_SEARCH_API = 'https://api.spotify.com/v1/search'

load_dotenv(dotenv_path='./spotify_client.env')

CLIENT_ID = os.getenv('SPOTIFY_CLIENT_ID')
CLIENT_SECRET = os.getenv('SPOTIFY_CLIENT_SECRET')

# import models after db is defined
socketio = SocketIO(app)
socketio.init_app(app, cors_allowed_origins="*")

TOKEN_EXPIRATION_TIME = 3600  # Token expires in 1 hour
AUTH_HEADER = None

# Function to get authentication header
def get_auth_header():
    global AUTH_HEADER, TOKEN_EXPIRATION_TIME

    # Check if token is expired or not set
    if AUTH_HEADER is None or time.time() > TOKEN_EXPIRATION_TIME:
        url = "https://accounts.spotify.com/api/token"
        data = {"grant_type": "client_credentials"}
        response = requests.post(url, auth=(CLIENT_ID, CLIENT_SECRET), data=data)
        if response.status_code != 200:
            print(f"Error getting token: {response.json()}")
            return None
        AUTH_HEADER = {"Authorization": "Bearer " + response.json()["access_token"]}
        TOKEN_EXPIRATION_TIME = time.time() + response.json()["expires_in"]
    return AUTH_HEADER

def refresh_token():
    global AUTH_HEADER, TOKEN_EXPIRATION_TIME

    # Set AUTH_HEADER and TOKEN_EXPIRATION_TIME to None before the first refresh
    AUTH_HEADER = None
    TOKEN_EXPIRATION_TIME = 3600

    while True:
        get_auth_header()
        print("Refreshed Spotify Auth Header")
        time.sleep(3600)

# define SQLite schema
class Queue(db.Model):
    queue_id = db.Column(db.Integer, primary_key=True)
    queue_name = db.Column(db.String(100))
    queue_code = db.Column(db.String(4), unique=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    creator_session_id = db.Column(db.String(32), nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())  # add this line
    queue_songs = db.relationship('QueueSong', backref='queue')

class Song(db.Model):
    track_id = db.Column(db.String(100), primary_key=True)
    song_name = db.Column(db.String(100))
    artist_name = db.Column(db.String(100))
    queue_songs = db.relationship('QueueSong', backref='song')

class QueueSong(db.Model):
    queue_id = db.Column(db.Integer, db.ForeignKey('queue.queue_id'), primary_key=True)
    track_id = db.Column(db.String(100), db.ForeignKey('song.track_id'), primary_key=True)
    request_count = db.Column(db.Integer, default=1)

# Generate random 4 character code
def generate_code(session_id):
    code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    print("Generated " + code + " for " + session_id)
    return code

# Return index html if user visits root
@app.route('/')
def index():
    return render_template('index.html')

# Create queue
@socketio.on('create')
def create_queue(data):
    print("== Creating Queue ==")
    print(request.args)
    session_id = data['sessionID']
    code = generate_code(session_id)
    queue_name = data['queueName']
    queue = Queue(queue_name=queue_name, queue_code=code, creator_session_id=session_id) # Record creators session ID
    db.session.add(queue)
    db.session.commit()
    emit('queue_created', {'code': code, 'session_id': session_id})
    print("======")

# HTTP request for debugging
@app.route('/create', methods=['POST'])
def create_queue_api():
    print("== Create Queue (HTTP) ==")
    code = generate_code()
    queue_name = "Test"
    queue = Queue(queue_name=queue_name, queue_code=code, creator_session_id="omuxrmt33mnetsfirxi2sdsfh4j1c2kv") # Hardcoded session ID for testing
    db.session.add(queue)
    db.session.commit()
    return jsonify({'code': code}), 201

# Join queue
@socketio.on('join')
def join_queue(data):
    print("== Joining Queue " + data['code'] + " ==")
    code = data['code']
    queue = Queue.query.filter_by(queue_code=code).first()
    if queue:
        song_list = [{'track_id': queue_song.song.track_id, 'song_name': queue_song.song.song_name, 'artist_name': queue_song.song.artist_name, 'count': queue_song.request_count} for queue_song in queue.queue_songs]
        emit('queue_joined', {'code': code, 'songs': song_list, 'session_id': queue.creator_session_id, 'queue_name': queue.queue_name})
    else:
        emit('invalid_code')

# Add song (used after joining queue)
@socketio.on('add_song')
def add_song(data):
    print("== Adding Song " + data['track_id'] + " to queue " + data['code'] + " ==")
    code = data['code']
    song_name = data['name']
    artist_name = data['artist']
    track_id = data['track_id']
    print(track_id)
    queue = Queue.query.filter_by(queue_code=code).first()
    if queue:
        song = Song.query.filter_by(track_id=track_id).first()
        if song:
            queue_song = QueueSong.query.filter_by(queue_id=queue.queue_id, track_id=song.track_id).first()
            if queue_song:
                queue_song.request_count += 1
            else:
                queue_song = QueueSong(queue_id=queue.queue_id, track_id=song.track_id)
                db.session.add(queue_song)
        else:
            song = Song(track_id=track_id, song_name=song_name, artist_name=artist_name)
            db.session.add(song)
            queue_song = QueueSong(queue_id=queue.queue_id, track_id=song.track_id)
            db.session.add(queue_song)
        db.session.commit()
        song_list = [{'id': queue_song.song.track_id, 'name': queue_song.song.song_name, 'artist': queue_song.song.artist_name, 'count': queue_song.request_count} for queue_song in queue.queue_songs]
        emit('song_added', {'code': code, 'songs': song_list}, broadcast=True)
    else:
        emit('invalid_code')

# Delete song (only used by queue creators)
@socketio.on('delete_song')
def delete_song(data):
    print("== Deleting Song " + data['track_id'] + " from queue " + data['code'] + " ==")
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

# Delete queue (only used by queue creators)
@socketio.on('delete_queue')
def delete_queue(data):
    print("== Deleting Queue " + data['code'] + " ==")
    code = data['code']
    queue = Queue.query.filter_by(creator_session_id=request.sid, queue_code=code).first()
    if queue:
        db.session.delete(queue)
        db.session.commit()
        emit('queue_deleted', {'code': queue.queue_code}, broadcast=True)
    else:
        emit('invalid_delete')

# HTTP Search Endpoint
@app.route('/search', methods=['GET'])
def search():
    print("== Spotify Search for " + request.args.get('query') + " ==")
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
    print("== Getting Track Data ==")
    track_ids = request.args.getlist('track_id')
    track_data = []
    tracklist = ""
    for track_id in track_ids:
        print(track_id)
        params = {'ids': track_id}
        tracklist += (track_id + "%2C") 
    response = requests.get(f'https://api.spotify.com/v1/tracks?ids={tracklist[:-3]}', headers=AUTH_HEADER)
    return response.json()

def activate_job():
    def run_job():
        while True:
            auth_header = get_auth_header()
            print(auth_header)
            if auth_header is not None:
                os.environ['AUTH_HEADER'] = str(auth_header)
                print("Refreshed Spotify Auth Header")
            print(os.getenv('AUTH_HEADER'))
            time.sleep(3600)

    thread = threading.Thread(target=run_job)
    thread.daemon = True
    thread.start()

if __name__ == '__main__':
    get_auth_header()
    with app.app_context():
        db.create_all()
    print("=== DJ-App Flask Built Successfully ===")
    print("Starting socketio...")
    activate_job()
    socketio.run(app)
    # Start token refresh thread

