# Flack

A Web Programming project using Python, Flask, JavaScript, and websockets (Socket.io)
A single-page website that uses HTML, CSS, SCSS, and Bootstrap4 for reponsive display.

Flack is an online messaging service using Flask, similar in spirit to Slack. Users can sign into this site with a display name, create channels (chatrooms) to communicate in, as well as see and join existing channels. Once a channel is selected, users can send and receive messages with one another in real time.
 
Project Specifications
 
Display Name: When a user visits Flack for the first time, they are prompted to type in a display name that is associated with every message the user sends. If a user closes the page and returns to Flack later, the display name should still be remembered as it is kept in local storage client-side.

Channel Creation: Any user can create a new channel, so long as its name doesn’t conflict with the name of an existing channel.

Channel List: Users can see a list of all current channels, and selecting one allows the user to view the channel. 

Messages View: Once a channel is selected, the user can any messages that have already been sent in that channel, up to a maximum of 100 messages. The 100 most recent messages per channel are stored in server-side memory.

Sending Messages: Once in a channel, users can send text messages to others in the channel. When a user sends a message, their display name and the timestamp of the message are displayed with the message. All users in the channel should then see the new message appear on their channel page. Sending and receiving messages does NOT require reloading the page.

Remembering the Channel: If a user is on a channel page, closes the web browser window, and goes back to the Flack application, the app remembers what channel the user was on previously and takes the user back to that channel.




