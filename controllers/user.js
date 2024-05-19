import { db } from "../connect.js";
import jwt from "jsonwebtoken";

export const getUser = (req, res) => {
  const userId = req.params.userId;
  const q = "SELECT * FROM users WHERE id=?";

  db.query(q, [userId], (err, data) => {
    if (err) return res.status(500).json(err);
    const { password, ...info } = data[0];
    return res.json(info);
  });
};

// get all users
export const getUsers = (req, res) => {
  const q = "SELECT * FROM users";
  db.query(q, (err, data) => {
    if (err) return res.status(500).json(err);
    const users = data.map((user) => {
      const { password, ...info } = user;
      return info;
    });
    return res.json(users);
  });
};

export const updateUser = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q =
      "UPDATE users SET `name`=?,`city`=?,`website`=?,`profilePic`=?,`coverPic`=? WHERE id=? ";

    db.query(
      q,
      [
        req.body.name,
        req.body.city,
        req.body.website,
        req.body.coverPic,
        req.body.profilePic,
        userInfo.id,
      ],
      (err, data) => {
        if (err) res.status(500).json(err);
        if (data.affectedRows > 0) return res.json("Updated!");
        return res.status(403).json("You can update only your post!");
      }
    );
  });
};

// serarch all users by name
export const searchAllUsersByName = (req, res) => {
  const name = req.query.name;
  if (!name) {
    return res.status(400).json("Name parameter is missing.");
  }

  const sanitizedSearchName = `%${name}%`;

  const q = "SELECT id, name, profilePic FROM users WHERE name LIKE ?";
  db.query(q, [sanitizedSearchName], (err, data) => {
    if (err) {
      console.error("Error searching users by name:", err);
      return res.status(500).json("Internal Server Error.");
    }
    const users = data.map((user) => {
      return {
        id: user.id,
        name: user.name,
        profilePic: user.profilePic,
      };
    });
    return res.json(users);
  });
};
