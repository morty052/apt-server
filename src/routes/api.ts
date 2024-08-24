import express from "express";
import {
  checkWord,
  createPrivateMatch,
  getHost,
  getLeaderBoard,
  getPlayers,
  getSearchResults,
  handleSignup,
  saveGeminiAnswerTodDB,
} from "../services/supabase";
import { gemini } from "../services/gemini";

async function verifyAnswerGroup({
  Animal,
  Place,
}: {
  Animal: string;
  Place: string;
}) {
  try {
    const requiredFields1 = `return a JSON object with one field "isReal" as a boolean if the all the answers are true or false, "wrongItems" as an array with the names of the wrong values`;
    const requiredFields2 = `"descriptions" as an object with the fields "animal" an object with the fields "name" the name of the animal and "description" a description of the animal about 4 lines, "place" an object with the fields "name" the name of the place and "description" a description of the place about 4 lines`;
    const prompt = ` is this a real animal ? ${
      Animal || "NULL"
    }, is this a real place ? ${
      Place || "NULL"
    } ${requiredFields1} and ${requiredFields2}`;

    const result = await gemini.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error(error);
  }
}

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

ApiRouter.post("/check-word", async (req, res) => {
  try {
    const { word, type } = req.body;
    const { data, error } = await checkWord({ word });

    console.log({ word });

    if (error) {
      throw error;
    }
    res.status(200).send({
      data,
      error,
    });
  } catch (error) {
    console.error(error);
    if (error.message === "Word not found") {
      res.status(404).send({ error: error.message });
      return;
    }
    res.status(500).send({ error: error.message });
  }
});

ApiRouter.post("/verify-answers", async (req, res) => {
  try {
    const { Place, Animal } = req.body;

    const verdict = await verifyAnswerGroup({ Place, Animal });
    res.status(200).send({ message: "success", verdict });
    const { isReal, descriptions } = JSON.parse(verdict);
    if (isReal) {
      await saveGeminiAnswerTodDB(descriptions);
      console.log("doing things in background");
    }
  } catch (error) {
    console.error("error", error);
    res.status(400).send({ message: "error", isReal: false, error });
  }
});

export default ApiRouter;
