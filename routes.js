// app/routes.js

var mysql = require('mysql');
var dbconfig = require('./config/database');
var connection = mysql.createConnection(dbconfig.connection);

connection.query('USE ' + dbconfig.database);

module.exports = function(app, passport) {

	app.get('/', isLoggedIn, function(req, res) {
		connection.query("SELECT * FROM Classes", function(err, rows) {
			if (err) console.log(err);
			res.render('index.ejs', {classlist : rows});
		})
	});

	app.get('/login', function(req, res) {
		var loginMessage = req.flash('loginMessage');
		var name = req.flash('name');
		var earth = req.flash('earth');
		var campus = req.flash('campus');
		var year = req.flash('year');
		console.log(name);
		console.log(earth);
		console.log(campus);
		console.log(year);
		res.render('login.ejs', {wrong : (loginMessage.length != 0), login_message : loginMessage, name : name, earth : earth, campus : campus, year : year});
	});

	app.post('/login', passport.authenticate('local-login', { successRedirect : '/', failureRedirect : '/' }));


	app.get('/logout', isLoggedIn, function(req, res) {
		req.logOut();
		res.redirect('/');
	});

	app.get('/deleteAccount', function(req, res) {
		connection.query("DELETE FROM Users WHERE id = ?", [req.user.uid], function(err, rows) {
			console.log(rows);
			console.log(err);
			req.logOut();
			res.redirect('/');
		})
	});

	app.get('/details', isLoggedIn, function(req, res) {
		connection.query("SELECT * FROM Classes where cid = ?", [req.query.cid], function(err1, rows1) {
			if (err1)
				console.log(err1);
			if (rows1.length == 0)
				res.redirect('/confirm?t=de');
			else {
				connection.query("SELECT * FROM Users where uid = ? and cid = ?", [req.user.uid, req.query.cid], function(err2, rows2) {
					if (err2)
						console.log(err2);
					res.render('detail.ejs', {classinfo : rows1[0], registered : (rows2.length > 0)});
				});
			}
		});
	});

	app.get('/cancel', isLoggedIn, function(req, res) {
		connection.query("SELECT cid from Users where uid = ?", [req.user.uid], function(err, rows) {
			if (err)
				res.redirect('/confirm?t=e');
			else if (rows[0].cid == null)
				res.redirect('/confirm?t=cet');
			else {
				connection.query("UPDATE Classes SET current = (current - 1) where cid = ?", [req.query.cid], function(err1, rows1) {
					if (err1)
						res.redirect('/confirm?t=ce');
					else {
						connection.query("UPDATE Users SET cid = null where uid = ?", [req.user.uid], function(err, rows) {
							if (err)
								res.redirect('/confirm?t=e');
							else
								res.redirect('/confirm?t=cs');
						})
					}
				})
			}
		})
	})

	app.get('/register', isLoggedIn, function(req, res) {
		connection.query("SELECT cid from Users where uid = ?", [req.user.uid], function(err, rows) {
			if (err)
				res.redirect('/confirm?t=e');
			else if (rows[0].cid == req.query.cid)
				res.redirect('/confirm?t=ret');
			else if (rows[0].cid != null)
				res.redirect('/confirm?t=red');
			else {
				connection.query("UPDATE Classes SET current = (current + 1) where cid = ?", [req.query.cid], function(err1, rows1) {
					if (err1)
						res.redirect('/confirm?t=ref');
					else {
						connection.query("UPDATE Users SET cid = ? where uid = ?", [req.query.cid, req.user.uid], function(err, rows) {
							if (err)
								res.redirect('/confirm?t=e');
							else
								res.redirect('/confirm?t=rs');
						})
					}
				})
			}
		})
	})

	app.get('/confirm', isLoggedIn, function(req, res){
		res.render('confirm.ejs', {t : req.query.t});
	});

	app.get('/mycid', isLoggedIn, function(req, res) {
		connection.query("SELECT * FROM Classes where cid = (SELECT cid FROM Users where uid = ?)", [req.user.uid], function(err, rows) {
			if (!rows.length)
				res.redirect('/confirm?t=me');
			else
				res.render('detail.ejs', {classinfo : rows[0], registered : true});
		})
	});
	
};

// route middleware to make sure
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/login');
}
