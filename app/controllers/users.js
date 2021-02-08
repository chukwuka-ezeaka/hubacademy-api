const handleUsers = (req, res, db) => {
    db.select('*').from('users')
    .then(users => {
      res.json(users)
    })
    .catch(err => res.status(400).json('unable to fetch'))
  }

  module.exports = {
    handleUsers: handleUsers
}

