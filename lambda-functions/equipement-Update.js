'ude strict';
const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();



exports.handler = function(event, context,callback){

    const equipment_type = event.equipment_type;
    const in_use = event.in_use;
    const current_user = event.current_user;
    const equipment_ID = event.equipment_ID;
    const access_level_req = event.access_level_req;
    
    checkValues(callback,equipment_ID,equipment_type,in_use,current_user,access_level_req);
    
  
    
}; 


// function checks event arguments to compare values to DB values - if same, no action is taken, else perform the update

function checkValues(callback,equipment_ID,equipment_type,in_use,current_user,access_level_req){
    let params = {
        TableName : 'Equipment',
        Key : { equipment_ID : equipment_ID, },
    };
    return docClient.get(params, function(err, data) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, data);
            // checking for changes
            if (data.Item.equipment_type == equipment_type && data.Item.in_use == in_use && data.Item.current_user == current_user && data.Item.access_level_req == access_level_req){
                console.log("No Data needed to be updated");
            }
            else{
                return docClient.update({
                        TableName : 'Equipment',
                        Key : { equipment_ID : equipment_ID, },
                        
                        UpdateExpression : "SET   #ET = :ET, #IU = :IU, #CU = :CU, #ACCL = :ACCL",
                        ExpressionAttributeNames : {
                            "#ET" : "equipment_type",
                            "#IU" : "in_use",
                            "#CU" : "current_user",
                            "#ACCL" : "access_level_req",
                        },
                        ExpressionAttributeValues : {
                            ":ET" : equipment_type,
                            ":IU" : in_use,
                            ":CU" : current_user,
                            ":ACCL" : access_level_req,
                                },
                        ReturnValues: "UPDATED_NEW"
                },callback);
            }
        }
    });
}   
   
    