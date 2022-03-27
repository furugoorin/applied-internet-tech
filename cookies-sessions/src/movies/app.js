// app.js
const db = require('./db');
const mongoose = require('mongoose');
const express = require('express');
const app = express();
const session = require('express-session');

app.set('view engine', 'hbs');
app.use(express.urlencoded({extended: false}));

const Movie = mongoose.model('Movie');

const sessionOptions = { 
	secret: 'secret for signing session id', 
	saveUninitialized: false, 
	resave: false 
};

app.use(session(sessionOptions));


/**
 * HTTP GET request that retrieves all movies
 * @param  {String} route The route to the /movies page
 * @param  {Object} req The request object 
 * @param  {Object} res The response object
 */
app.get('/movies', (req, res) => { 
    if(req.query.director && req.query.director !== ''){
        //specifies search criteria by director
        Movie.find({director: req.query.director}, (err, movies) => {
            res.render('movies', {movies});
        });
    } else{
        //otherwise, render all movies
        Movie.find({}, (err, movies) => { 
            res.render('movies', {movies});
        });
    }   
});

/**
 * HTTP GET Request that renders page to add movies
 * @param  {String} route The route to the /movies/add page
 * @param  {Object} req The request object 
 * @param  {Object} res The response object
 */
app.get('/movies/add', (req, res) => {
    res.render('addMovie');
});

/**
 * HTTP POST Request that updates movie into database
 * @param  {String} route The route to the /movies/add page
 * @param  {Object} req The request object 
 * @param  {Object} res The response object
 */
app.post('/movies/add', (req, res) => {
    //create a Movie object
    const movie = new Movie({
        title: req.body.title,
        director: req.body.director,
        year: req.body.year
    });
    //checks if there is a current session
    if(req.session.sessionMovies == undefined || req.session.sessionMovies == null){
        req.session.sessionMovies = [];
    }
    //saves Movie to current session
    req.session.sessionMovies.push(movie);
    movie.save((err, savedMovie) => {
        if(err){
            Movie.find({}, (err, movies) => { 
                res.render('/movies', {movies, error: 'error adding movie'});
            });
        } else{
            res.redirect('/movies');
        }
    });
});

/**
 * HTTP GET Request that renders page of movies added during current session
 * @param  {String} route The route to the /mymovies page
 * @param  {Object} req The request object 
 * @param  {Object} res The response object
 */
app.get('/mymovies', (req, res) => {
    res.render('mymovies', {sessionMovies: req.session.sessionMovies});
});


app.listen(3000);