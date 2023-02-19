from socketIO_client import SocketIO

socketIO = SocketIO('localhost', 5000)

def on_queue_created(*args):
    print('Queue created:', args)

socketIO.on('queue_created', on_queue_created)

socketIO.emit('create')

socketIO.wait()
