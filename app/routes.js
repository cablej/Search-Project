var models  = require('../models');
var request = require("paranoid-request");
var CronJob = require('cron').CronJob;

// Every hour, refresh 1/24 of the urls
const NUM_DIVS = 24;
new CronJob('0 * * * *', function() {
  models.url.count({}).then((count) => {
	var hour = new Date().getHours();
	var interval = Math.ceil(count / NUM_DIVS);
	var min = interval*hour;
	var max = interval*(hour + 1);
	models.url.findAll({
	  attributes: ['id', 'url'],
	  where: {
		id: {
		  lt:max,
		  gt:min
		}
	  }
	}).then((urls) => {
	  var done = 0;
	  fetchUrls((resp) => {
	  	resp.where = {
	  		url: resp.url
	  	}
		models.url.update(resp).then(url => {
			console.log('Update success for ' + resp.url)
	    })
	  })
	});
  })
}, null, true, 'America/Chicago');

// Helper method to fetch a list of urls, calls callback as each response is returned
function fetchUrls(urls, callback) {
	for (url of urls) {
		request.get(url, (err, res1, body) => {
			if (!res1 || err) {
				return;
			}
			var url = res1.request.uri.href
		    var titleArr = body.match("<title>(.*?)</title>");
		    var title = titleArr && titleArr.length > 1 ? titleArr[1] : url;
		    callback({ title: title, url: url, contents: body })
		});
	}
}

module.exports = function(app) {

	app.get('/api/urls', function(req, res) {
		models.url.findAll({
			attributes: ['id', 'url', 'title'],
			order: [
	            ['id', 'DESC']
	        ],
		}).then(function(urls) {
			res.status(200).json(urls);
		});
	});

	app.post('/api/urls', function(req, res) {
		var urls = req.body.url.split('\n');
		var done = 0;
		var resps = []
		fetchUrls(urls, (resp) => {
			models.url.create(resp).then(url => {
		    	url.contents = '';
			    done++;
			    resps.push(url)
			    if (done == urls.length) {
					res.status(200).json(resps);
				}
		    })
	    })
	});

	app.get('/api/urls/search', function(req, res) {
		// Utilize Postgres full-text query
		models.sequelize.query(`
			SELECT url, title, ts_headline(contents, :query) as contents
			FROM ${models.url.tableName}
			WHERE _search @@ plainto_tsquery('english', :query);
		`, {
			model: models.url,
			replacements: { query: req.query.q },
		}).then(searchResults => {
			console.log(searchResults)
			res.status(200).json(searchResults);
		});
	});

	app.delete('/api/urls/:id', function(req, res) {
		models.url.destroy({
		    where: {
		        'id': req.params.id
		    }
		}).then(() => {
			res.status(200).json({});
		});
	});

	// frontend routes =========================================================
	// route to handle all angular requests
	app.get('*', function(req, res) {
		res.sendfile('./public/index.html');
	});

};