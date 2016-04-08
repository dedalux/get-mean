var request = require('request');
var apiOptions = {
	server: "http://localhost:3000"
}

// Change to production base URL
if (process.env.NODE_ENV === 'product') {
	apiOptions.server = "https://boiling-sea-52208.herokuapp.com/"
};


var renderHomepage = function(req, res, responseBody) {
	// Error message passed back on to homepage locations-list template
	var message;

	if (!(responseBody instanceof Array)) {
		message = "API lookup error";
		responseBody = [];
	} else {
		if (!responseBody.length) {
			message = "No places found nearby";
		}
	}

	res.render('locations-list', { 
		title:'Loc8r - Find a Place to Work with Wifi',
		sidebar: "Looking for wifi and seat? Loc8r helps you find places to work when you are out and about. Perhaps with coffee, cake or a beer? Let Loc8r help you find the place you're looking for.",
		pageHeader: {
			title: 'Loc8r',
			strapline: 'Find places to work with wifi near you!'
		},
		locations: responseBody,
		message: message
	});
}


/* GET 'home' page */
module.exports.homelist = function(req, res) {
	var requestOptions, path;
	// set api call path
	path = '/api/locations';
	requestOptions = {
		url: apiOptions.server + path,
		method: "GET",
		json: {},
		// querys are the extra options in URL
		qs: {
			lng: -0.7992599,
			lat: 51.378091,
			maxDistance: 15000
		}
	};
	// api request
	request(requestOptions,
		function(err, response, body){
			var i, data;
			data = body;
			// only do the loop if Request response returns 200
			if (response.statusCode === 200 && data.length) {
				for (i = 0; i<data.length; i++) {
					data[i].distance = _formatDistance(data[i].distance);
			}
				
			}
			renderHomepage(req, res, data);
		}
	);
};

/* GET 'Location info' page */
module.exports.locationInfo = function(req, res){
	getLocationInfo(req, res, function(req, res, responseData) {
		renderDetailPage(req, res, responseData);
	});
};

/* GET a new review add page */
module.exports.addReview = function(req,res) {
	getLocationInfo(req, res, function(req, res, responseData) {
		renderReviewForm(req, res, responseData);
	});
};


// Get location information call
var getLocationInfo = function(req, res, callback) {
	var requestOptions, path;
	path = "/api/locations/" + req.params.locationid;
	requestOptions = {
		url: apiOptions.server + path,
		method: "GET",
		json: {}
	}
	request(requestOptions,
		function(err, response, body){
			var data = body;
			if (response.statusCode === 200) {
			
			data.coords = {
				lng: body.coords[0],
				lat: body.coords[1]
			};
			callback(req, res, data);
		} else {
			_showError(req, res, response.statusCode);
		}

		});
};

// render location details
var renderDetailPage = function(req, res, locDetail) {
	res.render('location-info', { 
		title: locDetail.name,
		pageHeader: {title: locDetail.name},
		sidebar: {
			context: locDetail.name + " is on Loc8r because it has " + locDetail.facilities.join(", ").toLowerCase() + ".",
			callToAction: "If you've been and you like it - or if you don't - please leave a review to help other people just like you."
		},
		location: locDetail
	});
}

// render review form
var renderReviewForm = function(req, res, locDetail) {
	res.render('location-review-form', { 
		title:'Revew ' + locDetail.name + " on Loc8r",
		pageHeader: { title: 'Review ' + locDetail.name },
		name: locDetail.name,
		id: locDetail._id,
		error: req.query.err
	});
};

module.exports.doAddReview = function(req,res) {
	var requestOptions, path, locationid, postdata;
	locationid = req.params.locationid;
	path = "/api/locations/" + locationid + "/reviews";
	postdata = {
		author: req.body.name,
		rating: parseInt(req.body.rating, 10),
		reviewText: req.body.review
	};
	// send POST request to API
	requestOptions = {
		url: apiOptions.server + path,
		method: "POST",
		json: postdata
	};

	// application level validation
	if (!postdata.author || !postdata.rating || !postdata.reviewText) {
		res.redirect('/locations/' + locationid + '/reviews/new?err=val')
	} else {
	request(requestOptions, 
		function(err, response, body){
			if (response.statusCode === 201) {
				res.redirect('/locations/' + locationid);
			// Mongoose validation throws "ValidationError" in response body 
			} else if (response.statusCode === 400 && body.name && body.name === "ValidationError") {
				res.redirect('/locations/' + locationid + '/reviews/new?err=val')
			} else {
				_showError(req, res, response.statusCode);
			}
			}
		);
	}
};

// helper function to format distance

var _formatDistance = function(distance) {
	var numDistance, unit;
	if (distance > 1000) {
		numDistance = parseFloat(distance / 1000).toFixed(1);
		unit = 'km';
	} else {
		numDistance = parseInt(distance);
		unit = 'm';
	}
	return numDistance + unit;
}

var _showError = function(req, res, status)  {
	var title, content;
	if (status === 404) {
		title = "404, page not found";
		content = "Cannot find this page.";
	} else {
		title = status + ", something's gone wrong";
		content = "Something has gone wrong somewhere..."
	} 
	res.status(status);
	res.render('error',{
		title : title,
		content: content
	});
}