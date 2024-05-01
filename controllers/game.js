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
            db.query(`select phone from profile where uid = '${decodedToken.sub}'`
                , (err, result) => {
                    if (err) res.status(400).send({ err: err.message })
                    if (result.length > 0) {
                        decodedToken.phone = result[0].phone
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
    getstart: (req, res, next) => {
        db.query(`select profile.uid , profile.phone , profile.name , profile.score , hard_setting.* from profile CROSS JOIN hard_setting where profile.uid = '12345'`
            , (err, result) => {
                if (err) res.status(400).send({ err: err.message })
                req.datas.user = result
                next()
            })
    },
    save: (req, res, next) => {
        try {
            validate(req, ['uid', 'score', 'name'])
                .then(() => {
                    const { uid, score, name } = req.body
                    const userAgent = req.headers['user-agent']
                    const bot = botDetector.parse(userAgent)
                    if (bot)
                        res.status(402).send({ err: 'bot detected' })

                    const device = deviceDetector.parse(userAgent)?.os?.name
                    db.query(
                        `insert into play_record (uid,score,device) values ('${uid}', ${score},'${device}')`
                        , (err, result) => {
                            if (err) console.log('err1', err)
                            if (err) throw err
                            db.query(`insert into profile (uid,score,name) values ('${uid}',${score},'${name}') on DUPLICATE key update score = score+${score}, update_date = CURRENT_TIMESTAMP()`,
                                (err, result2) => {
                                    if (err) console.log('err2', err)
                                    if (err) throw err
                                    res.send('ok')
                                })
                        }
                    )
                })
                .catch(() => {
                    validate(req, ['uid', 'phone'])
                        .then(() => {
                            db.query(`update profile set phone = '${(req.body.phone).toString()}', update_date = CURRENT_TIMESTAMP() where uid = '${req.body.uid}'`
                                , (err, result) => {
                                    if (err) throw err
                                    db.query(`SELECT a.name, a.phone, b.rank, a.score 
                                    FROM (
                                        SELECT name, phone, score 
                                        FROM profile 
                                        WHERE uid = '${req.body.uid}'
                                    ) AS a
                                    CROSS JOIN (
                                        SELECT COUNT(uid) + 1 'rank'
                                        FROM profile 
                                        WHERE uid = '${req.body.uid}' AND score >= (SELECT score FROM profile WHERE uid = '${req.body.uid}')
                                    ) AS b;`, (err, result) => {
                                        if (err) throw err
                                        res.send(result[0])
                                    })
                                })
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
                    ORDER BY score DESC 
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