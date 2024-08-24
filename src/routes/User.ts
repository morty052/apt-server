import express from "express";
import {
  createPrivateMatch,
  getLeaderBoard,
  getSearchResults,
  updatePlayerHighScore,
} from "../services/supabase";

const UserRouter = express.Router();

UserRouter.get("/", (req, res) => {
  res.send("user");
});

UserRouter.get("/leaderboard", async (req, res) => {
  try {
    const { data, error } = await getLeaderBoard();
    if (error) {
      throw error;
    }
    res.status(200).send({ data, error });
  } catch (error) {
    res.status(500).send({
      error,
    });
  }
});

UserRouter.post("/search-user", async (req, res) => {
  try {
    const { username } = req.body;
    const { data, error } = await getSearchResults(username as string);
    if (error) {
      throw error;
    }
    res.status(200).send({
      data,
      error,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error });
  }
});

UserRouter.post("/create-private-match", async (req, res) => {
  try {
    const { host_id, username, guests, avatar } = req.body;
    const { data, error } = await createPrivateMatch({
      host_id,
      username,
      guests,
      avatar,
    });
    if (error) {
      throw error;
    }
    res.status(200).send({
      data,
      error,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error });
  }
});

UserRouter.post("/update-score", async (req, res) => {
  try {
    const { username, scoreForMatch } = req.body;
    const { new_highscore, new_total_score, error } =
      await updatePlayerHighScore({
        username,
        scoreForMatch,
      });
    if (error) {
      throw error;
    }
    res.status(200).send({
      new_highscore,
      new_total_score,
      error,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error });
  }
});

export default UserRouter;
