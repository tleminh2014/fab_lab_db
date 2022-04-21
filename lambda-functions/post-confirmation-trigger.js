const AWS = require('aws-sdk');

const cognito = new AWS.CognitoIdentityServiceProvider();


// function places a newly created user in Fab-Lab user pool in User-Group: Other. To move a specific user to the Admin User-Group, you will need to manually do so through
// the Cognito console
exports.handler = (event, context, callback) => {
    console.log(event);
    
    const params = {
        GroupName: 'Other',
        Username: event.userName,
        UserPoolId: event.userPoolId,
    };
    
    cognito.adminAddUserToGroup(params, (err, data) => {
        if (err) {
            callback(err);
        } else {
            callback(null, event);
        }
    });
};