const ApiError = require('../error/ApiError');
const {Chat, User} = require('../models/models');
const uuid = require("uuid");
const path = require("path");

class ChatController
{
    async accessChat(request, response, next)
    {
        try
        {
            const {userId} = request.body;
            if(!userId)
            {
                return next(ApiError.BadRequest('ChatController: access: ' +
                    'Неверно указан id пользователя'));
            }

            let data = await Chat.findOne({
                is_group: false,
                $and: [
                    {users: {$elemMatch: {$eq: request.user._id}}},
                    {users: {$elemMatch: {$eq: userId}}}
                ]
            }).populate('users', '-password').populate('latest_message');

            //console.log(data);

            data = await User.populate(data, {
                path: 'latest_message.sender',
                select: 'display_name image email'
            });

            //console.log(data);

            if(data != null)
            {
                data = await Chat.findOneAndUpdate({
                    is_group: false,
                    $and: [
                        {users: {$elemMatch: {$eq: request.user._id}}},
                        {users: {$elemMatch: {$eq: userId}}}
                    ]
                }, {is_deleted: false}, {new: true})
                response.json(data);
            }
            else
            {
                const chat = await Chat.create({name: 'chat', users: [request.user._id, userId]});
                const FullChat = await Chat.findOne({ _id: chat._id }).populate("users", "-password");
                response.json(FullChat);
            }
        }
        catch(e)
        {
            next(e);
        }
    }

    async fetchChats(request, response, next)
    {
        try
        {
            Chat.find({is_group: false, is_deleted: false, users: {$elemMatch: {$eq: request.user._id}}})
                .populate('users', '-password')
                .populate('admin', '-password')
                .populate('latest_message')
                .sort({updatedAt: -1})
                .then(async (result) =>
                {
                    result = await User.populate(result, {
                        path: 'latest_message.sender',
                        select: 'display_name image email'
                    });

                    response.json(result);
                });
        }
        catch(e)
        {
            next(e);
        }
    }

    async fetchGroupChats(request, response, next)
    {
        try
        {
            await Chat.find({is_group: true, users: {$elemMatch: {$eq: request.user._id}}})
                .sort({updatedAt: -1})
                .then(async (result) => {
                    response.json(result);
                });
        }
        catch(e)
        {
            next(e);
        }
    }

    async createGroupChat(request, response, next)
    {
        try
        {
            const {name} = request.body;
            const {image} = request.files;

            if(!request.body.users || !name || !image)
            {
                return next(ApiError.BadRequest(`ChatController: createGroup: 
                Не полностью указаны входные данные, получено: ${request.body.users} : ${name}`));
            }

            let fileName = uuid.v4() + '.jpg';
            image.mv(path.resolve(__dirname, '..', 'static', 'chats', fileName))

            let users = JSON.parse(request.body.users);

            if(users.length < 2)
            {
                return next(ApiError.BadRequest(`ChatController: createGroup: 
                Слишком мало пользователей, минимум 2, получено: ${users.length}`));
            }

            users.push(request.user);

            const groupChat = await Chat.create({
                name: name,
                image: fileName,
                is_group: true,
                users: users,
                admin: request.user._id
            });

            const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
                .populate("users", "-password")
                .populate("admin", "-password");

            response.json(fullGroupChat);
        }
        catch(e)
        {
            next(e);
        }
    }

    async renameGroupChat(request, response, next)
    {
        try
        {
            const {chatId, name} = request.body;

            const chat = await Chat.findByIdAndUpdate(chatId, {name: name}, {new: true})
                .populate("users", "-password")
                .populate("admin", "-password");

            if(!chat)
            {
                return next(ApiError.Internal(`ChatController: renameGroup: Не удалось обновить имя чата`));
            }

            response.json(chat);
        }
        catch(e)
        {
            next(e);
        }
    }

    async addGroupChatMember(request, response, next)
    {
        try
        {
            const {chatId, userId} = request.body;

            const result = await Chat.findByIdAndUpdate(chatId, {
                $push: {users: userId},
            }, {new: true})
                .populate("users", "-password")
                .populate("admin", "-password");

            if(!result)
            {
                return next(ApiError.Internal(`ChatController: addGroupChatMember: Не удалось добавить нового участника`));
            }

            response.json(result);
        }
        catch(e)
        {
            next(e);
        }
    }

    async removeGroupChatMember(request, response, next)
    {
        try
        {
            const {chatId, userId} = request.body;

            const result = await Chat.findByIdAndUpdate(chatId, {
                $pull: {users: userId},
            }, {new: true})
                .populate("users", "-password")
                .populate("admin", "-password");

            if(!result)
            {
                return next(ApiError.Internal(`ChatController: removeGroupChatMember: Не удалось удалить участника`));
            }

            response.json(result);
        }
        catch(e)
        {
            next(e);
        }
    }

    async removeChat(request, response, next)
    {
        try
        {
            const {chatId} = request.body;

            const chat = await Chat.findByIdAndUpdate(chatId, {is_deleted: true}, {new: true})
                .populate("users", "-password");

            if(!chat)
            {
                return next(ApiError.Internal(`ChatController: removeChat: Не удалось удалить контакт`));
            }

            response.json(chat);
        }
        catch(e)
        {
            next(e);
        }
    }
}

module.exports = new ChatController();