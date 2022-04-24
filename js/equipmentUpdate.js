/*global fablab _config*/

var fablab = window.fablab || {};

//Wrapper includes authorization-restriction for fab-lab staff users only
(function tableScopeWrapper($) {
  var authToken;
  fablab.authToken.then(function setAuthToken(token) {

    //auth token generated during user sign-in process
    if (token) {
      authToken = token;
      returnData = parseJwt(token);
      // console.log(returnData);
      var group = returnData['cognito:groups'][0];
      if (group !== 'AdminGroup') { //checking token for group value, then authorizing access if in admin group
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

  //reading the user pool id from the config file
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
  };

  

    //when the edit button is clicked on each row, this function will trigger
  $(document).on('click','.edit', function(){
    var parent = $(this).parents('tr');
    
    
    //the parent of the button which is the ancestor row is selected
    //then each specified child, identified by its class is read using the following
    var access = parent.children("td.access")[0].innerText;
    var eqtype = parent.children("td.equipmenttype")[0].innerText;
    var eqid = parent.children("td.equipmentid")[0].innerText;
    var currentuser = parent.children("td.currentuser")[0].innerText;
    var training_req = parent.children("td.training_req")[0].innerText;

    //calling the post method with variables
    $.ajax({
      method: 'POST',
      url: _config.api.invokeUrl + '/equipmentupdate',
      data: JSON.stringify({
        "access_level_req": access,
        "equipment_type": eqtype, 
        "current_user": currentuser, 
        "equipment_ID": parseInt(eqid), //make sure that datatype matches db schema
        "training_req": training_req
      }),
      contentType: "application/json",
      success: function(data){
        console.log('Successfully editted equipment id ', eqid);
        completeRequest(data);
        location.reload();
      },
      error: function ajaxError(jqXHR, textStatus, errorThrown) {
        console.error('Error requesting : ', textStatus, ', Details: ', errorThrown);
        console.error('Response: ', jqXHR.responseText);
        
      }
    });



  });


  

  function completeRequest(result) {
    console.log('Response received from API: ', result);
  }



}(jQuery));