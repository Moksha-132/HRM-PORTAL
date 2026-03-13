# HRM Portal Full-Stack

This is a full-stack HR Management Portal built with Node.js, Express, MongoDB, and Vanilla HTML/CSS/JS.

## Prerequisites

- **Node.js** (v14 or higher)
- **MongoDB** (running locally on port 27017 or a MongoDB Atlas connection string)

## Setup & Installation

1. Navigate to the `HRM-PORTAL` directory:
   ```bash
   cd HRM-PORTAL
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Ensure MongoDB is running locally. If not, update the `MONGO_URI` in the `.env` file to your cluster URI.

4. Seed the initial Super Admin account (this gives you login access):
   ```bash
   node seeder.js
   ```

## Running the Application

1. Start the server:
   ```bash
   npm start
   ```
   *The server will run on port 5000 by default.*

2. Open your browser and navigate to:
   ```
   http://localhost:5000
   ```

## Login Credentials

You can log in to the admin dashboard using the seeded Super Admin account:
- **Email:** `admin@shnoor.com`
- **Password:** `Admin@1234`