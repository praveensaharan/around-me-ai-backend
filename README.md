# Backend API

A Node.js Express backend providing endpoints for place search, AI-powered activity suggestions, place images, and IP-based geolocation.

## Features

- **/api/places**: Search for places using Foursquare Places API.
- **/api/ai-activities**: Get activity suggestions from an AI model based on mood, weather, city, date, and time.
- **/api/places/image**: Fetch images for a place from Foursquare.
- **/api/myip**: Get your public IP and geolocation.

## Setup

1. **Clone the repository**

2. **Install dependencies**
   ```sh
   npm install
   ```

3. **Environment Variables**

   Create a `.env` file in the root directory with the following keys:
   ```
   FOURSQUARE_API_KEY=your_foursquare_api_key
   GOOGLE_API_KEY=your_google_api_key
   OPENROUTER_API_KEY=your_openrouter_api_key
   ```

4. **Run the server**
   ```sh
   node index.js
   ```
   The server runs on [http://localhost:3001](http://localhost:3001).

## API Endpoints

### `GET /api/places`

Search for places.

**Query Parameters:**
- `query`: Search term (e.g., "cafe")
- `ll`: Latitude and longitude (e.g., "35.6895,139.6917")

### `POST /api/ai-activities`

Get AI-generated activity suggestions.

**Body (JSON):**
```json
{
  "mood": "happy",
  "weather": "sunny",
  "city": "Tokyo",
  "date": "2024-06-18",
  "time": "14:00"
}
```

### `GET /api/places/image`

Get images for a place.

**Query Parameters:**
- `fsq_id`: Foursquare place ID

### `GET /api/myip`

Get your public IP and geolocation.

---

## Deployment

This project is configured for Vercel deployment using vercel.json.

---

## License

ISC
