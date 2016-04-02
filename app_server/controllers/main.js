// GET homepage
module.exports.index = function (req, res) {
	// render(template name, return JSON data for template)
	res.render('index', {title: 'Express'});
};