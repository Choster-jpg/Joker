const GoogleStrategy = require('passport-google-oauth20').Strategy;
const config = require('../default.json');
const sequelize = require('../databse/db');
const {User} = require('../models/models').Models(sequelize);

class Strategies
{
    google(passport)
    {
        passport.use(new GoogleStrategy({
            clientID: config.auth.google.google_client_id,
            clientSecret: config.auth.google.google_client_secret,
            callbackURL: 'http://localhost:5000/api/user/auth/google/callback'
        },
        async (accessToken, refreshToken, profile, done) => 
        {
            try {
                console.log(profile);
                const candidate = await User.findOne({where: {email: profile.displayName}});
                console.log(candidate);
                if (candidate)
                {
                    done(null, candidate);
                }

                const user = await User.create({
                    email: profile.displayName,
                    password: null,
                    name: profile.name.givenName,
                    last_name: profile.name.familyName
                });
                done(null, user);
            }
            catch(e)
            {
                console.log(e);
            }

        }));

        passport.serializeUser((user, done) =>
        {
            console.log('serialize: displayName', user.profile.displayName);
            done(null, user);
        });

        passport.deserializeUser((user, done) =>
        {
            console.log('deserialize: displayName', user.profile.displayName);
            done(null, user);
        });
    }
}

module.exports = new Strategies();