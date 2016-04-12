// service passed to controller then passed to scope
var locationListCtrl = function($scope, loc8rData, geolocation) {
	$scope.message = "Checking your location...";

	// success case, getPosition returns a position parameter
	$scope.getData = function(position) {
		var lat = position.coords.latitude;
		var lng = position.coords.longitude;
		console.log(position);
		$scope.message = "Searching for places near you...";
		// call service using lat,lng
		loc8rData.locationByCoords(lat, lng)
			.success(function(data) {
				console.log(data);
				$scope.message = data.length > 0 ? "" : "No locations found."
				$scope.data = {	locations: data };
			})
			.error(function(e) {
				$scope.message = "Sorry, something's wrong."
				console.log(e);
			});
	}

	$scope.showError = function(error) {
		// $apply wrapper
		$scope.$apply(function() {
			$scope.message = error.message;
		});
	};

	$scope.noGeo = function() {
		$scope.$apply(function(){
			$scope.message = "Geolocation not supported by this browser."
		});
	};	

	// call the service
	geolocation.getPosition($scope.getData, $scope.showError, $scope.noGeo);
};

// Interesting wrapper logic:
var loc8rData = function($http) {
	var locationByCoords = function (lat, lng) {
		return $http.get('/api/locations?lng=' + lng + '&lat=' + lat + '&maxDistance=20000');
	}
	return {
		locationByCoords : locationByCoords
	};
};

var _isNumeric = function(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
};

// use navigator object on modern browsers to get coords
// returned function checks success, error, no coords
var geolocation = function() {
	var getPosition = function(cbSuccess, cbError, cbNoGeo) {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(cbSuccess, cbError);
		} else {
			cbNoGeo();
		}
	};
	return {
		getPosition: getPosition
	};
}

var formatDistance = function() {
	return function(distance) {
		var numDistance, unit;
		if (distance && _isNumeric(distance)) {
			if (distance > 1) {
				numDistance = parseFloat(distance / 1000).toFixed(1);
				unit = 'km';
			} else {
				numDistance = parseInt(distance * 1000, 10);
				unit = 'm';
			}
			return numDistance + unit;
		} else {
			return "?";
		}
	};
};

var ratingStars = function() {
	return {
		scope: {
			thisRating: "=rating"
		}, // reference rating from rating element
		/* isolate template to separate file
		template: "{{ thisRating }}"
		*/
		templateUrl: "/angular/rating-stars.html"
	};
};



angular
	.module('loc8rApp', [])
	.controller('locationListCtrl', locationListCtrl) // take $scope set data
	.filter('formatDistance', formatDistance)
	.directive('ratingStars', ratingStars)
	.service('loc8rData', loc8rData) // take $http to retrieve data\
	.service('geolocation', geolocation);