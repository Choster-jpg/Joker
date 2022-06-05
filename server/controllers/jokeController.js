const {Joke, Rate} = require("../models/models");
const ApiError = require('../error/ApiError');

class JokeController
{
    async getAll(request, response, next)
    {
        try
        {
            const params = request.query.search
                ? {
                    level: +request.query.search,
                    is_deleted: false
                }
                 : {is_deleted: false};

            const jokes = await Joke.find(params);
            response.json(jokes);
        }
        catch(e)
        {
            next(e);
        }
    }

    async Add(request, response, next)
    {
        try
        {
            const {content, level} = request.body;
            if(!content || !level)
            {
                return next(ApiError.BadRequest(`JokeController: Add: 
                Не полностью указаны входные данные, получено: ${content} : ${level}`));
            }

            let joke = await Joke.create({creator: request.user._id, content: content, level: level});

            if(!joke)
            {
                return next(ApiError.Internal(`JokeController: Add: Не удалось добавить новый анекдот`));
            }

            joke = await joke.populate('creator', 'display_name image email');
            return response.json(joke);
        }
        catch(e)
        {
            next(e);
        }
    }

    async Rate(request, response, next)
    {
        try
        {
            const {rate} = request.body;
            if(!rate || +rate > 5 || +rate < 1)
            {
                return next(ApiError.BadRequest(`JokeController: Rate: 
                Неверно указаны входные данные, получено: ${rate}`));
            }

            const options = {user: request.user._id, joke: request.query.id};

            const rates = await Rate.find(options);
            console.log(rates);
            console.log(request.query.id);

            let result;

            if(rates[0])
            {
                console.log('if')
                result = await Rate.findOneAndUpdate(options, {rate: rate});
            }
            else
            {
                console.log('else')
                result = await Rate.create({joke: request.query.id, user: request.user._id, rate: rate});
            }

            response.json(result);
        }
        catch(e)
        {
            next(e);
        }
    }

    async getAverageMark(request, response, next)
    {
        try
        {
            const rates = await Rate.find({joke: request.query.id});
            let sum = 0.0;
            rates.map(rate => {
                sum += rate.rate;
            });

            let result = sum / rates.length;
            response.json(result.toFixed(2));
        }
        catch(e)
        {
            next(e);
        }
    }
}

module.exports = new JokeController();