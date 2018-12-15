/*
 * A Dummy MiddleWare
 * This file was made to clear the idea of MiddleWare
 */
 

let hello = (req, res, next) => {
  console.log('hello');
  next();
};


module.exports = hello;
