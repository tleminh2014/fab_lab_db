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