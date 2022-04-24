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
          //then displaying all matching instance of equipment tr
        tr[i].style.display = "";
        } else {
        tr[i].style.display = "none";
        }
    }
    }
}
 //function to reload the equipment table when the filter needs to be reset or user cancels out of edit mode
function loadEquipmentTable() {
    //repulling latest data from the equipment table and recreating the equipment table
    $.ajax({
        method: 'GET',
        url: _config.api.invokeUrl + '/equipment',
        success: function(data){
          $('#equipTable').html('<thead class="thead-light" ><tr class="header"><th style="width: 15%;">Equipment ID #</th><th style="width: 20%;">Access Level Required</th><th style="width: 20%;">Equipment Type</th><th style="width: 10%;">Available?</th><th style="width: 10%;">Training</th><th style="width: 10%;">Checkout</th></tr></thead><tbody class=" table table-striped" style="text-align: center; justify-content: center; align-items: center; position: relative; "></tbody>');
          data.Items.forEach(function(equipmentItem){
    
            var availability;
            var checkout;
            var currentUser = equipmentItem.current_user;
  
            // added by raven 
            var cancel, edit;
  
 
            //depending on the availibility of the equipment, the tr tag will be displayed differently
            if (!equipmentItem.in_use) {
              availability = "<span style='color:green'>Available</span>";
              checkout = "<button class='checkout sho' data-dismiss='modal' data-value='"+ JSON.stringify(equipmentItem) +"' onchange='appendCheckoutFunction()'>Check Out</button>";
              edit = "<button class='edit hidd' data-dismiss='modal' data-value='"+ JSON.stringify(equipmentItem) +"' onchange=''>Edit</button>";
              cancel = "<button class='cancel hidd' data-dismiss='modal' data-value='"+ JSON.stringify(equipmentItem) +"' onclick='cancelFunction()'>Cancel</button>";
            } else {
              availability = "<span style='color:red'>Unavailable</span>";
              checkout = "<button class='checkin sho' data-dismiss='modal' data-value='"+ JSON.stringify(equipmentItem) +"'onchange='appendCheckinFunction()' disabled= 'true'>Check In</button>";
              edit = "<button class='edit hidd' data-dismiss='modal' data-value='"+ JSON.stringify(equipmentItem) +"' onchange=''>Edit</button>";
              cancel = "<button class='cancel hidd' data-dismiss='modal' data-value='"+ JSON.stringify(equipmentItem) +"' onclick='cancelFunction()'>Cancel</button>";
            }
            
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
      
}

//driver function for when the cancel button is pressed - reloads the equipment table and hides the edit/cancel buttons, resetting the page
function cancelFunction() {
    // loadEquipmentTable();
    // $(".hidd").hide();
    // $(".sho").show();
    // $(".edit_db").html('<button onclick="switchButtons('+ "'button1'" + ',' + "'first'" + ')" id="button1" class="editdb_button">Edit Database</button><button onclick="switchButtons('+ "'button2'" + ',' + "'second'" + ')" id="button2" class="editdb_button">Update Database</button>');
    // above is a more graceful solution that still had bugs, so for now the page will reload after cancelling
    location.reload();
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