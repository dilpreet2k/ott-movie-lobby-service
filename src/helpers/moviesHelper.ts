import MovieModel from "../models/movies";
const { Types } = require('mongoose');

interface MovieParams {
    page?: number;
    limit?: number;
    title?: string;
    genre?: string;
    rating?: number;
    streamingLink?: string;
}

interface SanitizedMovieParams {
    page: number;
    limit: number;
    key: string;
}

interface AddMovieParams {
    title: string;
    genre: string;
    rating: number;
    streamingLink: string;
}

const MoviesHelper = {
    /**
     * Sanitize and extract pagination parameters for listing movies.
     * @param params MovieParams object containing query parameters.
     * @returns SanitizedMovieParams object with page, limit, and cache key.
     */
    sanitizeListMovieParams: (params: MovieParams): SanitizedMovieParams => {
        const { page = 1, limit = 5 } = params;
        const key = `movies_list_page${page}_limit${limit}`;
        return { page, limit, key };
    },

    /**
     * Retrieve movies from the database.
     * @param page Page number for pagination.
     * @param limit Limit number of movies per page.
     * @returns Promise resolving to an array of movies.
     */
    getMoviesFromDb: async (page: number, limit: number): Promise<any> => {
        const pageAsInt = parseInt(page.toString());
        const limitAsInt = parseInt(limit.toString());
        return MovieModel.find()
            .skip((pageAsInt - 1) * limitAsInt)
            .limit(limitAsInt);
    },

    /**
     * Sanitize and validate parameters for adding a new movie.
     * @param params MovieParams object containing movie details.
     * @returns AddMovieParams object with validated movie details.
     * @throws Error if required parameters are missing.
     */
    sanitizeAddMovieParams: (params: MovieParams): AddMovieParams => {
        const { title, genre, rating, streamingLink } = params;
        if (!title || !genre || !rating || !streamingLink) {
            throw new Error('INVALID_REQ_PARAMS');
        }
        return { title, genre, rating, streamingLink };
    },

    /**
     * Add a new movie into the database.
     * @param newMovieParams AddMovieParams object containing movie details.
     * @returns Promise resolving to the added movie object.
     */
    addMovieIntoDb: async (newMovieParams: AddMovieParams): Promise<any> => {
        const newMovie = new MovieModel(newMovieParams);
        return newMovie.save();
    },

    /**
     * Sanitize and extract search query parameters.
     * @param params Object containing search query parameters.
     * @returns Sanitized search query string.
     * @throws Error if search query is missing.
     */
    sanitizeSearchMovieParams: (params: any): string => {
        const { q } = params;
        if (!q) {
            throw new Error('NO_SEARCH_QUERY_FOUND');
        }
        return q;
    },

    /**
     * Search for movies in the database based on search criteria.
     * @param searchReg Regular expression object for searching.
     * @returns Promise resolving to an array of matched movies.
     */
    searchForMoviesInDb: async (searchReg: RegExp): Promise<any> => {
        const conditions = {
            $or: [
                { title: searchReg },
                { genre: searchReg }
            ],
        };

        return MovieModel.find(conditions);
    },

    /**
     * Sanitize and validate parameters for updating a movie.
     * @param params Object containing URL parameters.
     * @param body Object containing request body parameters.
     * @returns Object with sanitized movie ID and requested changes.
     */
    sanitizeUpdateMovieParams: async (params: any, body: any): Promise<any> => {
        const id = await MoviesHelper.sanitizeMovieId(params);
        const { title, genre, rating, streamingLink } = body;
        const movieWithRequestedChanges: any = {
            ...(typeof title !== 'undefined' && { title }),
            ...(typeof genre !== 'undefined' && { genre }),
            ...(typeof rating !== 'undefined' && { rating }),
            ...(typeof streamingLink !== 'undefined' && { streamingLink }),
        };

        return { id, movieWithRequestedChanges };
    },

    /**
     * Sanitize and validate movie ID.
     * @param params Object containing URL parameters.
     * @returns Validated movie ID.
     * @throws Error if movie ID is missing, invalid, or not found.
     */
    sanitizeMovieId: async (params: any): Promise<any> => {
        const { id } = params;
        if (!id) {
            throw new Error('MOVIE_ID_MISSING');
        }

        if (!await Types.ObjectId.isValid(id)) {
            throw new Error('MOVIE_ID_INVALID');
        }

        const doesMovieExist = await MovieModel.findOne({ _id: id });
        console.log(doesMovieExist);
        if (!doesMovieExist) {
            throw new Error('MOVIE_NOT_FOUND');
        }

        return id;
    },

    /**
     * Update movie details in the database.
     * @param id Movie ID to update.
     * @param changes Object containing updated movie details.
     * @returns Promise resolving to the updated movie object.
     */
    updateMovie: async (id: any, changes: any): Promise<any> => {
        return MovieModel.findByIdAndUpdate(
            id,
            changes,
            { new: true }
        );
    },
};

export {
    MoviesHelper,
};
