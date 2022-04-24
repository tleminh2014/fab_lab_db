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
      url: _config.api.invokeUrl + '/account',
      success: function(data){
        data.Items.forEach(function(accountItem){
        var fullname = accountItem.first_name + ' ' + accountItem.last_name;

        // variables for save button and cancel button when the 'edit database' 
        //     button is clicked
        var save = "<button class='edit hidd' data-dismiss='modal' data-value='"+ JSON.stringify(accountItem) +"' onchange=''>Save</button>";
        var cancel = "<button class='cancel hidd' data-dismiss='modal' data-value='"+ JSON.stringify(accountItem) +"' onclick='cancelFunction()'>Cancel</button>";



          // console.log(accountItem);
          $('#accountTable').append('<tr> <td contenteditable="true" class="user_RFID">' + accountItem.user_RFID + '</td>' + '<td contenteditable="true" class="first_name">' + accountItem.first_name + '</td>' + '<td contenteditable="true" class="last_name">' + accountItem.last_name + '</td>' 
            + '<td contenteditable="true" class="email">' + accountItem.email +'</td>'+ '<td contenteditable="true" class="equip_active_appts">' + accountItem.equip_active_appts +'</td>'+ '<td contenteditable="true" class="station_active_appts">' + accountItem.station_active_appts 
            + '</td>'+ '<td contenteditable="true" class="membership_start">' + accountItem.membership_start + '</td>'+ '<td contenteditable="true" class="membership_end">' + accountItem.membership_end  + '</td>' + '<td>' + save + cancel + '</td></tr>'
          );
    
          // i++;
        });
      }
    });

    $(document).on('click', '.edit', function () {
      var parent = $(this).parents('tr');
      console.log(parent);
      console.log(parent.children("td.user_RFID")[0].innerText);
      console.log(parent.children("td.first_name")[0].innerText);
      
      
      
    });
      
    
    
     
  });



 

 



}(jQuery));