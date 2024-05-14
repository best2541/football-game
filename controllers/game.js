const jwt = require('jsonwebtoken')
const validate = require('../utilities/validate')
const DeviceDetector = require('device-detector-js')
const BotDetector = require('device-detector-js/dist/parsers/bot')

const deviceDetector = new DeviceDetector();
const botDetector = new BotDetector();

module.exports = {
    init: (req, res, next) => {
        req.data = {}
        next()
    },
    auth: (req, res, next) => {
        try {
            const decodedToken = jwt.decode(req.body.token)
            db.query(`
            select a.rank + b.rank + 1 'rank', c.phone , c.score FROM
(select count(uid) 'rank' from profile where score >(select score from profile where uid ='${decodedToken.sub}') and phone is not null) as a,
(select count(uid) 'rank' from profile where score =(select score from profile where uid ='${decodedToken.sub}') and update_date < (select update_date from profile where uid = '${decodedToken.sub}') and phone is not null) as b,
(select phone, profile.score from profile where uid = '${decodedToken.sub}') as c`
                , (err, result) => {
                    if (err) res.status(400).send({ err: err.message })
                    if (result.length > 0) {
                        console.log('test!!!!!!!!!!!!!!!!')
                        decodedToken.phone = result[0].phone
                        decodedToken.rank = result[0].rank
                        decodedToken.score = result[0].score
                    }
                    res.send(decodedToken)
                }
            )
        } catch (err) {
            res.status(500).send({ err: err.message })
        }
    },
    getServerStatus: (req, res, next) => {
        db.query(`select server_status.status 'server_status' from server_status`
            , (err, result) => {
                if (err) res.status(400).send({ err: err.message })
                req.datas.server_status = result[0]
                next()
            })
    },
    getSetting: (req, res, next) => {
        db.query('select level, time_limit_level from hard_setting'
            , (err, result) => {
                if (err) res.status(400).send({ err: err.message })
                req.datas.setting = result[0]
                next()
            })
    },
    getstart: (req, res, next) => {
        db.query(`select profile.uid , profile.phone , profile.name , profile.score , hard_setting.time_limit_level from profile CROSS JOIN hard_setting where profile.uid = '${req.query.uid}'`
            , (err, result) => {
                if (err) res.status(400).send({ err: err.message })
                req.datas.user = result
                next()
            })
    },
    save: (req, res, next) => {
        const { uid, token, name } = req.body
        req.body.score = atob(token)
        const userAgent = req.headers['user-agent']
        const bot = botDetector.parse(userAgent)
        if (bot)
            res.status(402).send({ err: 'bot detected' })

        const device = deviceDetector.parse(userAgent)?.os?.name
        try {
            validate(req, ['uid', 'name', 'token'])
                .then(() => {
                    if (score === '-999') {
                        db.execute(`insert into profile (uid,score,name) values (?,?,?) on DUPLICATE key update score = score+${score}, update_date = CURRENT_TIMESTAMP()`,
                            [uid.toString(), score.toString(), name]
                            ,
                            (err, result2) => {
                                if (err) console.log('err2', err)
                                if (err) throw err
                                res.send('ok')
                            })
                    } else {
                        db.query(
                            `insert into play_record (uid,score,device) values ('${uid}', ${score},'${device}')`
                            , (err, result) => {
                                if (err) console.log('err1', err)
                                if (err) throw err
                                db.execute(`insert into profile (uid,score,name) values (?,?,?) on DUPLICATE key update score = score+${score}, update_date = CURRENT_TIMESTAMP()`,
                                    [uid.toString(), score.toString(), name]
                                    ,
                                    (err, result2) => {
                                        if (err) console.log('err2', err)
                                        if (err) throw err
                                        res.send('ok')
                                    })
                            }
                        )
                    }
                })
                .catch(() => {
                    validate(req, ['uid', 'phone', 'token'])
                        .then(() => {
                            db.query(`update profile set phone = '${(req.body.phone).toString()}', score = ${req.body.score}, update_date = CURRENT_TIMESTAMP() where uid = '${req.body.uid}'`
                                , (err, result) => {
                                    if (err) throw err
                                    db.query(`SELECT a.name, a.phone, b.rank + c.rank + 1 'rank', a.score 
                                    FROM (
                                        SELECT name, phone, score 
                                        FROM profile 
                                        WHERE uid = '${req.body.uid}'
                                    ) AS a
                                    CROSS JOIN (
                                        SELECT COUNT(uid) 'rank'
                                        FROM profile 
                                        WHERE score > (SELECT score FROM profile WHERE uid = '${req.body.uid}') and phone is not null
                                    ) AS b
                                    CROSS JOIN (
                                        select count(uid) 'rank' 
                                        from profile 
                                        where score =(select score from profile where uid ='${req.body.uid}' and update_date < (select update_date from profile where uid = '${req.body.uid}') and phone is not null)
                                    ) AS c`, (err, result) => {
                                        if (err) throw err
                                        res.send(result[0])
                                    })
                                })
                            db.query(
                                `insert into play_record (uid,score,device) values ('${uid}', ${score},'${device}')`
                                , (err, result) => {
                                    if (err) throw err
                                }
                            )
                        })
                        .catch(err2 => res.status(400).send({ err: err2.message }))
                })
        } catch (err) {
            res.status(500).send({ err: err.message })
        }
    },
    getRanking: (req, res, next) => {
        try {
            const uid = req.query.uid
            db.query(`SELECT role, name, score, phone, @rank := @rank + 1 'rank'
            FROM (
                SELECT role, name, score, phone
                FROM (
                    SELECT IF(uid = '${uid}', 'you', '') 'role', name, score, phone
                    FROM profile 
                    WHERE phone IS NOT NULL
                    ORDER BY score DESC , update_date ASC
                    LIMIT 999
                ) AS a
            ) AS ranks,
            (SELECT @rank := 0) AS ordr;
            `
                , async (err, result) => {
                    if (err) throw err
                    req.datas.ranking = result
                    const yourRank = await result.filter(x => x.role == 'you')
                    if (yourRank.length === 0) {
                        db.query(`select '999+' 'role', name, phone, score from profile where uid = '${uid}' and phone is not null`
                            , (err, yourResult) => {
                                if (err) throw err
                                req.datas.yourRank = yourResult
                                next()
                            })
                    } else {
                        next()
                    }
                })
        } catch (err) {
            res.status(500).send({ err: err.message })
        }
    }
}