/*global fablab _config*/

var fablab = window.fablab || {};

//Wrapper includes authorization-restriction for fab-lab staff users only
(function tableScopeWrapper($) {
  var authToken;
  fablab.authToken.then(function setAuthToken(token) {
    //auth token generated during user sign-in process
    if (token) {
      authToken = token;
      returnData = parseJwt(token); //checking token for group value, then authorizing access if in admin group
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
  
  //function to parse the JWT token to read the groupname of current session user
  parseJwt = function(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace('-', '+').replace('_', '/');
    return JSON.parse(window.atob(base64));
 }

  //function checks out the equipment using equipment id and associates the selected username with the equipment's current user
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

  //function checks in the equipment using equipment id and associates the selected username with the equipment's current user
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
            console.error('Error requesting checkin: ', textStatus, ', Details: ', errorThrown);
            console.error('Response: ', jqXHR.responseText);
        }
    });
  }


  function completeRequest(result) {
    console.log('Response received from API: ', result);
  }

  //function creates a session log of the equipmentID and adds the new log id to the list of items in use by the selected user
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
          console.log('REQUEST COMPLETED! Checked in for->' + equipment_ID);
          completeRequest(data);
          location.reload();
        },
        error: function ajaxError(jqXHR, textStatus, errorThrown) {
            console.error('Error requesting checkoutlog: ', textStatus, ', Details: ', errorThrown);
            console.error('Response: ', jqXHR.responseText);
            // alert('An error occured during checkout logging:\n' + jqXHR.responseText);
        }
    });
  }
  
  //this function updates the log associated with the user and updates the return date in the log
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
        location.reload();
      },
      error: function ajaxError(jqXHR, textStatus, errorThrown) {
          console.error('Error requesting checkoutlog: ', textStatus, ', Details: ', errorThrown);
          console.error('Response: ', jqXHR.responseText);

      }
  });
}

  
  $(function onDocReady() {
    //reading the data from the equipment table in the db, then looping through items to append attributes to the table 
    $.ajax({
      method: 'GET',
      url: _config.api.invokeUrl + '/equipment',
      success: function(data){
        $('#entries').html('');


        data.Items.forEach(function(equipmentItem){
          var availability;
          var checkout;
          var currentUser = equipmentItem.current_user;

          var cancel, edit;

       
          if (!equipmentItem.in_use) {
            availability = "<span style='color:green'>Available</span>";
            checkout = "<button class='checkout sho' data-dismiss='modal' data-value='"+ JSON.stringify(equipmentItem) +"' onchange='appendCheckoutFunction()'>Check Out</button>";
            edit = "<button class='edit hidd' data-dismiss='modal' data-value='"+ JSON.stringify(equipmentItem) +"' onchange=''>Save</button>";
            cancel = "<button class='cancel hidd' data-dismiss='modal' data-value='"+ JSON.stringify(equipmentItem) +"' onclick='cancelFunction()'>Cancel</button>";
          } else {
            availability = "<span style='color:red'>Unavailable</span>";
            checkout = "<button class='checkin sho' data-dismiss='modal' data-value='"+ JSON.stringify(equipmentItem) +"'onchange='appendCheckinFunction()' disabled= 'true'>Check In</button>";
            edit = "<button class='edit hidd' data-dismiss='modal' data-value='"+ JSON.stringify(equipmentItem) +"' onchange=''>Save</button>";
            cancel = "<button class='cancel hidd' data-dismiss='modal' data-value='"+ JSON.stringify(equipmentItem) +"' onclick='cancelFunction()'>Cancel</button>";
          }
          
          //items are separated into their attributes and appended to the table as follows
          $('#equipTable').append('<tr class="tabledata"> <td contenteditable="true" class="equipmentid">' + equipmentItem.equipment_ID + '</td>' 
          + '<td contenteditable="true" class="access">' + equipmentItem.access_level_req + '</td>' 
            // + '<td>' + equipmentItem.date_maintenance +'</td>'+ '<td>' + equipmentItem.date_rented +'</td>'+ '<td>' + equipmentItem.date_returned 
            + '<td contenteditable="true" class="equipmenttype">' + equipmentItem.equipment_type + '</td>'
            + '<td>' + availability + '</td>'
            + '<td contenteditable="true" class="training_req">' + equipmentItem.training_req + '</td>'
            + '<td>' + checkout + edit + cancel
            + '<td class="currentuser" style="display: none">' + currentUser +'</td></tr>'
          );

        });
      }
    });
    
    //the Select customer list is created by reading the account table from db and creating list options
    $.ajax({
      method: 'GET',
      url: _config.api.invokeUrl + '/account',
      success: function(data){
        data.Items.forEach(function(accountItem){
         var fullname = accountItem.first_name + ' ' + accountItem.last_name;      
         $('#customerName').append('<option value="'+ accountItem.email +'" data-val="' + accountItem.equip_active_appts + '">'+ fullname + '</option>');
    

        });
      }
    });
    
    
  });
  
  
  
  //checkout button event listener
  $(document).on('click', '.checkout', function () {
    var sel = document.getElementById('customerName');
    // display value property of select list (from selected option)
    var username = sel.value;
    var limit = $("#customerName option:selected").data("val");
    var equipmentitem = $(this).data('value');
    
    
    
    //if selected user already has 4 items checkedout, then an error will appear
    if (limit < 4) {
      console.log('obj: ', equipmentitem);
      requestCheckout(username, equipmentitem.equipment_ID);
      requestLog(username, equipmentitem.equipment_ID);
  
      console.log('equipmentid', equipmentitem.equipment_ID,'checked out for: ', username);
    } else {
      alert('Equipment Limit reached for ' + username);
    }

  });
  

  //checkin button event listener
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


  //adding new equipment to the database
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
        // location.reload();
      },
      error: function ajaxError(jqXHR, textStatus, errorThrown) {
        console.error('Error requesting : ', textStatus, ', Details: ', errorThrown);
        console.error('Response: ', jqXHR.responseText);
        
      }
    });



  });




}(jQuery));