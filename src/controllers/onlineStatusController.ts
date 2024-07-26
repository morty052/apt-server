import redisClient from "../services/redis";
import { supabase } from "../services/supabase";

type PlayerProps = {
  username: string;
  socketId: string;
};

export async function getOnlinePlayers() {
  try {
    const onlinePlayersData = await redisClient.lRange(`ONLINE_PLAYERS`, 0, -1);
    const onlinePlayers = onlinePlayersData.map((player) => JSON.parse(player));
    return onlinePlayers;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function removeFromOnlineList({ socketId }: { socketId: string }) {
  try {
    await redisClient.lRem(`ONLINE_PLAYERS`, 0, JSON.stringify({ socketId }));
    console.log("player removed from online list", socketId);
  } catch (error) {
    console.error(error);
  }
}

export async function updateOnlinePlayersList({
  socketId,
}: {
  socketId: string;
}) {
  try {
    // * check if player is already in list
    const onlinePlayers = await getOnlinePlayers();
    if (onlinePlayers.find((player) => player.socketId === socketId)) {
      return;
    }

    await redisClient.rPush(`ONLINE_PLAYERS`, JSON.stringify({ socketId }));
  } catch (error) {
    console.error(error);
  }
}

export async function takePlayerOnline({
  username,
  socketId,
}: {
  username;
  socketId: string;
}) {
  try {
    const { data, error } = await supabase
      .from("users")
      .update({ online: true, socket_id: socketId })
      .eq("username", `${username}`)
      .select("socket_id");

    if (error || !username) {
      throw error;
    }
  } catch (error) {
    console.error(error);
  }
}

export async function takePlayerOffline({ socketId }: { socketId: string }) {
  try {
    const { data, error } = await supabase
      .from("users")
      .update({ online: false, socket_id: socketId })
      .eq("socket_id", `${socketId}`)
      .select("socket_id");

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error(error);
  }
}
