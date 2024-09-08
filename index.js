const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');


const bodyParser = require('body-parser');

const connection = require('./db/db');

const perguntaModel = require('./db/perguntas');

const respostaModel = require('./db/respostas');

const User = require('./db/user');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

connection.
authenticate().
then(() => {
    console.log('Conexão feita com o banco de dados!');
}).
catch((msgErro) => {
    console.log(msgErro);
});

app.set('view engine', 'ejs');


app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());



app.get('/login', (req, res) => {
    res.render('login', { errorMessage: null });
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ where: { email } });

        if (!user || !bcrypt.compareSync(password, user.password)) {
            return res.render('login', { errorMessage: 'Email ou senha incorretos' });
        }

        const token = jwt.sign({ id: user.id }, 'secret_key', { expiresIn: '1h' });
        console.log(token);
        res.cookie('auth_token', token, { httpOnly: true });

        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.render('login', { errorMessage: 'Ocorreu um erro, tente novamente.' });
    }
});

app.get('/register', (req, res) => {
    res.render('register');
});

    
app.post('/register', async (req, res) => {
    console.log(req.body); 
    const { name, email, password } = req.body;

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    try {
        const user = await User.create({ name, email, password: hash });
        res.status(201).json({ message: 'Usuário registrado com sucesso!' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


    
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign({ id: user.id }, 'secret_key', { expiresIn: '1h' });

    res.json({ token });
});

const authenticateToken = (req, res, next) => {
    const token = req.cookies['auth_token'];

    if (!token) return res.status(401).json({ error: 'No token provided' });

    jwt.verify(token, 'secret_key', (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user; 
        console.log("aaaa", req.user.id);
        next();
    });
};



    
app.get('/questions', async (req, res) => {
    const perguntas = await Pergunta.findAll({ include: User });
    res.render('questions', { perguntas });
});






app.get('/question', (req, res) => {
    res.render('question.ejs');
});

app.get('/', (req, res) => {
    perguntaModel.findAll({ raw: true, order: [
        ['id', 'DESC']
    ] }).then(perguntas => {
        res.render('index.ejs', {
            perguntas: perguntas
        });
    });
});

app.get('/question/:id', (req, res) => {
    var id = req.params.id;
    perguntaModel.findOne({
        where: { id: id }
    }).then(pergunta => {
        if (pergunta != undefined) {

            respostaModel.findAll({
                where: { perguntaId: pergunta.id },
                order: [['id', 'DESC']]
            }).then(respostas => {
                res.render('detalhepergunta.ejs', {
                    pergunta: pergunta,
                    respostas: respostas
                });
            } );
        } else {
            res.redirect('/');
        }
    });
});

app.post('/responder', authenticateToken, (req, res) => {
    var corpo = req.body.corpo;
    var perguntaId = req.body.perguntaId;

    console.log("Dados recebidos no POST /responder:");
    console.log("corpo:", corpo);
    console.log("perguntaId:", perguntaId);

    respostaModel.create({
        corpo: corpo,
        perguntaId: perguntaId,
        UserId: req.user.id
    }).then(() => {
        console.log("Resposta salva com sucesso!");
        res.redirect('/question/' + perguntaId);
    }).catch((error) => {
        console.error("Erro ao salvar a resposta: ", error);
        res.redirect('/question/' + perguntaId); // Ou redirecione para uma página de erro
    });
});


app.post("/savequestion", authenticateToken, (req, res) => {
    var titulo = req.body.title;
    var descricao = req.body.description;

    console.log("Dados recebidos:");
    console.log("Título: " + titulo);
    console.log("Descrição: " + descricao);

    perguntaModel.create({
        titulo: titulo,
        descricao: descricao,
        UserId: req.user.id
    }).then(() => {
        console.log("Pergunta salva com sucesso!");
        res.redirect('/');
    }).catch((error) => {
        console.log("Erro ao salvar a pergunta: ", error);
        console.log("userId: ", req.user.id);
        res.redirect('/');
    });
});

app.get("/question/delete/:id", (req, res) => {
    var id = req.params.id;
    respostaModel.destroy({
        where: { id: id }
    }).then(() => {
        res.redirect('back');
    });
});

app.get("/", (req, res) => {
    res.render('index.ejs');
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

