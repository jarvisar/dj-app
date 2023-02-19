from flask import Flask, render_template, jsonify 
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO
from models import Queue, Song, QueueSong
import random
import string
db = SQLAlchemy(app)

