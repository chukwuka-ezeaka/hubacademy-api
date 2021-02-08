var JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;
// const bcrypt = require('bcryptjs');
const models = require('../app/models/models.index');

module.exports = function (passport) {
    var opts = {}
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
    opts.secretOrKey = process.env.SECRET;
    opts.passReqToCallback = true
    passport.use(
        new JwtStrategy(opts, (req,payload, done)=>{
            return models.User.findOne({where: {
                    email: payload.email
                },
                include: [{ model:models.UserRole, include: [{model:models.Role}]}, {model:models.Wallet, as:'wallets'} ]
            })
                .then(( user,err)=>{
                    if (err) {
                        return done(err, false);
                    }
                    if(!user){
                        return done(null, false, {message: "User is not registered"})
                    }
                    req.user = user;
                    return done(null, user)
                })
                .catch( (err)=> {
                    return done(null, false, {message: err.message})
                })
        })
    )

}
