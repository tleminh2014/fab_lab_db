console.log('starting function');
const randomBytes = require('crypto').randomBytes;

const AWS = require('aws-sdk');

const docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = function(event, context, callback) {

    //Cognito User pools authorizer is used in this function via auth token in the request context
    if (!event.requestContext.authorizer) {
      errorResponse('Authorization not configured', context.awsRequestId, callback);
      return;
    }
    
    const equipmentlogid  = toUrlString(randomBytes(16));
    
    const requestBody = JSON.parse(event.body);
    const username = requestBody.username;
    const equipment_ID = requestBody.equipment_ID;
    console.log('Received event (', equipmentlogid, '): ', event);
    
    recordCheckout(equipmentlogid, username, equipment_ID, context, callback);
    
    
    
};

// function to format the log creation date
function getFormattedDate(date) {
  date = date.toLocaleString("en-US", {timeZone: 'EST'});

  return date;
}

function recordCheckout(equipmentlogid, username, equipment_ID, context, callback) {
    var currentDate = new Date();

    //parameters for log entry
    var params = {
        TableName: 'EquipmentLog',
        Item: {
             logid: equipmentlogid,
             user_RFID: username,
             equipment_ID: equipment_ID,
             date_rented: getFormattedDate(currentDate),
             date_returned: ''
         }
    };

    //calling the put method to create a new entry in Equipment Log table
    docClient.put(params, function(err, data) {
        if (err) {
            console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
        } else {
            console.log('Checkout log created - ', equipmentlogid, 'Assigning log to account');
            updateAccountLogid(equipment_ID, equipmentlogid, username).then(() => {
                callback(null, {
                statusCode: 201,
                body: JSON.stringify({
                   logid: equipmentlogid,
                   user_RFID: username,
                   equipment_ID: equipment_ID,
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
    });
}

//function adding the newly create logID and equipment ID to the associated customer entry in Account table
function updateAccountLogid(equipment_ID, equipmentlogid, username) {
   
    return docClient.update({
        TableName: "Account",
        Key: {
            'user_RFID': username,
            'email': username
        },
        UpdateExpression: "set recent_logid = list_append(if_not_exists(recent_logid, :empty_list), :C)",
        ExpressionAttributeValues: {
            ":C": [{
                'equipment_ID': equipment_ID,
                'equipmentlogid': equipmentlogid
            }],
            ":empty_list": []
        },
        ReturnValues: "UPDATED_NEW"
    }).promise();
}


function toUrlString(buffer) {
    return buffer.toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
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