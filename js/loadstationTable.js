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
            var save = "<button class='edit hidd' data-dismiss='modal' data-value='"+ JSON.stringify(stationItem) +"' onchange=''>Save</button>";
            var cancel = "<button class='cancel hidd' data-dismiss='modal' data-value='"+ JSON.stringify(stationItem) +"' onclick='cancelFunction()'>Cancel</button>";


            if (!stationItem.station_status) {
                availability = "<span style='color:green'>Available</span>";
              } else {
                availability = "<span style='color:red'>Unavailable</span>";
            }

            $('#stationTable').append(
            '<tr> <td contenteditable="true" class="station_ID">' + stationItem.station_ID + '</td>' 
            + '<td contenteditable="true" class="table_ID">' + stationItem.table_ID + '</td>' 
            + '<td contenteditable="true" class="equipment_ID">' + stationItem.equipment_ID +'</td>'
            + '<td contenteditable="true" class="station_name">' + stationItem.station_name +'</td>' 
            + '<td contenteditable="true" class="station_status">' + stationItem.station_status + '</td>' 
            + '<td>' + save + cancel + '</td></tr>'
          );
    
     
        });
      }
    });
      
    //when the edit button is clicked on each row, this function will trigger
    $(document).on('click', '.edit', function () {
      var parent = $(this).parents('tr');
      
      //the parent of the button which is the ancestor row is selected
      //then each specified child, identified by its class is read using the following
      var station_ID = parent.children("td.station_ID")[0].innerText;//
      var table_ID = parent.children("td.table_ID")[0].innerText;//
      var equipment_ID = parent.children("td.equipment_ID")[0].innerText;//
      var station_name = parent.children("td.station_name")[0].innerText;//
      var station_status = parent.children("td.station_status")[0].innerText;//
 

     

      $.ajax({
        method: 'POST',
        url: _config.api.invokeUrl + '/stationupdate',
        data: JSON.stringify({
          "station_ID": station_ID,
          "table_ID": table_ID,
          "equipment_ID": parseInt(equipment_ID),
          "station_name": station_name,
          "station_status": station_status
          }),
        contentType: "application/json",
        success: function(data){
          console.log('Successfully editted stationID ', station_ID);
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