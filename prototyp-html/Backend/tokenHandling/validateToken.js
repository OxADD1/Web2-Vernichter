// include jwt library
const jwt = require('jsonwebtoken');

// get settings from file
const { TOKEN_ALGORITHM, TOKEN_SECRET, TOKEN_MAX_AGE } = require('./tokenSettings.js');

// function validates token and return the userId which is the payload of the token
// token has to be in the header of the http request under label authorization and has to be have a prefix, Bearer
// is available as export function
module.exports = function (request, response, next) {
    console.log('Middleware for validating token was called');

    // first check if correct header attribute is set
    if (request.headers['authorization'] === undefined) {
        console.log('Authorization attribute not found in header');
        response.status(401).json({ 'fehler': true, 'nachricht': 'Token was not provided' });
        return;
    }

    // now get content of attribute and check if prefix is present
    // and length is at least 50 chars
    var tmp = request.headers['authorization'];
    if (!tmp.startsWith('Bearer') || tmp.length < 50) {
        console.log('Authorization attribute has invalid format');
        response.status(401).json({ 'fehler': true, 'nachricht': 'Token format mismatch' });
        return;
    }

    // now remove the prefix and validate if token is valid
    tmp = tmp.slice(7);
    try {
        console.log('Verifying found Token');
        var decrypted = jwt.verify(tmp, TOKEN_SECRET, { algorithm: TOKEN_ALGORITHM, expiresIn: TOKEN_MAX_AGE });
        console.log('Token successfully decrypted and is valid, created, validTill', decrypted.iat, decrypted.exp);
    } catch (ex) {
        console.log('Validation failed');
        response.status(401).json({ 'fehler': true, 'nachricht': 'Token is not valid' });
        return;
    }

    // everything is ok, remember the userId from token in request object for Service Method
    request.userId = decrypted.userId;
    console.log('Remembered userId', request.userId);
    next();
}