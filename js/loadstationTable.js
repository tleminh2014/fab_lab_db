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
      url: _config.api.invokeUrl + '/station',
      success: function(data){
        data.Items.forEach(function(stationItem){
            var availability;

            if (!stationItem.station_status) {
                availability = "<span style='color:green'>Available</span>";
              } else {
                availability = "<span style='color:red'>Unavailable</span>";
              }
          // console.log(stationItem);
          $('#stationTable').append('<tr> <td>' + stationItem.station_ID + '</td>' + '<td>' + stationItem.table_ID + '</td>' 
            + '<td>' + stationItem.equipment_ID +'</td>'+ '<td>' + stationItem.station_name +'</td>'+ '<td>' + availability 
            + '</td></tr>'
          );
    
          // i++;
        });
      }
    });
      
    
    
     
  });



 

 



}(jQuery));