const bcrypt = require('bcrypt');
const uuid = require('uuid');

const mailService = require('./mailService');
const tokenService = require('./tokenService');
const UserDto = require('../dto/userDto');
const {User} = require('../models/models');
const ApiError = require('../error/ApiError');

class UserService
{
    async register(email, password, display_name, image)
    {
        let candidate = await User.findOne( {email: email});

        if(candidate)
        {
            throw ApiError.BadRequest(`Пользователь с указанной почтой уже существует:  ${email}`);
        }

        let hashPassword = await bcrypt.hash(password, 3);
        let activationLink = uuid.v4();

        let completeActivationLink = `${process.env.API_URL}/api/user/activate/${activationLink}`;

        let user = await User.create({email: email, password: hashPassword, activationLink: activationLink, display_name: display_name, image: image});
        await mailService.sendActivationMail(email, completeActivationLink);

        let userDto = new UserDto(user);

        return { user: userDto };
    }

    async activate(activationLink)
    {
        let user = await User.findOne({activationLink: activationLink});
        console.log(user);
        if(!user)
        {
            throw ApiError.BadRequest('Некорректная ссылка активации')
        }

        await User.updateOne({activationLink: activationLink}, {is_activated: true});
    }

    async checkResetLink(resetLink)
    {
        let user = await User.findOne({resetLink: resetLink});
        console.log(user);
        if(!user)
        {
            throw ApiError.BadRequest('Некорректная ссылка обновления пароля')
        }

        return new UserDto(user);
    }

    async login(email, password)
    {
        const user = await User.findOne({email: email});

        if(!user)
        {
            throw ApiError.BadRequest(`Пользователь с таким email не найден: ${email}`);
        }

        const isPassEquals = await bcrypt.compare(password, user.password);
        if(!isPassEquals)
        {
            throw ApiError.BadRequest(`Неверный пароль`);
        }

        if(user.is_activated === false)
        {
            throw ApiError.BadRequest(`Аккаунт не активирован`);
        }

        const userDto = new UserDto(user);
        console.log("user dto: ", userDto);
        const tokens = tokenService.generateTokens({...userDto});
        await tokenService.saveToken(userDto._id, tokens.refreshToken);

        return { ...tokens, user: userDto };
    }

    async logout(refreshToken)
    {
        const token = await tokenService.removeToken(refreshToken);
        return token;
    }

    async refresh(refreshToken)
    {
        if(!refreshToken)
        {
            throw new ApiError.Unauthorized();
        }
        const userData = tokenService.validateRefreshToken(refreshToken);
        const tokenFromDb = await tokenService.findToken(refreshToken);

        if(!userData || !tokenFromDb)
        {
            throw ApiError.Unauthorized();
        }

        const user = User.findOne({email: userData.email});
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto});
        await tokenService.saveToken(userDto._id, tokens.refreshToken);

        return { ...tokens, user: userDto };
    }

    async reset(email)
    {
        let candidate = await User.findOne({email: email});

        if(!candidate)
        {
            throw ApiError.BadRequest(`Пользователь с указанной почтой не существует:  ${email}`);
        }

        let resetLink = uuid.v4();
        let temporaryPassword = uuid.v4();

        let hashPassword = await bcrypt.hash(temporaryPassword, 3);

        let completeResetLink = `${process.env.API_URL}/api/user/reset/${resetLink}`;

        let user = await User.updateOne({email: email},{password: hashPassword, resetLink: resetLink});
        await mailService.sendResetMail(email, completeResetLink, temporaryPassword);

        return { user: user, temporaryPassword: temporaryPassword};
    }

    async resetPassword(email, password)
    {
        let candidate = await User.findOne({email: email});

        if(!candidate)
        {
            throw ApiError.BadRequest(`Пользователь с указанной почтой не существует:  ${email}`);
        }

        let hashPassword = await bcrypt.hash(password, 3);

        let user = await User.updateOne({email: email},{password: hashPassword});

        let userDto = new UserDto(user);

        return { user: userDto };
    }
}

module.exports = new UserService();