console.log('starting function');

const AWS = require('aws-sdk');

const docClient = new AWS.DynamoDB.DocumentClient();

// in main, Station table is read to return first 100 items
exports.handler = function(e, ctx, callback) {
     
    let scanningParams = {
        TableName: 'Station',
        Limit: 100
    };
    
    docClient.scan(scanningParams, function(err, data) {
        if(err){
            callback(err, null);
        }else{
            callback(null, data);
        }
    });

};