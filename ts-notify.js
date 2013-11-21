var net = require('net');
var fs = require('fs');
var http = require('http');
var program = require('commander');
var EventSource = require('eventsource');
var growl = require("growl");

program
	.version("0.0.3")
	.option("-p, --port [port]", "Server port [60000]", 60000)
	.option("-a, --address <address>", "Remote ip address/hostname")
	.option("--file [file]", "Alternative 'friends' file")
	.option('--disable-output', "Disable all output (except error messages)")
	.option('--reconnect-delay [delay]', 'Reconnection delay (in seconds)', 20)
	.option('--reconnect-max-attempts [max-attempts]', 'Number of reconnection retries', 5)
	.parse(process.argv);

if (!fs.existsSync(program.file || 'friends')) {
	output('File "friends" missing');
	process.exit(1);
}
if (!program.address) {
	program.help();
}
var subID;
var eventSource;
var attemptCounter = 0;
var friends = [];
var address = 'http://' + program.address + ':' + program.port;
var iconPath = fs.realpathSync('icon.png');
var friendsFile = fs.readFileSync(program.file || 'friends', {encoding: 'UTF-8'});
friends = friendsFile.split(require('os').EOL);
friends.pop();
if (friends.length < 1) {
	output('Invalid "friends" file');
	process.exit(1);
}

init(setupEventSource);

function setupEventSource() {
	eventSource = new EventSource('http://' + program.address + ':' + program.port + '/event?id=' + subID);
	eventSource.onopen = function() {
		output('Connected to ' + address);
	}
	eventSource.onmessage = function(e) {
		if (e.data == '"success"') return;
		var event = JSON.parse(e.data);
		var action = event.status == 1 ? 'connected' : 'disconnected';
		growl(event.name + " " + action, {title: 'ts-notify', image: iconPath});
	};
	eventSource.onerror = function() {
		if (attemptCounter >= program.reconnectMaxAttempts) {
			output('Too many failed connection attempts. Exiting..');
			process.exit(1);
		}
		output('Lost connection. Attempting to reconnect in ' + program.reconnectDelay + ' seconds');
		eventSource.close();
		setTimeout(function() {
			attemptCounter++;
	   		init(setupEventSource);
		}, program.reconnectDelay * 1000);
	};
}

function init(cb) {
	doReq('GET', '/init', function(res, data) {
		subID = JSON.parse(data).id;
		var subCount = 0;
		for(i in friends) {
			doReq('POST', '/subscribe?id=' +subID + "&userid=" + encodeURIComponent(friends[i]), function(res, data) {
				subCount++;
				if (subCount == friends.length) {
					cb();
				}
			});
		}
	});
}

function doReq(method, path, cb) {
	if (typeof data == "function") cb = data;
	var options = {
		'host': program.address,
		'port': program.port,
		'method': method,
		'path': path
	};
	var req = http.request(options, function(res) {
		var data = "";
		res.on('data', function(chunk) {
			data += chunk;
		});
		res.on('end', function() {
			cb(res, data);
		});
	});
	req.on('error', function() {
		if (attemptCounter >= program.reconnectMaxAttempts) {
			output('Too many failed connection attempts. Exiting..');
			process.exit(1);
		}
		output("Can't connect to server. Attempting to reconnect in " + program.reconnectDelay + " seconds.");
		setTimeout(function() {
			attemptCounter++;
	   		init(setupEventSource);
		}, program.reconnectDelay * 1000);
	});
	req.end();
}

function output(text, obj) {
	if (program.disableOutput) return;
	var _d = new Date();
	console.log("[" + ('0' + _d.getDate()).slice(-2) + "." + ('0' + (_d.getMonth()+1)).slice(-2) + "." + _d.getFullYear() + " " + ('0' + _d.getHours()).slice(-2) + ":" + ('0' + _d.getMinutes()).slice(-2) + ":" + ('0' + _d.getSeconds()).slice(-2) + "] " + text, (obj) ? obj : "");
}