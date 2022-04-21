// this function is to serve as the basis for the station checkin/out logic for the swipe access team. Will not be implemented for the db web app


console.log('starting function');
// const randomBytes = require('crypto').randomBytes;

const AWS = require('aws-sdk');

const docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = function(event, context, callback) {
    if (!event.requestContext.authorizer) {
      errorResponse('Authorization not configured', context.awsRequestId, callback);
      return;
    }
    
    
    
    // const username = event.requestContext.authorizer.claims['cognito:username'];
    const requestBody = JSON.parse(event.body);
    const RFID = requestBody.RFID;
    const username = requestBody.username;
    const station_ID = requestBody.station_ID;
    const table_ID = requestBody.table_ID;
    const equipment_ID = requestBody.equipment_ID;
    
    updateStation(context, callback, username, station_ID, RFID, table_ID, equipment_ID);
    
};

// invoker function, calls all three functions and returns response

function updateStation(context, callback, username, station_ID, RFID, table_ID, equipment_ID) {
    // this is used to check the number of active appts the user currently has ... might be able to get rid of this and the for loop
    var queryparams = {
      TableName: 'Account',
        KeyConditionExpression: 
            "#user_RFID = :NNNN",
        ExpressionAttributeNames: {
            "#user_RFID" : "user_RFID"
        },
        ExpressionAttributeValues: {
            ":NNNN" : RFID
        }        
    };
    
    docClient.query(queryparams, function(err, data) {
        if (err) {
            console.error("Unable to query. Error: ", JSON.stringify(err, null, 2));
        } else {
            console.log("Query succeeded.");
            data.Items.forEach(function(item) {
                var equipAppts = item.equip_active_appts; //grabbing number of active items checked out
                console.log(equipAppts);
                limitUpdate(callback, username, RFID);
                equipUpdate(callback, equipment_ID, username);
                stationUpdate(station_ID, username, table_ID).then(() => {
                    callback(null, {
                        statusCode: 201,
                        body: JSON.stringify({
                            station_ID: station_ID,
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

//updates the station entry status to true (in use)
function stationUpdate(station_ID, username, table_ID) {
    return docClient.update({
        TableName: 'Station',
        Key: {
            'station_ID': station_ID,
            'table_ID': table_ID
        },
        UpdateExpression: "set station_status = :T",
        ExpressionAttributeValues: {
            ":T": true
        },
        ReturnValues: "UPDATED_NEW"
    }).promise();
}

//updates the equipment entry to in_use to true and setting the current_user value to the customer name
function equipUpdate(callback, equipment_ID, username) {
    return docClient.update({
        TableName: 'Equipment',
        Key: {
            'equipment_ID': equipment_ID
        },
        UpdateExpression: "set in_use = :T, current_user = :U",
        ExpressionAttributeValues: {
            ":T": true,
            ":U": username
        },
        ReturnValues: "UPDATED_NEW"
    }, callback);
}

// incrementing the number of station items checked out for customer
function limitUpdate(callback, username, RFID) {
    return docClient.update({
        TableName: 'Account',
        Key: {
            'user_RFID': RFID,
            'email': username
        },
        UpdateExpression: "ADD #station_active_appts :incva",
        ExpressionAttributeNames: {
          "#station_active_appts": "station_active_appts"  
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