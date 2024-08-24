import express from "express";
import {
  createPrivateMatch,
  getHost,
  getLeaderBoard,
  getPlayers,
  getSearchResults,
  handleSignup,
} from "../services/supabase";

const ApiRouter = express.Router();

ApiRouter.get("/leaderboard", async (req, res) => {
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

ApiRouter.post("/get-players", async (req, res) => {
  try {
    const { playerList } = req.body;
    const { data, error } = await getPlayers(playerList);
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

ApiRouter.post("/get-host", async (req, res) => {
  try {
    const { room_id } = req.body;
    const { data, error } = await getHost(room_id);
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

ApiRouter.post("/sign-up", async (req, res) => {
  try {
    const { username, email, password, expo_push_token, avatar } = req.body;
    const { data, error } = await handleSignup({
      username,
      email,
      password,
      expo_push_token,
      avatar,
    });
    if (error) {
      throw error;
    }
    console.log({
      username,
      email,
      password,
      expo_push_token,
      avatar,
    });
    res.status(200).send({
      data,
      error,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error });
  }
});

export default ApiRouter;
