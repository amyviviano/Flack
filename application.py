import os
import requests

from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit
from collections import defaultdict

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

# Dictionary of channel messages
channelMessages = defaultdict(list)
# Channel list
channels = []
messageLimit = 100

@app.route("/")
def index():
    return render_template('index.html', channels=channels)

# Returns channel messages, otherwise return null
@app.route("/channel/<name>")
def channel(name):
    if name in channelMessages.keys():
        return jsonify(channelMessages.get(name, "null"))
    else:
        return "null"

@app.route("/channelcheck/<name>")
def channelcheck(name):
    duplicate = False
    for x in range(len(channels)):
        if (name == channels[x]):
            duplicate = True
    if duplicate:
        error = "Channel name is already taken." 
        return error
    else:
        return "null"
        #socket.emit('submit channel', {'newchannelname': channelname});

# Adds new channel if channel name doesn't already exist
@socketio.on("submit channel")
def submitChannel(data):
    newchannelname = data["newchannelname"]
    #for x in range(len(channels)):
        #if (newchannelname == channels[x]):
            #return render_template('error.html', errormsg="Channel name already taken")
    channels.append(newchannelname)
    emit("announce channel", {"newchannelname": newchannelname}, broadcast=True)

# Adds new message to channelMessages storage
# Emits new message to all users on that channel
@socketio.on("submit new message")
def submitNewMessage(data):
    channel = data['channel']
    message = {'user':data['user'],'time':data['time'], 'message':data['newMessage']}
    channelMessages[channel].append(message)
    print(channelMessages[channel])
    if (len(channelMessages[channel])>messageLimit):
        channelMessages[channel].pop(0)
    emit("announce new message",{'channel': channel, 'message': message},broadcast=True)


if __name__ == '__main__':
    socketio.run(app)
