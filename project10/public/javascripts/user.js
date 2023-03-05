if (document.readyState !== "loading") {
    initializeCode();
  } else {
    document.addEventListener("DOMContentLoaded", function () {
      initializeCode();
    });
  }
  
function initializeCode() {

    const logoutLink = document.getElementById("logout")
    logoutLink.addEventListener("click", logout)
    const title = document.getElementById("title")
    const postcontentDiv1 = document.getElementById("postcontent-div1")
    const postcontentDiv2 = document.getElementById("postcontent-div2")
    const timestamp = document.getElementById("timestamp")
    const editTextareaContainerDiv1 = document.getElementById("edit-textarea1")
    const editTextareaContainerDiv2 = document.getElementById("edit-textarea2")

    /* User is re-authorized and users email address, register date, and the user bio are fetched from the backend and elements
    are created to display this content. User can delete or edit only their own posts and comments. If user is admin, then admin
    can see all content and have rights to edit and delete. */
    async function isUserLoggedIn() {
        const authToken = localStorage.getItem("auth_token");
        if(!authToken) return;
    
    
        await fetch("/user", {
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
                //console.log(data)
                const userIcon = document.createElement("i")
                userIcon.setAttribute("class", "material-icons")
                userIcon.innerHTML = "account_circle"
    
                let userdata = Object.values(data[0])
                userdata.forEach(element => {
                    let userName = element.email
                    console.log(userName)
                    title.innerHTML = "User " + userName
                    let registeredAt = element.createdAt
                    timestamp.innerHTML = "Registered at " + registeredAt
                })
                console.log(typeof data[1])
                if(Object.keys(data[1]).length === 0){ // check if user posts array is empty
                    let info = document.createElement("a")
                    info.setAttribute("class", "collection-item")
                    let infoText = document.createTextNode("You have no previous posts!")
                    info.href = "#"
                    info.title = "info"
                    info.appendChild(infoText)
                    postcontentDiv1.appendChild(info)
                } else { // create list for user posts and generate delete and edit buttons
                    let postdata = Object.values(data[1])
                    postdata.forEach(element => {
                        let postContentTitle = element.title
                        let postContentPost = element.post
                        let created = element.createdAt
                        let updated = element.updatedAt
                        let contentElement1 = document.createElement("p")
                        contentElement1.setAttribute("class", "collection-item")
                        contentElement1.innerHTML = "Title: " + postContentTitle + '<br></br>' + " Post: " + postContentPost + '<br></br>' + "Created: " + created + ", Last updated: " + updated
                        let deletePost = document.createElement("a")
                        deletePost.setAttribute("class", "waves-effect waves-light btn-small")
                        deletePost.innerHTML = "Delete"
                        deletePost.onclick = function() { deletePostClick(this) }
                        deletePost.href = "#"
                        deletePost.title = element._id
                        let editPost = document.createElement("a")
                        editPost.setAttribute("class", "waves-effect waves-light btn-small")
                        editPost.innerHTML = "Edit"
                        editPost.onclick = function() { editPostClick(this, postContentTitle, postContentPost) } //when the button is clicked, function takes post id value, post title and post content values into attributes
                        editPost.href = "#"
                        editPost.title = element._id
                        postcontentDiv1.appendChild(contentElement1)
                        postcontentDiv1.appendChild(deletePost)
                        postcontentDiv1.appendChild(editPost)
                    })
                }
                if(Object.keys(data[2]).length === 0) { // check if user comments array is empty
                    let info = document.createElement("a")
                    info.setAttribute("class", "collection-item")
                    let infoText = document.createTextNode("You have no previous comments!")
                    info.href = "#"
                    info.title = "info"
                    info.appendChild(infoText)
                    postcontentDiv2.appendChild(info)
                } else { // create list for user comments and generate delete and edit buttons
                    let commentdata = Object.values(data[2])
                    commentdata.forEach(element => {
                        let commentContent = element.comment
                        let commentcreated = element.createdAt
                        let commentupdated = element.updatedAt
                        let contentElement2 = document.createElement("p")
                        contentElement2.setAttribute("class", "collection-item")
                        contentElement2.innerHTML = commentContent + '<br></br>' + "Created: " + commentcreated + ", Last updated: " + commentupdated
                        let deleteComment = document.createElement("a")
                        deleteComment.setAttribute("class", "waves-effect waves-light btn-small")
                        deleteComment.innerHTML = "Delete"
                        deleteComment.onclick = function() { deleteCommentClick(this) }
                        deleteComment.href = "#"
                        deleteComment.title = element._id
                        let editComment = document.createElement("a")
                        editComment.setAttribute("class", "waves-effect waves-light btn-small")
                        editComment.innerHTML = "Edit"
                        editComment.onclick = function() { editCommentClick(this, commentContent) }
                        editComment.href = "#"
                        editComment.title = element._id
                        postcontentDiv2.appendChild(contentElement2)
                        postcontentDiv2.appendChild(deleteComment)
                        postcontentDiv2.appendChild(editComment)
                    })
                }
                
                })).catch((e) => {
                console.log("error" + e);
            })

            // send post id to delete into the backend when the delete button is clicked
            function deletePostClick(e) {
            
                let value = e.getAttribute("title")

                fetch("http://localhost:3000/post/delete", {
                    method: "POST",
                    headers: {
                        "Content-type": "application/json",
                        "authorization": "Bearer " + authToken
                    },
                    body: '{ "id": "' + value + '"}'
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
                        location.reload()
                    } else {
                        console.log(data)
                        location.reload()
                    }
                })).catch((e) => {
                    console.log("error" + e)
                })
            };

             // send comment id to delete into the backend when the delete button is clicked
            function deleteCommentClick(e) {
            
                let value = e.getAttribute("title")

                fetch("http://localhost:3000/comment/delete", {
                    method: "POST",
                    headers: {
                        "Content-type": "application/json",
                        "authorization": "Bearer " + authToken
                    },
                    body: '{ "id": "' + value + '"}'
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
                        location.reload()
                    } else {
                        console.log(data)
                        
                    }
                })).catch((e) => {
                    console.log("error" + e)
                })
            }

            /*when the edit post button is clicked, post id value, post title and post values are saved into variables,
            textarea and submit button for editing are displayed. Edited post is sent to the backend*/
            function editPostClick(e, title, content) {

                let idvalue = e.getAttribute("title")
                console.log(idvalue)
                const headerItem = document.createElement("h5")
                headerItem.innerHTML = "Edit post here:"
                const editTitle = document.createElement("textarea")
                editTitle.setAttribute("class", "materialize-textarea")
                editTitle.setAttribute("id", "textarea1")
                editTitle.innerHTML = title
                const editContent = document.createElement("textarea")
                editContent.setAttribute("class", "materialize-textarea")
                editContent.setAttribute("id", "textarea2")
                editContent.innerHTML = content
                const submitButton = document.createElement("button")
                submitButton.setAttribute("class", "btn waves-effect waves-light")
                submitButton.setAttribute("id", "submitedited-button")
                submitButton.setAttribute("type", "submit")
                submitButton.setAttribute("name", "action")
                submitButton.innerHTML = "Submit"
                const i = document.createElement("i")
                i.setAttribute("class", "material-icons right")
                i.innerHTML="send"
                submitButton.appendChild(i)
                editTextareaContainerDiv1.appendChild(headerItem)
                editTextareaContainerDiv1.appendChild(editTitle)
                editTextareaContainerDiv2.appendChild(editContent)
                editTextareaContainerDiv2.appendChild(submitButton)
               
                document.getElementById("submitedited-button").addEventListener("click", () => {
                    fetch("http://localhost:3000/post/edit", {
                        method: "POST",
                        headers: {
                            "Content-type": "application/json",
                            "authorization": "Bearer " + authToken
                        },
                        body: '{ "id": "' + idvalue + '", "title": "' + editTitle.value + '", "content": "' + editContent.value + '"}'
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
                            //location.reload()
                        }
                    })).catch((e) => {
                        console.log("error" + e)
                    })
                })
            }

            /*when the edit comment button is clicked, comment id value and comment content value are saved into variables,
            textarea and submit button for editing are displayed. Edited post is sent to the backend*/
            function editCommentClick(e, content) {

                let idvalue = e.getAttribute("title")
                console.log(idvalue)
                const headerItem = document.createElement("h5")
                headerItem.innerHTML = "Edit comment here:"
                const editComment = document.createElement("textarea")
                editComment.setAttribute("class", "materialize-textarea")
                editComment.setAttribute("id", "textarea1")
                editComment.innerHTML = content
                const submitButton = document.createElement("button")
                submitButton.setAttribute("class", "btn waves-effect waves-light")
                submitButton.setAttribute("id", "submitedited-button")
                submitButton.setAttribute("type", "submit")
                submitButton.setAttribute("name", "action")
                submitButton.innerHTML = "Submit"
                const i = document.createElement("i")
                i.setAttribute("class", "material-icons right")
                i.innerHTML="send"
                submitButton.appendChild(i)
                editTextareaContainerDiv1.appendChild(headerItem)
                editTextareaContainerDiv1.appendChild(editComment)
                editTextareaContainerDiv1.appendChild(submitButton)
               
                document.getElementById("submitedited-button").addEventListener("click", () => {
                    fetch("http://localhost:3000/comment/edit", {
                        method: "POST",
                        headers: {
                            "Content-type": "application/json",
                            "authorization": "Bearer " + authToken
                        },
                        body: '{ "id": "' + idvalue + '", "content": "' + editComment.value + '"}'
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
                            //location.reload()
                        }
                    })).catch((e) => {
                        console.log("error" + e)
                    })
                })
            }

        }
    //logout. Function explained and source information is available in posts.js file
    function logout(){
        localStorage.removeItem("auth_token");
        window.location.href = "/";
    }
    isUserLoggedIn()
}