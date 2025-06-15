const express = require("express");
const multer = require("multer");
const fs = require("fs");
const Post = require("../models/post");
const router = express.Router();
const axios = require("axios");
const FormData = require("form-data");
require("dotenv").config();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Get all posts
router.get("/", async (req, res) => {
  const posts = await Post.find();
  res.json(posts);
});

// Create post
router.post("/", upload.single("image"), async (req, res) => {
  const { title, description, category, userId } = req.body;
  try {
    if (!req.file) {
      return res.status(400).json({ message: "image required" });
    }

    // Save buffer to temp file
    const tempFilePath = `temp_${Date.now()}.${
      req.file.mimetype.split("/")[1] || "jpg"
    }`;
    fs.writeFileSync(tempFilePath, req.file.buffer);

    const formData = new FormData();
    formData.append("image", fs.createReadStream(tempFilePath));
    formData.append("key", process.env.IMGBB_API_KEY);

    const response = await axios.post(
      "https://api.imgbb.com/1/upload",
      formData,
      { headers: formData.getHeaders() }
    );

    fs.unlinkSync(tempFilePath);

    const imageUrl = response.data.data.url;
    const post = new Post({
      title,
      description,
      Image: imageUrl,
      category,
      user: userId,
    });
    await post.save();
    res.status(201).json({ message: "Post created successfully", post });
  } catch (error) {
    console.error(
      "Error uploading image:",
      error.response ? error.response.data : error.message
    );
    res.status(500).json({ message: "Internal server error", error });
  }
});

router.get("/categories", async (req, res) => {
  try {
    const categories = await Post.distinct("category", { isDeleted: false });
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get post by id
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const post = await Post.findById(id);
  res.send(post);
});

// Update post
router.patch("/:id", upload.single("image"), async (req, res) => {
  const { id } = req.params;
  const { title, description, category } = req.body;
  try {
    const oldPost = await Post.findById(id);
    if (!oldPost) return res.status(404).send("Post not found");

    const updateData = {
      title: req.body.title ?? oldPost.title,
      description: req.body.description ?? oldPost.description,
      category: req.body.category ?? oldPost.category,
    };

    if (req.file) {
      const tempFilePath = `temp_${Date.now()}.${
        req.file.mimetype.split("/")[1] || "jpg"
      }`;
      fs.writeFileSync(tempFilePath, req.file.buffer);

      const formData = new FormData();
      formData.append("image", fs.createReadStream(tempFilePath));
      formData.append("key", process.env.IMGBB_API_KEY);

      const response = await axios.post(
        "https://api.imgbb.com/1/upload",
        formData,
        { headers: formData.getHeaders() }
      );

      fs.unlinkSync(tempFilePath);

      updateData.Image = response.data.data.url;
    }

    const post = await Post.findByIdAndUpdate(id, updateData, { new: true });
    if (!post) return res.status(404).send("Post not found");
    res.send("Post updated");
  } catch (error) {
    console.error(
      "Error updating post:",
      error.response ? error.response.data : error.message
    );
    res.status(500).send("Error updating post");
  }
});

// Delete post
router.delete("/:id", async (req, res) => {
  let { id } = req.params;
  id = id.trim();
  try {
    const deleted = await Post.findByIdAndDelete(
      id,
      { isDeleted: true },
      { new: true }
    );
    if (!deleted) return res.status(404).send("Post not found");
    res.send("post deleted");
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).send("Error deleting post");
  }
});

module.exports = router;
