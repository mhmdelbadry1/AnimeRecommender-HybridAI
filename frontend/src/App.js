import React, { useState } from "react";
import axios from "axios";
import AnimeList from "./AnimeList";
import { XlviLoader } from "react-awesome-loaders";
import "./styles.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const App = () => {
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [userId, setUserId] = useState("");
  const [hybridWeight, setHybridWeight] = useState(0.5);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  console.log(typeof(recommendations))

  const handleSelectAnime = (anime) => {
    setSelectedAnime(anime);
    fetchRecommendations(anime); // Fetch recommendations directly when anime is selected
  };

  const fetchRecommendations = async (anime) => {
    setErrorMessage("");
    setLoading(true);

    if (!anime) {
      setErrorMessage("Please select an anime to get recommendations.");
      setLoading(false);
      return;
    }

    const parsedUserId = parseInt(userId, 10);
    if (isNaN(parsedUserId)) {
      setErrorMessage("Please enter a valid User ID.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post("http://localhost:5500/api/recommend", {
        user_id: parsedUserId,
        selected_anime_id: anime.anime_id,
        hybrid_weight: hybridWeight,
      });

      setRecommendations(response.data);
    } catch (error) {
      if (error.response) {
        setErrorMessage(
          error.response.data.error || "Error fetching recommendations. Please try again later."
        );
      } else if (error.request) {
        setErrorMessage("No response from server. Please try again later.");
      } else {
        setErrorMessage("Error: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <header>
        <img src="logo193.png"></img>
        <h4>Anime Recommendation System</h4>
      </header>

      <div className="input-container">
        <label htmlFor="user-id">Select User ID: </label>
        <input
          id="user-id"
          type="number"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Enter User ID"
        />
      </div>

      <div className="slider-container">
        <label htmlFor="hybrid-weight">
          Adjust Hybrid Weight ({hybridWeight}):{" "}
        </label>
        <input
          id="hybrid-weight"
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={hybridWeight}
          onChange={(e) => setHybridWeight(parseFloat(e.target.value))}
        />
      </div>

      <AnimeList
        onSelectAnime={handleSelectAnime}
        userId={userId}
        setErrorMessage={setErrorMessage}
      />

      {errorMessage && (
        <div className="error">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
            stroke="#d8000c"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M20.24 4.74a9.975 9.975 0 00-15.492 0 9.975 9.975 0 000 14.007 9.975 9.975 0 0015.492 0 9.975 9.975 0 000-14.007z"
            />
          </svg>
          {errorMessage}
        </div>
      )}

      {selectedAnime && (
        <div className="selected-anime-container">
          <div>
            <h3>Selected Anime: {selectedAnime.name}</h3>
            <img src={selectedAnime.image_url} alt={selectedAnime.name} />
          </div>
          {loading ? (
            <XlviLoader
              boxColors={["#EF4444", "#F59E0B", "#6366F1"]}
              desktopSize={"30px"}
              mobileSize={"15px"}
            />
          ) : (
            recommendations.length > 0 && (
              
              <div>
                <h3>Recommendations</h3>
                <div className="anime-list">
                  {recommendations.map((anime) => (
                    <div key={anime.anime_id} className="anime-card">
                      <img src={anime.image_url} alt={anime.name} />
                      <h3>{anime.name}</h3>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default App;
