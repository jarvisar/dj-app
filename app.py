from flask import Flask, render_template, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO
import random
import string

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
db = SQLAlchemy(app)

# import models after db is defined
socketio = SocketIO(app)

# define SQLite schema
class Queue(db.Model):
    queue_id = db.Column(db.Integer, primary_key=True)
    queue_name = db.Column(db.String(100))
    queue_code = db.Column(db.String(4), unique=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    creator_session_id = db.Column(db.String(32), nullable=False)
    songs = db.relationship('QueueSong', backref='queue')

class Song(db.Model):
    song_id = db.Column(db.Integer, primary_key=True)
    song_name = db.Column(db.String(100))
    artist_name = db.Column(db.String(100))
    album_name = db.Column(db.String(100))
    track_id = db.Column(db.String(100))
    queue_songs = db.relationship('QueueSong', backref='song')

class QueueSong(db.Model):
    queue_id = db.Column(db.Integer, db.ForeignKey('queue.queue_id'), primary_key=True)
    song_id = db.Column(db.Integer, db.ForeignKey('song.song_id'), primary_key=True)
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
        song_list = [{'id': queue_song.song.song_id, 'name': queue_song.song.song_name, 'artist': queue_song.song.artist_name, 'count': queue_song.request_count} for queue_song in queue.queue_songs]
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
            queue_song = QueueSong.query.filter_by(queue_id=queue.queue_id, song_id=song.song_id).first()
            if queue_song:
                queue_song.request_count += 1
            else:
                queue_song = QueueSong(queue_id=queue.queue_id, song_id=song.song_id)
                db.session.add(queue_song)
        else:
            song = Song(song_name=song_name, artist_name=song_artist, spotify_uri=spotify_uri, image_url=image_url)
            db.session.add(song)
            queue_song = QueueSong(queue_id=queue.queue_id, song_id=song.song_id)
            db.session.add(queue_song)
        db.session.commit()
        song_list = [{'id': queue_song.song.song_id, 'name': queue_song.song.song_name, 'artist': queue_song.song.artist_name, 'count': queue_song.request_count} for queue_song in queue.queue_songs]
       

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

if __name__ == '__main__':
	with app.app_context():
		db.create_all()
	socketio.run(app)
