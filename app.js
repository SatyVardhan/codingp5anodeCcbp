const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqliteDriver = require("sqlite3");
const app = express();
app.use(express.json()); //it is middle ware
const dbPath = path.join(__dirname, "moviesData.db");
let db = null;
const initailiseServerAndDatabse = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqliteDriver.Database,
    });
    app.listen(3020, () => {
      console.log("server has started at http://localhost:3020/");
    });
  } catch (e) {
    console.log(`DATEBASE ERROR: ${e.message}`);
    process.exit(1);
  }
};
initailiseServerAndDatabse();

//  API 1 return list of all movie  names from the movie table

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT * FROM movie;`;
  const moviesListArray = await db.all(getMoviesQuery);
  const getMovieNameOnly = (mObject) => {
    return {
      movieName: mObject.movie_name,
    };
  };
  const moviesNameArray = moviesListArray.map((eachItem) =>
    getMovieNameOnly(eachItem)
  );
  response.send(moviesNameArray);
});

// API 2 create new movie in the movie table

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const createMovieQuery = `INSERT INTO
     movie 
     (director_id,movie_name,lead_actor) VALUES
     (${directorId},${movieName},${leadActor})`;
  const dbResponse = await db.run(createMovieQuery);
  response.send("Movie Successfully Added");
});

// API 3 get a movie based on its movieId

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieNameByMovieid = `SELECT * FROM movie WHERE
    movie_id = ${movieId};`;
  const movieArray = await db.get(getMovieNameByMovieid);
  response.send(movieArray);
});

// API 4  update movie details by movieid

app.put("/movies/:moviesId/", async (request, response) => {
  const movieDetails = request.body;
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateQuery = `UPDATE movie 
    SET director_id =${directorId},
    movie_name = ${movieName},lead_actor =${leadActor}
    WHERE movie_id = ${movieId};`;
  await db.run(updateQuery);
  response.send("Movie Details Updated");
});

// API 5 delete a movie by movie ID

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteQuery = `DELETE FROM 
    movie WHERE movie_id = ${movieId};`;
  await db.run(deleteQuery);
  response.send("Movie Removed");
});

// API 6 all directors from director table

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `SELECT * FROM director;`;
  const directorArray = await db.all(getDirectorsQuery);
  const convertDirectorsArray = (ob) => {
    return {
      directorID: ob.director_id,
      directorName: ob.director_name,
    };
  };
  response.send(
    directorArray.map((eachItem) => convertDirectorsArray(eachItem))
  );
});

// API 7 get all movies directed by a specified director

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMoviesList = `
    SELECT
     *
    FROM
     movie
    WHERE
      director_id = ${directorId};`;
  const booksArray = await db.all(getMoviesList);
  response.send(movieList);
});
