from flask import Flask, render_template, jsonify 
from flask_sqlalchemy import SQLAlchemy
from app import db
db = SQLAlchemy(app)

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