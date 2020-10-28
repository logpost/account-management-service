import express from 'express'
import config from './config'

import NodeMailerAdapter from './adapters/nodemailer.adapter'
import AccountRoute from './routes/account.router'

const app = express()
const port = config.app.port

NodeMailerAdapter.getInstance()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/', AccountRoute)

app.listen(port, () => {
console.log(`Example app listening at http://localhost:${port}`)
})