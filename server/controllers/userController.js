const userService = require('../services/userService');
const ApiError = require('../error/ApiError');
const {User} = require('../models/models');

const passport = require('passport');
const {validationResult} = require('express-validator');
const uuid = require('uuid');
const path = require('path');

class UserController
{
    async register(request, response, next)
    {
        try
        {
            const errors = validationResult(request);
            if(!errors.isEmpty())
            {
                return next(new ApiError('Ошибка при валидации', errors.array()))
            }
            const {email, password, display_name} = request.body;
            const {image} = request.files;

            let fileName = uuid.v4() + '.jpg';
            image.mv(path.resolve(__dirname, '..', 'static', 'users', fileName))

            const userData = await userService.register(email, password, display_name, fileName);

            return response.json(userData);
        }
        catch(e)
        {
            next(e);
        }
    }

    async login(request, response, next)
    {
        try
        {
            const {email, password} = request.body;
            const userData = await userService.login(email, password);
            response.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 1000, httpOnly: true})

            return response.json(userData);
        }
        catch(e)
        {
            console.log(e);
            next(e);
        }
    }

    async logout(request, response, next)
    {
        try
        {
            const {refreshToken} = request.cookies;
            const token = await userService.logout(refreshToken);
            response.clearCookie('refreshToken');
            return response.json(token);
        }
        catch(e)
        {
            next(e);
        }
    }

    async reset(request, response, next)
    {
        try
        {
            const {email} = request.body;
            const userData = await userService.reset(email);

            return response.json(userData);
        }
        catch(e)
        {
            next(e);
        }
    }

    async resetPassword(request, response, next)
    {
        try
        {
            const {email, password} = request.body;
            const userData = await userService.resetPassword(email, password);

            return response.json(userData);
        }
        catch(e)
        {
            next(e);
        }
    }

    async refresh(request, response, next)
    {
        try
        {
            const {refreshToken} = request.cookies;
            const userData = await userService.refresh(refreshToken);
            response.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 1000, httpOnly: true})

            return response.json(userData);
        }
        catch(e)
        {
            next(e);
        }
    }

    async activate(request, response, next)
    {
        try
        {
            const activationLink = request.params.link;
            await userService.activate(activationLink);
            return response.redirect(process.env.CLIENT_URL);
        }
        catch(e)
        {
            next(e);
        }
    }

    async checkResetLink(request, response, next)
    {
        try
        {
            const resetLink = request.params.link;
            const user = await userService.checkResetLink(resetLink);
            if(user)
            {
                response.setHeader('email', user.email);
                return response.redirect(process.env.NEW_PASSWORD_URL);
            }
        }
        catch(e)
        {
            next(e);
        }
    }

    async getAll(request, response, next)
    {
        try
        {
            const params = request.query.search
            ? {
                $or: [
                    { display_name: { $regex: request.query.search, $options: 'i'}},
                    { email: { $regex: request.query.search, $options: 'i'}}
                ]
            } : {};
            const users = await User.find(params).find({_id: { $ne: request.user._id}});
            return response.json(users);
        }
        catch(e)
        {
            next(e);
        }
    }

    async setInfo(request, response, next)
    {
        try
        {
            const {email, display_name, level} = request.body;
            const {image} = request.files;
            let user;

            if(image)
            {
                let fileName = uuid.v4() + '.jpg';
                image.mv(path.resolve(__dirname, '..', 'static', 'users', fileName));

                user = await User.updateOne({email: email}, {
                    display_name: display_name,
                    image: fileName,
                    level: level
                }, {new: true});
            }
            else
            {
                user = await User.updateOne({email: email}, {
                    display_name: display_name,
                    level: level
                }, {new: true});
            }
            return response.json(user);
        }
        catch(e)
        {
            next(e);
        }
    }

    async google(request, response, next)
    {
        try
        {
            passport.authenticate('google', {failureRedirect: '/'})
        }
        catch(e)
        {
            next(e);
        }
    }
}

module.exports = new UserController();