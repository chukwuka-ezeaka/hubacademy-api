const handleSignin = (req, res, db, bcrypt) => {
    const { email, password } = req.body;
    //console.log(email);
    if(!email || !password){
       return res.status(400).json('incorrect submission')
   }
    db.select('*').from('login')
    .where('email', '=', email)
    .then(data => {
        const isValid = bcrypt.compareSync(password, data[0].password);
        if(isValid){
            return db.select('*').from('users')
            .where('email', '=', email)
            .then(user => {
                res.json(user[0])
            })
            .catch(err => res.status(400).json('unable to get user'))
        } else {
            res.status(400).json('invalid credentials')
        }
    })
    .catch(err => res.status(400).json('invalid credentials'))
   }

   module.exports = {
    handleSignin: handleSignin
}