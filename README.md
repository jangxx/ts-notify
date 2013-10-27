ts-notify Client

Connects to a ts-notify-server and updates you about your friends connecting and disconnectin from a TeamSpeak3 server (using notify-send).

Usage: node ts-notify -p <port> -i <ip/host> [--file <file>]

Needs a file containing the uniqueIds (without the trailing '=') of the TeamSpeak-Clients you want to follow.

Example 'friends' file:

<uniqueId1>
<uniqueId2>
<uniqueId3>
