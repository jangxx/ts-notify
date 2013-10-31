var notify = require('notify-send');
var net = require('net');
var fs = require('fs');
var http = require('http');
var program = require('commander');

program
	.version("0.0.1")
	.option("-p, --port <port>", "Server port [60000]", 60000)
	.option("-a, --address <address>", "Remote ip address/hostname")
	.option("--file <file>", "Alternative 'friends' file")
	.parse(process.argv);

if (!fs.existsSync(program.file || 'friends')) {
	console.log('File "friends" missing');
	process.exit(1);
}
if (!program.address) {
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
var r = new ReconnectManager();
connect();

function connect() {
	var socket = net.connect(program.port, program.address);
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
			console.log(notification);
			var action = (notification.status == 1) ? 'connected' : 'disconnected';
			notify.icon(iconPath).notify('ts-notify', notification.name + ' ' + action);
		}
	});
	socket.on('connect', function() {
		console.log('Connected.');
	});
	socket.on('close', function() {
		socket.destroy();
		delete socket;
		reconnect();
	});
	socket.on('error', function() {
		socket.destroy();
		delete socket;
		reconnect();
	});
}

function reconnect() {
	var success = r.run(connect, 30000);
	if (success) console.log("Lost connection to ts-notify-server. Reconnecting in 30 seconds.");
}

function resetVars() {
	subscriptionCount = 0;
}

function ReconnectManager() {
	var running = false;
	var attempts = 0;
	var lastAttempt;
	this.run = function(fn, delay) {
		if (running) return false;
		var time = (new Date()).getTime();
		if (lastAttempt) {
			if (lastAttempt + 5*60*1000 > time) {
				attempts++;
			} else {
				attempts = 1;
			}
			if(attempts > 3) {
				console.log("Script exits after 3 failed attempts in 5 minutes");
				notify.notify('ts-notify', 'The script exited after 3 failed attempts to reconnect.');
				process.exit(1);
			}
		} else {
			attempts = 1;
		}
		lastAttempt = time;
		running = true;
		setTimeout(function() {
			fn();
			running = false;
		}, delay);
		return true;
	}
}
