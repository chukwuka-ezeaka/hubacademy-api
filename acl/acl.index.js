const passport = require('passport');
require('../config/config.passport')

const isAuthenticated = (req,res,next) =>
{
    passport.authenticate('jwt', {session: false},(err, user, info) => {
            if(err || !user) {
                const err = {};
                err.status = "unautorized";
                err.message = 'Unauthorized Access';
                res.status(401).send({status:err.status, message:err.message})

                // next(new Error(err.message)) // send the error response to client
            }else{
                return next(); // continue to next middleware if no error.
            }

        }
    )(req,res,next)
}

module.exports = {
    isAuthenticated:isAuthenticated
}
