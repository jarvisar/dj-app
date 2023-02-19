from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app import db

class Queue(db.Model):
    queue_id = Column(Integer, primary_key=True)
    queue_name = Column(String(100))
    queue_code = Column(String(4), unique=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())

    songs = relationship("Song", secondary="queue_song")

class Song(db.Model):
    song_id = Column(Integer, primary_key=True)
    song_name = Column(String(100))
    artist_name = Column(String(100))
    album_name = Column(String(100))
    spotify_uri = Column(String(100))
    image_url = Column(String(100))

    queues = relationship("Queue", secondary="queue_song")

class QueueSong(db.Model):
    queue_id = Column(Integer, ForeignKey('queue.queue_id'), primary_key=True)
    song_id = Column(Integer, ForeignKey('song.song_id'), primary_key=True)
    request_count = Column(Integer, default=1)
