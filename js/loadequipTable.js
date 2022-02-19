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

  function requestCheckout(equipment_ID) {
    $.ajax({
        method: 'POST',
        url: _config.api.invokeUrl + '/equipmentcheckout',
        headers: {
            Authorization: authToken
        },
        data: JSON.stringify({
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
            alert('An error occured during checkout:\n' + jqXHR.responseText);
        }
    });
  }

  function completeRequest(result) {
    console.log('Response received from API: ', result);
  }

  function requestLog(equipment_ID) {
      $.ajax({
        method: 'POST',
        url: _config.api.invokeUrl + '/equipmentcheckout/equipmentlog',
        headers: {
            Authorization: authToken
        },
        data: JSON.stringify({
            equipment_ID: equipment_ID
        }),
        contentType: 'application/json',
        success: function(data){
          console.log('REQUEST COMPLETED! ->' + equipment_ID);
          completeRequest(data);
          location.reload();
        },
        error: function ajaxError(jqXHR, textStatus, errorThrown) {
            console.error('Error requesting checkoutlog: ', textStatus, ', Details: ', errorThrown);
            console.error('Response: ', jqXHR.responseText);
            alert('An error occured during checkout logging:\n' + jqXHR.responseText);
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
          if (!equipmentItem.inUse) {
            availability = "<span style='color:green'>Available</span>";
            checkout = "<button class='checkout' data-dismiss='modal' data-value='"+ JSON.stringify(equipmentItem) +"'>Check Out</button>";
          } else {
            availability = "<span style='color:red'>Unavailable</span>";
            checkout = "<button class='checkout' disabled>Check Out</button>";
          }

          // console.log(equipmentItem);
          $('#equipTable').append('<tr> <td>' + equipmentItem.equipment_ID + '</td>' + '<td>' + equipmentItem.access_level_req + '</td>' 
            + '<td>' + equipmentItem.date_maintenance +'</td>'+ '<td>' + equipmentItem.date_rented 
            +'</td>'+ '<td>' + equipmentItem.date_returned + '</td>'+ '<td>' + equipmentItem.equipment_type + '</td>'+ '<td>' + availability + '</td>'+ '<td>' + checkout + '</td></tr>'
          );
    
          // i++;
        });
      }
    });
      
    // $('.checkout').click(handleCheckout);        
    var cognitoUser = userPool.getCurrentUser();
    var username = cognitoUser.username;
    username = username.split("@").shift();
    $("#welcomeheader").html('Welcome ' + username);      
  });

  // function handleCheckout(event) {
  //   event.preventDefault();
  //   var equipmentitem = $(this).data('value');
  //   requestCheckout(equipmentitem.equipment_ID);
  //   // requestLog(equipmentItem.equipment_ID);
  //   // location.reload();
  //   console.log('equipmentid checked out: ', equipmentitem.equipment_ID);
  // }

  $(document).on('click', '.checkout', function () {
    var equipmentitem = $(this).data('value');
    console.log('obj: ', equipmentitem);
    requestCheckout(equipmentitem.equipment_ID);
    requestLog(equipmentitem.equipment_ID);

    console.log('equipmentid checked out: ', equipmentitem.equipment_ID);

  })


  $('#submitButton').on('click', function(){
    $.ajax({
      method: 'POST',
      url: _config.api.invokeUrl + '/equipment',
      data: JSON.stringify({"equipment_ID": $('#equipmentid').val(), "accesslevel": $('#accesslevel').val(), "equipmenttype": $('#equipmenttype').val()}),
      contentType: "application/json",
      success: function(data){
        location.reload();
      }
    });
    return false;
  })

}(jQuery));