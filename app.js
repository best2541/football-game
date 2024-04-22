require('dotenv').config()
const express = require('express')
const app = express()
const mysql = require('mysql2')
const cors = require('cors')
const path = require("path")
const encrypt = require('./utilities/encrypt')

app.use(express.json())
app.use(express.urlencoded())
app.use(cors())

const options = {
    client: 'mysql2',
    connection: {
        host: process.env.HOST,
        user: process.env.ROOT,
        password: process.env.PASSWORD,
        database: process.env.DATABASE
    }
}
const knex = require('knex')(options)
global.knex = knex

const db = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.ROOT,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
})
global.db = db
app.use('/game', require('./routes/game.js'))
app.use('/dashboard', require('./routes/dashboard.js'))

app.get('/test', (req, res) => {
    res.send('test : ok')
})

app.get('/schema', (req, res) => {
    knex.schema.createTable('admin', (table) => {
        table.string('username').primary()
        table.string('password').notNullable()
        table.datetime('create_at').defaultTo(knex.raw('(CURRENT_TIMESTAMP())'))
    })
        .then(() => console.log('admin created'))
        .finally(async () => {
            const ps = await encrypt('password').then(result => result)
            knex('admin')
                .insert({ username: 'admin', password: ps })
                .then(() => console.log('admin data inserted'))
                .catch(() => console.log('admin data skip'))
        })
        .catch(() => console.log('admin skip'))
    knex.schema.createTable('profile', (table) => {
        table.string('uid', 255).primary(),
            table.string('phone', 11),
            table.string('name', 50),
            table.integer('score').defaultTo(0),
            table.timestamp('create_date').defaultTo(knex.raw('(CURRENT_TIMESTAMP())')),
            table.timestamp('update_date').defaultTo(knex.raw('(CURRENT_TIMESTAMP())'))
    })
        .then(() => console.log('profile created'))
        .catch((err) => console.log('profile skip'))
    knex.schema.createTable('play_record', (table) => {
        table.increments('id').primary(),
            table.string('uid', 255).notNullable(),
            table.string('device', 50),
            table.integer('score').defaultTo(0).notNullable(),
            table.timestamp('create_date').defaultTo(knex.raw('(CURRENT_TIMESTAMP())'))
    })
        .then(() => console.log('play_record created'))
        .catch(err => console.log('play_record skip'))

    knex.schema.createTable('hard_setting', (table) => {
        table.float('level').primary()
    })
        .then(() => {
            console.log('hard_setting created')
            knex('hard_setting')
                .insert({ level: 0.5 })
                .then(() => console.log('hard_setting data inserted'))
                .catch(() => console.log('hard_setting data skip'))
        })
        .catch(err => console.log('hard_setting skip'))
    knex.schema.createTable('server_status', (table) => {
        table.boolean('status').primary().defaultTo(0)
    }).then(() => {
        console.log('server_status created')
        knex('server_status').insert({ status: 0 })
            .then(() => console.log('server_status datas inserted'))
            .catch(() => console.log('server_status datas skip'))
    })
        .catch(err => console.log('server_status skip'))
    res.send('status : ok')
})
app.get('/1', async (req, res) => {
    db.query(
        'SELECT uid,score FROM profile',
        function (err, results, fields) {
            res.send(results);
        }
    )
})
app.get('/2', (req, res) => {
    db.query(
        'SELECT uid, SUM(score) AS total_score FROM log GROUP BY uid',
        (err, result) => {
            res.send(result)
        }
    )
})
app.post('/save1', (req, res) => {
    const { uid, score } = req.body
    db
        .query(`insert into log (uid, score) values (${uid}, ${score})`
            , (err, result) => {
                if (err) throw err
                res.send('ok')
            })
})
app.post('/save2', (req, res) => {
    const { uid, score, name, phone } = req.body
    db.query(
        `insert into play_record (uid,score) values (${uid}, ${score})`
        , (err, result) => {
            if (err) throw err
            db.query(`insert into profile (uid,score,name,phone) values (${uid},${score},'${name}',${phone}) on DUPLICATE key update score = score+${score}`,
                (err, result2) => {
                    if (err) throw err
                    res.send('ok')
                })
        }
    )
})

app.use(express.static("./web"));
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, './web/index.html'));
})
app.listen(3000, () => {
    console.log('app is running')
})