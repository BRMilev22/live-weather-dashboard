# Live Weather Dashboard

A modern, real-time weather dashboard featuring interactive data visualizations and dynamic weather maps. Built to showcase full-stack development skills with modern web technologies.

## 🌟 Features

- **Real-time Weather Data**: Live weather information with automatic updates
- **Interactive Charts**: Dynamic data visualization using Chart.js
- **Weather Maps**: Interactive maps powered by Mapbox
- **Responsive Design**: Modern, mobile-first UI that works on all devices
- **Real-time Updates**: Live data streaming for up-to-date weather information

## 🛠️ Tech Stack

**Frontend:**
- React 18 with TypeScript
- Vite for fast development and building
- Chart.js & React-Chart.js-2 for data visualization
- Mapbox GL JS & React-Map-GL for interactive maps
- Modern CSS with responsive design

**Backend:**
- Node.js with Express
- RESTful API architecture  
- Environment-based configuration
- CORS enabled for cross-origin requests

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager
- Mapbox API key (for map functionality)
- Weather API key (OpenWeatherMap or similar)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/BRMilev22/live-weather-dashboard.git
   cd live-weather-dashboard
   ```

2. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies:**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Setup:**
   - Create `.env` file in the backend directory
   - Add your API keys and configuration:
     ```
     PORT=5000
     WEATHER_API_KEY=your_weather_api_key
     MAPBOX_TOKEN=your_mapbox_token
     ```

5. **Start the development servers:**
   
   **Backend (Terminal 1):**
   ```bash
   cd backend
   npm run dev
   ```
   
   **Frontend (Terminal 2):**
   ```bash
   cd frontend
   npm run dev
   ```

6. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📁 Project Structure

```
live-weather-dashboard/
├── frontend/              # React TypeScript frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API services
│   │   └── types/         # TypeScript type definitions
│   ├── package.json
│   └── vite.config.ts
├── backend/               # Node.js Express backend
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   └── utils/         # Utility functions
│   └── package.json
└── README.md
```

## 🎯 Next Development Steps

### Phase 1: Core Functionality
- [ ] **Frontend Integration**
  - Implement API service layer for weather data fetching
  - Connect WeatherChart component with Chart.js for real data visualization
  - Integrate WeatherMap component with Mapbox for interactive maps
  - Add real-time data updates with WebSocket or polling

### Phase 2: Enhanced Features
- [ ] **Backend Enhancements**
  - Replace mock data with real weather API integration (OpenWeatherMap)
  - Add location-based weather data (geolocation support)
  - Implement data caching and rate limiting
  - Add weather alerts and notifications

### Phase 3: Advanced UI/UX
- [ ] **Styling & Interactions**
  - Implement responsive design with advanced CSS animations
  - Add dark/light theme toggle
  - Create loading states and error handling
  - Add search functionality for different locations

### Phase 4: Production Ready
- [ ] **Testing & Deployment**
  - Add unit and integration tests
  - Set up CI/CD pipeline
  - Implement error monitoring and logging
  - Deploy to production (Vercel/Netlify + Railway/Heroku)

## 🚀 Current Status
✅ Project scaffolding complete  
✅ Frontend and backend structure established  
✅ Placeholder components implemented  
🔄 Ready for API integration and data visualization implementation

---

**Developer:** Boris Milev  
**GitHub:** [https://github.com/BRMilev22](https://github.com/BRMilev22)  
**Portfolio Project:** Full-stack weather dashboard showcasing modern web development practices