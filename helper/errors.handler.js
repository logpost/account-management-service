const response = (responseData, res) => {
  let responseCode = res.header('Content-Type', 'application/json;charset=utf-8').status(200)

  if ('error' in responseData) {
    switch (responseData.error.code) {
      case 400: {
        responseCode = res.header('Content-Type', 'application/json;charset=utf-8').status(responseData.error.code)
        break
      }
      case 403: {
        responseCode = res.header('Content-Type', 'application/json;charset=utf-8').status(responseData.error.code)
        break
      }
      case 404: {
        responseCode = res.header('Content-Type', 'application/json;charset=utf-8').status(responseData.error.code)
        break
      }
      default: {
        responseCode = res.header('Content-Type', 'application/json;charset=utf-8').status(500)
        break
      }
    }
  }
  return responseCode
}
export default { response }
