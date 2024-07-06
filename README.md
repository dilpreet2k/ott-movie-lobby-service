# OTT Movie Lobby Service

This Microservice provides endpoints to manage a collection of movies for an OTT application's lobby. It allows users to list, search, add, update, and delete movies.

## Prerequisites

Ensure the following software is installed on your machine:

- [Node.js v18 or above](https://nodejs.org/) (includes NPM)
- [MongoDB](https://www.mongodb.com/) with Database 'movie_lobby'

## Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/dilpreet2k/ott-movie-lobby-service.git
   cd ott-movie-lobby-service
2. **Install dependencies:**
   ```
   npm install
4. Set up environment variables:
   Change .env file in the root directory if required, exmaple is as following:
   ```
   PORT=3001
   JWT_SECRET=DEFAULT
   MONGO_URL=mongodb://127.0.0.1:27017/
   DB_NAME=movie_lobby
6. Run the API:
   ```
   npm start
8. Test
    ```
   npm test
10. Import Postmen JSON named ott_movie_lobby_service.postman_collection.json directly into Postman, it has all APIs setted up to call, or you can check [API documentation](https://dilpreet2k.github.io/) too.

## API Documentation
Click following link to access API Documentation:
- [API Doc](https://dilpreet2k.github.io/)

> **Note:**
>
> Before using Movie Lobby CRUD operation APIs, please:
> 1. Create a user account from [Create a new user](https://dilpreet2k.github.io/#api-User-CreateNewUser) APIs.
> 2. And by using [login API](https://dilpreet2k.github.io/#api-User-Login), get a bearer token generated as a response, which you would be using in CRUD APIs
> 3. Also: Please keep param ```isAdmin: true``` while creating your user account, if you wish to access following APIs:  
>   a) [Add Movie](https://dilpreet2k.github.io/#api-Movies-Add_a_movie)  
>   b) [Delete Movie](https://dilpreet2k.github.io/#api-Movies-DeleteMovie)  
>   c) [Update Movie](https://dilpreet2k.github.io/#api-Movies-UpdateMovie)  
> 4. Following APIs don't require Admin roles  
>   a) [Create New User](https://dilpreet2k.github.io/#api-User-CreateNewUser)  
>   b) [Login](https://dilpreet2k.github.io/#api-User-Login)  
>   c) [Get Movies List](https://dilpreet2k.github.io/#api-Movies-Get_Movie_List)  
>   d) [Search Movies](https://dilpreet2k.github.io/#api-Movies-SearchMovies)  
> 


## Testing

Unit and integration tests are being implemented by Jest.
You can run them using:
   ```
   npm test
```

## Code Quality

ESLint is used to enforce coding style and ensure maintainability.

## Caching

Caching is done using node-cache.

## Tech-Stack

- **Backend:** TypeScript, Node.js (ExpressJS) & Mongoose
- **Database:** MongoDB
- **Testing:** Jest
- **Code Quality Checker:** ESLint
