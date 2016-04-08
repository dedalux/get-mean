/* /api/locations/:locationid/review controllers */
var mongoose = require('mongoose');
var Loc = mongoose.model('Location');

var sendJsonResponse = function(res, status, content) {
	res.status(status);
	res.json(content);
};


/* 
POST a new review 
find parent then add through callback in exec
doAddReview and SetAverageRating helper functions
*/ 
module.exports.reviewsCreate = function(req,res){
	var locationid = req.params.locationid;
	if (locationid) {
		Loc.
		findById(locationid).
		exec(
			function(err, location){
				if (err) {
					sendJsonResponse(res, 400, err);
				} else {
						// invoke add review once location is found
						doAddReview(req, res, location);
					}
				});
	} else {
		sendJsonResponse(res, 404, {
			"message" : "Not found, locationid required."
		});
	}
};

var doAddReview = function(req, res, location) {
	// check empty location
	if (!location) {
		sendJsonResponse(res, 404, {
			"message" : "locationid not found"
		});
	} else {
		// push to end of existing reviews array
		location.reviews.push({
			author: req.body.author,
			rating: req.body.rating,
			reviewText: req.body.reviewText
		});
		// save to db, returns entire location parent
		location.save(function(err, location) {
			var thisReview;
			if (err) {
				sendJsonResponse(res, 400, err);
			} else {
				// update rating if successful
				updateAverageRating(location._id);
				thisReview = location.reviews[location.reviews.length - 1];
				sendJsonResponse(res, 201, thisReview);
			}
		});
	}
};

// a new find operation
var updateAverageRating = function(locationid){
	Loc
	.findById(locationid)
	.select('rating reviews')
	.exec(
		function(err, location){
			if (!err) {
				doSetAverageRating(location);
			}
// add check if no id is found?
		})
};

var doSetAverageRating = function(location){
	var i, reviewCount, ratingAverage, ratingTotal;
	if (location.reviews && location.reviews.length > 0){
		reviewCount = location.reviews.length;
		ratingTotal = 0;
		// get total rating
		for (i=0; i<reviewCount; i++){
			ratingTotal += location.reviews[i].rating;
		}
		//calculate average rating
		ratingAverage = parseInt(ratingTotal / reviewCount, 10);
		location.rating = ratingAverage;
		location.save(function(err){
			if (err){
				console.log(err);
			} else {
				console.log("Average rating updated to ", ratingAverage);
			}
		});
	}
};
/* End POST a new review */ 


/* 
GET, DELETE, PUT one review
Error checking performed by doOneReviewById
if no error perform the intended function in callback
*/


// GET one review
module.exports.reviewsReadOne = function(req, res){
	doOneReviewById(req, res, 'name reviews', function(res, thisReview, location){
		var response = {
				location : {
					name : location.name,
					id: req.params.locationid
				},
				review : thisReview
			};
		sendJsonResponse(res, 200, response);
	});
};

// PUT to update one existing review
module.exports.reviewsUpdateOne = function(req, res){
	doOneReviewById(req, res, 'reviews', function(res, thisReview, location){
		thisReview.author = req.body.author;
		thisReview.rating = req.body.rating;
		thisReview.reviewText = req.body.reviewText;
		location.save(function(err, location){
			if(err) {
				sendJsonResponse(res, 404, err);
			} else {
				updateAverageRating(location._id);
				sendJsonResponse(res, 200, thisReview);
			}
		});
	});
};

// DELETE one review
module.exports.reviewsDeleteOne = function(req,res){
	doOneReviewById(req, res, 'reviews', function(res, thisReview, location){
		thisReview.remove()
		location.save(function(err){
			if (err) {
				sendJsonResponse(res, 404, err);
			} else {
				updateAverageRating(location._id);
				sendJsonResponse(res, 204, null);
			}
		});
	});
}

// Get one review by Id, perform callback if no error
var doOneReviewById = function(req, res, selection, callback){
	if (!(req.params && req.params.locationid && req.params.reviewid)) {
		sendJsonResponse(res, 404, {
			"message" : "No review to delete"
		});
		return;
	};

	Loc
		// find locationid document, from which select name review 
		.findById(req.params.locationid)
		.select(selection)
		.exec(
			function(err, location) { // returns the type of model searched
				var thisReview;
				if (!location) {
					sendJsonResponse(res, 404, {
						"message" : "locationid not found"
					});
					return;
				} else if (err) {
					sendJsonResponse(res, 404, err);
					return;
				}

			if (location.reviews && location.reviews.length > 0) {
				thisReview = location.reviews.id(req.params.reviewid);
				console.log(thisReview)
				if (!thisReview) {
					sendJsonResponse(res, 404, {
						"message:" : "reviewid not found"
					});
				} else {
					// execute callback if correct review turned 
					callback(res, thisReview, location);
				}
			}
		});

};