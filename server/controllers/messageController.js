const ApiError = require('../error/ApiError');
const {Chat, User, Message} = require('../models/models');

class MessageController
{
    async sendMessage(request, response, next)
    {
        try
        {
            const {content, chatId, jokeId} = request.body;
            if(!content || !chatId)
            {
                return next(ApiError.BadRequest(`MessageController: sendMessage: 
                Не полностью указаны входные данные, получено: ${chatId} : ${content}`));
            }
            let params = jokeId ? {
                sender: request.user._id, content: content, chat: chatId, joke: jokeId
            } :
                {
                    sender: request.user._id, content: content, chat: chatId
                }

            let message = await Message.create(params);
            message = await message.populate('sender', 'display_name image');
            message = await message.populate('chat');
            message = await User.populate(message, {
                path: 'chat.users',
                select: 'display_name image email'
            });

            await Chat.findByIdAndUpdate(chatId, {latest_message: message});

            response.json(message);
        }
        catch (e)
        {
            next(e);
        }
    }

    async getAllMessage(request, response, next)
    {
        try
        {
            const messages = await Message.find({chat: request.params.chatId})
                .populate('sender', 'display_name image email')
                .populate('chat')
                .populate('joke');

            response.json(messages);
        }
        catch (e)
        {
            next(e);
        }
    }
}

module.exports = new MessageController();

