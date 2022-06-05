module.exports = class UserDto
{
    _id;
    email;
    display_name;
    is_activated;
    image;
    level;

    constructor(model)
    {
        this._id = model._id;
        this.email = model.email;
        this.is_activated = model.is_activated;
        this.display_name = model.display_name;
        this.image = model.image;
        this.level = model.level;
    }
}