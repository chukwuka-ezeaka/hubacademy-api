const Sequelize = require('sequelize');
const db = require('../../config/db');
const Model = Sequelize.Model;

class Post extends Model {}

Post.init({
    // attributes
    status: {
        type: Sequelize.ENUM('draft', 'publish'),
        allowNull: false,
        defaultValue: 'draft',
    },
    slug: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    userId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    content: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    tags: {
        type: Sequelize.TEXT,
        allowNull: true
    }
}, {
    sequelize: db,
    modelName: 'Post',
    tableName: 'posts',
    timestamps: true
});


module.exports = Post;