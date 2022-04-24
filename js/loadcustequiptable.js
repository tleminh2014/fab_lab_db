/*global fablab _config*/

var fablab = window.fablab || {};

(function tableScopeWrapper($) {
  var authToken;
  fablab.authToken.then(function setAuthToken(token) {
    if (!token) {
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
        url: _config.api.invokeUrl + '/equipment',
        success: function(data){
    
          // var i = '0';
          data.Items.forEach(function(equipmentItem){
          // $.each(data, function (equipmentItem) {
            var availability;
            var checkout;
            // var checkoutid = 'checkout' + i;
            // ids.set(checkoutid, checkoutid);
            if (!equipmentItem.in_use) {
              availability = "<span style='color:green'>Available</span>";
              checkout = "<button class='checkout' data-dismiss='modal' data-value='"+ JSON.stringify(equipmentItem) +"'>Check Out</button>";
            } else {
              availability = "<span style='color:red'>Unavailable</span>";
              checkout = "<button class='checkin' data-dismiss='modal' data-value='"+ JSON.stringify(equipmentItem) +"'>Check In</button>";
            }
    
            // console.log(equipmentItem);
            $('#custequipmenttable').append('<tr> <td>' + equipmentItem.equipment_ID + '</td>' 
            + '<td>' + equipmentItem.access_level_req + '</td>' 
            + '<td>' + equipmentItem.equipment_type + '</td>'
            + '<td>' + availability + '</td>'
            + '<td>' + equipmentItem.training_req + '</td>'
            + '</tr>'
            );
      
            // i++;
          });
        }
      });
    
      
  });
      
  
  
  
  
  

  

}(jQuery));