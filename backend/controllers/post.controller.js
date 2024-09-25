const Post = require("../models/Post");
const mongoose = require("mongoose");
const User = require("../models/User");



const createPost = async (req, res) => {
  let mediaType = {};
  console.log("Uploaded files:", req.files); 

  if (req.files) {
    if (req.files.photo && req.files.photo.length > 0) {
      const photo = req.files.photo[0].filename; 
      console.log("Photo filename:", photo);
      mediaType.photo = photo; 
    }
    if (req.files.video && req.files.video.length > 0) {
      const video = req.files.video[0].filename; 
      console.log("Video filename:", video);
      mediaType.video = video; 
    }
  }

  try {
    const post = new Post({
      content: req.body.content,
      user: req.user._id,
      media: mediaType, 
      tags: req.body.tags,
      privacy: req.body.privacy,
      postType: req.body.postType,
    });

    const savedPost = await post.save();

    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { posts: savedPost._id } }, 
      { new: true } 
    );

    res
      .status(201)
      .json({ post: savedPost, message: "Post saved successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllPosts = async (req, res) => {
  try {
    console.log("Fetching posts...");
    const userFriends = req.user.friends;

    const posts = await Post.find({
      $or: [
        { privacy: "public" },
        { privacy: "friends", user: { $in: userFriends } },
      ],
      privacy: { $ne: "private" },
    })
      .populate("user", "name")
      .populate("likes", "name")
      .populate("comments.user", "name")
      .populate({
        path: "sharedPost", // Populate the original post that was shared
        populate: { path: "user", select: "name profilePic" }, // Populate user of the original post
      })
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error.message);
    res.status(500).json({ error: error.message });
  }
};

const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("user", "name profilePic")
      .populate("likes", "name")
      .populate("comments.user", "name");

    if (!post) return res.status(404).json({ message: "Post not found" });
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Unauthorized to edit this post" });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      {
        content: req.body.content,
        photo: req.body.photo,
        video: req.body.video,
        tags: req.body.tags,
        privacy: req.body.privacy,
      },
      { new: true }
    );

    res.status(200).json({ updatedPost, message: "Post updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this post" });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const likePost = async (req, res) => {
  const id = req.params.id;

  try {
    const post = await Post.findById(id);

    if (!post) return res.status(404).json({ message: "Post not found" });

    const userId = req.user._id;
    if (post.likes.includes(userId)) {
      post.likes.pull(userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = {
      user: req.user._id,
      content: req.body.content,
    };

    post.comments.push(comment);
    await post.save();

    res
      .status(200)
      .json({ post: post, message: "comment created successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    const commentId = req.params.commentId;
    const commentIndex = post.comments.findIndex(
      (comment) => comment._id.toString() === commentId
    );

    if (commentIndex === -1) {
      return res.status(404).json({ message: "Comment not found" });
    }
    post.comments.splice(commentIndex, 1);
    await post.save();

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const likeComment = async (req, res) => {
  const postId = req.params.id;
  const commentId = req.params.commentId;
  const userId = req.user._id;
  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });
    const commentIndex = post.comments.findIndex(
      (comment) => comment._id.toString() === commentId
    );
    if (commentIndex === -1)
      return res.status(404).json({ message: "Comment not found" });
    const comment = post.comments[commentIndex];
    if (comment.likes.includes(userId)) {
      comment.likes.pull(userId);
    } else {
      comment.likes.push(userId);
    }
    await post.save();
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const editComment = async (req, res) => {
  const postId = req.params.id;
  const commentId = req.params.commentId;
  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });
    const commentIndex = post.comments.findIndex(
      (comment) => comment._id.toString() === commentId
    );
    if (commentIndex === -1)
      return res.status(404).json({ message: "Comment not found" });
    const comment = post.comments[commentIndex];
    comment.content = req.body.content;
    await post.save();
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const replyComment = async (req, res) => {
  const postId = req.params.id;
  const commentId = req.params.commentId;
  const userId = req.user._id;
  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });
    const commentIndex = post.comments.findIndex(
      (comment) => comment._id.toString() === commentId
    );
    if (commentIndex === -1)
      return res.status(404).json({ message: "Comment not found" });
    const comment = post.comments[commentIndex];
    const reply = {
      user: userId,
      content: req.body.content,
      replies: comment.replies,
    };
    comment.replies.push(reply);
    await post.save();
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const likeReplyComment = async (req, res) => {
  const postId = req.params.id;
  const commentId = req.params.commentId;
  const replyId = req.params.replyId;
  const userId = req.user._id;
  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });
    const commentIndex = post.comments.findIndex(
      (comment) => comment._id.toString() === commentId
    );
    if (commentIndex === -1)
      return res.status(404).json({ message: "Comment not found" });
    const comment = post.comments[commentIndex];
    const replyIndex = comment.replies.findIndex(
      (reply) => reply._id.toString() === replyId
    );
    if (replyIndex === -1)
      return res.status(404).json({ message: "Reply not found" });
    const reply = comment.replies[replyIndex];
    if (reply.likes.includes(userId)) {
      reply.likes.pull(userId);
    } else {
      reply.likes.push(userId);
    }
    await post.save();
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const deleteReply = async (req, res) => {
  const postId = req.params.id;
  const commentId = req.params.commentId;
  const replyId = req.params.replyId;
  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });
    const commentIndex = post.comments.findIndex(
      (comment) => comment._id.toString() === commentId
    );
    if (commentIndex === -1)
      return res.status(404).json({ message: "Comment not found" });
    const comment = post.comments[commentIndex];
    const replyIndex = comment.replies.findIndex(
      (reply) => reply._id.toString() === replyId
    );
    if (replyIndex === -1)
      return res.status(404).json({ message: "Reply not found" });
    comment.replies.splice(replyIndex, 1);
    await post.save();
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCommentsByPostId = async (req, res) => {
  const postId = req.params.id;
  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.status(200).json(post.comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const getRepliesByCommentId = async (req, res) => {
  const postId = req.params.id;
  const commentId = req.params.commentId;
  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });
    const commentIndex = post.comments.findIndex(
      (comment) => comment._id.toString() === commentId
    );
    if (commentIndex === -1)
      return res.status(404).json({ message: "Comment not found" });
    const comment = post.comments[commentIndex];
    res.status(200).json(comment.replies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const editReply = async (req, res) => {
  const postId = req.params.id;
  const commentId = req.params.commentId;
  const replyId = req.params.replyId;
  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });
    const commentIndex = post.comments.findIndex(
      (comment) => comment._id.toString() === commentId
    );
    if (commentIndex === -1)
      return res.status(404).json({ message: "Comment not found" });
    const comment = post.comments[commentIndex];
    const replyIndex = comment.replies.findIndex(
      (reply) => reply._id.toString() === replyId
    );
    if (replyIndex === -1)
      return res.status(404).json({ message: "Reply not found" });
    const reply = comment.replies[replyIndex];
    reply.content = req.body.content;
    await post.save();
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const replayReplayComment = async (req, res) => {
  const postId = req.params.id;
  const commentId = req.params.commentId;
  const replyId = req.params.replyId;
  const userId = req.user._id;
  const replyContent = req.body.content;

  if (!replyContent || replyContent.trim() === "") {
    return res.status(400).json({ message: "Reply content is required" });
  }

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const commentIndex = post.comments.findIndex(
      (comment) => comment._id.toString() === commentId
    );
    if (commentIndex === -1) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const replyIndex = post.comments[commentIndex].replies.findIndex(
      (reply) => reply._id.toString() === replyId
    );
    if (replyIndex === -1) {
      return res.status(404).json({ message: "Reply not found" });
    }

    const newReply = {
      _id: new mongoose.Types.ObjectId(),
      user: userId,
      content: replyContent,
      replies: [],
      createdAt: new Date(),
    };

    post.comments[commentIndex].replies[replyIndex].replies.push(newReply);

    await post.save();

    res.status(200).json({ message: "Reply added successfully", post });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const likeReplyOnRepliedComment = async (req, res) => {
  const postId = req.params.id;
  const commentId = req.params.commentId;
  const replyId = req.params.replyId;
  const replyReplyId = req.params.replyReplyId;
  const userId = req.user._id;

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const commentIndex = post.comments.findIndex(
      (comment) => comment._id.toString() === commentId
    );
    if (commentIndex === -1)
      return res.status(404).json({ message: "Comment not found" });

    const replyIndex = post.comments[commentIndex].replies.findIndex(
      (reply) => reply._id.toString() === replyId
    );
    if (replyIndex === -1)
      return res.status(404).json({ message: "Reply not found" });

    const replyReplyIndex = post.comments[commentIndex].replies[
      replyIndex
    ].replies.findIndex((reply) => reply._id.toString() === replyReplyId);
    if (replyReplyIndex === -1)
      return res.status(404).json({ message: "Reply to reply not found" });

    const replyReply =
      post.comments[commentIndex].replies[replyIndex].replies[replyReplyIndex];

    if (replyReply.likes.includes(userId)) {
      replyReply.likes.pull(userId);
    } else {
      replyReply.likes.push(userId);
    }

    await post.save();
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const editReplyOnRepliedComment = async (req, res) => {
  const postId = req.params.id;
  const commentId = req.params.commentId;
  const replyId = req.params.replyId;
  const replyReplyId = req.params.replyReplyId;
  const userId = req.user._id;
  const newContent = req.body.content;

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const commentIndex = post.comments.findIndex(
      (comment) => comment._id.toString() === commentId
    );
    if (commentIndex === -1)
      return res.status(404).json({ message: "Comment not found" });

    const replyIndex = post.comments[commentIndex].replies.findIndex(
      (reply) => reply._id.toString() === replyId
    );
    if (replyIndex === -1)
      return res.status(404).json({ message: "Reply not found" });

    const replyReplyIndex = post.comments[commentIndex].replies[
      replyIndex
    ].replies.findIndex((reply) => reply._id.toString() === replyReplyId);
    if (replyReplyIndex === -1)
      return res.status(404).json({ message: "Reply to reply not found" });

    const replyReply =
      post.comments[commentIndex].replies[replyIndex].replies[replyReplyIndex];

    if (replyReply.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    replyReply.content = newContent;
    await post.save();

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteReplyOnRepliedComment = async (req, res) => {
  const postId = req.params.id;
  const commentId = req.params.commentId;
  const replyId = req.params.replyId;
  const replyReplyId = req.params.replyReplyId;
  const userId = req.user._id;

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const commentIndex = post.comments.findIndex(
      (comment) => comment._id.toString() === commentId
    );
    if (commentIndex === -1)
      return res.status(404).json({ message: "Comment not found" });

    const replyIndex = post.comments[commentIndex].replies.findIndex(
      (reply) => reply._id.toString() === replyId
    );
    if (replyIndex === -1)
      return res.status(404).json({ message: "Reply not found" });

    const replyReplyIndex = post.comments[commentIndex].replies[
      replyIndex
    ].replies.findIndex((reply) => reply._id.toString() === replyReplyId);
    if (replyReplyIndex === -1)
      return res.status(404).json({ message: "Reply to reply not found" });

    const replyReply =
      post.comments[commentIndex].replies[replyIndex].replies[replyReplyIndex];

    if (replyReply.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    post.comments[commentIndex].replies[replyIndex].replies.splice(
      replyReplyIndex,
      1
    );

    await post.save();

    res.status(200).json({ message: "Reply deleted successfully", post });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const sharePost = async (req, res) => {
  try {
    const postId = req.params.id;

    const originalPost = await Post.findById(postId).populate(
      "user",
      "name email"
    );

    if (!originalPost) {
      return res.status(404).json({ message: "Original post not found" });
    }
    const sharedPost = new Post({
      content: originalPost.content,
      media: originalPost.media,
      tags: originalPost.tags,
      user: req.user._id,
      sharedPost: originalPost._id,
      privacy: originalPost.privacy,
      postType: originalPost.postType,
    });

    await sharedPost.save();

    res.status(201).json({
      message: "Post shared successfully",
      sharedPost: {
        ...sharedPost._doc,
        originalPost: {
          content: originalPost.content,
          media: originalPost.media,
          tags: originalPost.tags,
          user: originalPost.user,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  addComment,
  deleteComment,
  likeComment,
  replyComment,
  likeReplyComment,
  deleteReply,
  editComment,
  getCommentsByPostId,
  getRepliesByCommentId,
  editReply,
  replayReplayComment,
  likeReplyOnRepliedComment,
  editReplyOnRepliedComment,
  deleteReplyOnRepliedComment,
  sharePost,
};
