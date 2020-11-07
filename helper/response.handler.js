import errorHandler from './errors.handler'
import parseResponse from './response.parser'

export const responseSender = async (data, res) => {
  res = await errorHandler.response(parseResponse(data), res)
  res.send(data)
}

const responseHandler = async (next, res) => {
  try {
    const data = await next()
    responseSender(data, res)
  } catch (error) {
    responseSender(error, res)
  }
}

export default responseHandler
