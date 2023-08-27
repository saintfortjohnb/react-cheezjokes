import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Joke from "./Joke";
import "./JokeList.css";

const JokeList = ({ numJokesToGet = 5 }) => {
  const [jokes, setJokes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const getJokes = useCallback(async () => {
    try {
      let jokesArray = [];
      let seenJokes = new Set();

      while (jokesArray.length < numJokesToGet) {
        let res = await axios.get("https://icanhazdadjoke.com", {
          headers: { Accept: "application/json" }
        });
        let joke = res.data;

        if (!seenJokes.has(joke.id)) {
          seenJokes.add(joke.id);
          jokesArray.push({ ...joke, votes: 0 });
        } else {
          console.log("duplicate found!");
        }
      }

      setJokes(jokesArray);
      localStorage.setItem('jokes', JSON.stringify(jokesArray));
      setIsLoading(false);
    } catch (err) {
      console.error(err);
    }
  }, [numJokesToGet]);

  useEffect(() => {
    const savedJokes = JSON.parse(localStorage.getItem('jokes'));
    if (savedJokes) {
      setJokes(savedJokes);
      setIsLoading(false);
    } else {
      getJokes();
    }
  }, [getJokes]);

  const generateNewJokes = () => {
    setIsLoading(true);
    getJokes();
  };

  const vote = (id, delta) => {
    const updatedJokes = jokes.map(j =>
      j.id === id ? { ...j, votes: j.votes + delta } : j
    );
    setJokes(updatedJokes);
    localStorage.setItem('jokes', JSON.stringify(updatedJokes));
  };

  const resetVotes = () => {
    const resetJokes = jokes.map(j => ({ ...j, votes: 0 }));
    setJokes(resetJokes);
    localStorage.removeItem('jokes');
  };

  let sortedJokes = [...jokes].sort((a, b) => b.votes - a.votes);
  return isLoading ? (
    <div className="loading">
      <i className="fas fa-4x fa-spinner fa-spin" />
    </div>
  ) : (
    <div className="JokeList">
      <button className="JokeList-getmore" onClick={generateNewJokes}>
        Get New Jokes
      </button>
      <button className="JokeList-reset" onClick={resetVotes}>
        Reset Votes
      </button>
      {sortedJokes.map(j => (
        <Joke text={j.joke} key={j.id} id={j.id} votes={j.votes} vote={vote} />
      ))}
    </div>
  );
};

export default JokeList;
