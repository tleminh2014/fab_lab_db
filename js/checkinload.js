/*global fablab _config*/

var fablab = window.fablab || {};


//Wrapper includes authorization-restriction for fab-lab staff users only
//this script is currently not in use as check for General Fab lab for non-member's was introduced late in semester
(function tableScopeWrapper($) {
  var authToken;
  fablab.authToken.then(function setAuthToken(token) {
      if (token) {
          authToken = token;
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
  
  $(function onDocReady() {
     
  
      var cognitoUser = userPool.getCurrentUser();
      var username = cognitoUser.username;
         
  });
    
  

}(jQuery));

