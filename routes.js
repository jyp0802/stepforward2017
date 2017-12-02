// app/routes.js

var mysql = require('mysql');
var dbconfig = require('./config/database');
var connection = mysql.createConnection(dbconfig.connection);

connection.query('USE ' + dbconfig.database);

module.exports = function(app, passport) {

	app.get('/', isLoggedIn, function(req, res) {
		connection.query("SELECT * FROM Classes", function(err, rows) {
			if (err)
				console.log(err);
			res.render('index.ejs', {classlist : rows});
		})
	});

	app.get('/login', function(req, res) {
		var loginMessage = req.flash('loginMessage');
		if (loginMessage) l_msg = loginMessage;
		res.render('login.ejs', {login_message : l_msg});
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
				connection.query("SELECT * FROM Registration where uid = ? and cid = ?", [req.user.uid, req.query.cid], function(err2, rows2) {
					if (err2)
						console.log(err2);
					res.render('detail.ejs', {classinfo : rows1[0], registered : (rows2.length == 1)});
				});
			}
		});
	});

	app.get('/cancel', isLoggedIn, function(req, res) {
		connection.query("UPDATE Classes SET current = current - 1 where cid = ?", [req.query.cid], function(err1, rows1) {
			if (err1) {
				console.log(err1);
				res.redirect('/confirm?t=ce');
			}
			else {
				connection.query("DELETE FROM Registration where uid = ? and cid = ?", [req.user.uid, req.query.cid], function(err2, rows2) {
					if (err2 || rows2.affectedRows == 0) {
						console.log(rows2);
						res.redirect('/confirm?t=ce');
					}
					else {
						res.redirect('/confirm?t=cs');
					}
				})
			}
		})
	})

	app.get('/register', isLoggedIn, function(req, res) {
		connection.query("UPDATE Classes SET current = (current + 1) where cid = ?", [req.query.cid], function(err1, rows1) {
			if (err1) {
				console.log(err1);
				res.redirect('/confirm?t=ref');
			}
			else {
				connection.query("INSERT into Registration values (?,?)", [req.user.uid, req.query.cid], function(err, rows) {
					if (err || rows.affectedRows == 0) {
						console.log(err);
						res.redirect('/confirm?t=red');
					}
					else{
						res.redirect('/confirm?t=rs');
					}
				})
			}
		})
	})

	app.get('/confirm', isLoggedIn, function(req, res){
		res.render('confirm.ejs', {t : req.query.t});
	});

	app.get('/mycid', isLoggedIn, function(req, res) {
		connection.query("SELECT * FROM Classes where cid = (SELECT cid FROM Registration where uid=?)", [req.user.uid], function(err, rows) {
			if (!rows.length)
				res.redirect('/confirm?t=me');
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
