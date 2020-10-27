import { connect, connection } from 'mongoose'

class MongoAdapter {
  database = null

  constructor(username, password, host, post, dbName, authName) {
    
    connect(`mongodb://${host}:${post}/${dbName}?authSource=${authName}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    
    // connect(`mongodb://${username}:${password}@${host}:${post}/${dbName}?authSource=${authName}`, {
    //   useNewUrlParser: true,
    //   useUnifiedTopology: true,
    // })

    this.database = connection
    this.database.on('open', this.connected)
    this.database.on('error', this.error)
  }

   connected = () => {
    console.log('Mongoose has connected')
  }

  error = (error) => {
    console.log('**** error [mongodb] : ', error)
    throw error
  }
}

export default MongoAdapter
