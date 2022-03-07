const Sauce = require("../models/sauce");
const fs = require("fs");

exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((err) => res.status(400).json({ err }));
};

exports.addSauce = (req, res, next) => {
  const sauce = new Sauce({
    ...JSON.parse(req.body.sauce),
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
    dislikes: 0,
    likes: 0,
  });
  console.log(sauce);
  sauce
    .save()
    .then(() => res.status(201).json({ message: "sauce crée" }))
    .catch((err) => res.status(400).json({ err }));
};

exports.getSauceById = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch((err) => res.status(400).json({ err }));
};

exports.updateSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
  .then((sauce) => {
      // Vérifie que l'utilisateur connecté est le créateur de la sauce
      if (sauce.userId === req.auth.userId) {
        if (typeof req.body.sauce === "string") {
          const filename = sauce.imageUrl.split("/images/")[1];
          fs.unlink(`images/${filename}`, () => {
            const imageUrl = `${req.protocol}://${req.get("host")}/images/${
              req.file.filename
            }`;
            Sauce.updateOne(
              { _id: req.params.id },
              { ...JSON.parse(req.body.sauce), imageUrl, _id: req.params.id }
            )
              .then(() => res.status(200).json({ message: "Objet modifié !" }))
              .catch((error) => res.status(400).json({ error }));
          });
        } else {
          Sauce.updateOne(
            { _id: req.params.id },
            { ...req.body, _id: req.params.id }
          )
            .then(() => res.status(200).json({ message: "Objet modifié !" }))
            .catch((error) => res.status(400).json({ error }));
        }
      } else {
        return res
          .status(401)
          .json({
            message: "Non autorisé, vous n'êtes pas l'auteur de la sauce",
          });
      }
    })
    .catch((error) => res.status(400).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      // Vérifie que l'utilisateur connecté est le créateur de la sauce
      if (sauce.userId === req.auth.userId) {
        const filename = sauce.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          Sauce.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: "Objet supprimé !" }))
            .catch((error) => res.status(400).json({ error }));
        });
      } else {
        return res
          .status(401)
          .json({
            message: "Non autorisé, vous n'êtes pas l'auteur de la sauce",
          });
      }
    })
    .catch((error) => res.status(400).json({ error }));
};

exports.sendLike = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      switch (req.body.like) {
        case -1:
          if (!sauce.usersDisliked.includes(req.body.userId)) {
            sauce.usersDisliked.push(req.body.userId);
          }
          break;

        case 0:
          if (sauce.usersDisliked.includes(req.body.userId)) {
            sauce.usersDisliked = sauce.usersDisliked.filter(
              (e) => e !== req.body.userId
            );
          } else if (sauce.usersLiked.includes(req.body.userId)) {
            sauce.usersLiked = sauce.usersLiked.filter(
              (e) => e !== req.body.userId
            );
          }
          break;

        case 1:
          if (!sauce.usersLiked.includes(req.body.userId)) {
            sauce.usersLiked.push(req.body.userId);
          }
          break;
      }

      const dislikes = sauce.usersDisliked.length || 0;
      const likes = sauce.usersLiked.length || 0;
      Sauce.updateOne(
        { _id: req.params.id },
        {
          _id: req.params.id,
          usersDisliked: sauce.usersDisliked,
          usersLiked: sauce.usersLiked,
          dislikes,
          likes,
        }
      )
        .then(() => res.status(200).json({ message: "Like mis à jour" }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(400).json({ error }));
};
