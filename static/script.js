document.addEventListener('DOMContentLoaded', () => {

    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    socket.on('connect', () => {

        // Uncomment to Clear local storage upon flask restart
        // localStorage.removeItem('username');
        // localStorage.removeItem('channelname');

        // Get display name from user via prompt
        var welcome;
        var person = localStorage.getItem('username');
        welcome = "Hello " + person + "!";
        if (!person) {
            person = prompt("Please enter a display name:");
            if (person == null || person == "") {
                welcome = "Please reload page and enter a display name to enter Flack.";
            } else {
                // Save username client-side for when user leaves and returns to site
                localStorage.setItem('username', person);
                welcome = "Hello " + person + "!";
            }
        }

        // Set html headings
        document.querySelector('#welcome').innerHTML = welcome;
        var localChannel = localStorage.getItem('channelname');
        if (!localChannel) {
            document.querySelector('#channel-title').innerHTML = 'Select or Create a Channel to Chat';
        } else {
            document.querySelector('#channel-title').innerHTML = localChannel;
            load_channel(localChannel);
        }

        // Set links up to load new channels.
        document.querySelectorAll('.nav-link').forEach(link => {
            link.onclick = () => {
                // update localchannel storage on click
                var newLocalChannel = link.dataset.channel;
                localStorage.setItem('channelname', newLocalChannel);
                document.querySelector('#channel-title').innerHTML = newLocalChannel;
                load_channel(newLocalChannel);
                return false;
            };
        });

        // By default, create new channel button is disabled
        document.querySelector('#submit').disabled = true;

        // Create new channel, save local storage
        // Enable button only if there is text in the input field
        document.querySelector('#channel-name').onkeyup = () => {
            if (document.querySelector('#channel-name').value.length > 0)
                document.querySelector('#submit').disabled = false;
            else
                document.querySelector('#submit').disabled = true;
        };

        // Submit new channel to server storage and broadcast to all users
        document.querySelector('#form-channel').onsubmit = () => {
            // Get new channel name
            var channelname = document.querySelector('#channel-name').value;

            // Check channel isn't a duplicate, otherwise submit
            check_channel(channelname)

            // Clear channel name input field
            document.querySelector('#channel-name').value = '';

            // Disable button again after submit
            document.querySelector('#submit').disabled = true;

            // Stop form from submitting to some other website, loading other page
            return false;
        };

        // By default, create new message button is disabled
        document.querySelector('#submit2').disabled = true;

        // Enable button only if user is on a channel and form isn't null
        document.querySelector('#message').onkeyup = () => {
            if (localStorage.getItem('channelname')) {
                if (document.querySelector('#message').value.length > 0)
                    document.querySelector('#submit2').disabled = false;
                else
                    document.querySelector('#submit2').disabled = true;
            }
        };

        // Emit new messages to users on the channel and send to server storage
        document.querySelector('#form-message').onsubmit = () => {
            // Get message
            const newMessage = document.querySelector('#message').value;
            const time = new Date().toLocaleString();
            var localChannel = localStorage.getItem('channelname');
            socket.emit('submit new message', {'channel': localChannel,
            'newMessage': newMessage, 'user': person, 'time': time});

            // Clear message input field
            document.querySelector('#message').value = '';

            // Disable button again after submit
            document.querySelector('#submit2').disabled = true;

            // Stop form from submitting to some other website, loading other page
            return false;
        };
    });


    // When a new channel is announced, broadcast to the channel list
    socket.on('announce channel', data => {
        // Add new channel to channel list
        const li = document.createElement('li');
        li.className = 'nav-link';
        li.innerHTML = data.newchannelname;
        li.href = '';
        li.dataset.channel = data.newchannelname;
        document.querySelector('#channels').append(li);

        // Set links up to load new channels.
        document.querySelectorAll('.nav-link').forEach(link => {
            link.onclick = () => {
                var newLocalChannel2 = link.dataset.channel;
                localStorage.setItem('channelname', newLocalChannel2);
                document.querySelector('#channel-title').innerHTML = newLocalChannel2;
                load_channel(newLocalChannel2);
                return false;
            };
        });
    });

    // Broadcasts new message to the channel when submitted by a user
    socket.on('announce new message', data => {
        var localChannel = localStorage.getItem('channelname');
        if (data.channel == localChannel) {
            const timestamp = document.createElement('p');
            timestamp.className = 'newChannelMessage';
            timestamp.innerHTML = data.message.user + ' ' + data.message.time + "<br />" + data.message.message;
            document.querySelector('#channel-messages').append(timestamp);
        }
    });

    // Check if channel name is already taken
    // Gives error message if name is duplicate
    // Loads the new channel if name is unique
    function check_channel(channelname) {
        const request = new XMLHttpRequest();
        request.open('GET', `/channelcheck/${channelname}`);
        request.onload = () => {
            const error = request.responseText;
            console.log(error);
            if (error != "null") {
                document.querySelector('#channel-title').innerHTML = error;
            } else {
                socket.emit('submit channel', {'newchannelname': channelname});
                localStorage.setItem('channelname', channelname);
                document.querySelector('#channel-title').innerHTML = channelname;
                load_channel(channelname);
            }
        };
        request.send();
    }

    // Renders contents of channel in main view.
    function load_channel(name) {
        const request = new XMLHttpRequest();
        request.open('GET', `/channel/${name}`);
        request.onload = () => {
            // Clear messages box
            document.querySelector('#channel-messages').innerHTML = "";
            // Loop through messages from server storage and display
            const res = request.responseText;
            if (res == "null") {
                document.querySelector('#channel-messages').innerHTML = "Send a Message!";
            } else {
                var myArr = JSON.parse(request.responseText);
                console.log(myArr);
                for (var i = 0; i < myArr.length; i++) {
                  const timestamp = document.createElement('p');
                  timestamp.className = 'newChannelMessage';
                  timestamp.innerHTML = myArr[i].user + ' ' + myArr[i].time + "<br />" + myArr[i].message;
                  document.querySelector('#channel-messages').append(timestamp);
                }
            }
        };
        request.send();
    }

});
