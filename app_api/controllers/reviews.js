/* /api/locations/:locationid/review controllers */
var mongoose = require('mongoose');
var Loc = mongoose.model('Location');

var sendJsonResponse = function(res, status, content) {
	res.status(status);
	res.json(content);
};


/* GET one review, based on locationid and reviewid */
module.exports.reviewsReadOne = function(req,res){
	// pre-check for valid ids
	if (req.params && req.params.locationid && req.params.reviewid) {
		Loc
			// find locationid document, from which select name review 
			.findById(req.params.locationid)
			.select('name reviews')
			.exec(
				function(err, location) { // returns the type of model searched
					var response, review;
					if (!location) {
						sendJsonResponse(res, 404, {
							"message" : "locationid not found"
						});
						return;
					} else if (err) {
						sendJsonResponse(res, 404, err);
						return;
				} // !location 404s end
				
				if (location.reviews && location.reviews.length > 0) {
					// mongoose sub-document id method
					// review2 = location.reviews.find({id: req.params.reviewid});
					review = location.reviews.id(req.params.reviewid);
					
					if (!review) {
						sendJsonResponse(res, 404, {
							"message" : "reviewid not found"
						});
					} else {
						// construct custom response
						response = {
							location : {
								name : location.name,
								id: req.params.locationid
							},
							review : review
						};
						sendJsonResponse(res, 200, response);
					}
				} else {
					sendJsonResponse(res, 404, {
						"message" : "No reviews found"
					});
				}

			}
			); 
		} else {
			sendJsonResponse(res, 404, {
				"message" : "no locationid and or reviewid in request"
			});
		}
	}; 

/* POST a new review */ 

// find parent then add through callback in exec
// doAddReview and SetAverageRating helper functions
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
}
/* End POST a new review */ 

module.exports.reviewsUpdateOne = function(req,res){
	sendJsonResponse(res, 200, {"message" : "ok"});
};

module.exports.reviewsDeleteOne = function(req,res){}

