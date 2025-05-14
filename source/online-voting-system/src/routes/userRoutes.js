const express = require('express');
const UserController = require('../controllers/userController');

const router = express.Router();
const userController = new UserController();

const setUserRoutes = (app) => {
    router.post('/register', userController.register);
    router.post('/login', userController.login);
    router.get('/profile', userController.getProfile);

    app.use('/api/users', router);
};

module.exports = setUserRoutes;