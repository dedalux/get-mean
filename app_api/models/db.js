var mongoose = require('mongoose');

/* open mongoose connection at application startup */
var dbURI = 'mongodb://localhost/Loc8r'

/* change dbURI for production mode, credential on heroku */
if (process.env.NODE_ENV === 'production') {
	dbURI = process.env.MONGOLAB_URI;
};

mongoose.connect(dbURI); //var _ = mongoose.createConnection(dbURI) for multi

/* event listeners for development */
mongoose.connection.on('connected', function () {
	console.log('Mongoose connected to ' + dbURI);
});

mongoose.connection.on('error',function (err) {
	console.log('Mongoose connection error: ' + err);
});

mongoose.connection.on('disconnected', function () {
	console.log('Mongoose disconnected');
});

/* readline for windows */
var readLine = require ("readline");
if (process.platform === "win32"){
	var rl = readLine.createInterface ({
		input: process.stdin,
		output: process.stdout
	});
	rl.on ("SIGINT", function (){
		process.emit ("SIGINT");
	});
}


var gracefulShutdown = function (msg, callback) {
	mongoose.connection.close(function () {
		console.log('Mongoose disconnected through ' + msg);
		callback();
	});
};

/* db shut down processes */
// for nodemon restarts
process.once('SIGUSR2', function () {
	gracefulShutdown('nodemon restart', function () {
		process.kill(process.pid, 'SIGUSR2');
	});
});

// for app termination
process.on('SIGINT', function () {
	gracefulShutdown('app termination', function () {
		process.exit(0);
	});
});

// for Heroku app termination
process.on('SIGTERM', function() {
	gracefulShutdown('Heroku app shutdown', function () {
		process.exit(0);
	});
});

/* require model schemas */
require('./locations')