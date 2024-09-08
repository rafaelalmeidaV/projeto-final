const Sequelize = require('sequelize');

const connection = new Sequelize('projetopratico', 'root', '3443', {
    host: 'localhost',
    dialect: 'mysql'
});

module.exports = connection;

