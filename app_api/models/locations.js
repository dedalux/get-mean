var mongoose = require('mongoose');

/* location sub-document schemas */
var openingTimeSchema = new mongoose.Schema({
	_id: false,
	days: {type: String, required: true},
	opening: String,
	closing: String,
	closed: {type: Boolean, required: true}
});

var reviewSchema = new mongoose.Schema({
	author: {type: String, required: true},
	rating: {type: Number, required: true, min: 0, max: 5},
	reviewText: {type: String, required: true}
	// createdOn: {type: Date, "default": Date.now}
},{
	timestamps: true // require mongoose >= 4.0.0
});

var locationSchema = new mongoose.Schema({
	name: {type: String, required: true},
	address: String,
		
	//default is reserved in js, put in quotes
	rating: {type: Number, "default": 0, min: 0, max: 5},
	facilities: [String],

	// coord index in GeoJSON [lng, lat]
	coords: {type: [Number], index: '2dsphere'},
	
	// nesting sub-document
	openingTimes: [openingTimeSchema],
	reviews: [reviewSchema] 
});

mongoose.model('Location',locationSchema);