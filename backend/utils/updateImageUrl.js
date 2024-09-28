const mongoose = require('mongoose');
const axios = require('axios');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/animeDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define the Anime schema
const animeSchema = new mongoose.Schema({
  name: String,
  anime_id: Number,
  image_url: String,
  genres: [String],
});

const Anime = mongoose.model('Anime', animeSchema);

// Helper function to add a delay (in milliseconds)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Fetch the image from the API with retry logic
async function fetchAnimeImage(anime_id, retries = 3) {
  try {
    const response = await axios.get(`https://api.jikan.moe/v4/anime/${anime_id}`);
    const animeData = response.data;
    if (animeData && animeData.data.images.jpg.image_url) {
      return animeData.data.images.jpg.image_url;
    } else {
      console.error(`No image found for anime ID: ${anime_id}`);
      return null;
    }
  } catch (error) {
    if (error.response && error.response.status === 429 && retries > 0) {
      // Handle rate limit exceeded (status code 429)
      console.warn(`Rate limit exceeded for anime ID: ${anime_id}, retrying in 5 seconds...`);
      await delay(5000); // Wait for 5 seconds before retrying
      return fetchAnimeImage(anime_id, retries - 1); // Retry the request
    } else {
      console.error(`Error fetching image for anime ID: ${anime_id}:`, error.message);
      return null;
    }
  }
}

// Update the image_url for all anime in the database
async function updateAnimeImages() {
  const limit = 10; // Adjust the batch size based on rate limits
  let skip = 0;
  let animeBatch;

  try {
    do {
      // Fetch a batch of anime from the database
      animeBatch = await Anime.find().skip(skip).limit(limit);

      // Loop through each anime and update the image URL
      for (const anime of animeBatch) {
        console.log(`Fetching image for: ${anime.name} (ID: ${anime.anime_id})`);

        // Fetch the new image URL from the API
        const newImageUrl = await fetchAnimeImage(anime.anime_id);

        if (newImageUrl) {
          // Update the image_url field in the database
          anime.image_url = newImageUrl;
          await anime.save();
          console.log(`Updated image for ${anime.name}`);
        } else {
          console.error(`Failed to update image for ${anime.name}`);
        }

        // Add a delay between each request to avoid rate limit
        await delay(1000); // 1 second delay between requests
      }

      // Move to the next batch
      skip += limit;
    } while (animeBatch.length > 0);

    console.log('All anime images have been updated.');
  } catch (error) {
    console.error('Error updating anime images:', error);
  } finally {
    // Close the connection to the database
    mongoose.connection.close();
  }
}

// Start the update process
updateAnimeImages();
