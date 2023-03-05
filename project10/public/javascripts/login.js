if (document.readyState !== "loading") {
    initializeCodeLogin();
  } else {
    document.addEventListener("DOMContentLoaded", function () {
      initializeCodeLogin();
    });
  }
  
  
  function initializeCodeLogin() {
    document.getElementById("submit-button").addEventListener("click", onSubmit);
    const user = document.getElementById("email")
    const pw = document.getElementById("password")

/*
  Get user login form values and send into the backend for authentication 
  source: https://version.lab.fi/Erno.Vanhala/web-applications-week-8/-/blob/master/public/javascripts/login.js */

    function onSubmit() {

        fetch("http://localhost:3000/login", {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: '{ "email": "' + user.value + '", "password": "' + pw.value + '" }'
        }).then((response) => response.json())
            .then((data) => {
                console.log(data)
                if(data.token) {
                    storeToken(data.token);
                    window.location.href="/posts.html";
                } else {
                    if (data.message) {
                        document.getElementById("error").innerHTML = data.message;
                    }  else {
                        document.getElementById("error").innerHTML = "error!";
                    }
                }

            })
        }

/*  If jwt token is received from the response, it is set for the users local storage
source: https://version.lab.fi/Erno.Vanhala/web-applications-week-8/-/blob/master/public/javascripts/login.js */
function storeToken(token) {
    localStorage.setItem("auth_token", token);
}
}
