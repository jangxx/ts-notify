<h1>ts-notify Client</h1>

Connects to a ts-notify-server and updates you about your friends connecting and disconnecting from a TeamSpeak3 server using node-growl.
On Linux this means you need to have notify-send installed. For Mac and Windows follow the instructions over on their git (https://github.com/visionmedia/node-growl).

<strong>Usage: node ts-notify -i &lt;ip/host&gt; [-p &lt;port&gt;] [--file &lt;file&gt;]</strong>

Needs a file containing the uniqueIds of the TeamSpeak-Clients you want to follow.

Example 'friends' file:

&lt;uniqueId1&gt;<br>
&lt;uniqueId2&gt;<br>
&lt;uniqueId3&gt;
