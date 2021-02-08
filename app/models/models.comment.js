const Sequelize = require('sequelize');
const db = require('../../config/db');
const Model = Sequelize.Model;

class Comment extends Model {}

Comment.init({
        status: {
            type: Sequelize.ENUM('pending', 'approve'),
            allowNull: false,
            defaultValue: 'approve',
        },
        postId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                // This is a reference to another model
                model: 'Post',

                // This is the column name of the referenced model
                key: 'id'
            }
        },
        userId: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        content: {
            type: Sequelize.TEXT,
            allowNull: false
        }
    },
    {
        sequelize: db,
        modelName: 'comments',
        timestamps: true
    });


module.exports = Comment;