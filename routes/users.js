import express from "express";
import {
  getUser,
  updateUser,
  getUsers,
  searchAllUsersByName,
} from "../controllers/user.js";

const router = express.Router();

router.get("/find/:userId", getUser);
router.get("/getAllUsers", getUsers);
router.get("/search-all-users-by-name", searchAllUsersByName);
router.put("/", updateUser);

export default router;
