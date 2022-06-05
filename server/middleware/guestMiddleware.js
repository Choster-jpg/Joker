const ApiError = require('../error/ApiError');

module.exports = function (req, res, next)
{
    try
    {
        const authorizationHeader = req.headers.authorization;
        console.log(authorizationHeader);
        console.log(req.isAuthenticated());
        if(!req.isAuthenticated() && authorizationHeader == null)
        {
            return next();
        }

        return next(ApiError.BadRequest());
    }
    catch (e)
    {
        return next(ApiError.BadRequest());
    }
}