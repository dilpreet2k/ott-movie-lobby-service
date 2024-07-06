import { Request, Response, NextFunction } from 'express';
import { getMoviesList, addMovie, searchMovies, updateMovie, deleteMovie } from '../src/controllers/movies';
import { MoviesHelper } from '../src/helpers/moviesHelper';
import { CacheHelper } from '../src/helpers/cacheHelper';
import MovieModel, { IMovie } from '../src/models/movies';

jest.mock('../src/helpers/moviesHelper');
jest.mock('../src/helpers/cacheHelper');
jest.mock('../src/models/movies', () => ({
    __esModule: true,
    default: {
        findByIdAndDelete: jest.fn(),
    },
}));

describe('Movies Controller', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: jest.MockedFunction<NextFunction>;

    beforeEach(() => {
        mockRequest = {};
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            end: jest.fn().mockReturnThis()
        };
        mockNext = jest.fn();
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('getMoviesList', () => {
        it('should get movies list from database and cache if not already cached', async () => {
            const mockedMoviesList: any[] = [{ id: 1, title: 'Movie A', genre: 'Action', rating: 8.5, streamingLink: 'http://example.com/movieA' }];
            const sanitizedParams = { page: 1, limit: 10, key: 'someKey' };
            (MoviesHelper.sanitizeListMovieParams as jest.MockedFunction<typeof MoviesHelper.sanitizeListMovieParams>).mockReturnValue(sanitizedParams);
            (CacheHelper.getValueFromKey as jest.MockedFunction<typeof CacheHelper.getValueFromKey>).mockReturnValue(null);
            (MoviesHelper.getMoviesFromDb as jest.MockedFunction<typeof MoviesHelper.getMoviesFromDb>).mockResolvedValue(mockedMoviesList);

            await getMoviesList(mockRequest as Request, mockResponse as Response, mockNext);

            expect(MoviesHelper.sanitizeListMovieParams).toHaveBeenCalledWith(mockRequest.query);
            expect(CacheHelper.getValueFromKey).toHaveBeenCalledWith(sanitizedParams.key);
            expect(MoviesHelper.getMoviesFromDb).toHaveBeenCalledWith(sanitizedParams.page, sanitizedParams.limit);
            expect(CacheHelper.setValueByKey).toHaveBeenCalledWith(sanitizedParams.key, mockedMoviesList);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(mockedMoviesList);
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should return cached movies list if available', async () => {
            const mockedCachedMovies: any[] = [{ id: 1, title: 'Cached Movie', genre: 'Drama', rating: 7.8, streamingLink: 'http://example.com/cachedmovie' }];
            const sanitizedParams = { page: 1, limit: 10, key: 'someKey' };
            (MoviesHelper.sanitizeListMovieParams as jest.MockedFunction<typeof MoviesHelper.sanitizeListMovieParams>).mockReturnValue(sanitizedParams);
            (CacheHelper.getValueFromKey as jest.MockedFunction<typeof CacheHelper.getValueFromKey>).mockReturnValue(mockedCachedMovies);

            await getMoviesList(mockRequest as Request, mockResponse as Response, mockNext);

            expect(MoviesHelper.sanitizeListMovieParams).toHaveBeenCalledWith(mockRequest.query);
            expect(CacheHelper.getValueFromKey).toHaveBeenCalledWith(sanitizedParams.key);
            expect(MoviesHelper.getMoviesFromDb).not.toHaveBeenCalled();
            expect(CacheHelper.setValueByKey).not.toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(mockedCachedMovies);
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should handle error and call next middleware', async () => {
            const error = new Error('Database error');
            (MoviesHelper.sanitizeListMovieParams as jest.MockedFunction<typeof MoviesHelper.sanitizeListMovieParams>).mockImplementation(() => { throw error; });

            await getMoviesList(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockResponse.status).not.toHaveBeenCalled();
            expect(mockResponse.json).not.toHaveBeenCalled();
            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });

    describe('addMovie', () => {
        it('should add a new movie to the database', async () => {
            const mockRequestBody = { title: 'New Movie', genre: 'Comedy', rating: 7.5, streamingLink: 'http://example.com/newmovie' };
            (MoviesHelper.sanitizeAddMovieParams as jest.MockedFunction<typeof MoviesHelper.sanitizeAddMovieParams>).mockReturnValue(mockRequestBody);
            const mockAddedMovie = { id: 2, ...mockRequestBody };
            (MoviesHelper.addMovieIntoDb as jest.MockedFunction<typeof MoviesHelper.addMovieIntoDb>).mockResolvedValue(mockAddedMovie);

            mockRequest.body = mockRequestBody;
            await addMovie(mockRequest as Request, mockResponse as Response, mockNext);

            expect(MoviesHelper.sanitizeAddMovieParams).toHaveBeenCalledWith(mockRequest.body);
            expect(MoviesHelper.addMovieIntoDb).toHaveBeenCalledWith(mockRequestBody);
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith(mockAddedMovie);
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should handle error and call next middleware', async () => {
            const mockRequestBody = { title: 'New Movie', genre: 'Comedy', rating: 7.5, streamingLink: 'http://example.com/newmovie' };
            (MoviesHelper.sanitizeAddMovieParams as jest.MockedFunction<typeof MoviesHelper.sanitizeAddMovieParams>).mockReturnValue(mockRequestBody);
            const error = new Error('Database error');
            (MoviesHelper.addMovieIntoDb as jest.MockedFunction<typeof MoviesHelper.addMovieIntoDb>).mockImplementation(() => { throw error; });

            mockRequest.body = mockRequestBody;
            await addMovie(mockRequest as Request, mockResponse as Response, mockNext);

            expect(MoviesHelper.sanitizeAddMovieParams).toHaveBeenCalledWith(mockRequest.body);
            expect(MoviesHelper.addMovieIntoDb).toHaveBeenCalledWith(mockRequestBody);
            expect(mockResponse.status).not.toHaveBeenCalled();
            expect(mockResponse.json).not.toHaveBeenCalled();
            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });

    describe('searchMovies', () => {
        it('should search movies in database and cache if not already cached', async () => {
            const mockQuery = { q: 'Action' };
            const sanitizedQuery = 'Action';
            (MoviesHelper.sanitizeSearchMovieParams as jest.MockedFunction<typeof MoviesHelper.sanitizeSearchMovieParams>).mockReturnValue(sanitizedQuery);
            const mockedSearchResults: any[] = [{ id: 1, title: 'Movie A', genre: 'Action', rating: 8.5, streamingLink: 'http://example.com/movieA' }];
            const key = `movies_search_query${sanitizedQuery}`;
            (CacheHelper.getValueFromKey as jest.MockedFunction<typeof CacheHelper.getValueFromKey>).mockReturnValue(null);
            (MoviesHelper.searchForMoviesInDb as jest.MockedFunction<typeof MoviesHelper.searchForMoviesInDb>).mockResolvedValue(mockedSearchResults);

            await searchMovies(mockRequest as Request, mockResponse as Response, mockNext);

            expect(MoviesHelper.sanitizeSearchMovieParams).toHaveBeenCalledWith(mockRequest.query);
            expect(CacheHelper.getValueFromKey).toHaveBeenCalledWith(key);
            expect(MoviesHelper.searchForMoviesInDb).toHaveBeenCalledWith(new RegExp(sanitizedQuery, 'i'));
            expect(CacheHelper.setValueByKey).toHaveBeenCalledWith(key, mockedSearchResults);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(mockedSearchResults);
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should return cached search results if available', async () => {
            const mockQuery = { q: 'Action' };
            const sanitizedQuery = 'Action';
            (MoviesHelper.sanitizeSearchMovieParams as jest.MockedFunction<typeof MoviesHelper.sanitizeSearchMovieParams>).mockReturnValue(sanitizedQuery);
            const mockedCachedResults: any[] = [{ id: 1, title: 'Cached Movie', genre: 'Action', rating: 8.0, streamingLink: 'http://example.com/cachedmovie' }];
            const key = `movies_search_query${sanitizedQuery}`;
            (CacheHelper.getValueFromKey as jest.MockedFunction<typeof CacheHelper.getValueFromKey>).mockReturnValue(mockedCachedResults);

            await searchMovies(mockRequest as Request, mockResponse as Response, mockNext);

            expect(MoviesHelper.sanitizeSearchMovieParams).toHaveBeenCalledWith(mockRequest.query);
            expect(CacheHelper.getValueFromKey).toHaveBeenCalledWith(key);
            expect(MoviesHelper.searchForMoviesInDb).not.toHaveBeenCalled();
            expect(CacheHelper.setValueByKey).not.toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(mockedCachedResults);
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should handle error and call next middleware', async () => {
            const mockQuery = { q: 'Action' };
            const sanitizedQuery = 'Action';
            (MoviesHelper.sanitizeSearchMovieParams as jest.MockedFunction<typeof MoviesHelper.sanitizeSearchMovieParams>).mockReturnValue(sanitizedQuery);
            const error = new Error('Database error');
            (MoviesHelper.searchForMoviesInDb as jest.MockedFunction<typeof MoviesHelper.searchForMoviesInDb>).mockImplementation(() => { throw error; });

            await searchMovies(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockResponse.status).not.toHaveBeenCalled();
            expect(mockResponse.json).not.toHaveBeenCalled();
            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });

    describe('updateMovie', () => {
        it('should update a movie in the database', async () => {
            const mockParams = { id: '1' };
            const mockRequestBody = { title: 'Updated Movie', genre: 'Action', rating: 9.0, streamingLink: 'http://example.com/updatedmovie' };
            (MoviesHelper.sanitizeUpdateMovieParams as jest.MockedFunction<typeof MoviesHelper.sanitizeUpdateMovieParams>).mockResolvedValue({ id: mockParams.id, movieWithRequestedChanges: mockRequestBody });
            const mockUpdatedMovie = { id: mockParams.id, ...mockRequestBody };
            (MoviesHelper.updateMovie as jest.MockedFunction<typeof MoviesHelper.updateMovie>).mockResolvedValue(mockUpdatedMovie);

            mockRequest.params = mockParams;
            mockRequest.body = mockRequestBody;
            await updateMovie(mockRequest as Request, mockResponse as Response, mockNext);

            expect(MoviesHelper.sanitizeUpdateMovieParams).toHaveBeenCalledWith(mockParams, mockRequestBody);
            expect(MoviesHelper.updateMovie).toHaveBeenCalledWith(mockParams.id, mockRequestBody);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(mockUpdatedMovie);
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should handle error and call next middleware', async () => {
            const mockParams = { id: '1' };
            const mockRequestBody = { title: 'Updated Movie', genre: 'Action', rating: 9.0, streamingLink: 'http://example.com/updatedmovie' };
            (MoviesHelper.sanitizeUpdateMovieParams as jest.MockedFunction<typeof MoviesHelper.sanitizeUpdateMovieParams>).mockResolvedValue({ id: mockParams.id, movieWithRequestedChanges: mockRequestBody });
            const error = new Error('Database error');
            (MoviesHelper.updateMovie as jest.MockedFunction<typeof MoviesHelper.updateMovie>).mockImplementation(() => { throw error; });

            mockRequest.params = mockParams;
            mockRequest.body = mockRequestBody;
            await updateMovie(mockRequest as Request, mockResponse as Response, mockNext);

            expect(MoviesHelper.sanitizeUpdateMovieParams).toHaveBeenCalledWith(mockParams, mockRequestBody);
            expect(MoviesHelper.updateMovie).toHaveBeenCalledWith(mockParams.id, mockRequestBody);
            expect(mockResponse.status).not.toHaveBeenCalled();
            expect(mockResponse.json).not.toHaveBeenCalled();
            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });


    describe('deleteMovie', () => {
        it('should delete a movie from the database', async () => {
            const mockParams = { id: '1' };
            (MoviesHelper.sanitizeMovieId as jest.MockedFunction<typeof MoviesHelper.sanitizeMovieId>).mockResolvedValue(mockParams.id);
            (MovieModel.findByIdAndDelete as jest.MockedFunction<typeof MovieModel.findByIdAndDelete>).mockResolvedValue({});

            mockRequest.params = mockParams;
            await deleteMovie(mockRequest as Request, mockResponse as Response, mockNext);

            expect(MoviesHelper.sanitizeMovieId).toHaveBeenCalledWith(mockParams);
            expect(MovieModel.findByIdAndDelete).toHaveBeenCalledWith(mockParams.id);
            expect(mockResponse.status).toHaveBeenCalledWith(204);
            expect(mockResponse.end).toHaveBeenCalled();
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should handle error during deletion and respond with 500 status', async () => {
            const mockParams = { id: '1' };
            const error = new Error('Database error');
            (MoviesHelper.sanitizeMovieId as jest.MockedFunction<typeof MoviesHelper.sanitizeMovieId>).mockResolvedValue(mockParams.id);
            (MovieModel.findByIdAndDelete as jest.MockedFunction<typeof MovieModel.findByIdAndDelete>).mockRejectedValue(error);

            mockRequest.params = mockParams;
            await deleteMovie(mockRequest as Request, mockResponse as Response, mockNext);

            expect(MoviesHelper.sanitizeMovieId).toHaveBeenCalledWith(mockParams);
            expect(MovieModel.findByIdAndDelete).toHaveBeenCalledWith(mockParams.id);
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Error occurred while deleting the movie.' });
            expect(mockNext).not.toHaveBeenCalled();
        });
    });
});
