import { db } from "../connect.js";
import jwt from "jsonwebtoken";

export const fetchLikes = (req, res) => {
  const { postId } = req.query;

  if (!postId) {
    return res.status(400).json({ message: "Post ID is required" });
  }

  const sqlQuery = "SELECT userId FROM likes WHERE postId = ?";

  db.query(sqlQuery, [postId], (error, result) => {
    if (error) {
      console.error("Error retrieving likes:", error);
      return res
        .status(500)
        .json({ message: "An error occurred while retrieving likes" });
    }

    const likedUserIds = result.map((like) => like.userId);
    return res.status(200).json(likedUserIds);
  });
};

export const likePost = (req, res) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json("Authentication required");
  }

  jwt.verify(token, "secretkey", (error, userData) => {
    if (error) {
      return res.status(403).json("Invalid token");
    }

    const sqlInsert = "INSERT INTO likes (`userId`, `postId`) VALUES (?)";
    const parameters = [userData.id, req.body.postId];

    db.query(sqlInsert, [parameters], (dbError, result) => {
      if (dbError) {
        return res.status(500).json(dbError);
      }
      return res.status(200).json("Successfully liked the post");
    });
  });
};

export const removeLike = (req, res) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json("Authentication required");
  }

  jwt.verify(token, "secretkey", (error, userData) => {
    if (error) {
      return res.status(403).json("Invalid token");
    }

    const postId = req.query.postId;
    if (!postId) {
      return res.status(400).json("Missing post ID in request.");
    }

    const deleteQuery = "DELETE FROM likes WHERE `userId` = ? AND `postId` = ?";

    db.query(deleteQuery, [userData.id, postId], (dbError, result) => {
      if (dbError) {
        return res.status(500).json(dbError);
      }

      if (result.affectedRows > 0) {
        return res.status(200).json("Like has been removed from the post.");
      } else {
        return res.status(404).json("No like found for the given post.");
      }
    });
  });
};
