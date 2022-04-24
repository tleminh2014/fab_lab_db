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
          $('#accountTable').append('<tr> <td contenteditable="true" class="user_RFID">' + accountItem.user_RFID + '</td>'
            + '<td contenteditable="true" class="first_name">' + accountItem.first_name + '</td>'
            + '<td contenteditable="true" class="last_name">' + accountItem.last_name + '</td>' 
            + '<td contenteditable="true" class="Z_number">' + accountItem.Z_number + '</td>' 
            + '<td contenteditable="true" class="email">' + accountItem.email +'</td>'
            + '<td contenteditable="true" class="access_level">' + accountItem.access_level +'</td>'
            + '<td contenteditable="true" class="equip_active_appts">' + accountItem.equip_active_appts +'</td>'
            + '<td contenteditable="true" class="station_active_appts">' + accountItem.station_active_appts +'</td>'
            + '<td contenteditable="true" class="membership_active">' + accountItem.membership_active + '</td>' 
            + '<td contenteditable="true" class="is_eng_student">' + accountItem.is_eng_student + '</td>' 
            + '<td contenteditable="true" class="membership_start">' + accountItem.membership_start + '</td>'
            + '<td contenteditable="true" class="membership_end">' + accountItem.membership_end  + '</td>'
            + '<td contenteditable="true" class="photo" style="display: none">' + accountItem.photo  + '</td>'

            + '<td>' + save + cancel + '</td></tr>'
          );
    
          // i++;
        });
      }
    });

    $(document).on('click', '.edit', function () {
      var parent = $(this).parents('tr');
      

      var first_name = parent.children("td.first_name")[0].innerText;//
      var last_name = parent.children("td.last_name")[0].innerText;//
      var equip_active_appts = parent.children("td.equip_active_appts")[0].innerText;//
      var access_level = parent.children("td.access_level")[0].innerText;//
      var user_RFID = parent.children("td.user_RFID")[0].innerText;//
      var email = parent.children("td.email")[0].innerText;//
      var photo = parent.children("td.photo")[0].innerText;//
      var membership_end = parent.children("td.membership_end")[0].innerText;//
      var membership_active = parent.children("td.membership_active")[0].innerText;//
      var Z_number = parent.children("td.Z_number")[0].innerText;//
      var station_active_appts = parent.children("td.station_active_appts")[0].innerText;//
      var membership_start = parent.children("td.membership_start")[0].innerText;//
      var is_eng_student = parent.children("td.is_eng_student")[0].innerText;//

      

     

      $.ajax({
        method: 'POST',
        url: _config.api.invokeUrl + '/accountupdate',
        data: JSON.stringify({
          "first_name": first_name,
          "last_name": last_name,
          "equip_active_appts": equip_active_appts,
          "access_level": access_level,
          "user_RFID": user_RFID,
          "email": email,
          "photo": photo,
          "membership_end": membership_end,
          "membership_active": membership_active,
          "Z_number": Z_number,
          "station_active_appts": station_active_appts,
          "membership_start": membership_start,
          "is_eng_student": is_eng_student
        }),
        contentType: "application/json",
        success: function(data){
          console.log('Successfully editted rfid ', user_RFID);
          completeRequest(data);
          location.reload();
        },
        error: function ajaxError(jqXHR, textStatus, errorThrown) {
          console.error('Error requesting : ', textStatus, ', Details: ', errorThrown);
          console.error('Response: ', jqXHR.responseText);
         
        }
      });
      
      
      
    });
      
    
    
     
  });



 

 



}(jQuery));