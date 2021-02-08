const Sequelize = require('sequelize');
const Model = Sequelize.Model;
const db = require('../../config/db');

class CounsellorSetting extends Model {}

CounsellorSetting.init({
    // attributes
    chat_price: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: false
    },
    video_price: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: false
    },
    call_price: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: false
    },
    share_percentage: {
        type: Sequelize.INTEGER,
        allowNull: true,
        unique: false
    }

}, {
    sequelize: db,
    modelName: 'CounsellorSetting',
    tableName: 'counsellorsettings',
    timestamps: true
});

module.exports = CounsellorSetting;