// stuff for jsonwebtoken library
// details: https://www.npmjs.com/package/jsonwebtoken
const algorithm = 'HS512';
const secret = 'SUPERgeheimesPASSWORT';
const max_age = '1h';

exports.TOKEN_ALGORITHM = algorithm;
exports.TOKEN_SECRET = secret;
exports.TOKEN_MAX_AGE = max_age;