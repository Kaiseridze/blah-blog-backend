import CommentModel from "../models/Comment.js";
import PostModel from "../models/Post.js";

export const createComment = async (req, res) => {
  try {
    const { id, text } = req.body;

    const comment = new CommentModel({ text, user: req.userId });
    await comment.save();

    try {
      await PostModel.findByIdAndUpdate(id, {
        $push: { comments: comment },
      });
    } catch (error) {
      console.log("PostModel error: ", error);
      res.json(error);
    }

    res.json(comment);
  } catch (error) {
    console.log("Comment Error: ", error);
    res.json("Не удалось создать комментарий");
  }
};
export const removeCommentById = async (req, res) => {
  try {
    await CommentModel.findByIdAndDelete({ _id: req.params.comment_id });
    await PostModel.findByIdAndUpdate(
      req.params.id,
      { $pull: { comments: req.params.comment_id } },
      { new: true }
    );
    res.json({ success: true });
  } catch (error) {
    console.log(error);
  }
};
