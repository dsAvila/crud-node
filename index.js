const express = require('express');
const app = express();
const hbs = require('express-handlebars');
const bodyParser = require('body-parser');
const session = require('express-session');
const PORT = process.env.PORT || 3000;

// Configuração do Handlebars
app.engine('hbs', hbs.engine({
    extname: 'hbs',
    defaultLayout: 'main'
})); app.set('view engine', 'hbs');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));

// Importar model user
const User = require('./models/User');
const { where } = require('sequelize');

// Configuração das sessions
app.use(session({
    secret: 'CriarUmaChaveQualquer1234',
    resave: false,
    saveUninitialized: true
}))

app.get('/', (req, res) => {
    if (req.session.errors) {
        var arrayErr = req.session.errors;
        req.session.errors = "";
        return res.render('index', { NavActiveCad: true, error: arrayErr });
    }

    if (req.session.success) {
        req.session.success = false;
        return res.render('index', { NavActiveCad: true, MsgSuccess: true });
    }

    res.render('index', { NavActiveCad: true });
})

app.get('/users', (req, res) => {
    User.findAll().then(function (values) {
        // console.log(values.map(values => values.toJSON()));
        if (values.length > 0) {
            return res.render('users', { NavActiveUsers: true, table: true, users: values.map(values => values.toJSON()) });
        } else {
            res.render('users', { NavActiveUsers: true, table: false });
        }
    }).catch(function (err) {
        console.log(`Houve um problema: ${err}`);
    })
    // res.render('users', { NavActiveUsers: true });
})

app.post('/edit', (req, res) => {
    var id = req.body.id;
    User.findByPk(id).then(function (dados) {
        return res.render('edit', { error: false, id: dados.id, name: dados.name, email: dados.email });
    }).catch((err) => {
        console.log(err);
        return res.render('edit', { error: true, problem: 'Não é possível editar este registro' });
    });
    // res.render('edit');
})

app.post('/reg', (req, res) => {
    // Valores vindos do formulário
    var name = req.body.name;
    var email = req.body.email;

    // Array que vai conter os erros
    const err = [];

    // Remover os espaços em branco antes e depois
    name = name.trim();
    email = email.trim();

    // Limpar o nome de caracteres especiais
    name = name.replace(/[^A-zÀ-ú\s]/gi, '');
    name = name.trim();

    // Verificar se esta vazio ou não campo
    if (name == '' || typeof name == undefined || name == null) {
        err.push({ message: "Campo nome não pode ser vazio!" });
    }

    // Verificar se o campo nome é válido (APENAS LETRAS)
    if (!/^[A-Za-záàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ\s]+$/.test(name)) {
        err.push({ message: "Nome inválido!" });
    }

    // Verificar se esta vazio ou não campo
    if (email == '' || typeof email == undefined || email == null) {
        err.push({ message: "Campo email não pode ser vazio!" });
    }

    // Verificar se email é válido
    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\w{2,3})+$/.test(email)) {
        err.push({ message: "Campo email inválido" });
    }

    if (err.length > 0) {
        console.log(err);
        req.session.errors = err;
        req.session.success = false;
        return res.redirect('/');
    }

    // Sucesso nenhum erro
    // Salvar no banco de dados
    User.create({
        name: name,
        email: email.toLowerCase()
    }).then(function () {
        console.log('Cadastrado com sucesso!');
        req.session.success = true;
        return res.redirect('/');
    }).catch(function (err) {
        console.log(`Ops, houve um erro: ${err}`);
    })
})

app.post('/update', (req, res) => {
    // Valores vindos do formulário
    var name = req.body.name;
    var email = req.body.email;

    // Array que vai conter os erros
    const err = [];

    // Remover os espaços em branco antes e depois
    name = name.trim();
    email = email.trim();

    // Limpar o nome de caracteres especiais
    name = name.replace(/[^A-zÀ-ú\s]/gi, '');
    name = name.trim();

    // Verificar se esta vazio ou não campo
    if (name == '' || typeof name == undefined || name == null) {
        err.push({ message: "Campo nome não pode ser vazio!" });
    }

    // Verificar se o campo nome é válido (APENAS LETRAS)
    if (!/^[A-Za-záàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ\s]+$/.test(name)) {
        err.push({ message: "Nome inválido!" });
    }

    // Verificar se esta vazio ou não campo
    if (email == '' || typeof email == undefined || email == null) {
        err.push({ message: "Campo email não pode ser vazio!" });
    }

    // Verificar se email é válido
    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\w{2,3})+$/.test(email)) {
        err.push({ message: "Campo email inválido" });
    }

    if (err.length > 0) {
        console.log(err);
        return res.status(400).send({ status: 400, err: errors });
    }

    // Sucesso nenhum erro
    // Atualizar registro no banco de dados
    User.update(
        {
            name: name,
            email: email.toLowerCase()
        },
        {
            where: {
                id: req.body.id
            }
        }).then((result) => {
            console.log(result);
            return res.redirect('/users');
        }).catch((err) => {
            console.log(err);
        })
})

app.post('/del', (req, res) => {
    User.destroy({
        where: {
            id: req.body.id
        }
    }).then((retorno) => {
        return res.redirect('/users');
    }).catch((err)=>{
        console.log(err);
    })
})

app.listen(PORT, () => {
    console.log('Servidor rodando em http://localhost:' + PORT);
})