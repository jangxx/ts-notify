var notify = require('notify-send');
var net = require('net');
var fs = require('fs');
var http = require('http');
var program = require('commander');

program
	.version("0.0.1")
	.option("-p, --port <port>", "Server port [60000]", 60000)
	.option("-i, --ip <ip>", "Remote ip address")
	.option("--file <file>", "Alternative 'friends' file")
	.parse(process.argv);

if (!fs.existsSync(program.file || 'friends')) {
	console.log('File "friends" missing');
	process.exit(1);
}
if (!program.ip) {
	program.help();
}
var friends = [];
var friendsFile = fs.readFileSync(program.file || 'friends', {encoding: 'UTF-8'});
friends = friendsFile.split('\n');
if (friends.length < 1) {
	console.log('Invalid "friends" file');
	process.exit(1);
}
var subscriptionCount;
var iconPath = fs.realpathSync('icon.png');
resetVars();
connect();

function connect() {
	var socket = net.connect(program.port, program.ip);
	socket.setKeepAlive(true, 2*60*1000);
	socket.on('data', function(data) {
		if (data.toString().trim() == "ok" && subscriptionCount < friends.length) {
			var req = {'request': 'subscribe', 'uid': friends[subscriptionCount]};
			var req = JSON.stringify(req);
			socket.write(req + '\n');
			subscriptionCount++;
		} else {
			if (data.toString().trim() == 'ok') return;
			var notification = JSON.parse(data.toString());
			var action = (notification.status == 1) ? 'connected' : 'disconnected';
			notify.icon(iconPath).notify('ts-notify', notification.name + ' ' + action);
		}
	});
	socket.on('connect', function() {
		console.log('Connected.');
	});
	socket.on('close', reconnect);
	socket.on('error', reconnect);
}

function resetVars() {
	subscriptionCount = 0;
}

function reconnect() {
	console.log('Disconnected. Attempting to reconnect in 30 seconds');
	setTimeout(function() {
		resetVars();
		connect();
	}, 30000);
}