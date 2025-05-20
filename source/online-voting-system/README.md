# Online Voting System

## Overview
The Online Voting System is a secure and user-friendly platform that allows users to register, log in, and cast their votes in various elections. This application leverages MongoDB for data storage and Mongoose for object modeling.

## Features
- User registration and authentication
- Secure voting process
- Real-time vote tallying
- User profile management

## Technologies Used
- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Tokens (JWT)
- dotenv for environment variable management

## Project Structure
```
online-voting-system
├── src
│   ├── config
│   │   └── db.js
│   ├── controllers
│   │   └── userController.js
│   ├── models
│   │   ├── User.js
│   │   └── Vote.js
│   ├── routes
│   │   ├── userRoutes.js
│   │   └── voteRoutes.js
│   ├── utils
│   │   └── authMiddleware.js
│   └── app.js
├── package.json
├── .env
├── .gitignore
└── README.md
```

## Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd online-voting-system
   ```
3. Install the dependencies:
   ```
   npm install
   ```
4. Create a `.env` file in the root directory and add your MongoDB connection string and any other necessary environment variables.

## Usage
1. Start the server:
   ```
   npm start
   ```
2. Access the application at `http://localhost:3000`.

## API Endpoints
- **User Routes**
  - `POST /api/users/register` - Register a new user
  - `POST /api/users/login` - Log in an existing user
  - `GET /api/users/profile` - Get user profile information

- **Vote Routes**
  - `POST /api/votes` - Cast a vote
  - `GET /api/votes/results` - Retrieve voting results

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License
This project is licensed under the MIT License.