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

  

//////////////////
$('#second').on('click',function(){
  $.ajax({
    type: 'POST',
    url: _config.api.invokeUrl + '/equipmentupdate',
    data: JSON.stringify({"access_level_req":$('#access').val(), "current_user":$('#access').val(), "equipement_type":$('#access').val(), "in_use":$('#access').val()}),
    contentType: "application/json",

    success: function(data){
      location.reload();
    }
  })
})

  function completeRequest(result) {
    console.log('Response received from API: ', result);
  }

  
  


  
  $(function onDocReady() {
   
      
    
    
     
  });



 

 



}(jQuery));