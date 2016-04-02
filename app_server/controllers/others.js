/* GET 'about' page */
module.exports.about = function (req, res) {
	// render(template name, return JSON data for template)
	res.render('about-placeholder', {title: 'About'});
};