var fs = require('fs');
var program = require('commander');
var socketio = require('socket.io-client');
var growl = require("growl");
var util = require('util');

program
	.version("0.1.1")
	.option("-p, --port [port]", "Server port [60000]", 6000)
	.option("-a, --address <address>", "Remote ip address/hostname")
	.option("--file [file]", ".json file containing an array of uniqueIDs", "friends.json")
	.option('--disable-output', "Disable all output (except error messages)")
	.parse(process.argv);

if (!fs.existsSync(program.file || 'friends')) {
	output('File "friends" missing');
	process.exit(1);
}
if (!program.address) {
	program.help();
}
var address = 'http://' + program.address + ':' + program.port;
var iconPath = fs.realpathSync('icon.png');

if(!fs.existsSync(program.file)) {
	fs.writeFileSync(program.file, "[]");
}

var friendsFile = fs.readFileSync(program.file, {encoding: 'UTF-8'});
try {
	var friends = JSON.parse(friendsFile);
} catch(e) {
	log('Invalid "friends" file');
	var friends = [];
}

var socket = socketio(address);

socket.on('connect', function() {
	log("Connected to " + address);
	
	for(var f in friends) {
		socket.emit('subscribe', friends[f]);
	}
});

socket.on('connected', function(name) {
	log(name + " connected");
	growl(htmlEntities(name) + " connected", {title: 'ts-notify', image: iconPath});
});

socket.on('disconnected', function(name) {
	log(name + " disconnected");
	growl(htmlEntities(name) + " disconnected", {title: 'ts-notify', image: iconPath});
});

function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(new RegExp('"', 'g'), '&quot;');
}

function log(text) {
	if(!program.disableOutput) util.log(text);
}
