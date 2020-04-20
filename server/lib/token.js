const { TOKEN_SECRET, TOKEN_EXPIRESIN } = require('../config')
const jwt = require('jsonwebtoken')

exports.createToken = info => {
  const token = jwt.sign(info, TOKEN_SECRET, { expiresIn: TOKEN_EXPIRESIN })
  return token
}

const decodeToken = ctx => {
  const authorizationHeader = ctx.headers['authorization']
  if (!authorizationHeader || authorizationHeader.length === 0) return null;
  const token = authorizationHeader.split(' ')[1] // 取到 token
  return jwt.decode(token)
}

exports.decodeToken = decodeToken
