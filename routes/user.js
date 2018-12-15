/*
 * This file handel all /api/user Routes
 *
 */

// Dependencies
const express = require("express");
const router = express.Router();
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/users");
// const bcrypt = require('bcrypt');

/*
 *  @TODO you can use below to create a more complex Queries
 *  eq  Equal
 *  ne  Eot Equal
 *  gt  Greater Than
 *  gte Greater Than or Equal
 *  ls  Less Than
 *  lte Less Than or Equal
 *  in  Contain
 *  nin Not in
 *  //  Example:
 *  .find({ age: { $gte: 18, $lt: 40 } })  Means that the age should be >= 18 AND less than 40
 *  .find({ age: { $in: [18, 19, 20] } })  Means that the age should equal one of the array items
 *  // Adding OR operator
 *  Keep the find() emplty just like that then write your or operator, just like below
 *  .find().or([ { age: { $gte: 18 } }, { name: 'Hamdon' } ])
 *  //
 *
 *  @TODO
 *  You Can Set a Pagination Like This:
 *
 *  const pageNumber = 1;
 *  const pageSize = 10;
 *  .skip((pageNumber - 1) * pageSize)
 *
 *
 */

// Getting all users
router.get("/", (req, res) => {
  User.find() // This is means WHERE NAME == Hamdon && AGE == 24
    .or([{ name: "husam" }, { age: { $lt: 30 } }])
    .limit(10) //  This for setting a limit to the requesr
    .sort({ name: -1 }) //  Sorting according the name 1 mean asc -1 means desc
    .select({ name: 1, age: 1 }) //  Means that get me the name and age only
    .then(result => {
      res.send(result);
    })
    .catch(err => {
      res.status(400).send(err);
    });
});

//  Regastiration a new user
router.post("/register", (req, res) => {
  // bcrypt.genSalt(10).then(salt => {
  // bcrypt.hash(req.body.password, salt).then(hashed => {
  const user = new User({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    age: req.body.age,
    password: req.body.password,
    email: req.body.email
  });
  user.save().then(result => {
    const token = jwt.sign(
      { id: result._id, exp: Date.now() + 1000 * 60 },
      "key"
    );
    res.header({ "X-auth-token": token }).send();
  });
  // });
  // });
});

router.post("/checKlogin", (req, res) => {
  //  check if there token is there
  const token = req.headers.token;
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVjMTUwZTBmOTMxYWYzNmExNGQ4MWY5NiIsImV4cCI6MTU0NDg4Mzc4ODExNiwiaWF0IjoxNTQ0ODgzNzI4fQ.TboyUlBb4Fh8SElXFLtciHSg_PlBRNLnAVyn9LKJKAE
console.log(token);

  if (token) {
    //  decode the token and chekc if it's validate
    try {
         //  Get the payload from the jsonwebtoken
      let payload = jwt.verify(req.headers.token, 'key');
        //  return('you are logged in')
      res.send("you are logged in");
    } catch (err) {
    res.status(400).send('invalid token you have to login');
    }    
  } else {
    //  you have to login
    res.status(400).send("you have to login");
  }



  
});

router.post("/login", (req, res) => {
  //  check if there is a user data (username & password) in the req body
  const validating = userValidating(req.body);
  if (validating.error) {
    res.status(400).send(validating.error);
  } else {
    //  chekc if there is such email get the user info
    User.find({ email: req.body.email })
      .then(result => {
        console.log("res in is ", result);

        if (result.length == 0) {
          console.log("res out is ", result);
          res.status(400).send("there is no such user");
        } else {
          const token = jwt.sign(
            { email: req.body.email, exp: Date.now() + 1000 * 60 },
            "key"
          );
          res.header({ "X-auth-token": token }).send("new token was created");
        }
      })
      .catch(err => {
        res.status(400).send(err);
      });

    // .then(result => {
    //   //  check if the password valid
    //   //  create a new token and send it back to the user in the response header
    //   console.log(result);

    // });
  }
});

// Getting information
router.get("/:id", (req, res) => {
  User.findById(req.params.id)
    .then(result => {
      if (!result) {
        res.status(404).send("There is no such user");
      }
      res.send(result);
    })
    .catch(err => {
      res.status(400).send(err.message);
    });
});

// Adding a new User
router.post("/", (req, res) => {
  // Setting Schema so i can validate it
  const validating = userValidating(req.body);
  if (validating.error) {
    res.status(400).send(validating.error);
  } else {
    const user = new User({
      _id: new mongoose.Types.ObjectId(),
      name: req.body.name,
      age: req.body.age
    });

    //  Checking the Mongoose Schema Validating
    const v = user.validateSync();
    // If the validateSync returns any string, that means that there is somthing wrong in saving the data
    if (v) res.status(400).send("There is somthing wrong");
    //  IF the above if didn't wokred then the program can contiue to the below lines
    user
      .save()
      .then(result => {
        //  IF the user saved in the database
        res.send("You have added a new user");
        console.log(result);
      })
      .catch(err => {
        //  IF the user hasn't saved in the database

        res.status(401).send(err);
        console.log(err);
      });
  }
});

// PUT
router.put("/:id", (req, res) => {
  // If req.body is valid
  const validating = userValidating(req.body);
  //  If the validation fails
  if (validating.error) {
    res.status(400).send(validating.error.details);
  } else {
    //  You can use updateMany
    User.updateOne({ _id: req.params.id }, { $set: req.body })
      .then(result => {
        res.send(`Number of updated users is ${result.n}`);
      })
      .catch(err => {
        res.status(400).send(err);
      });
  }
});

// Deleting a user
router.delete("/:id", (req, res) => {
  User.remove({ name: req.params.id })
    .then(result => {
      res.send(`Number of deleted users is ${result.n}`);
    })
    .catch(err => {
      res.status(400).send(err);
    });
});

//  To validate the POST PUT requestes
function userValidating(user) {
  const userSchema = {
    name: Joi.string()
      .min(3)
      .required(),
    email: Joi.string()
      .trim()
      .email({ minDomainAtoms: 2 })
      .required(),
    age: Joi.number(),
    password: Joi.string()
      .min(6)
      .required()
  };
  return Joi.validate(user, userSchema);
}

//  Expoting the router so app.js can use it in a MiddleWare
module.exports = router;
