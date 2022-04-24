function stationFunction() {
    // Declare variables
    var input, filter, table, tr, td, i, txtValue;
    input = document.getElementById("stationInput");
    filter = input.value.toUpperCase();
    table = document.getElementById("stationTable");
    tr = table.getElementsByTagName("tr");

    // Loop through all table rows, and hide those who don't match the search query
    for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[3];
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

//driver function for when the cancel button is pressed - reloads the equipment table and hides the edit/cancel buttons, resetting the page
function cancelFunction() {
    // loadEquipmentTable();
    // $(".hidd").hide();
    // $(".sho").show();
    // $(".edit_db").html('<button onclick="switchButtons('+ "'button1'" + ',' + "'first'" + ')" id="button1" class="editdb_button">Edit Database</button><button onclick="switchButtons('+ "'button2'" + ',' + "'second'" + ')" id="button2" class="editdb_button">Update Database</button>');
    // above is a more graceful solution that still had bugs, so for now the page will reload after cancelling
    location.reload();
}