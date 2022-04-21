console.log('starting function');
// const randomBytes = require('crypto').randomBytes;

const AWS = require('aws-sdk');

const docClient = new AWS.DynamoDB.DocumentClient();

//Cognito User pools authorizer is used in this function via auth token in the request context
exports.handler = function(event, context, callback) {
    if (!event.requestContext.authorizer) {
      errorResponse('Authorization not configured', context.awsRequestId, callback);
      return;
    }
    
    
    const requestBody = JSON.parse(event.body);
    const username = requestBody.username;
    const equipment_ID = requestBody.equipment_ID;
    
    checkinEquipment(context, callback, username,equipment_ID);
    
};



// transformation function that calls both update functions
function checkinEquipment(context, callback, username, equipment_ID) {
    updateAccount(callback, username);
    updateEquipment(username, equipment_ID).then(() => {
        callback(null, {
            statusCode: 201,
            body: JSON.stringify({
                equipment_ID: equipment_ID,
                user_RFID: username,
            }),
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
        });
    }).catch((err) => {
        console.error(err);
        errorResponse(err.message, context.awsRequestId, callback);
    });
    
}

//function updates equipment entry in Equipment table to reset entry
function updateEquipment(username, equipment_ID) {
    return docClient.update({
        TableName: 'Equipment',
        Key: {equipment_ID},
        UpdateExpression: "set in_use = :T, current_user = :U",
        ExpressionAttributeValues: {
            ":T": false,
            ":U": ''
        },
        ReturnValues: "UPDATED_NEW"
    }).promise();
    
}

//function decrements the account entry's equipment limit by 1
function updateAccount(callback, username) {
    return docClient.update({
        TableName: 'Account',
        Key: {
            'user_RFID': username,
            'email': username
        },
        UpdateExpression: "ADD #equip_active_appts :incva",
        ExpressionAttributeNames: {
          "#equip_active_appts": "equip_active_appts"  
        },
        ExpressionAttributeValues: {
            ":incva": -1
        },
        ReturnValues: "UPDATED_NEW"  
    }, callback);
    
}

function errorResponse(errorMessage, awsRequestId, callback) {
    callback(null, {
        statusCode: 500,
        body: JSON.stringify({
            Error: errorMessage,
            Reference: awsRequestId,
        }),
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
    });
}