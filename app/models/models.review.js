const Sequelize = require('sequelize');
const db = require('../../config/db');
const Model = Sequelize.Model;

class Review extends Model {}

Review.init({
        status: {
            type: Sequelize.ENUM('pending', 'approve'),
            allowNull: false,
            defaultValue: 'approve',
        },
        reviewableId: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        reviewableType: {
            type: Sequelize.STRING,
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
        modelName: 'Review',
        tableName: 'reviews',
        timestamps: true,
        paranoid:true
    });


module.exports = Review;
