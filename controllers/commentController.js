const Comment = require("../models/comment");
const { body, validationResult } = require("express-validator");

exports.create_comment = [
  body("text", "Texto vacio").trim().escape(),
  body("user", "Usuario vacio").trim().escape(),

  async function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json({
        data: req.body,
        errors: errors.array(),
      });
      return;
    }

    const { text, user } = req.body;
    const postId = req.params.postid;
    const comment = new Comment({ text, user, postId });
    comment.save((err) => {
      if (err) {
        return next(err);
      }
      res.status(200).json({ msg: "comentario enviado" });
    });
  },
];

exports.get_comment = async function (req, res, next) {
  try {
    const comment = await Comment.findById(req.params.commentid);
    if (!comment) {
      return res
        .status(404)
        .json({ err: `comentario con id ${req.params.commentid} no encontado` });
    }
    res.status(200).json({ comment });
  } catch (err) {
    next(err);
  }
};
exports.get_comments = async function (req, res, next) {
  try {
    const allComments = await Comment.find({});
    const comments = allComments.filter(
      (comment) => comment.postId === req.params.postid
    );
    if (!comments) {
      return res.status(404).json({ err: `comentarios no encontrados` });
    }
    res.status(200).json({ comments });
  } catch (err) {
    next(err);
  }
};

exports.update_comment = async function (req, res, next) {
  try {
    const { text, user } = req.body;
    const comment = await Comment.findByIdAndUpdate(req.params.commentid, {
      text,
      user,
    });
    if (!comment) {
      return res.status(404).json({ msg: "editado fallido" });
    }
    res.status(200).json({ msg: "editado exitoso" });
  } catch (err) {
    next(err);
  }
};
exports.delete_post_comments = async function (req, res, next) {
  try {
    const comment = await Comment.deleteMany({ postId: req.params.postid });
    if (!comment) {
      return res
        .status(404)
        .json({ err: `comentario con id ${req.params.id} no encontrado` });
    }
    res
      .status(200)
      .json({ msg: `comentario ${req.params.id} borrado exitosamente` });
  } catch (err) {
    next(err);
  }
};

exports.delete_comment = async function (req, res, next) {
  try {
    const comment = await Comment.findByIdAndDelete(req.params.commentid);
    if (!comment) {
      return res
        .status(404)
        .json({ err: `comentario con id ${req.params.id} no encontrado` });
    }
    res
      .status(200)
      .json({ msg: `commentario ${req.params.id} borrado exitosamente` });
  } catch (err) {
    next(err);
  }
};