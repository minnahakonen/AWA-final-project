if (document.readyState !== "loading") {
    initializeCode();
  } else {
    document.addEventListener("DOMContentLoaded", function () {
      initializeCode();
    });
  }
  
function initializeCode() {

    const linkList = document.getElementById("nav-mobile")
    const commentButton = document.getElementById("comment-button")
    const voteupButton = document.getElementById("voteup-button")
    const votedownButton = document.getElementById("votedown-button")
    const commentTextAreaDiv = document.getElementById("comment-textarea")
    const messagePanel = document.getElementById("message-panel")
    let postID

    /*user authorization is checked from the backend and links into the user profile and logout are created. Authorized user 
    is also allowed to vote up or down posts and comments and submit new comments
    source: https://version.lab.fi/Erno.Vanhala/web-applications-week-8/-/blob/master/public/javascripts/users.js*/
    function isUserLoggedIn() {
        const authToken = localStorage.getItem("auth_token");
        if(!authToken) return;
    
        let user
    
        fetch("/private", {
            method: "GET",
            headers: {
                "authorization": "Bearer " + authToken
            }
        })
            .then((response) => {
                if (response.status === 401) {
                 localStorage.removeItem("auth_token");
                 window.location.href = "../login.html"
                }
                return response.json()
                }).then((data => {
                user = data.email
                const listElement1 = document.createElement("li")
                const userName = document.createElement("a")
                userName.href = "/user.html"
                userName.title = user
                const userNameText = document.createTextNode("User: " + user)
                userName.appendChild(userNameText)
                listElement1.appendChild(userName)
                const listElement2 = document.createElement("li")
                const logoutElement = document.createElement("a")
                const linkText1 = document.createTextNode("Logout");
                logoutElement.appendChild(linkText1)
                logoutElement.title = "Logout";
                logoutElement.href = "#";
                listElement2.appendChild(logoutElement)
                linkList.appendChild(listElement1)
                linkList.appendChild(listElement2)
                logoutElement.addEventListener("click", logout);
            })).catch((e) => {
                console.log("error " + e)
            })
            const commentContent = document.createElement("textarea")
            
            // if "leave comment" button is clicked, textarea and submit button for a new comment is created
            commentButton.addEventListener("click", () => {

                
                commentContent.setAttribute("class", "materialize-textarea")
                commentContent.setAttribute("id", "textarea")
                const label = document.createElement("label")
                label.setAttribute("for", "textarea")
                label.innerHTML = "Your Comment"
                const submitButton = document.createElement("button")
                submitButton.setAttribute("class", "btn waves-effect waves-light")
                submitButton.setAttribute("id", "submitcomment-button")
                submitButton.setAttribute("type", "submit")
                submitButton.setAttribute("name", "action")
                submitButton.innerHTML = "Submit"
                const i = document.createElement("i")
                i.setAttribute("class", "material-icons right")
                i.innerHTML="send"
                submitButton.appendChild(i)
                commentTextAreaDiv.appendChild(commentContent)
                commentTextAreaDiv.appendChild(label)
                commentTextAreaDiv.appendChild(submitButton)
               
                document.getElementById("submitcomment-button").addEventListener("click", onSubmit) //event listener for submit comment button

                
            })

            // send a new comment and jwt
            function onSubmit() {
                const t = commentContent.value
                const textvalue = t.replace(/\n\r?/g, '<br />') //source: https://stackoverflow.com/questions/863779/how-to-add-line-breaks-to-an-html-textarea

                fetch("http://localhost:3000/comments", {
                    method: "POST",
                    headers: {
                        "Content-type": "application/json",
                        "authorization": "Bearer " + authToken
                    },
                    body: '{ "username": "' + user + '", "comment": "' + textvalue + '", "_id": "' + postID + '" }'
                }).then((response) => {
                    if (response.status === 401) {
                     localStorage.removeItem("auth_token");
                     window.location.href = "../login.html"
                    }
                    return response.json()
                    }).then((data => {
                        console.log(data.message)
                        //location.reload()
                   }))
            }
            //send a new up vote for the post
            voteupButton.addEventListener("click", () => {
                let number = 1
                fetch("http://localhost:3000/post/vote", {
                    method: "POST",
                    headers: {
                        "Content-type": "application/json",
                        "authorization": "Bearer " + authToken
                    },
                    body: '{ "number": "' + number + '", "user": "' + user + '", "voted": "' + postID + '" }'
                }).then((response) => {
                    if (response.status === 401) {
                     localStorage.removeItem("auth_token");
                     window.location.href = "../login.html"
                    }
                    return response.json()
                    }).then((data => {
                    if(data.message) {
                        let message = data.message
                        console.log(message)
                        messagePanel.innerHTML = message // if user has already voted, backend responses with info message and this information is displayed in the message panel
                    } else {
                        console.log(data)
                        location.reload()
                    }
                }))
            });

            //send a new down vote for the post
            votedownButton.addEventListener("click", () => {

                let number = -1
                fetch("http://localhost:3000/post/vote", {
                    method: "POST",
                    headers: {
                        "Content-type": "application/json",
                        "authorization": "Bearer " + authToken
                    },
                    body: '{ "number": "' + number + '", "user": "' + user + '", "voted": "' + postID + '" }'
                }).then((response) => {
                    if (response.status === 401) {
                     localStorage.removeItem("auth_token");
                     window.location.href = "../login.html"
                    }
                    return response.json()
                    }).then((data => {
                    if(data.message) {
                        let message = data.message
                        console.log(message)
                        messagePanel.innerHTML = message
                    } else {
                        console.log(data)
                        location.reload()
                    }
                }))
                
            })
         
           
    }
    
    // get a post and its comments from the backend and create elements to display those in the card
    async function fetchPosts() {
        
        const contentDiv = document.getElementById("card-content-id")
        const commentsDiv = document.getElementById("card-comments-id")
        
        await fetch("http://localhost:3000/post/id") // get post
        .then((response) => response.json())
        .then((data) => {
            //console.log(data)
            data.forEach(element => {
                postID = element._id
                let postTitle = element.title
                let postPost = element.post
                let postVotes = element.votes
                let postCreated = element.createdAt
                let postUpdate = element.updatedAt
                let titleElement = document.createElement("span")
                titleElement.setAttribute("class", "card-title")
                titleElement.innerHTML = postTitle
                contentDiv.appendChild(titleElement)
                let timeElement1 = document.createElement("p")
                let timeElement2 = document.createElement("p")
                let postElement = document.createElement("p")
                let voteElement = document.createElement("span")
                voteElement.setAttribute("class", "badge")
                voteElement.innerHTML = "Votes: " + postVotes
                timeElement1.innerHTML = "Created at: " + postCreated
                timeElement2.innerHTML = "Last updated at: " + postUpdate
                postElement.innerHTML = postPost
                contentDiv.appendChild(postElement)
                contentDiv.appendChild(timeElement1)
                contentDiv.appendChild(timeElement2)
                contentDiv.appendChild(voteElement)
                
            })
            
        })
        .catch((e) => {
            console.log("error" + e);
        })
        await fetch("http://localhost:3000/comments/"+postID) //get comments
        .then((response) => response.json())
        .then((data) => {
            //console.log(data)
            data.forEach(element => {
                let commentID = element._id
                let commentVotes = element.votes
                console.log(commentVotes)
                let newCommentList = document.createElement("li")
                newCommentList.setAttribute("class", "collection-item")
                let newComment = document.createElement("p")
                let timeElement1 = document.createElement("p")
                let timeElement2 = document.createElement("p")
                let voteElement = document.createElement("span")
                voteElement.setAttribute("class", "badge")
                voteElement.innerHTML = "Votes: " + commentVotes
                let voteupComment = document.createElement("a")
                voteupComment.setAttribute("class", "waves-effect waves-light btn-small")
                voteupComment.innerHTML = "Vote Up"
                voteupComment.onclick = function() { voteCommentUp(this) } //if the button is clicked, the function is used and it gets comment id as a title attribute
                voteupComment.href = "#"
                voteupComment.title = commentID
                let votedownComment = document.createElement("a")
                votedownComment.setAttribute("class", "waves-effect waves-light btn-small")
                votedownComment.innerHTML = "Vote Down"
                votedownComment.onclick = function() { voteCommentDown(this) } //if the button is clicked, the function is used and it gets comment id as a title attribute
                votedownComment.href = "#"
                votedownComment.title = commentID
                let lineBreak = document.createElement("br")
                let commentContent = element.comment
                let commentCreated = element.createdAt
                let commentUpdate = element.updatedAt
                newComment.innerHTML = commentContent
                timeElement1.innerHTML = "Created at: " + commentCreated
                timeElement2.innerHTML = "Last updated at: " + commentUpdate
                newCommentList.appendChild(newComment)
                newCommentList.appendChild(timeElement1)
                newCommentList.appendChild(timeElement2)
                newCommentList.appendChild(voteupComment)
                newCommentList.appendChild(votedownComment)
                newCommentList.appendChild(voteElement)
                commentsDiv.appendChild(newCommentList)
                commentsDiv.appendChild(lineBreak)
            })
        })
        .catch((e) => {
            console.log("error" + e);
        })
    }
    //send a new up vote for the comment
    function voteCommentUp(e) {
        const authToken = localStorage.getItem("auth_token");
        if(!authToken) return
    
        let value = e.getAttribute("title")
        let number = 1
        fetch("http://localhost:3000/comment/vote", {
            method: "POST",
            headers: {
                "Content-type": "application/json",
                "authorization": "Bearer " + authToken
            },
            body: '{ "number": "' + number + '", "voted": "' + value + '" }'
        }).then((response) => {
            if (response.status === 401) {
             localStorage.removeItem("auth_token");
             window.location.href = "../login.html"
            }
            return response.json()
            }).then((data => {
            if(data.message) {
                let message = data.message
                console.log(message)
                messagePanel.innerHTML = message
            } else {
                console.log(data)
               location.reload()
            }
        }))
    }
    // send a new down vote for the comment
    function voteCommentDown(e) {
        const authToken = localStorage.getItem("auth_token");
        if(!authToken) return;
    
        let value = e.getAttribute("title")
        let number = -1
        fetch("http://localhost:3000/comment/vote", {
            method: "POST",
            headers: {
                "Content-type": "application/json",
                "authorization": "Bearer " + authToken
            },
            body: '{ "number": "' + number + '", "voted": "' + value + '" }'
        }).then((response) => {
            if (response.status === 401) {
             localStorage.removeItem("auth_token");
             window.location.href = "../login.html"
            }
            return response.json()
            }).then((data => {
            if(data.message) {
                let message = data.message
                console.log(message)
                messagePanel.innerHTML = message
            } else {
                console.log(data)
                location.reload()
            }
        }))
                
    }
    
    function logout(){
        localStorage.removeItem("auth_token");
        window.location.href = "/";
    }
    
    fetchPosts()
    isUserLoggedIn()
    
}