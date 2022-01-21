<?php
    session_start();
?>

<!DOCTYPE html>
<html lang="en">
  <head>
    <!-- Required meta tags -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">

    <!-- my CSS file -->
    <link rel="stylesheet" href="style.css">
    
    <!-- icon library -->
    
    
    <!-- title tab -->
    <title>Fab Lab</title>
  </head>
  <body>
    <!-- navigation bar -->
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
        <div class="container-fluid">
          <a class="navbar-brand" href="/fablabtest/index.html">Fab Lab</a>
          <!-- <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarTogglerDemo02" aria-controls="navbarTogglerDemo02" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button> -->
          <div class="nav justify-content-end" id="navbarTogglerDemo02">
            <?php
              //checks if the user is logged in
              if (isset($_SESSION["usersid"]))
              {
                // echo "<a href='profile.php'><button>Profile</button></a>";
                echo "<a href='logout.inc.php'><button class='navbutton'>Logout</button></a>";
              }
              // else // if user isnt logged in
              // {
              //     echo "<a href='login.php'><button class='navbutton'>Sign In</button></a>";
              //     echo "<a href='signup.php'><button class='navbutton'>Sign Up</button></a>";
              // }
            ?>
            <!-- <ul class="navbar-nav me-auto mb-2 mb-lg-0">
              <li class="nav-item">
                <a class="nav-link active" aria-current="page" href="#">Home</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="#">Link</a>
              </li>
              <li class="nav-item">
                <a class="nav-link disabled">Disabled</a>
              </li>
            </ul>  -->
            <!-- <form class="d-flex">
              <input class="form-control me-2" type="search" placeholder="Search" aria-label="Search">
              <button class="btn btn-outline-success" type="submit">Search</button>
            </form> -->
          </div>
        </div>
    </nav>
        
    
    
  

    <div class="signupform">
        <h1 class="signupheader">Sign Up</h1>
        <p class="inst">Please fill in the following fields:</p>
        <div class="signup-form">
            <form action="signup.inc.php" method="post">
                <div class="newuser" style="display:flex;">
                    <input type="text" name="firstname" placeholder="First Name">
                    <input style="margin-left: 5px;" type="text" name="lastname" placeholder="Last Name">
                </div>
                <div class="newuser">
                    <input type="email" name="email" placeholder="Email">
                </div>
                <div class="newuser">
                    <input type="password" name="password" placeholder="Password">
                </div>
                <div class="newuser">
                    <input type="password" name="repeatpassword" placeholder="Repeat Password">
                </div>
                <div class="newuserocc">
                    <p>Occupation:</p>
                    <div class="radiooptions">
                        <input type="radio" id="Business/Organization" name="occupation" value="Business/Organization">
                        <label for="Business/Organization">Business/Organization</label><br>
                        <input type="radio" id="Guest" name="occupation" value="Guest">
                        <label for="Guest">Guest</label>
                    </div>
                </div>
                <div class="fausignup">
                    <!-- <input type="number" name="phonenumber" placeholder="Number" size="10"> -->
                    <label for="">Are you a FAU student or faculty member?</label>
                    <a href=""><button>FAU Sign Up</button></a>
                </div>
                <div class="signupformbuttons">
                    <button type="cancel" formaction="/fablabtest/index.html" name="cancel">Cancel</button>
                    <button type="submit">Submit</button>
                </div>
                <div class="leadsignin">
                    <label for="">Already have an account with us?</label>
                    <button formaction="/fablabtest/login.php">Log In</button>
                </div>
            </form>
        </div>
        <?php
          if (isset($_GET['error']))
          {
            // if any input field are empty
            if ($_GET['error'] == "emptyinput")
            {
              echo "<p>fill in all fields!</p>";
            }
            // if the username isn't proper
            else if ($_GET['error'] == "invalidusername")
            {
              echo "<p>Username is not valid</p>";
            }
            //if the email is invalid
            else if ($_GET['error'] == "invalidemail")
            {
              echo "<p>Email is not valid</p>";
            }
            // if passwords doesn't match
            else if ($_GET['error'] == "passworderror")
            {
              echo "<p>Password is not the same</p>";
            }
            // if the username already exists in the database
            else if ($_GET['error'] == "usernametaken")
            {
              echo "<p>Username is already taken</p>";
            }
            // if something went wrong
            else if ($_GET['error'] == "stmtfailed")
            {
              echo "<p>Something went wrong, try again</p>";
            }
            // no error exists
            else if ($_GET['error'] == "none")
            {
              echo "<p>Account successfully created</p>";
            }
          }
        ?>
    </div>

    









    <!-- Optional JavaScript; choose one of the two! -->
    <!-- Option 1: Bootstrap Bundle with Popper -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-ka7Sk0Gln4gmtz2MlQnikT1wXgYsOg+OMhuP+IlRH9sENBO0LRn5q+8nbTov4+1p" crossorigin="anonymous"></script>
    <!-- Option 2: Separate Popper and Bootstrap JS -->
    <!--
    <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.10.2/dist/umd/popper.min.js" integrity="sha384-7+zCNj/IqJ95wo16oMtfsKbZ9ccEh31eOz1HGyDuCQ6wgnyJNSYdrPa03rtR1zdB" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.min.js" integrity="sha384-QJHtvGhmr9XOIpI6YVutG+2QOK9T+ZnN4kzFN1RtK3zEFEIsxhlmWl5/YESvpZ13" crossorigin="anonymous"></script>
    -->
  </body>
</html>