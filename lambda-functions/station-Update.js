const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();



exports.handler = function(event, context,callback){

    const station_ID = event.station_ID;
    const table_ID = event.table_ID;
    const station_status = event.station_status;
    const equipment_ID = event.equipment_ID;
    const station_name = event.station_name;
    
    checkValues(callback,station_ID,table_ID,station_status,equipment_ID,station_name);
    
  
    
}; 

// function checks event arguments to compare values to DB values - if same, no action is taken, else perform the update
    
function checkValues(callback,station_ID,table_ID,station_status,equipment_ID,station_name){
    let params = {
        TableName : 'Station',
        Key : { station_ID : station_ID, table_ID : table_ID },
    };
    return docClient.get(params, function(err, data) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, data);
            // checking for changes
            if (data.Item.station_status == station_status && data.Item.equipment_ID == equipment_ID && data.Item.station_name == station_name ){
                console.log("No Data to be updated");
            }
            // calling the update method
            else{
                return docClient.update({
                        TableName : 'Station',
                        Key : { station_ID : station_ID, table_ID : table_ID },
                        UpdateExpression : "SET #EQID = :EQID, #STTUS = :STTUS, #SN = :SN",
                        ExpressionAttributeNames : {
                            "#EQID" : "equipment_ID",
                            "#STTUS" : "station_status",
                            "#SN" : "station_name"
                        },
                        ExpressionAttributeValues : {
                            ":EQID" : equipment_ID,
                            ":STTUS" : station_status,
                            ":SN" : station_name
                                },
                        ReturnValues: "UPDATED_NEW"
                },callback);
            }
        }
    });
}   
   
    