var express = require('express');
var router = express.Router();
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const {body, validationResult } = require("express-validator");
const User = require("../models/Users");
const Post = require("../models/Posts");
const Comment = require("../models/Comments");
const Vote = require("../models/Votes");
const jwt = require("jsonwebtoken");
const validateToken = require("../auth/validateToken.js")

const jwtExpirySeconds = 600 //set expiration seconds for jwt

/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile("/index.html");
});


/*Route for user registeration. Express-validator is utilized to check if user email and password inputs fullfill the requirements and uniqueness
of user email. Bcrypt library is used to salt and hash the password and new user is created.
source: https://version.lab.fi/Erno.Vanhala/web-applications-week-7/-/blob/master/routes/users.js    */
router.post("/register/", body('email').isEmail(), body("password").isStrongPassword({
  minLength: 8,
  minLowercase: 1,
  minUppercase: 1,
  minNumbers: 1,
  minSymbols: 1,
  returnScore: false}),
  (req, res, next) => {
    console.log(req.body)
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      return res.json({errors: errors.array()});
    }
    User.findOne({email: req.body.email}, (err, user) => {
      if(err) {
        console.log(err);
        throw err
      };
      if(user){
        return res.json({email: "Email already in use"});
      } else {
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(req.body.password, salt, (err, hash) => {
            if(err) throw err;
            User.create(
              {
                email: req.body.email,
                password: hash
              },
              
              (err, ok) => {
                if(err) throw err;
                return res.send({ok: "user created"});
              }
            );
          });
        });
      }
    });

  });

/* Route for user login. First it checks if user already exists in database. Then if user is found, it
utilize bcrypt to compare if password matches. If it matches, a new jwt is created for the user. 
source: https://version.lab.fi/Erno.Vanhala/web-applications-week-7/-/blob/master/routes/users.js*/
router.post("/login", (req, res) => {
  User.findOne({email: req.body.email}, (err, user) =>{
    if(err) throw err;
    if(!user) {
      return res.status(403).json({message: "Invalid credentials"});
    } else {
      bcrypt.compare(req.body.password, user.password, (err, isMatch) => {
        if(err) throw err;
        if(isMatch) {
          const jwtPayload = {
            id: user._id,
            email: user.email
          }
          const token = jwt.sign(
            jwtPayload,
            process.env.SECRET,
            {
              expiresIn: jwtExpirySeconds
            },
            (err, token) => {
              res.json({success: true, token});
            }
          );
        } else {
            res.json({message: "Invalid credentials"});
        }
      })
    }

  })
});

/*Route to get all posts in posts's page. */
router.get('/posts', function(req, res, next) {
    Post.find({}, (err, posts) =>{
      if(err) return next(err);
      res.send(posts);
    });
});

/*Route to get searched posts in posts's page. Takes user inputted search keyword as url parameter
and searches from database */
// find with keyword regex source: https://stackoverflow.com/questions/49842420/how-to-use-mongoose-to-query-keyword-in-2-fields
router.get('/posts/:keyword', function(req, res, next) {
  let keyword = req.params.keyword
  console.log(keyword)
  if (keyword != "0") {
    Post.find({
      $or: [ {title : { $regex: keyword, $options: 'i' }}, { post: { $regex: keyword, $options: 'i' } } ]
  }, (err, posts) =>{
      if(err) return next(err);
      res.send(posts);
    });
  }
  else {
    Post.find({}, (err, posts) =>{
      if(err) return next(err);
      res.send(posts);
    });
  }
});

/*Route to handle user send new post. Uses validateToken as middleware function to validate user authorization.
Create new post in the database*/
router.post("/posts", validateToken, function(req, res, next) {
  User.findOne({email: req.body.username}, (err, user) =>{
    if(err) throw err;
    if(!user) {
      return res.status(403).json({message: "User not found"});
    } else {

      Post.create(
        { 
          user: user._id,
          title: req.body.title,
          post: req.body.post
        },
        (err, ok) => {
          if(err) throw err;
          res.send({ok: "post created"});
          }
      );
    }})
});


/*Route to handle user post votes.  Uses validateToken to validate user authorization.
First user id is searched from Users model, then user id and post id combination is searched from Votes model.
If that combination doesn't exist yet, then new user vote is created and vote count is updated into the Post model.  */
router.post('/post/vote', validateToken, function(req, res, next) {
  
  User.findOne({email: req.user.email}, (err, user) =>{
    if(err) throw err;
    let userid = user._id
    let voteNumber = req.body.number
    let postid = req.body.voted
    Vote.find({$and: [{user: userid}, {voted: postid}]}, (err, votes) =>{
      if(err) return next(err);
      console.log(votes)
      if(votes.length == 0){
        Vote.create(
          {
            user: userid,
            voted: postid
          }
        ,(err) => {
          if(err) throw err;
          });
          Post.findOneAndUpdate({ _id: postid }, { $inc: { votes: voteNumber } }, {new: true }, (err, votes) => {
            if(err) return next(err);
            res.send(votes)
          })
      } else {
        res.send({message: "Already voted"})
        }
    })
  })
});


/*Route to handle user comment votes.  Uses validateToken to validate user authorization.
First user id is searched from Users model, then user id and comment id combination is searched from Votes model.
If that combination doesn't exist yet, then new user vote is created and vote count is updated into the Comment model.  */
router.post('/comment/vote', validateToken, function(req, res, next) {
  
  User.findOne({email: req.user.email}, (err, user) =>{
    if(err) throw err;
    let userid = user._id
    let voteNumber = req.body.number
    let postid = req.body.voted
    console.log("this is postid "+postid)
    console.log(voteNumber)
    Vote.find({$and: [{user: userid}, {voted: postid}]}, (err, votes) =>{
      if(err) return next(err);
      console.log(votes)
      if(votes.length == 0){
        Vote.create(
          {
            user: userid,
            voted: postid
          }
        ,(err) => {
          if(err) throw err;
          });
          Comment.findOneAndUpdate({ _id: postid }, { $inc: { votes: voteNumber } }, {new: true }, (err, votes) => {
            if(err) return next(err);
            res.send(votes)
          })
      }
      else {
        res.send({message: "Already voted"})
      }
    })
    });
  
          
});

/*Route to get one post's comments to be used in the comments page. The post id is used as a url parameter and 
searched from the Comments model. */
router.get('/comments/:id', function(req, res, next) {
  let commentToFind = req.params.id
  console.log("param id: " + commentToFind)
  Comment.find({postID: commentToFind}, (err, comments) =>{
    if(err) return next(err);
    res.send(comments);
  });
});

/*Route to handle user to send a new comment. User authorization is validated with validateToken middleware. User id is 
searched from the database. A new comment is created in the Comments model and also the Posts model is updated and pushed a new comment
into the comments array inside the Post model. */
router.post('/comments', validateToken, function(req, res, next) {
  
  User.findOne({email: req.body.username}, (err, user) =>{
    if(err) throw err;
    if(!user) {
      return res.status(403).json({message: "User not found"});
    } else {
      console.log(user)

      let newContent = req.body.comment
      
      Comment.create(
        {
          user: user._id,
          comment: newContent,
          postID: req.body._id
        }
    )
    
      Post.findOneAndUpdate({_id: req.body._id}, {"$push": {comments: {comment: newContent}}}, {new: true}, (err, info) => {
        if (err) throw err;
        else {
          console.log(info)
        }
      })

      res.send({message: "comment created"})
      console.log("comment created!")

      }
  })
});

/*Route to handle the specific post's post id which user clicked and what is used in the comments page */
let postID
router.post("/post/id", (req, res) => {
  postID = req.body.id
  console.log(postID)
  res.send(postID)

});
/*Route to get the specific post what is used in the comments page */
router.get("/post/id", (req, res) => {
  Post.find({_id: postID}, (err, posts) =>{
    if(err) return next(err);
    res.send(posts);
  })
});

/*Route to check if user is authorized using validateToken middleware and send user email address as response.
If user is not authorized, validateToken responses with 401 unauthorized. */
router.get("/private", validateToken, (req, res) => {
  User.findOne({email: req.user.email}, (err, user) =>{
    if(err) throw err;
    res.json({"email": user.email})

  })
});

/*Route to handle user's deletion of their own posts. If a post is deleted, also it's comments are deleted. */
router.post("/post/delete", validateToken, (req, res) => {
  User.findOne({email: req.user.email}, (err, user) =>{
    if(err) throw err;
    userid = user._id
    let postToDelete = req.body.id
    Post.deleteOne({_id: postToDelete}, (err, info) => {
      if(err) throw err;
      console.log(info)
      Comment.deleteMany({postID: postToDelete}, (err, info) => {
        if(err) throw err;
        console.log(info)
        res.send({message: "Post deleted"})
      })
    })
  })
});

/*Route to handle user's deletion of their own comments. If a comment is deleted, it is also pulled out from comments array
in the Posts model. */
router.post("/comment/delete", validateToken, (req, res) => {
  let userid
  User.findOne({email: req.user.email}, (err, user) =>{
    if(err) throw err;
    userid = user._id
    let commentToDelete = req.body.id
    Comment.findOneAndDelete({_id: commentToDelete}, (err, info) => {
      if(err) throw err;
      console.log(info)
      let postid = info.postID
      let content = info.comment
      Post.findOneAndUpdate({_id: postid}, {"$pull": {comments: {comment: content}}}, {new: true}, (err, info) => {
        if (err) throw err;
        else {
          console.log(info)
          res.send({message: "Comment deleted"})
        }
      })
    })
  })
});

/*Route to handle user's edit of their own posts. Edited post is updated in the Posts model. */
router.post("/post/edit", validateToken, (req, res) => {
    let postToEdit = req.body.id
    let editedTitle = req.body.title
    let editedContent = req.body.content
    Post.findOneAndUpdate({_id: postToEdit}, {title: editedTitle, post: editedContent}, {new: true}, (err, info) => {
      if(err) throw err;
      console.log("post edited " + info)
      res.send({message: "Post edited"})
    })
});

/*Route to handle user's edit of their own comments. Edited post is updated in the Comments model and also in the Posts model's
comments array. */
router.post("/comment/edit", validateToken, (req, res) => {
  let commentToEdit = req.body.id
  let editedContent = req.body.content
  Comment.findOneAndUpdate({_id: commentToEdit}, {comment: editedContent}, (err, comment) => {
    if(err) throw err;
    let postToEdit = comment.postID
    let oldContent = comment.content
    Post.updateOne({_id: postToEdit}, {"$pull": {comments: {comment: oldContent}}}, (err, info) => {
      if (err) throw err;
      console.log(info)
      Post.updateOne({_id: postToEdit}, {"$push": {comments: {comment: editedContent}}}, (err, info) => {
        if (err) throw err;
        console.log(info)
        res.send({message: "Comment edited"})
      })
    })
  })
});

/*Route to get user content. User authorization is validated with validateToken. Is user is admin account user,
all content is available. If user is a standard user, only their own profile and content is available.
Valid content is collected from Users, Posts and Comments models and pushed into the new json array which is
sent to the response. */
router.get("/user", validateToken, (req, res) => {
  User.findOne({email: req.user.email}, (err, user) =>{
    if(err) throw err;
    if(!user) {
      res.send({message: "user not found"})
    } 
    if(user.email === "admin@mail.com"){
      let usersmaterial = []
      let userID = user._id
      usersmaterial.push({"user": user})
      Post.find({}, (err, posts) =>{
        if(err) throw err;
        if(!posts) {
          console.log("no posts")
        } else {
          let postdata = []
        posts.forEach(element => {
          postdata.push(element)
        });
        usersmaterial.push(postdata)
        Comment.find({}, (err, comments) =>{
          if(err) throw err;
          if(!comments) {
            console.log("no comments")
          } else {
            let commentdata = []
          comments.forEach(element => {
            commentdata.push(element)
          });
          usersmaterial.push(commentdata)
        }
        res.send(usersmaterial)
        })
      }
      })
    }else {
      let usersmaterial = []
      let userID = user._id
      usersmaterial.push({"user": user})
      console.log("userid found! " + userID)
      
      Post.find({user: userID}, (err, posts) =>{
        if(err) throw err;
        if(!posts) {
          console.log("no posts")
        } else {
          let postdata = []
        posts.forEach(element => {
          postdata.push(element)
        });
        usersmaterial.push(postdata)
        Comment.find({user: userID}, (err, comments) =>{
          if(err) throw err;
          if(!comments) {
            console.log("no comments")
          } else {
            let commentdata = []
          comments.forEach(element => {
            commentdata.push(element)
          });
          usersmaterial.push(commentdata)
        }
        res.send(usersmaterial)
        })
      }
      })
  }
  })
});

module.exports = router;
