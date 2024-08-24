import { createClient } from "@supabase/supabase-js";
import { AvatarObject } from "../types";

const projectUrl = "https://gepjayxrfvoylhivwhzq.supabase.co";
const anonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlcGpheXhyZnZveWxoaXZ3aHpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTU5NDM5MDMsImV4cCI6MjAzMTUxOTkwM30.dd-IHKAsG2TXONjU451yHPw6CGtH2u0aflXOX3r9FgA";

export const supabase = createClient(projectUrl, anonKey);

const apiUrl = "https://exp.host/--/api/v2/push/send";

const sendNotification = async ({
  to,
  title,
  body,
  data,
}: {
  to: string;
  title: string;
  body: string;
  data?: any;
}) => {
  const payload = {
    to,
    title,
    body,
    data,
  };

  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    console.log("Push notification sent successfully:", data);
  } catch (error) {
    console.error("Error sending push notification:", error);
  }
};

const broadcast = async ({
  list,
  title,
  body,
  data,
}: {
  list: string[];
  title: string;
  body: string;
  data: any;
}) => {
  try {
    const { data: playersToNotify, error } = await supabase
      .from("users")
      .select("expo_push_token")
      .in("username", list);
    if (error) {
      throw error;
    }

    for (const player in playersToNotify) {
      sendNotification({
        to: playersToNotify[player].expo_push_token,
        title: "New private match",
        body,
        data,
      });
    }

    console.log({ playersToNotify });
  } catch (error) {
    console.error(error);
  }
};

export const getPlayers = async (playerList: string[]): Promise<any> => {
  try {
    const { data, error }: any = await supabase
      .from("users")
      .select("username, avatar(*)")
      .in("username", playerList);

    if (error) {
      throw error;
    }

    return { data, error };
  } catch (error) {
    console.log(error);
    return { error };
  }
};

export async function getLeaderBoard() {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*, avatar(*)")
      .order("total_score", { ascending: false })
      .limit(20);
    if (error) {
      throw error;
    }
    return { data, error };
  } catch (error) {
    console.log(error);
    return error;
  }
}

const getFriendsList = async (username: string) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("friends")
      .eq("username", `${username}`);

    if (error) {
      throw error;
    }

    if (data[0].friends === null) {
      return [];
    }

    return data[0].friends;
  } catch (error) {
    console.log(error);
  }
};

export const getFriendRequests = async (username: string) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("friend_requests")
      .eq("username", `${username}`);

    console.log({ data });

    if (error) {
      throw error;
    }

    // * if there are no friend requests, return an empty array
    if (data.length === 0) {
      return {
        friendRequests: [],
        error: null,
      };
    }

    // * get avatar for each friend request

    const friendRequests = await getPlayers(data[0].friend_requests);

    return {
      friendRequests,
      error: null,
    };
  } catch (error) {
    console.log(error, "occured here");
    return {
      friendRequests: [],
      error,
    };
  }
};

const getFriendRequestsArray = async (username: string) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("friend_requests")
      .eq("username", `${username}`);

    if (error) {
      throw error;
    }

    // * if there are no friend requests, return an empty array
    if (data?.length === 0) {
      return { friend_requests: [], error: null };
    }

    return { friend_requests: data[0].friend_requests, error: null };
  } catch (error) {
    console.log(error, "occured here");
    return {
      error,
      friend_requests: [],
    };
  }
};

export const getInvites = async (username: string): Promise<any> => {
  try {
    const { data, error } = await supabase
      .from("created_games")
      .select("host(username, avatar(*)), id, guests")
      .containedBy("guests", [`${username}`]);

    if (error) {
      throw error;
    }

    console.log({ data });

    return {
      invites: data,
      error: null,
    };
  } catch (error) {
    console.log(error);
    return {
      error,
    };
  }
};

export async function getUserFriends(username: string): Promise<any> {
  try {
    // * get users friends usernames
    const friends = await getFriendsList(username);

    // * get friend requests
    const friendRequests = await getFriendRequestsArray(username);

    // * query player database for all users with those usernames
    const { data, error } = await supabase
      .from("users")
      .select("username, total_score, online, avatar(*)")
      .in("username", friends);
    if (error) {
      throw error;
    }

    return {
      friends: data,
      friendRequests,
      error: null,
    };
  } catch (error) {
    console.error(error);
    return {
      friends: [],
      friendRequests: [],
      error,
    };
  }
}

export const getSearchResults = async (username: string) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*, avatar(*)")
      .ilike("username", `${username}`);

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.log(error);
    return { data: null, error: error };
  }
};

export const getPlayerDetails = async (username: string): Promise<any> => {
  try {
    const { data, error }: any = await supabase
      .from("users")
      .select("*")
      .ilike("username", `${username}`);

    if (error) {
      throw error;
    }

    return data[0];
  } catch (error) {
    console.error(error);
    return { error: error };
  }
};

// TODO: STOP USER FROM ADDING THEMSELVES AS A FRIEND
// TODO STOP USERS FROM SENDING MULTIPLE FRIEND REQUESTS
export const sendFriendRequest = async ({
  receiverUsername,
  senderUsername,
}: {
  receiverUsername: string;
  senderUsername: string;
}) => {
  try {
    // * get users existing friend requests
    const { friend_requests: existingFriendRequests } =
      await getFriendRequestsArray(receiverUsername);

    // * add sender's username to friend requests
    const updatedFriendRequests = [...existingFriendRequests, senderUsername];

    //* get user to update and notify
    const targetPlayer = await getPlayerDetails(receiverUsername);

    // * update users friend requests
    const { data, error } = await supabase
      .from("users")
      .update({ friend_requests: updatedFriendRequests })
      .eq("username", `${targetPlayer.username}`);

    // * send notification to receiver
    await sendNotification({
      to: targetPlayer.expo_push_token,
      title: "Friend Request",
      body: `You have a friend request from ${senderUsername}`,
      data: { type: "FRIEND_REQUEST" },
    });

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.log(error);
    return { data: null, error: error };
  }
};

export const acceptFriendRequest = async ({
  receiverUsername,
  senderUsername,
}: {
  receiverUsername: string;
  senderUsername: string;
}) => {
  try {
    // * get receivers existing friends
    const friends = await getFriendsList(receiverUsername);

    // * get senders existing friends
    const sendersFriends = await getFriendsList(senderUsername);

    // * add sender's username to receivers friends list
    const updatedFriends = [...friends, senderUsername];

    // * add receiver's username to senders friends list
    const updatedSendersFriends = [...sendersFriends, receiverUsername];

    // * remove sender's username from receivers friend requests
    const { friend_requests: existingRequests } = await getFriendRequestsArray(
      receiverUsername
    );
    const filteredRequests = existingRequests.filter(
      (request: string) => request !== senderUsername
    );

    // * add sender's username to receivers friends list
    const { data: receiversUpdateData, error: receiversUpdateError } =
      await supabase
        .from("users")
        .update({ friends: updatedFriends, friend_requests: filteredRequests })
        .eq("username", `${receiverUsername}`)
        .select("friend_requests");

    // * add receiver's username to senders friends list
    const { data: sendersUpdateData, error: sendersUpdateError } =
      await supabase
        .from("users")
        .update({ friends: updatedSendersFriends })
        .eq("username", `${senderUsername}`)
        .select("*, avatar(*)");

    if (receiversUpdateError || sendersUpdateError) {
      throw receiversUpdateError || sendersUpdateError;
    }

    return { filteredRequests, error: null };
  } catch (error) {
    console.log(error);
    return { data: null, error: error };
  }
};

const updateGuestsInvites = async ({
  host,
  game_id,
  guests,
}: {
  host: string;
  game_id: string;
  guests: string[];
}) => {
  try {
    const { data, error }: any = await supabase
      .from("users")
      .update({
        game_invites: {
          [game_id]: {
            username: host,
            game_id,
          },
        },
      })
      .in("username", guests)
      .select("id");
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error(error);
  }
};

export const createPrivateMatch = async ({
  host_id,
  guests,
  username,
  avatar,
}: {
  host_id: string;
  guests: string[];
  username: string;
  avatar: AvatarObject;
}): Promise<any> => {
  try {
    const { data, error }: any = await supabase
      .from("created_games")
      .insert({ host: host_id, guests })
      .select("id");

    if (error) {
      throw error;
    }

    // * notify guests
    await broadcast({
      list: guests,
      body: `join ${username} in a new private match.`,
      title: `${username} has invited you to a private match.`,
      data: {
        type: "INVITE",
        data: { host: { username, avatar }, game_id: data[0].id, guests },
      },
    });

    // * add game to guests invite list
    await updateGuestsInvites({
      host: username,
      game_id: data[0].id,
      guests,
    });

    return { data, error };
  } catch (error) {
    console.error(error);
    return { data: null, error };
  }
};

export const getHost = async (room_id: string) => {
  try {
    const { data, error }: any = await supabase
      .from("created_games")
      .select("host(username, avatar(*))")
      .eq("id", room_id);
    if (error) {
      throw new Error(error);
    }
    return {
      data: data[0],
      error: null,
    };
  } catch (error) {
    console.error(error);
    return { data: null, error };
  }
};

const getPlayerStats = async ({ username }: { username: string }) => {
  try {
    const { data, error }: any = await supabase
      .from("users")
      .select("highscore, total_score, level")
      .eq("username", `${username}`);
    if (error) {
      throw error;
    }

    const { highscore, total_score, level } = data[0];
    return { highscore, total_score, level, error };
  } catch (error) {
    console.error(error);
    return { error };
  }
};

export const updatePlayerHighScore = async ({
  username,
  scoreForMatch,
}: {
  username: string;
  scoreForMatch: number;
}) => {
  try {
    const {
      highscore,
      total_score,
      level,
      error: playerStatsError,
    } = await getPlayerStats({ username });

    if (playerStatsError) {
      throw playerStatsError;
    }

    const new_total_score = total_score + scoreForMatch;
    const new_highscore = scoreForMatch > highscore;

    if (new_highscore) {
      const { error: updateError }: any = await supabase
        .from("users")
        .update({
          total_score: new_total_score,
          highscore: scoreForMatch,
        })
        .eq("username", `${username}`);
      if (updateError) {
        throw updateError;
      }
    }

    const { error: updateError }: any = await supabase
      .from("users")
      .update({
        total_score: new_total_score,
      })
      .eq("username", `${username}`);
    if (updateError) {
      throw updateError;
    }

    return { error: updateError, new_highscore, new_total_score };
  } catch (error) {
    console.error(error);
    return { updateError: error };
  }
};

const createUserAvatar = async (avatarSelections: AvatarObject) => {
  try {
    const { data, error } = await supabase
      .from("avatars")
      .insert({
        ...avatarSelections,
      })
      .select("id");
    if (error) {
      throw error;
    }

    return data[0].id;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const handleSignup = async ({
  username,
  email,
  password,
  expo_push_token,
  avatar,
}: {
  username: string;
  email: string;
  password: string;
  expo_push_token: string;
  avatar: AvatarObject;
}) => {
  console.log("signup", username, email, password, expo_push_token);

  try {
    const AvatarId = await createUserAvatar(avatar);

    const { data, error } = await supabase
      .from("users")
      .insert({
        username,
        email,
        password,
        expo_push_token,
        avatar: AvatarId,
      })
      .select("id");

    if (error) {
      console.log(error);
      throw error;
    }

    return { data: data[0].id, error: null };
  } catch (error) {
    console.error(error);
    return { data: null, error };
  }
};
