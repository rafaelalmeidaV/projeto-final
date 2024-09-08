const sequelize = require('sequelize');
const connection = require('./db');
const User = require('./user');

const pergunta = connection.define('perguntas', {
    titulo: {
        type: sequelize.STRING,
        allowNull: false
    },
    descricao: {
        type: sequelize.TEXT,
        allowNull: false
    },
    UserId: {
        type: sequelize.INTEGER,
        allowNull: false
    }
    
});



pergunta.sync({ force: false }).then(() => {
    console.log('Tabela de pergunta criada');
});

module.exports = pergunta;