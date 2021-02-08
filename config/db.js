const dotenv = require('dotenv');
dotenv.config();
const Sequelize = require('sequelize');
const db_user = process.env.DB_USER
const db_pass = process.env.DB_PASS
const db_host = process.env.DB_HOST
const db_port = process.env.DB_PORT
const db_name = process.env.DB_NAME

const db = new Sequelize(db_name, db_user, db_pass, {
    logging: false,
    host: db_host,
    dialect: 'mysql',
    // timezone:'+01:00',
    // dialectOptions: {
    //     timezone:'+01:00'
    // },
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    port:db_port
});

// const db = new Sequelize({
//     dialect: 'sqlite',
//     storage: './database.sqlite'
// });

// const db = new Sequelize("mysql://fcmb:centricgwsbit_138#_123@fcmb.cr6kme5bqnc9.us-east-2.rds.amazonaws.com:3306/ReleaseNotes");

db
    .authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err.message);
        throw new Error(err.message)
    });

db.addHook('beforeCount', function (options) {
    if (this._scope.include && this._scope.include.length > 0) {
        options.distinct = true
        options.col = this._scope.col || options.col || `"${this.options.name.singular}".id`
    }

    if (options.include && options.include.length > 0) {
        options.include = null
    }
})

module.exports = db;
