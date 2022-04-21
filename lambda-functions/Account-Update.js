const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();



exports.handler = function(event, context,callback){

    const first_name = event.first_name;
    const last_name = event.last_name;
    const equip_active_appts = event.equip_active_appts;
    const access_level = event.access_level;
    const user_RFID = event.user_RFID;
    const email = event.email;
    const photo = event.photo;
    const membership_end = event.membership_end;
    const recent_logid = event.recent_logid;
    const membership_active = event.membership_active;
    const Z_number = event.Z_number;
    const station_active_appts = event.station_active_appts;
    const membership_start = event.membership_start;
    const is_eng_student = event.is_eng_student;
    
    checkValues(callback,user_RFID,email,first_name,last_name,equip_active_appts,access_level,photo,membership_end,recent_logid,
    membership_active,Z_number,station_active_appts,membership_start,is_eng_student);
    
  
    
}; 


// function checks event arguments to compare values to DB values - if same, no action is taken, else perform the update

function checkValues(callback,user_RFID,email,first_name,last_name,equip_active_appts,access_level,photo,membership_end,recent_logid,
    membership_active,Z_number,station_active_appts,membership_start,is_eng_student){
    let params = {
        TableName : 'Account',
        Key : { user_RFID : user_RFID, email : email},
    };
    return docClient.get(params, function(err, data) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, data);
            // checking for changes
            if (data.Item.first_name == first_name && data.Item.last_name == last_name && data.Item.equip_active_appts == equip_active_appts && data.Item.access_level == access_level &&
                data.Item.photo == photo && data.Item.membership_end == membership_end && data.Item.recent_logid == recent_logid && data.Item.membership_active == membership_active &&
                data.Item.Z_number == Z_number && data.Item.station_active_appts == station_active_appts && data.Item.membership_start == membership_start && data.Item.is_eng_student == is_eng_student){
                console.log("No Data needed to be updated");
            }
            else{
                return docClient.update({
                        TableName : 'Account',
                        Key : { user_RFID : user_RFID, email : email },
                        
                        UpdateExpression : "SET   #FN = :FN, #LN = :LN, #EQAA = :EQAA, #ACCL = :ACCL, #PH = :PH, #ME = :ME, #RL = :RL, #ZN = :ZN, #STAA = :STAA, #MS = :MS, #MA = :MA, #ISEN = :ISEN",
                        ExpressionAttributeNames : {
                            "#FN" : "first_name",
                            "#LN" : "last_name",
                            "#EQAA" : "equip_active_appts",
                            "#ACCL" : "access_level",
                            "#PH" : "photo",
                            "#ME" : "membership_end",
                            "#RL" : "recent_logid",
                            "#ZN" : "Z_number",
                            "#STAA" : "station_active_appts",
                            "#MS" : "membership_start",
                            "#MA" : "membership_active",
                            "#ISEN" : "is_eng_student"
                        },
                        ExpressionAttributeValues : {
                            ":FN" : first_name,
                            ":LN" : last_name,
                            ":EQAA" : equip_active_appts,
                            ":ACCL" : access_level,
                            ":PH" : photo,
                            ":ME" : membership_end,
                            ":RL" : recent_logid,
                            ":ZN" : Z_number,
                            ":STAA" : station_active_appts,
                            ":MS" : membership_start,
                            ":MA" : membership_active,
                            ":ISEN" : is_eng_student
                                },
                        ReturnValues: "UPDATED_NEW"
                },callback);
            }
        }
    });
}   
   
    