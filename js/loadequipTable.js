$(document).ready(function(){
    $.ajax({
      method: 'GET',
      url: _config.api.invokeUrl + '/equipment',
      success: function(data){
        $('#entries').html('');

        data.Items.forEach(function(equipmentItem){
          $('#equipTable').append('<tr> <td>' + equipmentItem.accesslevel + '</td>' + '<td>' + equipmentItem.equipmenttype + '</td></tr>');
        })
      }
    });


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
            $('#equipTable').append('<tr> <td>' + equipmentItem.accesslevel + '</td>' + '<td>' + equipmentItem.equipmenttype + '</td>'+ '<td>' + availability + '</span></td></tr>');
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
  });