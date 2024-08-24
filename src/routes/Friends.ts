import express from "express";
import {
  acceptFriendRequest,
  getFriendRequests,
  getInvites,
  getUserFriends,
  sendFriendRequest,
} from "../services/supabase";

const FriendsRouter = express.Router();

FriendsRouter.get("/", (req, res) => {
  res.send("friends");
});

FriendsRouter.post("/user-friends", async (req, res) => {
  try {
    const { username } = req.body;
    const {
      friends: userFriends,
      friendRequests,
      error,
    } = await getUserFriends(username as string);
    if (error) {
      throw error;
    }
    res.status(200).send({
      friends: userFriends,
      friendRequests,
      error,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error });
  }
});

FriendsRouter.post("/user-invites", async (req, res) => {
  try {
    const { username } = req.body;
    const { invites, error } = await getInvites(username as string);
    if (error) {
      throw error;
    }
    res.status(200).send({
      invites,
      error,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error });
  }
});

FriendsRouter.post("/user-friend-requests", async (req, res) => {
  try {
    const { username } = req.body;
    const { friendRequests, error } = await getFriendRequests(
      username as string
    );
    if (error) {
      throw error;
    }
    res.status(200).send({
      friendRequests,
      error,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error });
  }
});

FriendsRouter.post("/accept-friend-request", async (req, res) => {
  try {
    const { receiverUsername, senderUsername } = req.body;
    const { filteredRequests, error } = await acceptFriendRequest({
      receiverUsername,
      senderUsername,
    });
    if (error) {
      throw error;
    }
    res.status(200).send({
      filteredRequests,
      error,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error });
  }
});

FriendsRouter.post("/send-friend-request", async (req, res) => {
  try {
    const { receiverUsername, senderUsername } = req.body;
    const { error } = await sendFriendRequest({
      receiverUsername,
      senderUsername,
    });
    if (error) {
      throw error;
    }
    res.status(200).send({
      error,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error });
  }
});

export default FriendsRouter;
