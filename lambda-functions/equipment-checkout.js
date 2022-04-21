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
    
    updateEquipment(context, callback, username, equipment_ID);
    
};


// function is the transformation function that calls the other functions to perform update equipment information 
function updateEquipment(context, callback, username, equipment_ID) {
    
    var queryparams = {
      TableName: 'Account',
        KeyConditionExpression: 
            "#user_RFID = :NNNN",
        ExpressionAttributeNames: {
            "#user_RFID" : "user_RFID"
        },
        ExpressionAttributeValues: {
            ":NNNN" : username
        }        
    };
    
    docClient.query(queryparams, function(err, data) {
        if (err) {
            console.error("Unable to query. Error: ", JSON.stringify(err, null, 2));
        } else {
            console.log("Query succeeded.");
            data.Items.forEach(function(item) {
                // var equipAppts = item.equip_active_appts;
                // console.log(equipAppts);
                
                limitUpdate(callback, username);
                equipUpdate(equipment_ID, username).then(() => {
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
            });
        }
    });
}

// function updates equipment to in_user = T and change current_user to username passed via event
function equipUpdate(equipment_ID, username) {
    return docClient.update({
        TableName: 'Equipment',
        Key: {equipment_ID},
        UpdateExpression: "set in_use = :T, current_user = :U",
        ExpressionAttributeValues: {
            ":T": true,
            ":U": username
        },
        ReturnValues: "UPDATED_NEW"
    }).promise();
}

// incrementing the equipment limit value by 1 in associated Account table entry
function limitUpdate(callback, username) {
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
            ":incva": 1
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