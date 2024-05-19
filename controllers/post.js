import { db } from "../connect.js";
import jwt from "jsonwebtoken";
import moment from "moment";
import cron from "node-cron";

export const getPostsById = (req, res) => {
  const userId = req.query.userId;
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    console.log(userId);

    const q =
      userId !== "undefined"
        ? `SELECT p.*, u.id AS userId, name, profilePic FROM posts AS p JOIN users AS u ON (u.id = p.userId) WHERE p.userId = ? ORDER BY p.createdAt DESC`
        : `SELECT p.*, u.id AS userId, name, profilePic FROM posts AS p JOIN users AS u ON (u.id = p.userId)
    LEFT JOIN relationships AS r ON (p.userId = r.followedUserId) WHERE r.followerUserId= ? OR p.userId =?
    ORDER BY p.createdAt DESC`;

    const values =
      userId !== "undefined" ? [userId] : [userInfo.id, userInfo.id];

    db.query(q, values, (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json(data);
    });
  });
};

// get posts which show on user home page only of followed account posts
// export const getPosts = (req, res) => {
//   const token = req.cookies.accessToken;
//   if (!token) return res.status(401).json("Not logged in!");
//   jwt.verify(token, "secretkey", (err, userInfo) => {
//     if (err) return res.status(403).json("Token is not valid!");
//     const q = `SELECT p.*, u.id AS userId, name, profilePic FROM posts AS p JOIN users AS u ON (u.id =
//       p.userId) LEFT JOIN relationships AS r ON (p.userId = r.followedUserId) WHERE r.followerUserId= ? OR p.userId =
//       ? ORDER BY p.createdAt DESC`;
//     const values = [userInfo.id, userInfo.id];
//     db.query(q, values, (err, data) => {
//       if (err) return res.status(500).json(err);
//       return res.status(200).json(data);
//     });
//   });
// };

export const getPosts = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q = `
      SELECT p.*, u.id AS userId, name, profilePic 
      FROM posts AS p 
      JOIN users AS u ON u.id = p.userId 
      LEFT JOIN relationships AS r ON p.userId = r.followedUserId 
      WHERE (r.followerUserId = ? OR p.userId = ?) AND p.status = 'published'
      ORDER BY p.createdAt DESC`;
    const values = [userInfo.id, userInfo.id];

    db.query(q, values, (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json(data);
    });
  });
};

export const addPost = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q =
      "INSERT INTO posts(`desc`, `img`, `createdAt`, `userId`) VALUES (?)";
    const values = [
      req.body.desc,
      req.body.img,
      moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
      userInfo.id,
    ];

    db.query(q, [values], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json("Post has been created.");
    });
  });
};

export const deletePost = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q = "DELETE FROM posts WHERE `id`=? AND `userId` = ?";

    db.query(q, [req.params.id, userInfo.id], (err, data) => {
      if (err) return res.status(500).json(err);
      if (data.affectedRows > 0)
        return res.status(200).json("Post has been deleted.");
      return res.status(403).json("You can delete only your post");
    });
  });
};

// update a post
export const updatePost = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");
  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");
    const q =
      "UPDATE posts SET `desc`=?, `img`=? WHERE `id`=? AND `userId` = ?";
    const values = [req.body.desc, req.body.img, req.params.id, userInfo.id];
    db.query(q, values, (err, data) => {
      if (err) return res.status(500).json(err);
      if (data.affectedRows > 0)
        return res.status(200).json("Post has been updated.");
      return res.status(403).json("You can update only your post");
    });
  });
};

export const getAPost = (req, res) => {
  const postId = req.params.id;

  if (!postId) {
    return res.status(400).json({ message: "Post ID is required" });
  }

  const query = `
    SELECT p.*, u.id AS userId, u.name, u.profilePic 
    FROM posts AS p 
    JOIN users AS u ON p.userId = u.id 
    WHERE p.id = ?
  `;

  db.query(query, [postId], (err, results) => {
    if (err) {
      console.error("Error fetching post:", err);
      return res
        .status(500)
        .json({ message: "An error occurred while fetching the post" });
    }

    if (results.length > 0) {
      return res.status(200).json(results[0]);
    } else {
      return res.status(404).json({ message: "Post not found" });
    }
  });
};

export const schedulePost = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const { desc, img, scheduledAt } = req.body;
    const scheduledTime = moment(scheduledAt).format("YYYY-MM-DD HH:mm:ss");
    const now = moment().format("YYYY-MM-DD HH:mm:ss");

    if (moment(scheduledTime).isBefore(now)) {
      return res.status(400).json("Scheduled time must be in the future.");
    }

    const q =
      "INSERT INTO posts(`desc`, `img`, `createdAt`, `scheduledAt`, `userId`, `status`) VALUES (?)";
    const values = [desc, img, now, scheduledTime, userInfo.id, "scheduled"];

    db.query(q, [values], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json("Post has been scheduled.");
    });
  });
};

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
