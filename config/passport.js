// config/passport.js

// load all the things we need
var LocalStrategy = require('passport-local').Strategy;

// load up the user model
var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');
var dbconfig = require('./database');
var connection = mysql.createConnection(dbconfig.connection);

connection.query('USE ' + dbconfig.database);
// expose this function to our app using module.exports
module.exports = function(passport) {
    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.uid);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        connection.query("SELECT * FROM Users WHERE uid = ? ",[id], function(err, rows){
            done(err, rows[0]);
        });
    });

    passport.use(
        'local-login',
        new LocalStrategy({
            usernameField : 'name',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, email, password, done) { // callback with email and password from our form
            var name = req.body.name;
            var password = req.body.password;
            var earth = req.body.earth;
            var campus = req.body.campus;
            var year = req.body.year;
            var newUserMysql = {
                username: name,
                password: password
            };
            connection.query("SELECT * FROM Users WHERE name = ? and earth = ? and campus = ? and year = ?", [name, earth, campus, year], function(err, rows){
                if (err)
                    return done(err);

                if (!rows.length) {
                    connection.query("INSERT into Users (name,password,earth,campus,year) values (?,?,?,?,?)", [name, password, earth, campus, year], function(err1, rows1){
                        if (err1)
                            return done(err1);
                        newUserMysql.id = rows1.insertId;
                        return done(null, newUserMysql);
                    });
                }
                else {
                    // if the user is found but the password is wrong
                    if (password != rows[0].password)
                        return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

                    // all is well, return successful user
                    return done(null, rows[0]);
                }
            });
        })
    );
};