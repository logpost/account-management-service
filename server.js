import express from 'express'
import MongoAdapter from './adapters/mongo.adapter'
import config from './config'
import UserRoute from './routes/user.router'
const app = express()
const port = 5000

const db = {
    username: config.db.mongo.username,
    password: config.db.mongo.password,
    host: config.db.mongo.host,
    port: parseInt(`${config.db.mongo.port}`, 10) ?? 27017,
    dbName: config.db.mongo.name,
    authName: config.db.mongo.auth,
  }

new MongoAdapter(db.username, db.password, db.host, db.port, db.dbName, db.authName)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/', UserRoute)

app.listen(port, () => {
console.log(`Example app listening at http://localhost:${port}`)
})