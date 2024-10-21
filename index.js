const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');

// Create Express app
const app = express();
const PORT = 3000;

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/weatherDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected!'))
.catch((err) => console.error('Failed to connect to MongoDB', err));

// Define a Mongoose schema for weather
const weatherSchema = new mongoose.Schema({
    temp:Number ,
    feels_like:Number ,
    temp_min: Number,
    temp_max: Number,
    pressure: Number,
    humidity: Number,
    sea_level: Number,
    grnd_level: Number ,
});

// Create a Mongoose model
const Weather = mongoose.model('Weather', weatherSchema);

// API route to get weather data and save it to MongoDB
app.get('/save-weather', async (req, res) => {
  try {
    const apiKey = 'f21957ad4e92ebc3f5beff7644c2c825';  // Your OpenWeatherMap API key
    const city = req.query.city;  // Get the city from query parameter
    
    // Check if city is provided in the query
    if (!city) {
      return res.status(400).json({ error: 'Please provide a city name' });
    }

    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
    
    // Fetch weather data
    const response = await axios.get(weatherUrl);
    
    // Extract the 'weather' data from the response
    const weatherData = response.data.main; // Extract only the first weather object

    // Create a new weather document from the fetched data
    const newWeather = new Weather({
      
      temp:weatherData.temp ,
      feels_like:weatherData.feels_like ,
      temp_min: weatherData.temp_min,
      temp_max: weatherData.temp.max,
      pressure: weatherData.pressure,
      humidity: weatherData.humidity,
      sea_level: weatherData.sea_level,
      grnd_level: weatherData.grnd_level,
    });

    // Save the weather data to MongoDB
    await newWeather.save();

    res.json({
      message: 'Weather data saved successfully!',
      weatherData: newWeather
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch or save weather data' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
