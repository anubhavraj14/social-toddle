import express from "express";
import cron from "node-cron";
import {
  getPostsById,
  getPosts,
  addPost,
  deletePost,
  updatePost,
  getAPost,
  schedulePost,
} from "../controllers/post.js";

// Function to publish scheduled posts
const publishScheduledPosts = () => {
  const now = moment().format("YYYY-MM-DD HH:mm:ss");

  const q =
    "UPDATE posts SET status = 'published', createdAt = ? WHERE scheduledAt <= ? AND status = 'scheduled'";
  db.query(q, [now, now], (err, data) => {
    if (err) {
      console.error("Error publishing scheduled posts:", err);
    } else if (data.affectedRows > 0) {
      console.log(`${data.affectedRows} post(s) published.`);
    }
  });
};

// Schedule the job to run every minute
cron.schedule("* * * * *", publishScheduledPosts);

const router = express.Router();

router.get("/all-posts", getPostsById);
router.get("/show-posts-on-home-page", getPosts);
router.post("/add-a-post", addPost);
router.post("/getAPost/:id", getAPost);
router.delete("/delete-a-post/:id", deletePost);
router.put("/update-post/:id", updatePost);
router.post("/schedule-post", schedulePost);

export default router;
