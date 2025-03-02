# Productivity App

A minimalist productivity application that combines focused task management with real-time weather and stock market insights. The app will feature an AI-powered task manager and dedicated focus mode to enhance user productivity. Weekend project to learn React Native and Expo.

## ✅ Implemented Features

### Authentication
- Email-based registration and login
- Secure authentication system
- Protected routes

### Task Management
- Create, edit, and delete tasks
- Task status management (pending, in progress, completed)
- Priority levels (high, medium, low)
- Advanced search and filtering
- Subtasks with progress tracking
- Recurring tasks
- Task organization and hierarchy

### Focus Mode
- Focus session timer
- Break timer
- Notification controls
- Session tracking

### Weather Integration
- Real-time weather updates
- Location-based forecasting
- Temperature unit conversion (°C/°F)
- Detailed weather information (humidity, wind, UV index, etc.)
- Weather alerts

## 🚧 Upcoming Features

### Focus Mode Enhancements
- Session history view
- Focus session analytics

### Stock Market Integration
- Live market updates
- User-selected stocks tracking
- Detailed stock analysis

### AI Assistant Integration
- Task suggestions
- Task optimization
- AI metadata analysis

### Additional Enhancements
- Offline functionality
- Data caching
- Task analytics and trends
- Drag-and-drop task organization
- Task reminders
- Detailed weather view
- Weather caching

## Getting Started

1. Set up environment variables:
   Create a `.env` file with the following:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
   EXPO_PUBLIC_WEATHER_API_KEY=your_openweathermap_key
   ```

2. Set up the database:
   Run the following SQL queries in your Supabase SQL editor in order:
   - `queries/01_create_users_table.sql`: Creates the users table with authentication
   - `queries/02_create_tasks_table.sql`: Creates the tasks table with all features

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npx expo start
   ```

## Database Schema

### Users Table
- Handles user authentication and profiles
- Includes email and timestamps
- Protected with Row Level Security

### Tasks Table
- Stores all task-related data
- Supports subtasks, priorities, and recurring tasks
- Protected with Row Level Security
- Includes automatic timestamp updates

## Tech Stack
- Frontend: React Native with TypeScript
- Backend: Supabase
- Weather Data: OpenWeatherMap API
- UI Framework: React Native Paper
- Navigation: Expo Router

## Project Structure
```
productivity-app/
├── app/                      # Expo Router app directory
│   ├── (auth)/              # Authentication routes
│   └── (tabs)/              # Main app routes
├── components/              # Reusable components
├── context/                 # React Context providers
├── hooks/                   # Custom React hooks
├── services/               # External service integrations
├── types/                  # TypeScript definitions
└── utils/                  # Helper functions
```

## Development Progress
- Core Development (Phases 1-3): ✅ Completed
- Weather Integration (Phase 4): ✅ Completed
- Feature Integration (Phases 5-6): 🚧 In Progress
- Polish & Optimization (Phase 7): 📅 Planned

## Contributing
Feel free to submit issues and enhancement requests.

## License
This project is licensed under the MIT License - see the LICENSE file for details.
