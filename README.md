<h1>ts-notify Client</h1>

Connects to a ts-notify-server and updates you about your friends connecting and disconnectin from a TeamSpeak3 server (using notify-send).

<strong>Usage: node ts-notify -p <port> -i <ip/host> [--file &lt;file&gt;]</strong>

Needs a file containing the uniqueIds (without the trailing '=') of the TeamSpeak-Clients you want to follow.

Example 'friends' file:

&lt;uniqueId1&gt;
&lt;uniqueId2&gt;
&lt;uniqueId3&gt;
