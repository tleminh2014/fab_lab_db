// Declare variables
var input, filter, table, tr, td, i, txtValue, td0;
input = document.getElementById("equipInput");
filter = input.value.toUpperCase();
table = document.getElementById("equipTable");
tr = table.getElementsByTagName("tr");

function equipFunction() {

    // Loop through all table rows, and hide those who don't match the search query
    for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[2];
    if (td) {
        txtValue = td.textContent || td.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
        tr[i].style.display = "";
        } else {
        tr[i].style.display = "none";
        }
    }
    }
}

function loadEquipmentTable () {
    $.ajax({
        method: 'GET',
        url: _config.api.invokeUrl + '/equipment',
        success: function(data){
          $('#equipTable').html('<thead class="thead-light" ><tr class="header"><th style="width: 15%;">Equipment ID #</th><th style="width: 20%;">Access Level Required</th><th style="width: 20%;">Equipment Type</th><th style="width: 10%;">Available?</th><th style="width: 10%;">Training</th><th style="width: 10%;">Checkout</th></tr></thead><tbody class=" table table-striped" style="text-align: center; justify-content: center; align-items: center; position: relative; "></tbody>');
          data.Items.forEach(function(equipmentItem){
    
            var availability;
            var checkout;
            var currentUser = equipmentItem.current_user;
            
            if (!equipmentItem.in_use) {
              availability = "<span style='color:green'>Available</span>";
              checkout = "<button class='checkout' data-dismiss='modal' data-value='"+ JSON.stringify(equipmentItem) +"' onchange='appendCheckoutFunction()'>Check Out</button>";
            } else {
              availability = "<span style='color:red'>Unavailable</span>";
              checkout = "<button class='checkin' data-dismiss='modal' data-value='"+ JSON.stringify(equipmentItem) +"'onchange='appendCheckinFunction()' disabled= 'true'>Check In</button>";
            }
            
            $('#equipTable').append('<tr> <td>' + equipmentItem.equipment_ID + '</td>' + '<td>' + equipmentItem.access_level_req + '</td>' 
              // + '<td>' + equipmentItem.date_maintenance +'</td>'+ '<td>' + equipmentItem.date_rented +'</td>'+ '<td>' + equipmentItem.date_returned 
              + '</td>'+ '<td>' + equipmentItem.equipment_type + '</td>'+ '<td>' + availability + '</td>'+ '<td>'+ '</td>'+ '<td>' + checkout + '<td style="display: none">' + currentUser +'</td></tr>'
            );
    
          });
        }
    });

}


function customerFilter() {
   console.clear();
    loadEquipmentTable();

    $("#currentTable").html('');
    var name = $("#customerName option:selected").text();
    var limit = $("#customerName option:selected").data("val");
    $("#currentCustomer").html(limit + ' Items checked-out for ' + name);
    $("#currentTable").append('<thead class="thead-light" ><tr class="header"><th style="width: 15%;">Equipment ID #</th><th style="width: 20%;">Access Level Required</th><th style="width: 20%;">Equipment Type</th><th style="width: 10%;">Available?</th><th style="width: 10%;">Training</th><th style="width: 10%;">Checkout</th></tr></thead><tbody class=" table table-striped" style="text-align: center; justify-content: center; align-items: center; position: relative; "></tbody>');


    // filtering items from all equipment table to checkout table
    var sel = document.getElementById('customerName');
    // display value property of select list (from selected option)
    var email = sel.value;
    // current user is defined by their email
    // selected option has value = email
    // if any entry have currentuser set to select user [7], move entry to first table, hide in latter table
    for (i = 1; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[6]; // the currentUser value
        // console.log(td);
        if (td) {
            txtValue = td.textContent || td.innerText; 
            if ( txtValue  == email) {
                console.log(td);
                table = document.getElementById("equipTable");
                var button = tr[i].getElementsByTagName("button")[0];
                button.removeAttribute('disabled');
                $("#currentTable").append(tr[i]);
            }
        }
    }

    function appendCheckoutFunction() {
        // if there is time remaining for this task, function will automatically shift the newly checkedout item to the customer table
    }

    function appendCheckinFunction() {
        // if there is time remaining for this task, function will automatically shift the newly checkedin item to the all equipment table

    }
  }