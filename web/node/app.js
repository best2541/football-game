const express = require('express')
const app = express()
const axios = require('axios')

axios.post('https://api.line.me/oauth2/v2.1/token', {
    grant_type: 'authorization_code',
    code: 'ZaUZ8saFkYzVVncbJSnd',
    redirect_uri: 'https://central-game.ants.co.th',
    client_id: '2004588192',
    client_secret: '792518900ce4dca2b5b90f0768840180'
}, {
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
}
).then(result => console.log('test', result))

app.use(express.json())
app.get('/', (req, res) => {
    console.log('test')
    console.log(req.query.time)
})

app.post('/', (req, res) => {
    console.log(req.body)
    res.send(req.body)
})

app.listen(3000, () => {
    console.log('running')
})