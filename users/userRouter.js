const express = require('express');

const Users = require("./userDb");
const Posts = require("../posts/postDb");

const router = express.Router();

router
.post('/', validateUser, (req, res) => {
    Users.insert(req.body)
    .then(user => {
      res.status(200).json(user);
    })
    .catch(err => {
      res.status(500).json({ message: "Error, could not add user" });
    });
});

router
.post('/:id/posts', validatePost, validateUserId, (req, res) => {
  Posts.insert({ ...req.body, user_id: req.params.id })
    .then(post => {
      res.status(201).json(post);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ errorMessage: "Could not create post" });
    });
});

router
.get('/', (req, res) => {
  Users.get()
    .then(users => {
      res.status(200).json(users);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: "The list of users could not be retrieved" });
    });
});

router
.get('/:id', validateUserId, (req, res) => {
  req.user
    ? res.status(200).json(req.user)
    : res.status(500).json({
        message: "Error, could not get user"
      });
});

router
.get('/:id/posts', (req, res) => {
  Users.getUserPosts(req.params.id)
    .then(posts => {
      res.status(200).json(posts);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ errorMessage: "Error, could not get post" });
    });
});

router
.delete('/:id', validateUserId, (req, res) => {
  Users.remove(req.params.id)
    .then(user => {
      res.status(200).json(user);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ errorMessage: "Could not delete the user" });
    });
});

router
.put('/:id', validateUserId, validateUser, (req, res) => {
  Users.update(req.params.id, req.body)
    .then(user => {
      console.log(req);
      if (req.user.name !== req.body.name) {
        res.status(200).json({
          status: `Name ${
            req.user.name ? req.user.name : req.body.name
          } was changed to ${req.body.name}`,
        });
      } else {
        res.status(200).json({
          status: `Name ${req.user.name} was not changed`,
        });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ errorMessage: "Could not update the user" });
    });
});

//custom middleware

function validateUserId(req, res, next) {
  Users.getById(req.params.id)
  .then(user => {
    if (user) {
      req.user = user;
      next();
    } else {
      res.status(400).json({ message: "invalid user id" });
    }
  })
  .catch(err => {
    console.log(err);
    res.status(500).json({ message: "ERROR" });
  });
}

function validateUser(req, res, next) {
  if (req.body) {
    if (req.body.name) {
      next();
    } else {
      res.status(400).json({ message: "Needs a name" });
    }
  } else {
    res.status(400).json({ message: "Needs user data" });
  }
}

function validatePost(req, res, next) {
  if (req.body) {
    if (req.body.text) {
      next();
    } else {
      res.status(400).json({ message: "Needs a text field" });
    }
  } else {
    res.status(400).json({ message: "Data for post is missing" });
  }
}

module.exports = router;
