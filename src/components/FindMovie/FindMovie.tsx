import React, { useState } from 'react';
import './FindMovie.scss';
import { getMovie } from '../../api';
import { MovieData } from '../../types/MovieData';
import { ResponseError } from '../../types/ReponseError';
import { Movie } from '../../types/Movie';
import { MovieCard } from '../MovieCard';

export const FindMovie: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [previewMovie, setPreviewMovie] = useState<Movie | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);

  const normalizeMovie = (data: MovieData): Movie => {
    return {
      imdbId: data.imdbID,
      title: data.Title,
      description: data.Plot,
      imdbUrl: `https://www.imdb.com/title/${data.imdbID}/`,
      imgUrl:
        data.Poster === 'N/A'
          ? 'https://via.placeholder.com/360x270.png?text=no%20preview'
          : data.Poster,
    };
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoading(true);
    getMovie(query)
      .then((result: MovieData | ResponseError) => {
        if ('Response' in result && result.Response === 'False') {
          setErrorMessage('There is not such a movie title');
        } else {
          const normalized = normalizeMovie(result as MovieData);

          setPreviewMovie(normalized);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleAdd = () => {
    if (!previewMovie) {
      return;
    }

    const alreadyInList = movies.some(
      movie => movie.imdbId === previewMovie.imdbId,
    );

    if (!alreadyInList) {
      setMovies(prev => [...prev, previewMovie]);
    }

    setQuery('');
    setPreviewMovie(null);
  };

  return (
    <>
      <form className="find-movie" onSubmit={submit}>
        <div className="field">
          <label className="label" htmlFor="movie-title">
            Movie title
          </label>

          <div className="control">
            <input
              data-cy="titleField"
              type="text"
              id="movie-title"
              value={query}
              onChange={e => {
                setQuery(e.target.value);
                setErrorMessage('');
              }}
              placeholder="Enter a title to search"
              className={`input ${errorMessage ? 'is-danger' : ''}`}
            />
          </div>

          {errorMessage && (
            <p className="help is-danger" data-cy="errorMessage">
              Can&apos;t find a movie with such a title
            </p>
          )}
        </div>

        <div className="field is-grouped">
          <div className="control">
            <button
              data-cy="searchButton"
              type="submit"
              disabled={query === ''}
              className={`button is-light${loading ? 'is-loading' : ''}`}
            >
              Find a movie
            </button>
          </div>
          {previewMovie && (
            <div className="control">
              <button
                data-cy="addButton"
                type="button"
                className="button is-primary"
                onClick={handleAdd}
              >
                Add to the list
              </button>
            </div>
          )}
        </div>
      </form>

      <div className="container" data-cy="previewContainer">
        <h2 className="title">Preview</h2>
        {previewMovie && <MovieCard movie={previewMovie} />}
      </div>
    </>
  );
};
