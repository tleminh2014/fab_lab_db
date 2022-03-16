/*global fablab _config AmazonCognitoIdentity AWSCognito*/

var fablab = window.fablab || {};

(function scopeWrapper($) {
    var signinUrl = '/signin.html';

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

    if (typeof AWSCognito !== 'undefined') {
        AWSCognito.config.region = _config.cognito.region;
    }

  

    fablab.authToken = new Promise(function fetchCurrentAuthToken(resolve, reject) {
        var cognitoUser = userPool.getCurrentUser();

        if (cognitoUser) {
            cognitoUser.getSession(function sessionCallback(err, session) {
                if (err) {
                    reject(err);
                } else if (!session.isValid()) {
                    resolve(null);
                } else {
                    resolve(session.getIdToken().getJwtToken());
                }
            });
        } else {
            resolve(null);
        }
    });


    /*
     * Cognito User Pool functions
     */

    function register(occupation, given_name, family_name, email, password, onSuccess, onFailure) {

        var dataoccupation = {
            Name: 'custom:occupation',
            Value: occupation
        };
        
        var datagiven_name = {
            Name: 'given_name',
            Value: given_name
        };

        var datafamily_name = {
            Name: 'family_name',
            Value: family_name
        };
        var dataEmail = {
            Name: 'email',
            Value: email
        };
        
        var attributeOccupation = new AmazonCognitoIdentity.CognitoUserAttribute(dataoccupation);
        var attributeGivenName = new AmazonCognitoIdentity.CognitoUserAttribute(datagiven_name);
        var attributeFamilyName = new AmazonCognitoIdentity.CognitoUserAttribute(datafamily_name);
        var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);

        userPool.signUp(toUsername(email), password, [attributeOccupation, attributeEmail, attributeGivenName, attributeFamilyName], null,
            function signUpCallback(err, result) {
                if (!err) {
                    onSuccess(result);
                } else {
                    onFailure(err);
                }
            }
        );
    }

    function completeRequest(result) {
        console.log('Response received from API: ', result);
      }

    function createaccountEntry(email, first_name, last_name) {
        $.ajax({
            method: 'POST',
            url: _config.api.invokeUrl + '/account',
            data: JSON.stringify({
                "email": email, 
                "first_name": first_name, 
                "last_name": last_name
            }),
            contentType: 'application/json',
            success: function(data){
                completeRequest(data)
            },
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error requesting account: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                alert('An error occured during account entry creation:\n' + jqXHR.responseText);
            }
        });
          
    }

    parseJwt = function(token) {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace('-', '+').replace('_', '/');
        return JSON.parse(window.atob(base64));
    }

    function signin(email, password, onSuccess, onFailure) {
        var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
            Username: toUsername(email),
            // Username: email,
            Password: password
        });

        var cognitoUser = createCognitoUser(email);
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: onSuccess,
            onFailure: onFailure
        });
    }

    // function signOut() {
    //     // userPool.getCurrentUser().signOut();
    //     const cognitoUser = userPool.getCurrentUser();
    //     if (cognitoUser !== null) {
    //         cognitoUser.signOut();
    //     }

    // };

    function verify(email, code, onSuccess, onFailure) {
        createCognitoUser(email).confirmRegistration(code, true, function confirmCallback(err, result) {
            if (!err) {
                onSuccess(result);
            } else {
                onFailure(err);
            }
        });
    }

    function createCognitoUser(email) {
        return new AmazonCognitoIdentity.CognitoUser({
            Username: toUsername(email),
            // Username: email,
            Pool: userPool
        });
    }

    function toUsername(email) {
        // return email.split("@").shift();
        return email.replace("@", "-at-");
    }

    /*
     *  Event Handlers
     */

    $(function onDocReady() {
        $('#signinForm').submit(handleSignin);
        $('#registrationForm').submit(handleRegister);
        $('#verifyForm').submit(handleVerify);
        $('#signOut').click(handleSignout);
    });

    function handleSignin(event) {
        var email = $('#emailInputSignin').val();
        var password = $('#passwordInputSignin').val();
        event.preventDefault();
        signin(email, password,
            function signinSuccess(result) {
                var returnData;
                token = result.getIdToken().getJwtToken();
                returnData = parseJwt(token);
                // console.log(returnData);
                var group = returnData['cognito:groups'][0];

                if (group == 'AdminGroup') {
                    window.location.href = 'fablabstaff_user.html';  
                } else {
                    window.location.href = 'user.html';  
                }
            },
            function signinError(err) {
                alert(err);
            }
        );
    }

    function handleSignout(){
        var cognitoUser = userPool.getCurrentUser();

        if(cognitoUser !== null) {
            cognitoUser.signOut();
            window.location.href = 'signin.html'; 
        }
    }
    
    function handleRegister(event) {
        var occupation = $('input[name=occupation]:checked').val();
        var given_name = $('#givennameInputRegister').val();
        var family_name = $('#familynameInputRegister').val();
        var email = $('#emailInputRegister').val();
        var password = $('#passwordInputRegister').val();
        var password2 = $('#password2InputRegister').val();

        var onSuccess = function registerSuccess(result) {
            var cognitoUser = result.user;
            console.log('user name is ' + cognitoUser.getUsername());
            var confirmation = ('Registration successful. Please check your email inbox or spam folder for your verification code.');
            if (confirmation) {
                window.location.href = 'verify.html';
            }
        };
        var onFailure = function registerFailure(err) {
            alert(err);
        };
        event.preventDefault();

        if (password === password2) {
            register(occupation, given_name, family_name, email, password, onSuccess, onFailure);
            createaccountEntry(email, given_name, family_name);

        } else {
            alert('Passwords do not match');
        }
    }

    function handleVerify(event) {
        var email = $('#emailInputVerify').val();
        var code = $('#codeInputVerify').val();
        event.preventDefault();
        verify(email, code,
            function verifySuccess(result) {
                console.log('call result: ' + result);
                console.log('Successfully verified');
                alert('Verification successful. You will now be redirected to the login page.');
                window.location.href = signinUrl;
            },
            function verifyError(err) {
                alert(err);
            }
        );
    }
}(jQuery));
