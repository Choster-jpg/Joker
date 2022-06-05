const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const jokeController = require('../controllers/jokeController');

router.route('/')
    .get(authMiddleware(false), jokeController.getAll)
    .post(authMiddleware(false), jokeController.Add)

router.put('/rate', authMiddleware(false), jokeController.Rate);
router.get('/avg', authMiddleware(false), jokeController.getAverageMark);

module.exports = router;

