import { createClient } from "redis";

const client = createClient({
  password: "a6GbwDFrRFgqDj88xZMgvG59dMzsqqcG",
  socket: {
    host: "redis-12535.c331.us-west1-1.gce.redns.redis-cloud.com",
    port: 12535,
  },
});

client
  .connect()
  .then(() => console.log("Connected to Redis Controller"))
  .catch((err) => console.log(err));

export default client;
