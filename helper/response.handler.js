import errorHandler from './errors.handler'
import parseResponse from './response.parser'

const responseSender = async (data, res) => {
  res = await errorHandler.response(data, res)
  res.send(data)
}

const responseHandler = async (next, res) => {
  try {
    const data = await next()
    responseSender(parseResponse(data), res)
  } catch (error) {
    responseSender(parseResponse(error), res)
  }
}

export default responseHandler
