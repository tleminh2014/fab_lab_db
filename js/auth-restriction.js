/*global fablab _config*/

var fablab = window.fablab || {};

//Wrapper includes authorization-restriction for fab-lab staff users only
//for sites that allow non-staff access, I've commented the lines to remove
// lines 48-51 are the lines to display the welcome banner

(function tableScopeWrapper($) {
  var authToken;
  fablab.authToken.then(function setAuthToken(token) {
    if (token) {
      authToken = token;
      returnData = parseJwt(token);
      // console.log(returnData);
      var group = returnData['cognito:groups'][0]; // lines to restrict to staff-only
      if (group !== 'AdminGroup') {                 // lines to restrict to staff-only
        alert('You do not have access to this page');  // lines to restrict to staff-only
        window.location.href = 'user.html';  
      } // lines to restrict to staff-only
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
  console.log(cognitoUser);
  var username = cognitoUser.username;
  parseJwt = function(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace('-', '+').replace('_', '/');
    return JSON.parse(window.atob(base64));
    }

  $(function onDocReady() {
    username = username.split("-at-").shift();
    $("#welcomeheader").html('Welcome ' + username);      
  });


}(jQuery));