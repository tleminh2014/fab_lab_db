/*global fablab _config*/

var fablab = window.fablab || {};

//Wrapper includes authorization-restriction for fab-lab staff users only
(function tableScopeWrapper($) {
  var authToken;
  fablab.authToken.then(function setAuthToken(token) {
    if (token) {
      authToken = token;
      returnData = parseJwt(token); //auth token generated during user sign-in process
      var group = returnData['cognito:groups'][0]; //checking token for group value, then authorizing access if in admin group
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

             // variables for save button and cancel button when the 'edit database' 
            //     button is clicked
            var save = "<button class='hidd' data-dismiss='modal' data-value='"+ JSON.stringify(stationItem) +"' onchange=''>Save</button>";
            var cancel = "<button class='hidd' data-dismiss='modal' data-value='"+ JSON.stringify(stationItem) +"' onclick='cancelFunction()'>Cancel</button>";


            if (!stationItem.station_status) {
                availability = "<span style='color:green'>Available</span>";
              } else {
                availability = "<span style='color:red'>Unavailable</span>";
              }
          // console.log(stationItem);
          $('#stationTable').append('<tr> <td contenteditable="true">' + stationItem.station_ID + '</td>' + '<td contenteditable="true">' + stationItem.table_ID + '</td>' 
            + '<td contenteditable="true">' + stationItem.equipment_ID +'</td>'+ '<td contenteditable="true">' + stationItem.station_name +'</td>'+ '<td>' + availability 
            + '</td>' + '<td>' + save + cancel + '</td></tr>'
          );
    
          // i++;
        });
      }
    });
      
    
    
     
  });



 

 



}(jQuery));