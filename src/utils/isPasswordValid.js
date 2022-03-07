var passwordValidator = require('password-validator');

// Create a schema
var schema = new passwordValidator();

// Add properties to it
schema
.is().min(8)
.has().uppercase()
.has().lowercase()
.has().symbols()
.is().not().oneOf(['Passw0rd', 'Password123']);

exports.isPasswordValid = (password) => {
  return schema.validate(password);
}