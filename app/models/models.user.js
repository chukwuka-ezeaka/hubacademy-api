const Sequelize = require('sequelize');
const Model = Sequelize.Model;
const db = require('../../config/db');
const UserRole = require('./models.user_role');
const Role = require('./models.role');
const ContentCategory = require('./models.contentcategory');
const LikeCounter = require('./models.likecounter');
const Subscription = require('./models.subscription');
class User extends Model {}

User.init({
    name: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: false
    },
    firstname: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: false
    },
    lastname: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: false
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    phone: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
    },
    online: {
        type: Sequelize.INTEGER,
        allowNull: true,
        unique: false
    },
    address: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: false
    },
    about: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: false
    },
    pitch_video_link: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: false
    },
    years_of_experience: {
        type: Sequelize.INTEGER,
        allowNull: true,
        unique: false
    },
    photo: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: false
    },
    active: {
        type: Sequelize.INTEGER,
        allowNull: true,
        unique: false
    },
    category_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        unique: false,
        references: {
            // This is a reference to another model
            model: 'Category',

            // This is the column name of the referenced model
            key: 'id'
        }
    },
    verified: {
        type: Sequelize.INTEGER,
        allowNull: true,
        unique: false
    },
    verifiedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        unique: false
    },
    username: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
    },
    country_name: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: false
    },
    birthday: {
        type: Sequelize.DATE,
        allowNull: true,
        unique: false
    },
    bank_code: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: false
    },
    bank_name: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: false
    },
    bank_account: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: false
    },
    recipient_code: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: false
    },
    resetPasswordToken: {
        type: Sequelize.STRING,
        required: false,
        allowNull: true,
    },
    fcmTokenMobile: {
        type: Sequelize.STRING,
        required: false,
        allowNull: true,
    },
    fcmTokenWeb: {
        type: Sequelize.STRING,
        required: false,
        allowNull: true,
    },
    resetPasswordExpires: {
        type: Sequelize.DATE,
        required: false,
        allowNull: true,
    }
}, {
    sequelize: db,
    modelName: 'User',
    tableName:'users',
    timestamps: true,
    scopes: {
        authors: {
            include: [
                {model: UserRole, where:{roleId: 99},include:  [{model:Role,attributes: ['name','id'],
                        }],  attributes: ['roleId']},
                {model: ContentCategory,as:'category'},
                {
                    model:LikeCounter,
                    as:'likeCount',
                    attributes: ['count']
                },
                {
                    model:Subscription
                }
            ],
            attributes: [ ['name','fullname'], 'firstname', 'lastname', 'email', 'id', 'phone','photo','username', 'country_name','birthday','createdAt','online','address','years_of_experience','pitch_video_link', 'active','verified','verifiedAt']
        }
    }
});

module.exports = User;
