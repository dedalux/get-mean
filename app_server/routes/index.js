var express = require('express');
var router = express.Router();
var ctrlLocations = require('../controllers/locations');
var ctrlOthers = require('../controllers/others');

/* Locations pages */
// Get the res object from controller and sends to template
router.get('/', ctrlLocations.homelist);
router.get('/locations/:locationid', ctrlLocations.locationInfo);
router.get('/locations/:locationid/reviews/new', ctrlLocations.addReview);
router.post('/locations/:locationid/reviews/new/', ctrlLocations.doAddReview)


/* Other pages */
router.get('/about', ctrlOthers.about);


module.exports = router;