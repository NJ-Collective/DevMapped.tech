/**
 * Firebase Routes
 * Handles all Firebase Firestore operations from the backend
 * Uses Firebase Admin SDK
 */

import express from "express";
import { db } from "../config/firebase.js";

const router = express.Router();

/* GET API Calls*/

// TODO: Check if a user has submitted a response to questions
// TODO: Check if user has already submitted responses
// TODO: Fetch questions from database

/* POST API Calls */
// TODO: Submit user response to database
// TODO: Save

/**
 * POST /api/firebase/save-user-data
 * Save user data to Firestore
 * Body: { username, data }
 */
router.post("/save-user-data", async (req, res) => {
  try {
    const { username, data } = req.body;

    if (!username || !data) {
      return res.status(400).json({
        success: false,
        error: "Username and data are required",
      });
    }

    console.log(`Backend: Saving user data for: ${username}`);

    await db
      .collection("users")
      .doc(username)
      .set(
        {
          ...data,
          lastUpdated: new Date().toISOString(),
        },
        { merge: true }
      );

    console.log(`✅ Backend: User data saved successfully`);

    res.json({
      success: true,
      message: "User data saved successfully",
    });
  } catch (error) {
    console.error("❌ Backend: Error saving user data:", error);
    res.status(500).json({
      success: false,
      error: "Failed to save user data",
      details: error.message,
    });
  }
});

export default router;
