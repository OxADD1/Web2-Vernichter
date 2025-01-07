// include jwt library
const jwt = require('jsonwebtoken');

// get settings from file
const { TOKEN_ALGORITHM, TOKEN_SECRET, TOKEN_MAX_AGE } = require('./tokenSettings.js');

// function encrypts given data as an token and returns it
// is available as export function
module.exports.encrypt = function(dataToEncrypt) {
    console.log('creating token with data', dataToEncrypt);
    var encrypted = jwt.sign(dataToEncrypt, TOKEN_SECRET, { algorithm: TOKEN_ALGORITHM, expiresIn: TOKEN_MAX_AGE });

    console.log('token created and encrypted');
    return encrypted;
};