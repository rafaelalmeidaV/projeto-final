const sequelize = require('sequelize');
const connection = require('./db');
const User = require('./user');
const Pergunta = require('./perguntas');

const resposta = connection.define('respostas', {
    corpo: {
        type: sequelize.TEXT,
        allowNull: false
    },
    perguntaId: {
        type: sequelize.INTEGER,
        allowNull: false
    },
    UserId: {
        type: sequelize.INTEGER,
        allowNull: false
    }
});

User.hasMany(resposta);
resposta.belongsTo(User);

Pergunta.hasMany(resposta);
resposta.belongsTo(Pergunta);

resposta.sync({ force: false }).then(() => {
    console.log('Tabela de resposta criada');
});

module.exports = resposta;