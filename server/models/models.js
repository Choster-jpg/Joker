const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    email: {type: String, trim: true, unique: true, required: true },
    password: {type: String, required: true },
    display_name: {type: String, trim: true },
    level: {type: Number, default: 1    },
    rates: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Rate'
        }
    ],
    image: {type: String},
    is_activated: { type: Boolean, default: false },
    activationLink: { type: String },
    resetLink: { type: String }
});

const ChatSchema = mongoose.Schema({
    name: {type: String, trim: true},
    is_group: {type: Boolean, default: false },
    is_deleted: {type: Boolean, default: false},
    image: {type: String, default: ''},
    users: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    latest_message: {type: mongoose.Schema.Types.ObjectId, ref: 'Message'},
    admin: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
}, {timestamps: true});

const MessageSchema = mongoose.Schema({
    sender: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    content: {type: String, trim: true},
    chat: {type: mongoose.Schema.Types.ObjectId, ref: 'Chat'},
    joke: {type: mongoose.Schema.Types.ObjectId, ref: 'Joke'}
}, {timestamps: true})

const JokeSchema = mongoose.Schema({
    content: {type: String},
    level: {type: Number},
    creator: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    is_deleted: {type: Boolean, default: false}
});

const RateSchema = mongoose.Schema({
    joke: {type: mongoose.Schema.Types.ObjectId, ref: 'Joke'},
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    rate: {type: Number}
});

const TokenSchema = mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    refreshToken: {type: String}
});

const User = mongoose.model('User', UserSchema);
const Chat = mongoose.model('Chat', ChatSchema);
const Message = mongoose.model('Message', MessageSchema);
const Joke = mongoose.model('Joke', JokeSchema);
const Rate = mongoose.model('Rate', RateSchema);
const Token = mongoose.model('Token', TokenSchema);

module.exports = {User, Chat, Message, Joke, Token, Rate};