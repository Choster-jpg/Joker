const Router = require('express');
const router = new Router();

const userRouter = require('./userRouter');
const chatRouter = require('./chatRoute');
const jokeRouter = require('./jokeRouter');
const messageRouter = require('./messageRouter');

router.use('/user', userRouter);
router.use('/chat', chatRouter);
router.use('/message', messageRouter);
router.use('/joke', jokeRouter);

module.exports = router;


