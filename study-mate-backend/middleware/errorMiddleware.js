const notFound = (req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`)
  error.statusCode = 404
  next(error)
}

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || res.statusCode || 500

  if (statusCode >= 500) {
    console.error(err.stack || err.message)
  }

  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
  })
}

module.exports = { notFound, errorHandler }
