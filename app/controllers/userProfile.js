const updateProfile = (req, res, db) => {
    const { id } = req.body;
    db('users')
        .where('id', '=', id)
        .returning('*')
        .update({accounttype: 'vendor'})
        .then(data => res.json(data[0]))
        .catch(err => res.status(400).json('unable to get entry'))
}

module.exports = {
    updateProfile: updateProfile
}