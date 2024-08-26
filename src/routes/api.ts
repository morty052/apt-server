import express from "express";
import {
  checkEnergy,
  checkSavedAnswersForAnimal,
  checkSavedAnswersForPlace,
  checkWord,
  getHost,
  getLeaderBoard,
  getPlayers,
  handleReferral,
  handleSignup,
  saveGeminiAnswerTodDB,
} from "../services/supabase";
import { gemini } from "../services/gemini";

function generatePrompt({
  Animal,
  Place,
  type,
}: {
  Animal?: string;
  Place?: string;
  type: "FULL" | "PLACE" | "ANIMAL";
}) {
  if (type == "FULL") {
    const requiredFields1 = `return a JSON object with one field "isReal" as a boolean if the all the answers are true or false, "wrongItems" as an array with the names of the wrong values`;
    const requiredFields2 = `"descriptions" as an object with the fields "animal" an object with the fields "name" the name of the animal and "description" a description of the animal about 4 lines, "place" an object with the fields "name" the name of the place and "description" a description of the place about 4 lines`;
    const prompt = ` is this a real animal ? ${
      Animal || "NULL"
    }, is this a real place ? ${
      Place || "NULL"
    } ${requiredFields1} and ${requiredFields2}`;
    return prompt;
  }

  if (type == "ANIMAL") {
    const requiredFields1 = `return a JSON object with one field "isReal" as a boolean if the answer is true or false, "wrongItems" as an array with the names of the wrong value`;
    const requiredFields2 = `"descriptions" as an object with the fields "animal" an object with the fields "name" the name of the animal and "description" a description of the animal about 4 lines`;
    const prompt = ` is this a real animal ? ${Animal}
    } ${requiredFields1} and ${requiredFields2}`;
    return prompt;
  }

  if (type == "PLACE") {
    const requiredFields1 = `return a JSON object with one field "isReal" as a boolean if the answer is true or false, "wrongItems" as an array with the names of the wrong value`;
    const requiredFields2 = `"descriptions" as an object with the fields "place" an object with the fields "name" the name of the place and "description" a description of the place about 4 lines`;
    const prompt = ` is this a real place ? ${Place}
    } ${requiredFields1} and ${requiredFields2}`;
    return prompt;
  }
}

async function verifyAnswerGroup({ prompt }: { prompt: string }) {
  try {
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

    res.status(200).send({
      data,
      error,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error });
  }
});

ApiRouter.post("/handle-referral", async (req, res) => {
  try {
    const { referralCode } = req.body;
    const { data, error } = await handleReferral({
      code: referralCode,
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

ApiRouter.post("/check-energy", async (req, res) => {
  try {
    const { username } = req.body;
    const { canPlay, error } = await checkEnergy({
      username,
    });
    if (error) {
      throw error;
    }

    res.status(200).send({
      canPlay,
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

    const placeData = await checkSavedAnswersForPlace({ place: Place });
    const animalData = await checkSavedAnswersForAnimal({ animal: Animal });

    // * if both queries in database
    if (placeData.length > 0 && animalData.length > 0) {
      res.status(200).send({
        message: "success",
        verdict: {
          isReal: true,
          wrongItems: [],
        },
      });
      return;
    }

    // * if both not in database
    if (placeData.length === 0 && animalData.length === 0) {
      const prompt = generatePrompt({ Place, Animal, type: "FULL" });
      const verdict = await verifyAnswerGroup({ prompt });
      res.status(200).send({ message: "success", verdict });
      const { isReal, descriptions } = JSON.parse(verdict);
      if (isReal) {
        await saveGeminiAnswerTodDB({ descriptions, type: "FULL" });
        console.log("doing things in background");
      }
      return;
    }

    // * if animal not in database
    if (animalData.length === 0) {
      const prompt = generatePrompt({ Animal, type: "ANIMAL" });
      const verdict = await verifyAnswerGroup({ prompt });
      res.status(200).send({ message: "success", verdict });
      const { isReal, descriptions } = JSON.parse(verdict);
      if (isReal) {
        await saveGeminiAnswerTodDB({ descriptions, type: "ANIMAL" });
        console.log("doing things in background");
      }
      return;
    }

    // * if place not in database
    if (placeData.length === 0) {
      const prompt = generatePrompt({ Place, type: "PLACE" });
      const verdict = await verifyAnswerGroup({ prompt });
      res.status(200).send({ message: "success", verdict });
      const { isReal, descriptions } = JSON.parse(verdict);
      if (isReal) {
        await saveGeminiAnswerTodDB({ descriptions, type: "PLACE" });
        console.log("doing things in background");
      }
      return;
    }
  } catch (error) {
    console.error("error", error);
    res.status(400).send({ message: "error", isReal: false, error });
  }
});

export default ApiRouter;
