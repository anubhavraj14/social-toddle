import express from "express";
import { fetchLikes, likePost, removeLike } from "../controllers/like.js";

const router = express.Router();

router.get("/", fetchLikes);
router.post("/", likePost);
router.delete("/", removeLike);

export default router;
