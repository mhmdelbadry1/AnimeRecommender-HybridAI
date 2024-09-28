const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const request = require('request');

const app = express();
const PORT = 5500;

app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/animeDB', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB', err));

const animeSchema = new mongoose.Schema({
  name: String,
  anime_id: Number,
  image_url: String,
  genres: [String],
});

const Anime = mongoose.model('Anime', animeSchema);

// Fetch paginated anime list
app.get('/api/anime', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
  
    try {
      const animeList = await Anime.find().skip(skip).limit(limit);
      const totalAnimes = await Anime.countDocuments();
      console.log(animeList)
  
      res.status(200).json({
        animeList,
        total: totalAnimes,
        page,
        totalPages: Math.ceil(totalAnimes / limit)
      });
    } catch (err) {
      res.status(500).json({ error: 'Error fetching anime list' });
    }
});

// Fetch paginated anime list with optional search
app.get('/api/anime/search', async (req, res) => {
  setTimeout(async ()=>{


    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    const searchText = req.query.q || ''; // Optional search query
  
    try {
      const query = {
        $or: [
          { name: { $regex: searchText, $options: 'i' } }, // Search in 'name'
          { genres: { $in: [new RegExp(searchText, 'i')] } } // Search in 'genres' array
        ]
      };
  
      const animeList = await Anime.find(query).skip(skip).limit(limit);
      const totalAnimes = await Anime.countDocuments(query); // Count for pagination
  
      res.status(200).json({
        animeList,
        total: totalAnimes,
        page,
        totalPages: Math.ceil(totalAnimes / limit)
      });
    } catch (err) {
      res.status(500).json({ error: 'Error fetching anime list' });
    }
  } , 3000)
});

// Recommend anime based on selected anime ID
app.post('/api/recommend', async (req, res) => {
  const { user_id, selected_anime_id, hybrid_weight } = req.body;

  const parsedUserId = parseInt(user_id, 10);
  if (isNaN(parsedUserId)) {
    return res.status(400).json({ error: 'Invalid User ID. Please provide a valid integer.' });
  }

  try {
    request.post('http://192.168.1.8:6001/api/recommend', {
      json: { user_id: parsedUserId, selected_anime_id, hybrid_weight },
    }, async (error, response, body) => {
      if (error) {
        return res.status(500).json({ error: 'Error fetching recommendations from Flask API' });
      }
  
      if (response.statusCode === 200) {
        console.log("API response body:", body);
  
        const recommendations = body.recommendations || body; // Adjust based on structure
        if (!Array.isArray(recommendations)) {
          return res.status(500).json({ error: 'Recommendations are not an array' });
        }
  
        const recommendedAnimeIds = recommendations.map(anime => anime.anime_id);
        const recommendedAnimes = await Anime.find({ anime_id: { $in: recommendedAnimeIds } });
  
        console.log("Recommendations:", recommendedAnimes);
  
        res.status(200).json(recommendedAnimes );
      } else {
        res.status(response.statusCode).json({ error: 'Error fetching recommendations' });
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching recommendations' });
  }
});  

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
