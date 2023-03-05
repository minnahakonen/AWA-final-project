if (document.readyState !== "loading") {
    initializeCode();
  } else {
    document.addEventListener("DOMContentLoaded", function () {
      initializeCode();
    });
  }
  
function initializeCode() {

    const showPosts = document.getElementById("table-body")
    const linkList = document.getElementById("nav-mobile")
    const postTitle = document.getElementById("textarea1")
    const postContent = document.getElementById("textarea2")
    const searchInput = document.getElementById("search")
    const searchButton = document.getElementById("search-button")
    let postid
    let isSearched = false


    /*Event listener if user has searched. Fetch only posts with searched keyword */
    searchButton.addEventListener("click", () => {
        isSearched = true
        showPosts.innerHTML = ""  // clears table body before fetch
        const keyword = searchInput.value
        fetch('/posts/'+keyword).then((response) => response.json())
        .then((data) => {
            console.log(data)
            data.forEach(element => {
                postid = element._id
                let title = element.title
                let post = element.post.slice(0,25) // display only part of post in the table
                let comments = element.comments
                count = 0
                comments.forEach(e =>{
                    count ++
                }) // displays count of comments in the table
                let votes = element.votes
                let newRow = document.createElement("tr")
                let cell1 = document.createElement("td")
                let cell2 = document.createElement("td")
                let cell3 = document.createElement("td")
                let cell4 = document.createElement("td")
                let cell5 = document.createElement("td")
                let link = document.createElement("a")
                link.setAttribute("class", "secondary-content")
                link.onclick = function() { clickedLink(this) } // get post id from title inside the function which is used if user clicks the button
                link.href = "#";
                link.title = postid
                let i = document.createElement("i")
                i.setAttribute("class", "material-icons")
                i.innerText = "send"
                link.appendChild(i)
                cell1.innerHTML = title
                cell2.innerHTML = post + "..."
                cell3.innerHTML = count
                cell4.innerHTML = votes
                cell5.appendChild(link)
                newRow.appendChild(cell1)
                newRow.appendChild(cell2)
                newRow.appendChild(cell3)
                newRow.appendChild(cell4)
                newRow.appendChild(cell5)
                showPosts.appendChild(newRow)
    
            });
            
        }).catch((e) => {
            console.log("error" + e);
        })
    })
    
// fetch all posts from backend and create the table to display posts.
function fetchPosts() {
    let idcounter = 0
    fetch("/posts").then((response) => response.json())
    .then((data) => {
        console.log(data)
        data.forEach(element => {
            postid = element._id
            let title = element.title
            let post = element.post.slice(0,25)
            let comments = element.comments
            idcounter ++
            count = 0
            comments.forEach(e =>{
                count ++
            })
            let votes = element.votes
            let newRow = document.createElement("tr")
            let cell1 = document.createElement("td")
            let cell2 = document.createElement("td")
            let cell3 = document.createElement("td")
            let cell4 = document.createElement("td")
            let cell5 = document.createElement("td")
            let link = document.createElement("a")
            link.setAttribute("class", "secondary-content")
            link.setAttribute("id", "link-id" + idcounter)
            link.onclick = function() { clickedLink(this) } // get post id from title inside the function which is used if user clicks the button
            link.href = "#";
            link.title = postid
            let i = document.createElement("i")
            i.setAttribute("class", "material-icons")
            i.innerText = "send"
            link.appendChild(i)
            cell1.innerHTML = title
            cell2.innerHTML = post + "..."
            cell3.innerHTML = count
            cell4.innerHTML = votes
            cell5.appendChild(link)
            newRow.appendChild(cell1)
            newRow.appendChild(cell2)
            newRow.appendChild(cell3)
            newRow.appendChild(cell4)
            newRow.appendChild(cell5)
            showPosts.appendChild(newRow)

            

        });
        
    }).catch((e) => {
        console.log("error" + e);
    })
    
}

// check if user is not logged in, and create login and register links into the navbar
function notLoggedIn() {
    const authToken = localStorage.getItem("auth_token"); // source: https://version.lab.fi/Erno.Vanhala/web-applications-week-8/-/blob/master/public/javascripts/users.js

    if(authToken) return;

    const listElement1 = document.createElement("li")
    const listElement2 = document.createElement("li")
    const linkElement1 = document.createElement("a")
    const linkElement2 = document.createElement("a")
    const linkText1 = document.createTextNode("Login");
    const linkText2 = document.createTextNode("Register");
    linkElement1.appendChild(linkText1)
    linkElement2.appendChild(linkText2)
    linkElement1.title = "Login";
    linkElement1.href = "../login.html";
    listElement1.appendChild(linkElement1)
    linkElement2.title = "Register";
    linkElement2.href = "#";
    listElement2.appendChild(linkElement2)
    linkList.appendChild(listElement1)
    linkList.appendChild(listElement2)

    
}

/*user authorization is checked from the backend and links into the user profile and logout are created.
Authorized user is also allowed to submit new posts*/
function isUserLoggedIn() {
    // jwt is taken from local storage and saved into the authToken variable
    // source: https://version.lab.fi/Erno.Vanhala/web-applications-week-8/-/blob/master/public/javascripts/users.js
    const authToken = localStorage.getItem("auth_token");
    if(!authToken) return;

    let user

    //user authorization is checked from the backend
    fetch("/private", {
        method: "GET",
        headers: {
            "authorization": "Bearer " + authToken
        }
    })
    .then((response) => {
        if (response.status === 401) {
            //if user is unauthorized, jwt is removed from local storage
            localStorage.removeItem("auth_token");
            window.location.href = "../login.html"
        }
        return response.json()
        }).then((data => {

            console.log(data)
            user = data.email
            const userNameListElement = document.createElement("li")
            const userName = document.createElement("a")
            userName.href = "/user.html" // link into the user profile page
            userName.title = "user"
            const userlinkText = document.createTextNode("User: " + user)
            userName.appendChild(userlinkText)
            userNameListElement.appendChild(userName)
            linkList.appendChild(userNameListElement)
            const listElement1 = document.createElement("li")
            const logoutElement = document.createElement("a") // link to logout
            const linkText1 = document.createTextNode("Logout");
            logoutElement.appendChild(linkText1)
            logoutElement.title = "Logout";
            logoutElement.href = "#";
            listElement1.appendChild(logoutElement)
            linkList.appendChild(listElement1)
            logoutElement.addEventListener("click", logout); // logout function is used when user clicks logout element
            }
        )).catch((e) => {
            console.log("error" + e);
        })
        

        document.getElementById("submit-button").addEventListener("click", onSubmit);

        // submit new post if authorized
        async function onSubmit() {

            const t = postContent.value
            const textvalue = t.replace(/\n\r?/g, '<br />')

            await fetch("http://localhost:3000/posts", {
                method: "POST",
                headers: {
                    "Content-type": "application/json",
                    "authorization": "Bearer " + authToken
                    
                },
                body: '{ "username": "' + user + '", "title": "' + postTitle.value + '", "post": "' + textvalue + '" }'
            }).then((response) => response.json())
                .then((data) => {
                    console.log(data)
                    //location.reload()
                })
                    
                    .catch((e) => {
                        console.log("error" + e);
                    })
            
        }

        


}


// function to get clicked post's id from the title attribute and send it to backend
async function clickedLink(e) {
    
    
    let value = e.getAttribute("title")
    console.log("clicked link with value: " + value)
    

   await fetch("http://localhost:3000/post/id", {
                method: "POST",
                headers: {
                    "Content-type": "application/json"
                },
                body: '{ "id": "' + value + '"}'
            })
    
    window.location.href = "../comments.html"
}

// removes jwt from the local storage and redirects in index page
// source: https://version.lab.fi/Erno.Vanhala/web-applications-week-8/-/blob/master/public/javascripts/users.js
function logout(){
    localStorage.removeItem("auth_token");
    window.location.href = "/";
}
if(isSearched == false) {
    fetchPosts()
}


notLoggedIn()
isUserLoggedIn()
}