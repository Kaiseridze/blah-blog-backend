import PostModel from "../models/Post.js";
import CommentModel from "../models/Comment.js";
import UserModel from "../models/User.js";

export const createPost = async (req, res) => {
  try {
    const doc = new PostModel({
      title: req.body.title,
      text: req.body.text,
      imageUrl: req.body.imageUrl,
      tags: req.body.tags,
      user: req.userId,
      comments: req.body.comments,
    });

    const post = await doc.save();

    await UserModel.findByIdAndUpdate(req.userId, {
      $push: { posts: post },
    });

    res.json(post);
  } catch (err) {
    res.status(403).json({
      message: "Не удалось создать пост",
    });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const { page = 1, limit = 6, sortBy} = req.query;

    const count = await PostModel.estimatedDocumentCount();
    const pagesCount = Math.ceil(count / limit);

    const posts = await PostModel.find()
      .sort([[sortBy, -1]])
      .limit(limit)
      .skip((page - 1) * limit)
      .populate("user")

      .exec();
    res.json({
      pagesCount,
      count,
      data: posts,
    });
  } catch (err) {
    res.status(403).json({
      message: "Не удалось загрузить все посты",
    });
  }
};

export const getPostById = async (req, res) => {
  try {
    const postId = req.params.id;
    PostModel.findByIdAndUpdate(
      {
        _id: postId,
      },
      {
        $inc: { viewsCount: 1 },
      },
      {
        returnDocument: "after",
      },
      (err, doc) => {
        if (err) {
          return res.status(500).json({
            message: "Не удалось загрузить пост",
          });
        }
        if (!doc) {
          return res.status(404).json({
            message: "Статья не найдена",
          });
        }
        res.json(doc);
      }
    ).populate("user");
  } catch (err) {
    res.status(500).json({
      message: "Не удалось загрузить пост",
    });
  }
};

export const updatePost = async (req, res) => {
  try {
    const postId = req.params.id;
    await PostModel.updateOne(
      {
        _id: postId,
      },
      {
        title: req.body.title,
        text: req.body.text,
        imageUrl: req.body.imageUrl,
        tags: req.body.tags,
      }
    );
    res.json({
      success: true,
    });
  } catch (err) {
    res.status(403).json({
      message: "Не удалось изменить пост",
    });
  }
};

export const removePostById = async (req, res) => {
  try {
    const postId = req.params.id;
    await UserModel.findByIdAndUpdate(
      req.userId,
      {
        $pull: { posts: postId },
      },
      { new: true }
    );

    PostModel.findByIdAndDelete(
      {
        _id: postId,
      },
      (err, doc) => {
        if (err) {
          return res.status(500).json({
            message: "Не удалось удалить пост",
          });
        }
        if (!doc) {
          return res.status(404).json({
            message: "Статья не найдена",
          });
        }

        res.json({
          success: true,
        });
      }
    );
  } catch (err) {
    res.status(403).json({
      message: "Не удалить удалить пост",
    });
  }
};

export const getPostComments = async (req, res) => {
  try {
    const post = await PostModel.findById(req.params.id);
    const allComments = await Promise.all(
      post.comments.map((comment) => {
        return CommentModel.findById(comment).populate("user");
      })
    );
    res.json(allComments);
  } catch (err) {
    console.log(err);
    res.status(403).json({
      message: "Не удалось загрузить комментарии",
    });
  }
};
