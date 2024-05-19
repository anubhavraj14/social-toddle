import express from "express";
import {
  getComments,
  addComment,
  deleteComment,
  updateComment,
} from "../controllers/comment.js";

const router = express.Router();

router.get("/get-all-comments", getComments);
router.post("/add-comment-on-a-post", addComment);
router.delete("/delete-a-comment/:id", deleteComment);
router.put("/update-comment/:id", updateComment);

export default router;
