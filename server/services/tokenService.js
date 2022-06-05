const jwt = require('jsonwebtoken');

const {Token} = require('../models/models');
const ApiError = require("../error/ApiError");

class TokenService
{
    generateTokens(payload)
    {
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {expiresIn: '30m'});
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {expiresIn: '30d'});
        return {accessToken, refreshToken }
    }

    validateAccessToken(token)
    {
        try
        {
            const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
            return userData;
        }
        catch(e)
        {
            return null;
        }
    }

    validateRefreshToken(token)
    {
        try
        {
            const userData = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
            return userData;
        }
        catch(e)
        {
            return null;
        }
    }

    async saveToken(userEmail, refreshToken)
    {
        let tokenData = await Token.findOne({user: userEmail});
        console.log(refreshToken)
        if(tokenData)
        {
            tokenData.refreshToken = refreshToken;
            return tokenData.save();
        }
        const token = await Token.create({user: userEmail, refreshToken: refreshToken});
        return token;
    }

    async parseTokenFromRequest(request)
    {
        const authorizationHeader = request.headers.authorization;
        if(!authorizationHeader)
        {
            return null;
        }

        const accessToken = authorizationHeader.split(' ')[1];
        if(!accessToken)
        {
            return null;
        }

        const userData = this.validateAccessToken(accessToken);
        return userData;
    }

    async removeToken(refreshToken)
    {
        const tokenData = await Token.deleteOne({refreshToken: refreshToken});
        return tokenData;
    }

    async findToken(refreshToken)
    {
        const tokenData = await Token.findOne({refreshToken: refreshToken});
        return tokenData;
    }
}

module.exports = new TokenService();