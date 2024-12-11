// global var - Userdata
var userObj = null;
var credentials = null;
const CRED_HANDLE = 'credentials';

function saveToken(obj) {
    console.log('Saving credentials to session');
    setJSONSessionItem(CRED_HANDLE, obj);
}

function removeToken() {
    console.log('Removing credentials from session');
    removeSessionItem(CRED_HANDLE);
}

function getTokenObj() {
    return getJSONSessionItem(CRED_HANDLE);
}

function jumpToLogin() {
    console.log('Jumping to login page');
    document.location.href = 'login.html';
}

function validateTokenExistence() {
    console.log('Validating existence of credentials');

    // if nothing in session we can break away
    if (!existsSessionItem(CRED_HANDLE)) {
        console.log('No credentials in session found, break away');
        jumpToLogin();
    } else {
        console.log('Credentials found in session');
    }
}

function getAuthorizationObject() {
    return { 'Authorization': 'Bearer ' + getTokenObj().token }
}

$(document).ready(function() {

    // process logout
    $('#logoutButton').click(function() {
        removeToken();
        jumpToLogin();
    });
});