/* /api/locations controllers */
var mongoose = require('mongoose');
var Loc = mongoose.model('Location');

var sendJsonResponse = function(res, status, content) {
	res.status(status);
	res.json(content);
};


// GET closest cafe by location -- good controller processing example
module.exports.locationsListByDistance = function(req,res){
	var lng = parseFloat(req.query.lng);
	var lat = parseFloat(req.query.lat);
	var point = {
		type : "Point",
		coordinates: [lng, lat]
	};
	var geoOptions = {
		spherical: true,
		// Now Mongo 3/geoJSON takes meters
		maxDistance: 15000, //theEarth.getRadsFromDistance(2000), // max 20 km
		num: 10
	};

	// data validation
	if (!lng || !lat) {
		sendJsonResponse(res, 404, {
			"message" : "lng and lat query parameters required."
		});
		return;
	}

	Loc.geoNear(point, geoOptions, function(err, results, stats){
		/* geoNear returns in results: [{dis, obj}], closer first*/
		/* stats: {nscanned: #, objectLoaded: #, avgDistance, maxDistance} */
		var locations = []

		if (err){
			sendJsonResponse(res, 404, err);
		} else {
			results.forEach(function(doc){
				locations.push({
					distance: doc.dis, //theEarth.getDistanceFromRads(doc.dis), 
					name: doc.obj.name,
					address: doc.obj.address,
					rating: doc.obj.rating,
					facilities: doc.obj.facilities,
					_id: doc.obj._id
				});
			});
// to do: check to respond accordingly if no cafe nearby? 
		sendJsonResponse(res, 200, locations);
		}
	});
}

module.exports.locationsCreate = function(req,res){
	Loc.create({
		name: req.body.name,
		address: req.body.address,
		facilities: req.body.facilities.split(','),
		coords: [parseFloat(req.body.lng), parseFloat(req.body.lat)],
		openingTimes: [{
			days: req.body.days1,
			opening: req.body.opening1,
			closing: req.body.closing1,
			closed: req.body.closed1,
		}, {
			days: req.body.days2,
			opening: req.body.opening2,
			closing: req.body.closing2,
			closed: req.body.closed2,
		}]
		}, function(err, location){
			if (err) {
				sendJsonResponse(res, 400, err);
			} else {
				sendJsonResponse(res, 200, location);
			}
		});
};

module.exports.locationsReadOne = function(req,res){
	if (req.params && req.params.locationid) {
		Loc
		.findById(req.params.locationid)
		.exec(function(err, location){
			if (!location){
					// throw 404 not found
					sendJsonResponse(res, 404, {
						"message" : "locationid not found"
					});
					return
				} else if (err) {
					// throw other 404
					sendJsonResponse(res, 404, err);
					return
				} else {
					// 200 respond location
					sendJsonResponse(res, 200, location);
				}
			});
	} else {
		sendJsonResponse(res, 404, {
			"message" : "No locationid in request"
		});
	}
};

module.exports.locationsUpdateOne = function(req,res){}

module.exports.locationsDeleteOne = function(req,res){}


/*
// earth radian to kilometer; immediately execute
var theEarth = (function(){
	var earthRadius = 6371; // km
	var getDistanceFromRads = function(rads) {
		return parseFloat(rads * earthRadius);
	};

	var getRadsFromDistance = function(distance) {
		return parseFloat(distance / earthRadius)
	};
	return {
		getDistanceFromRads : getDistanceFromRads,
		getRadsFromDistance : getRadsFromDistance
	};
}) ();
*/