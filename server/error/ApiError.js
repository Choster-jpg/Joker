class ApiError extends Error
{
    constructor(status, message, errors = [])
    {
        super();
        this.status = status;
        this.message = message;
    }

    static BadRequest(message = "неверный url или параметры запроса", errors = [])
    {
        return new ApiError(400, `${message}`, errors);
    }

    static Unauthorized(message = "не авторизован", errors = [])
    {
        return new ApiError(401, `${message}`, errors);
    }

    static Forbidden(message = "отказано в доступе", errors = [])
    {
        return new ApiError(403, `${message}`, errors);
    }

    static Internal(message = "внутренняя ошибка сервера", errors = [])
    {
        return new ApiError(500, `${message}`, errors);
    }
}

module.exports = ApiError;