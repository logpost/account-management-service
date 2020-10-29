import express from 'express'
import config from './config'

import NodeMailerAdapter from './adapters/nodemailer.adapter'
import AccountRoute from './routes/account.router'

const app = express()
const port = config.app.port
const domain = config.app.domain

NodeMailerAdapter.getInstance()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/', AccountRoute)

app.listen(port, () => {
console.log(`Account Management Service 👨🏼‍💻👩🏾‍💻\nApp listening on the http://${domain}:${port} 🌟`)
})