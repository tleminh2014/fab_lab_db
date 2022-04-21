console.log('starting function');


const AWS = require('aws-sdk');

const docClient = new AWS.DynamoDB.DocumentClient();


exports.handler = function(event, context, callback) {
    
    const email = event.email;
    const last_name = event.last_name;
    const first_name = event.first_name;

    // parameters passed during the registration process where all information input from a new user creates a new entry in the Account table

    var params = {
        TableName: 'Account',
        Item: {
            user_RFID: email,
            email: email,
            photo: 'placeholder',
            membership_end: '4/24/2022',
            last_name: last_name,
            access_level: 0,
            first_name: first_name,
            membership_start: '2/12/2022',
            recent_logid: [],
            active_appts: '0'
            
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


