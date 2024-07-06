import { Router, Request, Response, NextFunction } from 'express';

import { isAdmin } from '../middlewares/authHandler';
import { getMoviesList, addMovie, deleteMovie, searchMovies, updateMovie } from '../controllers/movies';
import { createNewUser, login } from '../controllers/users';

const router = Router();

/* --- Public URLs --- */

/**
 * Route: POST /users
 * Description: Create a new user
 */
router.post('/users', (req: Request, res: Response, next: NextFunction) => {
    createNewUser(req, res, next);
});

/**
 * Route: POST /users/login
 * Description: User login
 */
router.post('/users/login', (req: Request, res: Response, next: NextFunction) => {
    login(req, res, next);
});


/* --- Assignment work starts here --- */
/* --- Authenticated URLs --- */

/**
 * 1. List all the movies in the lobby
 * Info:
 *  Route: GET /movies
 *  Description: List all the movies in the lobby
 *  Notes: Requires authentication
 */
router.get('/movies', (req: Request, res: Response, next: NextFunction) => {
    getMoviesList(req, res, next);
});

/**
 * 2. Search for a movie by title or genre
 * Info:
 *  Route: GET /movies/search
 *  Description: Search for a movie by title or genre
 *  Notes: Requires authentication
 */
router.get('/movies/search', (req: Request, res: Response, next: NextFunction) => {
    searchMovies(req, res, next);
});

/**
 * 3. Add a new movie to the lobby
 * Info:
 *  Route: POST /movies
 *  Description: Add a new movie to the lobby (requires "admin" role)
 *  Notes: Requires authentication and admin role
 */
router.post('/movies', isAdmin, (req: Request, res: Response, next: NextFunction) => {
    addMovie(req, res, next);
});

/**
 * 4. Update an existing movie information (title, genre, rating, or streaming link)
 * Info:
 *  Route: PUT /movies/:id
 *  Description: Update an existing movie information (title, genre, rating, or streaming link)
 *  Notes: Requires authentication and admin role
 */
router.put('/movies/:id', isAdmin, (req: Request, res: Response, next: NextFunction) => {
    updateMovie(req, res, next);
});

/**
 * 5. Delete a movie from the lobby
 * Info:
 *  Route: DELETE /movies/:id
 *  Description: Delete a movie from the lobby
 *  Notes: Requires authentication and admin role
 */
router.delete('/movies/:id', isAdmin, (req: Request, res: Response, next: NextFunction) => {
    deleteMovie(req, res, next);
});

export default router;
