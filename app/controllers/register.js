const handleRegister = (req, res, db, bcrypt) => {
    const { fullname, username, email, password, phone} = req.body;
    //console.log(fullname+" "+ username +" "+ email +" "+ password +" "+ phone);
    if(!fullname|| !username || !email || !password || !phone){
        return res.status(400).json('incorrect submission')
    }
    const hash = bcrypt.hashSync(password);
    db.transaction(trx => {
        trx.insert({
           email: email,
           username: username,
           password: hash
        })
        .into('login')
        .returning('email')
        .then(loginEmail => {
            db('users')
            .returning('*')
            .insert({
                fullname: fullname,
                username: username,
                email: loginEmail[0],
                phonenumber: phone,
                accounttype: 'vendor',
                joined: new Date()
            }).then(user => {
                res.json(user[0]);
            })
            .catch(err => res.status(400).json('unable to register'));
        }) 
        .then(trx.commit)
        .then(trx.rollback)
    })
  
  .catch(err => res.status(400).json('unable to register'))
}

module.exports = {
    handleRegister: handleRegister
}