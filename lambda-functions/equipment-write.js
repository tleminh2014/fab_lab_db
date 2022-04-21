console.log('starting function');

const AWS = require('aws-sdk');

const docClient = new AWS.DynamoDB.DocumentClient();


exports.handler = function(event, context, callback) {

    //new equipment parameters passed by event and creates a new entry in the equipment table
    var params = {
        TableName: 'Equipment',
        
        Item: {
            equipment_ID: event.equipment_ID,
            access_level_req: event.access_level_req,
            equipment_type: event.equipment_type,
            current_user: '',
            in_use: false
            
        }
        
        
    };
    
    docClient.put(params, function(err, data){
        if(err){
            callback(err, null);
        }else{
            callback(err, data);
        }
    });
};


