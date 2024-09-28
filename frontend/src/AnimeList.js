import React, { useState, useEffect } from 'react';
import Slider from "react-slick";
import axios from 'axios';
import './styles.css';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

const AnimeList = ({ onSelectAnime, userId, setErrorMessage }) => {
  const [animeList, setAnimeList] = useState([]);
  const [page, setPage] = useState(1);
  const [selectedAnimeId, setSelectedAnimeId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  // Debounce the search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    
    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Fetch anime list based on debounced search term
  useEffect(() => {
    if (debouncedSearchTerm) {
      // If there is a search term, reset the page to 1 and fetch the results
      setPage(1);
      fetchAnimeBySearch(debouncedSearchTerm, 1);
    } else {
      // If no search term, fetch all anime based on the current page
      fetchAllAnime(page);
    }
  }, [debouncedSearchTerm]);

  const fetchAllAnime = async (currentPage) => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5500/api/anime', {
        params: { page: currentPage },
      });

      // Only update the anime list if the current page is 1, else append
      if (currentPage === 1) {
        setAnimeList(response.data.animeList); // Reset the list on the first page
      } else {
        setAnimeList((prevList) => [
          ...prevList,
          ...response.data.animeList,
        ]);
      }
    } catch (error) {
      setErrorMessage('Error fetching anime list. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchAnimeBySearch = async (searchTerm, currentPage) => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5500/api/anime/search', {
        params: {
          q: searchTerm,
          page: currentPage,
        },
      });
      // If it's the first page of a search, reset the list
      if (currentPage === 1) {
        setAnimeList(response.data.animeList);
      } else {
        // Otherwise, append new results
        setAnimeList((prevList) => [
          ...prevList,
          ...response.data.animeList,
        ]);
      }
    } catch (error) {
      setErrorMessage('Error fetching anime list. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 2,
    arrows: true,
    afterChange: (currentSlide) => {
      // Check if we're close to the end of the current animeList
      if (currentSlide >= animeList.length - 5 && !loading && animeList.length > 0) {
        console.log("Fetching more anime...");
        if (debouncedSearchTerm) {
          // If searching, fetch the next page of the current search results
          fetchAnimeBySearch(debouncedSearchTerm, page + 1);
        } else {
          // If not searching, fetch the next page of all anime
          setPage((prevPage) => prevPage + 1);
          fetchAllAnime(page + 1);
        }
      }
    },
  };

  const handleCardClick = (anime) => {
    if (!userId) {
      setErrorMessage('Please select a user.');
      return;
    }
    setSelectedAnimeId(anime.anime_id);
    onSelectAnime(anime);
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
  
    if (value.trim() === "") {
      setAnimeList([]); // Clear previous results
      setPage(1); // Reset to the first page
    } else {

      setAnimeList([])
      setPage(1); // Reset page to 1 when searching
    }
  };

  return (
    <div className="container">
      {/* Search bar */}
      <div className="search-bar">
        <input
          type="text"
          value={searchTerm}
          placeholder="Search anime by name or genre..."
          onChange={handleSearch}
          className="search-input"
        />
      </div>

      {/* Anime Slider */}
      {animeList.length > 0 ? (
        <Slider {...settings}>
          {animeList.map((anime) => (
            <div 
              key={anime.anime_id} 
              className={`anime-card ${selectedAnimeId === anime.anime_id ? 'selected' : ''}`}
              onClick={() => handleCardClick(anime)}
            >
              <img src={anime.image_url} alt={anime.name} />
              <h3>{anime.name}</h3>
            </div>
          ))}
        </Slider>
      ) : (
        !loading && (
          <div className="not-found-card">
            <div className="anime-card">
              <img className="not-found" src="not_found.png" alt="Not Found" />
              <h3>No Anime Found</h3>
              <p>Try searching for something else!</p>
            </div>
          </div>
        )
      )}
      
      {/* Loading Spinner */}
      {loading && (
        <div className="loading-container">
          <div className="loading-text">
            <span>L</span>
            <span>O</span>
            <span>A</span>
            <span>D</span>
            <span>I</span>
            <span>N</span>
            <span>G</span>
          </div>
        </div>
      )}

      {/* Social Links */}
      <div className="socials">
        <a className="social-link" href="https://twitter.com/aybukeceylan" target="_top">
          {/* SVG code here */}
        </a>
        <a className="social-link" href="https://www.linkedin.com/in/ayb%C3%BCkeceylan/" target="_top">
          {/* SVG code here */}
        </a>
      </div>
    </div>
  );
};

export default AnimeList;
