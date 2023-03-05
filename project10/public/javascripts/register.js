if (document.readyState !== "loading") {
    initializeCodeRegister();
  } else {
    document.addEventListener("DOMContentLoaded", function () {
      initializeCodeRegister();
    });
  }
  
  function initializeCodeRegister() {
    document.getElementById("submit-button").addEventListener("click", onSubmit);
    const user = document.getElementById("email")
    const pw = document.getElementById("password")

// When submit button is clicked, function get values from register form of user input and send to the backend. If user registers successfully, user is redirected to the login page
function onSubmit() {

    fetch("http://localhost:3000/register/", {
        method: "POST",
        headers: {
            "Content-type": "application/json"
        },
        body: '{ "email": "' + user.value + '", "password": "' + pw.value + '" }'
    }).then((response) => response.json())
        .then((data) => {
            console.log(data)
            if(data.ok) {
                window.location.href="/login.html"
            } else {
                if (data.email) {
                    document.getElementById("error").innerHTML = data.email;
                }
                if (data.errors) {
                    
                    document.getElementById("error").innerHTML = "Email must be type: example@email.com. Strong password requirements: minimum length 8, at least one lowercase letter, at least one uppercase letter, at least one number, at least one symbol"

                    
                }
            }

        })

        }
    }

