console.log('starting function');

const AWS = require('aws-sdk');

const docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = function(event, context, callback) {
    //Cognito User pools authorizer is used in this function via auth token in the request context
    if (!event.requestContext.authorizer) {
      errorResponse('Authorization not configured', context.awsRequestId, callback);
      return;
    }
    
    const requestBody = JSON.parse(event.body);
    const username = requestBody.username;
    const equipment_ID = requestBody.equipment_ID;
    getLogId(username, equipment_ID, context, callback);
    
};

// function to format the log return date
function getFormattedDate(date) {
  date = date.toLocaleString("en-US", {timeZone: 'EST'});
  return date;
}

function getLogId(username, equipment_ID, context, callback) {

    //querying parameters to find all logIDs of associated user
    var queryParams = {
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
    var logid;
    var indix;
    var counter = 0;
    docClient.query(queryParams, function(err, data) {
        if (err) {
            console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
        } else {
            console.log("Query succeeded.");
            // loop to find associated logID matching the equipmentID 
            data.Items.forEach(function(item) {
                var entries = item.recent_logid;
                entries.forEach(element => {
                    if (element.equipment_ID == equipment_ID) {
                       logid = element.equipmentlogid;
                       console.log(logid);
                       indix = counter;
                    }
                    counter ++;
                }
                );

                //removing the log entry from the user's recentlogid list
                delete entries[indix];
                updateRecentloglist(callback, username, entries);
                updateLog(logid).then(() => {
                    callback(null, {
                        statusCode: 201,
                        body: JSON.stringify({
                            logid: logid,
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

// function updates the matching logid entry with the formatted return date
function updateLog(logid) {
    var currentDate = new Date();
    return docClient.update({
        TableName: 'EquipmentLog',
        Key: {logid},
        UpdateExpression: "set date_returned = :C",
        ExpressionAttributeValues: {
            ":C": getFormattedDate(currentDate)
        },
        ReturnValues: "UPDATED_NEW"
    }).promise();
}

//updating the recent_logid list of associated user with deleted entry
function updateRecentloglist(callback, username, entries) {
    return docClient.update({
        TableName: 'Account',
        Key: {
            'user_RFID': username,
            'email': username
        },
        UpdateExpression: "set recent_logid = :L",
        ExpressionAttributeValues: {
            ":L": entries
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