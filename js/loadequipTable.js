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
        window.history.back();  
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
  // console.log(cognitoUser);
  // var username = cognitoUser.username;

  parseJwt = function(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace('-', '+').replace('_', '/');
    return JSON.parse(window.atob(base64));
}

  function requestCheckout(username, equipment_ID) {
    $.ajax({
        method: 'POST',
        url: _config.api.invokeUrl + '/equipmentcheckout',
        headers: {
            Authorization: authToken
        },
        data: JSON.stringify({
            username: username,
            equipment_ID: equipment_ID
        }),
        contentType: 'application/json',
        success: function(data){
          console.log('REQUEST COMPLETED! ->' + equipment_ID);
          completeRequest(data); 
          // location.reload();
        },
        error: function ajaxError(jqXHR, textStatus, errorThrown) {
            console.error('Error requesting ride: ', textStatus, ', Details: ', errorThrown);
            console.error('Response: ', jqXHR.responseText);
            // alert('An error occured during checkout:\n' + jqXHR.responseText);
        }
    });
  }


  function requestCheckin(username, equipment_ID) {
    $.ajax({
        method: 'POST',
        url: _config.api.invokeUrl + '/equipmentcheckin',
        headers: {
            Authorization: authToken
        },
        data: JSON.stringify({
            username: username,
            equipment_ID: equipment_ID
        }),
        contentType: 'application/json',
        success: function(data){
          console.log('REQUEST COMPLETED! ->' + equipment_ID);
          completeRequest(data);
          // location.reload();
        },
        error: function ajaxError(jqXHR, textStatus, errorThrown) {
            console.error('Error requesting ride: ', textStatus, ', Details: ', errorThrown);
            console.error('Response: ', jqXHR.responseText);
            // alert('An error occured during checkin:\n' + jqXHR.responseText);
        }
    });
  }


  function completeRequest(result) {
    console.log('Response received from API: ', result);
  }

  function requestLog(username, equipment_ID) {
      $.ajax({
        method: 'POST',
        url: _config.api.invokeUrl + '/equipmentcheckout/equipmentlog',
        headers: {
            Authorization: authToken
        },
        data: JSON.stringify({
            username: username,
            equipment_ID: equipment_ID
        }),
        contentType: 'application/json',
        success: function(data){
          console.log('REQUEST COMPLETED! ->' + equipment_ID);
          completeRequest(data);
          // location.reload();
        },
        error: function ajaxError(jqXHR, textStatus, errorThrown) {
            console.error('Error requesting checkoutlog: ', textStatus, ', Details: ', errorThrown);
            console.error('Response: ', jqXHR.responseText);
            // alert('An error occured during checkout logging:\n' + jqXHR.responseText);
        }
    });
  }
  
  function requestLogUpdate(username, equipment_ID) {
    $.ajax({
      method: 'POST',
      url: _config.api.invokeUrl + '/equipmentcheckin/equipmentlogupdate',
      headers: {
          Authorization: authToken
      },
      data: JSON.stringify({
          username: username,
          equipment_ID: equipment_ID
      }),
      contentType: 'application/json',
      success: function(data){
        console.log('REQUEST COMPLETED! Log updated for ->' + username);
        completeRequest(data);
        // location.reload();
      },
      error: function ajaxError(jqXHR, textStatus, errorThrown) {
          console.error('Error requesting checkoutlog: ', textStatus, ', Details: ', errorThrown);
          console.error('Response: ', jqXHR.responseText);
          // alert('An error occured during checkout logging:\n' + jqXHR.responseText);
      }
  });
}

  
  $(function onDocReady() {
    // $('#checkout').click(handleCheckout);
    $.ajax({
      method: 'GET',
      url: _config.api.invokeUrl + '/equipment',
      success: function(data){
        $('#entries').html('');

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
          $('#equipTable').append('<tr> <td>' + equipmentItem.equipment_ID + '</td>' + '<td>' + equipmentItem.access_level_req + '</td>' 
            // + '<td>' + equipmentItem.date_maintenance +'</td>'+ '<td>' + equipmentItem.date_rented +'</td>'+ '<td>' + equipmentItem.date_returned 
            + '</td>'+ '<td>' + equipmentItem.equipment_type + '</td>'+ '<td>' + availability + '</td>'+ '<td>'+ '</td>'+ '<td>'+ '</td>'+ '<td>' + checkout + '</td></tr>'
          );
    
          // i++;
        });
      }
    });

    $.ajax({
      method: 'GET',
      url: _config.api.invokeUrl + '/account',
      success: function(data){

        // var i = '0';
        data.Items.forEach(function(accountItem){
        // $.each(data, function (accountItem) {
        //   var availability;
        //   var checkout;
          // var checkoutid = 'checkout' + i;
          // ids.set(checkoutid, checkoutid);
         var fullname = accountItem.first_name + ' ' + accountItem.last_name;

          // console.log(accountItem);
          $('#customerName').append('<option value="'+ accountItem.email + '">'+ fullname + '</option>'
          );
    
          // i++;
        });
      }
    });
      
    
    // username = username.split("-at-").shift();
    // $("#welcomeheader").html('Welcome ' + username);      
  });
  
  
  
  $(document).on('click', '.checkout', function () {
    var sel = document.getElementById('customerName');
    // display value property of select list (from selected option)
    var username = sel.value;
    var equipmentitem = $(this).data('value');
    console.log('obj: ', equipmentitem);
    requestCheckout(username, equipmentitem.equipment_ID);
    requestLog(username, equipmentitem.equipment_ID);

    console.log('equipmentid', equipmentitem.equipment_ID,'checked out for: ', username);

  })

  $(document).on('click', '.checkin', function () {
    var sel = document.getElementById('customerName');
    // display value property of select list (from selected option)
    var username = sel.value;
    var equipmentitem = $(this).data('value');
    console.log('obj: ', equipmentitem);
    requestCheckin(username, equipmentitem.equipment_ID);
    requestLogUpdate(username, equipmentitem.equipment_ID);

    console.log('equipmentid checked in: ', equipmentitem.equipment_ID, 'for user: ', username);

  })



  $('#submitButton').on('click', function(){
    $.ajax({
      method: 'POST',
      url: _config.api.invokeUrl + '/equipment',
      data: JSON.stringify({"equipment_ID": parseInt($('#equipmentid').val()), "access_level_req": $('#accesslevel').val(), "equipment_type": $('#equipmenttype').val()}),
      contentType: "application/json",
      success: function(data){
        location.reload();
      }
    });
    return false;
  })

}(jQuery));