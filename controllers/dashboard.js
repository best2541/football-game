const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const validate = require('../utilities/validate')
module.exports = {
    test: (req, res) => {
        res.send(req.user)
    },
    auth: (req, res) => {
        validate(req, ['username', 'password']).then(() => {
            knex('admin')
                .select('username', 'password')
                .where('username', req.body.username)
                .then(async result => {
                    if (result[0]) {
                        const { username, password } = result[0]
                        const validPassword = await bcrypt.compare(req.body.password, password);
                        if (validPassword) {
                            // Send JWT
                            const token = jwt.sign({ username, role: 'admin' }, process.env.SECRET, { expiresIn: '1d' })
                            return res.send({
                                "userData": {
                                    "role": "admin",
                                    "ability": [
                                        {
                                            "action": "manage",
                                            "subject": "all"
                                        }
                                    ],
                                },
                                "accessToken": token,
                            })
                        } else {
                            // handle error
                            res.send({ err: 'password ไม่ถูกต้อง' })
                        }
                    } else {
                        res.send({ err: 'username ไม่มีในระบบ' })
                    }
                })
        }).catch(err => res.send({ err }))
    },
    getProfile: (req, res, next) => {
        knex('profile')
            .select(['uid', 'phone', 'name', 'score'])
            .orderBy('score', 'desc')
            .then(result => {
                req.datas.users = result
                next()
            })
            .catch((err) => {
                res.status(500).send({ err: err.message })
            })
    },
    getDashboard: async (req, res, next) => {
        try {
            await knex('profile')
                .count('uid', { as: 'totalUsers' })
                .count('phone', { as: 'totalUsersPhone' })
                .then(result => {
                    req.datas.totalUsers = result[0]?.totalUsers
                    req.datas.totalUsersPhone = result[0]?.totalUsersPhone
                })
            await knex('play_record')
                .count('id', { as: 'allTimePlay' })
                .then(result => {
                    req.datas.allTimePlay = result[0]?.allTimePlay
                })
            await knex('play_record')
                .select('uid', 'create_date')
                .whereRaw('DATE(DATE_ADD(create_date, INTERVAL 11 HOUR)) = CURDATE()')
                .then(result => {
                    req.datas.playToday = result
                })
            await knex('profile')
                .count('uid', { as: 'usersPhonePlayToday' })
                .whereRaw('DATE(DATE_ADD(update_date, INTERVAL 11 HOUR)) = CURDATE() and phone IS NOT NULL')
                .then(result => {
                    req.datas.usersPhonePlayToday = result[0].usersPhonePlayToday
                })
            next()
        } catch (err) {
            console.log(err)
            res.status(500).send({ err: err.message })
        }
    },
    getTable: (req, res, next) => {
        try {
            const search = req.query.search
            db.query(`SELECT name, score, phone,
            @rank := @rank + 1
            'rank'
            FROM (
                SELECT name, phone, score
                FROM (
                    SELECT name, score, phone
                    FROM profile 
                    WHERE (name LIKE '%${search}%' OR phone LIKE '%${search}%') AND phone IS NOT NULL
                    ORDER BY score DESC 
					LIMIT 999
                )as a
            )as ranks,
            (SELECT @rank := 0)as ordr;`
                , async (err, result) => {
                    if (err) throw err
                    req.datas.ranking = result
                    next()
                })
        } catch (err) {
            res.status(500).send({ err: err.message })
        }
    },
    getReport: (req, res, next) => {
        try {
            const { search } = req.query
            db.query(`SELECT uid, name, phone, score, update_date,
            @rank := @rank + 1
            'rank'
            FROM (
                SELECT uid, name, phone, score, update_date
                FROM (
                    SELECT uid, name, score, update_date
                    FROM profile 
                    WHERE name LIKE '%${search || ''}%' OR phone LIKE '%${search || ''}%'
                    ORDER BY score DESC 
					LIMIT 999
                ) 'a'
            ) 'ranks',
            (SELECT @rank := 0) 'ordr';`
                , async (err, result) => {
                    if (err) throw err
                    req.datas.ranking = result
                    next()
                })
        } catch (err) {
            res.status(500).send({ err: err.message })
        }
    },
    getLogs: async (req, res, next) => {
        try {
            const { search, start, end } = req.query
            let query = knex('play_record').select('profile.phone', 'profile.name', 'play_record.score', 'play_record.device', 'play_record.create_date')
                .join('profile', 'play_record.uid', '=', 'profile.uid')
                .where(builder => {
                    builder.where('profile.phone', 'LIKE', `%${search}%`)
                    if (start.toString().length > 0 && end.toString().length > 0) {
                        let start2 = new Date(start)
                        start2.setDate(start2.getDate() - 1)
                        builder.andWhereBetween('play_record.create_date', [new Date(start2).toISOString().slice(0, 10) + ' 11:00:00', new Date(end).toISOString().slice(0, 10 + ' 12:59:59')])
                    }
                })
                .orWhere(builder => {
                    builder.where('profile.name', 'LIKE', `%${search}%`)
                    if (start.toString().length > 0 && end.toString().length > 0) {
                        let start2 = new Date(start)
                        start2.setDate(start2.getDate() - 1)
                        builder.andWhereBetween('play_record.create_date', [new Date(start2).toISOString().slice(0, 10) + ' 11:00:00', new Date(end).toISOString().slice(0, 10) + ' 12:59:59'])
                    }
                })
                .orWhere('profile.name', 'LIKE', `%${search}%`)
                .orderBy('create_date', 'desc')
            if (start && end) {
                let start2 = new Date(start)
                start2.setDate(start2.getDate() - 1)
                query.andWhere('play_record.create_date', '>', new Date(start2).toISOString().slice(0, 10) + ' 11:00:00')
                    .andWhere('play_record.create_date', '<', new Date(end).toISOString().slice(0, 10) + ' 12:59:59')
            }
            query.then(result => {
                req.datas.ranking = result
                next()
            })
        } catch (err) {
            console.log(err)
            res.status(500).send({ err: err.message })
        }
    },
    getReportByID: async (req, res, next) => {
        const { id } = req.params
        try {
            await knex('play_record')
                .select('score', 'device', 'create_date')
                .where('uid', id)
                .orderBy('create_date', 'desc')
                .then(result => {
                    req.datas.table = result
                })
            await knex.raw(`select a.name, b.rank, a.score, c.feq from (
                select name, score from profile where uid = '${id}'
                ) 'a',
                (
                select COUNT(uid)+1 'rank' from profile where phone is not null AND score > (select score from profile where uid = '${id}')
                ) 'b',
                (
                select COUNT(id) 'feq' from play_record where uid = '${id}'
                ) 'c'`)
                .then(result => {
                    req.datas.report = result[0][0]
                    next()
                })
        } catch (err) {
            res.status(500).send({ err: err.message })
        }
    }
}