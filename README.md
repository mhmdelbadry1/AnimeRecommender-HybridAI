

**AnimeRecommender-HybridAI**

This repository contains the development of a hybrid anime recommendation system that combines collaborative filtering and content-based filtering to provide personalized anime recommendations. The system processes 7 million user ratings and 12,000+ anime titles sourced from the MyAnimeList (MAL) Jikan API.

### Key Features:
- **Hybrid Recommendation System**: Merges collaborative filtering (user-based with cosine similarity) and content-based filtering (TF-IDF vectorization of genres and types) to deliver accurate recommendations.
- **Anime Data**: 12,000+ anime stored in MongoDB, with user preferences analyzed to recommend unseen anime.
- **User Ratings**: Integrated 7 million rows of user ratings to test the system's effectiveness.
- **Dynamic Frontend**: Built using React with infinite scroll, smooth anime sliders, and a clean user interface.
- **API Backend**: Flask API used to handle recommendation logic and data fetching between the front and backend.
- **Customizable Weighting**: The system allows for adjustable weighting between collaborative and content-based filtering. Setting the weight to 0 relies entirely on content-based filtering, while increasing the weight balances both methods.

### Technologies:
- MERN stack (MongoDB, Express, React, Node.js)
- Flask (for backend recommendation API)
- Sklearn (for machine learning models)
- TF-IDF for content-based filtering
- Cosine similarity for collaborative filtering
- Axios for handling HTTP requests

Feel free to explore the code, and any contributions or feedback are welcome!

