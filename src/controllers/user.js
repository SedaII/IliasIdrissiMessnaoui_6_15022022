const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const { isEmailValid } = require('../utils/isEmailValid');
const { isPasswordValid } = require('../utils/isPasswordValid');
require('dotenv').config();

exports.signUp = (req, res, next) => {
  //check email & password (password validator) validation
  if(!isEmailValid(req.body.email)) {
    return res.status(400).json({ message: "Veuillez indiquer un email valide. Ex : nom@email.fr" });
  }

  if(!isPasswordValid(req.body.password)) {
    return res.status(400).json({ message: "Veuillez indiquer un mot de passe valide. Il doit faire minimum 8 caractères, contenir une majuscule et un caractère spécial. Ex : @Jaimeb1manger" });
  }
  
  // Crypte le mot de passe
  bcrypt.hash(req.body.password, 10)
  .then(hash => {
    const user = new User({
      email: req.body.email,
      password: hash
    });

    user.save()
    .then(() => res.status(201).json({ message: 'Utilisateur créé !'}))
    .catch(err => res.status(400).json({ message: err.message }));
  })
  .catch(err => res.status(500).json({err}));
};

exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email })
  .then(user => {
    if(!user) {
      return res.status(401).json({ message: 'Utilisateur non trouvé !' });
    }

    bcrypt.compare(req.body.password, user.password)
    .then(isValid => {
      if(!isValid) {
        return res.status(401).json({ message: 'Mot de passe incorrect !' });
      }

      return res.status(200).json({
        userId: user._id,
        token: jwt.sign(
          { userId: user._id },
          process.env.TOKEN_SECRET,
          { expiresIn: '24h' }
        )
      });
    })
    .catch(err => res.status(500).json({ err }));
  })
  .catch(err => res.status(500).json({ err }));
};