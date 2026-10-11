# DRR Club - Online Quiz Platform

A full-stack, responsive web application for conducting online quizzes for the Disaster Risk Reduction Club.

## Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Lucide React
- **Backend**: Node.js, Express, MongoDB, Mongoose, JWT, bcrypt
- **Design**: Modern glassmorphism, dark navy theme with cyan and orange accents.

## Features
- **Student Portal**:
  - Secure registration (unique Gmail and quiz combination).
  - Countdown timer for upcoming quizzes.
  - Per-question countdown timers with auto-submit.
  - Automatic scoring with speed bonuses.
  - Dynamic competition leaderboard.
- **Admin Portal**:
  - Secure login with JWT.
  - Dashboard to manage quizzes.
  - Ability to publish/hide results.

## Prerequisites
- Node.js (v16 or higher)
- MongoDB running locally on port 27017 or a MongoDB Atlas URI.

## Setup Instructions

1. **Install Dependencies**
   Run the following from the root directory:
   ```bash
   npm install
   ```
   (This will install concurrently and then you can install sub-packages if needed, though the provided `package.json` setup might require running `npm install` in frontend and backend respectively initially.)

2. **Environment Variables**
   Create a `.env` file in the root based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Ensure `MONGODB_URI` points to a running MongoDB instance.

3. **Seed the Database**
   To create the initial admin account and a sample quiz:
   ```bash
   npm run seed
   ```
   *Note: This will clear the existing database.*

4. **Run the Application**
   Start both frontend and backend servers simultaneously:
   ```bash
   npm run start
   ```
   - Frontend will run on `http://localhost:5173`
   - Backend will run on `http://localhost:5000`

## Default Admin Credentials
If you seeded the database using default values:
- Email: `admin@drrclub.edu`
- Password: `adminpassword`

## License
MIT
