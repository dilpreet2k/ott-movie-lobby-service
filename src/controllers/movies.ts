import { Request, Response } from 'express';
import { NextFunction } from 'express-serve-static-core';
import MovieModel from '../models/movies';
import { MoviesHelper } from '../helpers/moviesHelper';
import { CacheHelper } from '../helpers/cacheHelper';

/**
 * 
 * @author Dilpreet Singh
 * @api {get} /movie_lobby/movies Get movies list
 * @apiName Get Movie List
 * @apiGroup Movies
 *
 * @apiParam {String} [page] Page of pagination.
 * @apiParam {String} [limit] Limit of records.
 *
 * @apiSuccess {String} _id Unique identifier of the movie.
 * @apiSuccess {String} title Title of the movie.
 * @apiSuccess {String} genre Genre of the movie.
 * @apiSuccess {Number} rating Rating of the movie.
 * @apiSuccess {String} streamingLink Streaming link of the movie.
 *
 * @apiParamExample {json} Request-Example:
 * GET /movie_lobby/movies?page=10&limit=10
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * [
 *   {
 *     "_id": "6689284d66c01b9afab203a4",
 *     "title": "Interstellar",
 *     "genre": "Sci-Fi",
 *     "rating": 10,
 *     "streamingLink": "http://localhost:1234",
 *     "__v": 0
 *   },
 *   {
 *     "_id": "66892af13ca8c463b864a315",
 *     "title": "Mr. Bean",
 *     "genre": "Comedy",
 *     "rating": 7,
 *     "streamingLink": "http://localhost:1234",
 *     "__v": 0
 *   }
 * ]
 *
 * @apiError {Number} code Error code.
 * @apiError {String} message Error message.
 *
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 500 Internal Server Error
 * {
 *   "code": 1001,
 *   "message": "Unexpected Error: Something went wrong!"
 * }
 */
const getMoviesList = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
    try {
        // Sanitize and extract pagination parameters
        const { page, limit, key } = MoviesHelper.sanitizeListMovieParams(req.query);

        // Check if movies list is cached
        const cachedMovies = CacheHelper.getValueFromKey(key);
        if (cachedMovies) {
            return res.status(200).json(cachedMovies);
        }

        // Fetch movies from the database
        const moviesList = await MoviesHelper.getMoviesFromDb(page, limit);
        CacheHelper.setValueByKey(key, moviesList); // Cache the fetched movies
        res.status(200).json(moviesList);
    } catch (error) {
        console.log(error);
        next(error);
    }
};

/**
 * 
 * @author Dilpreet Singh
 * @api {post} /movie_lobby/movies Add a movie
 * @apiName Add a movie
 * @apiGroup Movies
 *
 * @apiParam {String} title Title of the movie. (Required)
 * @apiParam {String} genre Genre of the movie. (Required)
 * @apiParam {Number} rating Rating of the movie. (Required)
 * @apiParam {String} streamLink Streaming link of the movie. (Required)
 *
 * @apiSuccess {Number} _id ID of the movie.
 * @apiSuccess {String} title Title of the movie.
 * @apiSuccess {String} genre Genre of the movie.
 * @apiSuccess {Number} rating Rating of the movie.
 * @apiSuccess {String} streamLink Streaming link of the movie.
 * 
 * @apiParamExample {json} Request-Example:
 * {
 *   "title": "Mr Bean",
 *   "genre": "Comedy",
 *   "rating": 7,
 *   "streamLink": "http://localhost:1234"
 * }
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "title": "Mr Bean",
 *   "genre": "Comedy",
 *   "rating": 7,
 *   "streamLink": "http://localhost:1234",
 *   "_id": "66892af13ca8c463b864a315"
 * }
 *
 * @apiError {Number} code Error code.
 * @apiError {String} message Error message.
 *
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 500 Internal Server Error
 * {
 *   "code": 1001,
 *   "message": "Unexpected Error: Something went wrong!"
 * }
 */
const addMovie = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Sanitize and validate movie parameters
        const newMovieParams = MoviesHelper.sanitizeAddMovieParams(req.body);
        // Add the new movie into the database
        const addedMovie = await MoviesHelper.addMovieIntoDb(newMovieParams);
        res.status(201).json(addedMovie);
    } catch (error) {
        console.log(error);
        next(error);
    }
};

/**
 * 
 * @author Dilpreet Singh
 * @api {get} /movie_lobby/movies/search?q= Search movies
 * @apiName SearchMovies
 * @apiGroup Movies
 *
 * @apiParam {String} q Search term (title or genre)
 *
 * @apiSuccess {Number} _id ID of the movie.
 * @apiSuccess {String} title Title of the movie.
 * @apiSuccess {String} genre Genre of the movie.
 * @apiSuccess {Number} rating Rating of the movie.
 * @apiSuccess {String} streamLink Streaming link of the movie.
 * 
 * @apiParamExample {json} Request-Example:
 * GET /movie_lobby/movies/search?q=Inte
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * [
 *   {
 *     "_id": "6689284d66c01b9afab203a4",
 *     "title": "Interstellar",
 *     "genre": "Sci-Fi",
 *     "rating": 10,
 *     "streamLink": "http://localhost:1234"
 *   }
 * ]
 *
 * @apiError {Number} code Error code.
 * @apiError {String} message Error message.
 *
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 400 Bad Request
 * {
 *   "code": 1010,
 *   "message": "No search query found!"
 * }
 *
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 500 Internal Server Error
 * {
 *   "code": 1001,
 *   "message": "Unexpected Error: Something went wrong!"
 * }
 */
const searchMovies = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
    try {
        // Sanitize and extract search query
        const query = MoviesHelper.sanitizeSearchMovieParams(req.query);

        const key = `movies_search_query${query}`;
        // Check if search results are cached
        const cachedMovies = CacheHelper.getValueFromKey(key);
        if (cachedMovies) {
            return res.status(200).json(cachedMovies);
        }

        // Perform database search based on the sanitized query
        const searchReg = new RegExp(query as string, 'i');
        const searchResults = await MoviesHelper.searchForMoviesInDb(searchReg);

        CacheHelper.setValueByKey(key, searchResults); // Cache the search results
        res.status(200).json(searchResults);
    } catch (error) {
        console.log(error);
        next(error);
    }
};

/**
 * 
 * @author Dilpreet Singh
 * @api {put} /movie_lobby/movies/:id Update a movie
 * @apiName UpdateMovie
 * @apiGroup Movies
 *
 * @apiParam {String} id ID of the movie. (Compulsory)
 * @apiParam {String} [title] Updated title of the movie.
 * @apiParam {String} [genre] Updated genre of the movie.
 * @apiParam {Number} [rating] Updated rating of the movie.
 * @apiParam {String} [streamLink] Updated streaming link of the movie.
 *
 * @apiSuccess {String} _id ID of the movie.
 * @apiSuccess {String} title Updated title of the movie.
 * @apiSuccess {String} genre Updated genre of the movie.
 * @apiSuccess {Number} rating Updated rating of the movie.
 * @apiSuccess {String} streamLink Updated streaming link of the movie.
 * 
 * @apiParamExample {json} Request-Example:
 * PUT /movie_lobby/movies/6689284d66c01b9afab203a4
 * {
 *   "genre": "Thriller",
 *   "title": "Interstellar"
 * }
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "_id": "6689284d66c01b9afab203a4",
 *   "title": "Interstellar",
 *   "genre": "Thriller",
 *   "rating": 10,
 *   "streamingLink": "http://localhost:1234"
 * }
 *
 * @apiError MOVIE_NOT_FOUND {String} Movie not found, can't update!
 * @apiError MOVIE_ID_MISSING {String} Movie ID is missing in request params!
 * @apiError MOVIE_ID_INVALID {String} Movie ID is invalid!
 *
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 404 Not Found
 * {
 *   "code": 1011,
 *   "message": "Movie not found, can't update!"
 * }
 *
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 400 Bad Request
 * {
 *   "code": 1012,
 *   "message": "Movie ID is missing in request params!"
 * }
 *
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 400 Bad Request
 * {
 *   "code": 1013,
 *   "message": "Movie ID is invalid!"
 * }
 */
const updateMovie = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Sanitize and validate update parameters
        const { id, movieWithRequestedChanges } = await MoviesHelper.sanitizeUpdateMovieParams(req.params, req.body);
        // Update the movie in the database
        const updatedMovie = await MoviesHelper.updateMovie(id, movieWithRequestedChanges);
        res.status(200).json(updatedMovie);
    } catch (error) {
        console.log(error);
        next(error);
    }
};

/**
 * 
 * @api {delete} /movie_lobby/movies/:id Delete a movie
 * @apiName DeleteMovie
 * @apiGroup Movies
 *
 * @apiParam {number} id Unique ID of the movie. (Compulsory)
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {}
 *
 * @apiError MOVIE_NOT_FOUND {String} Movie not found, can't delete!
 * @apiError MOVIE_ID_MISSING {String} Movie ID is missing in request params!
 * @apiError MOVIE_ID_INVALID {String} Movie ID is invalid!
 *
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 404 Not Found
 * {
 *   "code": 1011,
 *   "message": "Movie not found, can't delete!"
 * }
 *
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 400 Bad Request
 * {
 *   "code": 1012,
 *   "message": "Movie ID is missing in request params!"
 * }
 *
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 400 Bad Request
 * {
 *   "code": 1013,
 *   "message": "Movie ID is invalid!"
 * }
 */
const deleteMovie = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Sanitize and validate movie ID
        const id = await MoviesHelper.sanitizeMovieId(req.params);
        // Delete the movie from the database
        await MovieModel.findByIdAndDelete(id);
        res.status(204).end();
    } catch (error) {
        // Handle errors
        res.status(500).json({ error: 'Error occurred while deleting the movie.' });
    }
};

export {
    getMoviesList,
    addMovie,
    searchMovies,
    updateMovie,
    deleteMovie
};
