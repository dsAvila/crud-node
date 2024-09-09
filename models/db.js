const Sequelize = require('sequelize');
const sequelize = new Sequelize('crud-node', 'root', '', {
    host: '127.0.0.1',
    dialect: 'mysql',
    define: {
        charset: 'utf8',
        collate: 'utf8_general_ci',
        timestamps: true
    },
    logging: false
})

// Testando a conexão com o banco
// sequelize.authenticate().then(function(){
//     console.log('Conectado com o banco com sucesso!');
// }).catch(function(err){
//     console.log('Falha ao se conectar: '+err);
// })

module.exports = { Sequelize, sequelize }