/*global fablab _config*/

var fablab = window.fablab || {};

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
      $.ajax({
        method: 'GET',
        url: _config.api.invokeUrl + '/equipment',
        success: function(data){
          $('#entries').html('');
  
          data.Items.forEach(function(equipmentItem){
            var availability;
            if (equipmentItem.available) {
              availability = '<span style="color:green">Available</span>';
            } else {availability = '<span style="color:red">Unavailable</span>';}
            $('#equipTable').append('<tr> <td>' + equipmentItem.equipment_ID + '</td>' + '<td>' + equipmentItem.access_level_req + '</td>' 
                + '<td>' + equipmentItem.date_rented +'</td>'+ '<td>' + equipmentItem.date_rented 
                +'</td>'+ '<td>' + equipmentItem.date_returned + '</td>'+ '<td>' + equipmentItem.equipment_type + '</td>'+ '<td>' + availability + '</span></td></tr>');
          })
        }
      });
  
      var cognitoUser = userPool.getCurrentUser();
      var username = cognitoUser.username;
      username = username.split("@").shift();
      $("#welcomeheader").html('Welcome ' + username);      
  });

  $('#submitButton').on('click', function(){
    $.ajax({
      method: 'POST',
      url: _config.api.invokeUrl + '/equipment',
      data: JSON.stringify({"equipmenttype": $('#equipmenttype').val(), "accesslevel": $('#accesslevel').val()}),
      contentType: "application/json",
      success: function(data){
        location.reload();
      }
    });
    return false;
  })

}(jQuery));