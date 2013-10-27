<h1>ts-notify Client</h1>

Connects to a ts-notify-server and updates you about your friends connecting and disconnectin from a TeamSpeak3 server (using notify-send).

<strong>Usage: node ts-notify -i <ip/host> [-p &lt;port&gt;] [--file &lt;file&gt;]</strong>

Needs a file containing the uniqueIds (without the trailing '=') of the TeamSpeak-Clients you want to follow.

Example 'friends' file:

&lt;uniqueId1&gt;<br>
&lt;uniqueId2&gt;<br>
&lt;uniqueId3&gt;
