const sequelize = require('sequelize');
const connection = require('./db');

const User = connection.define('User', {
    id: {
        type: sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: sequelize.STRING,
        allowNull: false
    },
    email: {
        type: sequelize.STRING,
        unique: true,
        allowNull: false
    },
    password: {
        type: sequelize.STRING,
        allowNull: false
    }
});

User.sync({ force: false }).then(() => {
    console.log('Tabela de usuário criada');
});


module.exports = User;