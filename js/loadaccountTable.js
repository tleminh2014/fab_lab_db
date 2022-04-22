/*global fablab _config*/

var fablab = window.fablab || {};

(function tableScopeWrapper($) {
  var authToken;
  fablab.authToken.then(function setAuthToken(token) {
    if (token) {
      authToken = token;
      returnData = parseJwt(token);
      // console.log(returnData);
      var group = returnData['cognito:groups'][0];
      if (group !== 'AdminGroup') {
        alert('You do not have access to this page');  
        window.location.href = 'user.html';  
      }
    } else {
      window.location.href = '/signin.html';
    }
  }).catch(function handleTokenError(error) {
      alert(error);
      window.location.href = '/signin.html';
  });

  var poolData = {
    UserPoolId: _config.cognito.userPoolId,
    ClientId: _config.cognito.userPoolClientId
    };

  var userPool;
  
  if (!(_config.cognito.userPoolId &&
    _config.cognito.userPoolClientId &&
    _config.cognito.region)) {
      $('#noCognitoMessage').show();
      return;
  }
    
  userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
  var cognitoUser = userPool.getCurrentUser();
  
  var username = cognitoUser.username;

  parseJwt = function(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace('-', '+').replace('_', '/');
    return JSON.parse(window.atob(base64));
    }

  


  

  function completeRequest(result) {
    console.log('Response received from API: ', result);
  }

  
  


  
  $(function onDocReady() {
    $.ajax({
      method: 'GET',
      url: _config.api.invokeUrl + '/account',
      success: function(data){
        data.Items.forEach(function(accountItem){
        var fullname = accountItem.first_name + ' ' + accountItem.last_name;

        // variables for save button and cancel button when the 'edit database' 
        //     button is clicked
        var save = "<button class='hidd' data-dismiss='modal' data-value='"+ JSON.stringify(accountItem) +"' onchange=''>Save</button>";
        var cancel = "<button class='hidd' data-dismiss='modal' data-value='"+ JSON.stringify(accountItem) +"' onclick='cancelFunction()'>Cancel</button>";



          // console.log(accountItem);
          $('#accountTable').append('<tr> <td contenteditable="true">' + accountItem.user_RFID + '</td>' + '<td>' + fullname + '</td>' 
            + '<td contenteditable="true">' + accountItem.email +'</td>'+ '<td>' + accountItem.equip_active_appts +'</td>'+ '<td>' + accountItem.station_active_appts 
            + '</td>'+ '<td>' + accountItem.membership_start + '</td>'+ '<td>' + accountItem.membership_end  + '</td>' + '<td>' + save + cancel + '</td></tr>'
          );
    
          // i++;
        });
      }
    });
      
    
    
     
  });



 

 



}(jQuery));