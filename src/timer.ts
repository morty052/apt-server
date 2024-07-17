import { getRoomDetails } from "./controllers/matchRoomController";
import { userNameSpace } from "./controllers/socketController";

// TODO REFACTOR TIMERS

// export const handleCountDown = ({ room }: { room: string }) => {
//   let seconds = 10;
//   const stopTimer = () => {
//     clearInterval(timeInterval);
//     const time = `time is ${seconds}`;
//     console.log(time);
//   };

//   const timeInterval = setInterval(() => {
//     // * WHEN TIMER ENDS
//     if (seconds === 0) {
//       userNameSpace.to(room).emit("TIME_UP", { seconds });
//       stopTimer();
//       return;
//     }

//     // * WHEN TIMER STARTS
//     if (seconds === 10) {
//       userNameSpace.to(room).emit("START_COUNTDOWN", { seconds });
//       const time = `time is ${seconds}`;
//       console.log(time);
//       seconds--;
//       return;
//     }
//     const time = `time is ${seconds}`;
//     console.log(time);
//     seconds--;
//   }, 1000);
// };

export const handleCountDown = async ({ room }: { room: string }) => {
  let seconds = 10;
  const { round } = await getRoomDetails(room);
  console.log("round started", round);
  userNameSpace.to(room).emit("START_COUNTDOWN", { seconds, round });
  const timeInterval = setTimeout(() => {
    // * WHEN TIMER ENDS
    userNameSpace.to(room).emit("TIME_UP", { seconds, round });
    console.log("round ended");
    clearTimeout(timeInterval);
  }, 10000);
};

// export const handleTallyCountDown_ = ({ room }: { room: string }) => {
//   let seconds = 30;
//   const stopTimer = () => {
//     clearInterval(timeInterval);
//     const time = `time is ${seconds}`;
//     console.log(time);
//   };

//   const timeInterval = setInterval(() => {
//     // * WHEN TIMER ENDS
//     if (seconds === 0) {
//       userNameSpace.to(room).emit("SHOW_FINAL_TALLY", { seconds: 30 });
//       stopTimer();
//       return;
//     }

//     // * WHEN TIMER STARTS
//     if (seconds === 30) {
//       userNameSpace
//         .to(room)
//         .emit("START_EXIT_TALLY_COUNTDOWN", { seconds: 30 });
//       const time = `tally time is ${seconds}`;
//       console.log(time);
//       seconds--;
//       return;
//     }
//     const time = `time is ${seconds}`;
//     console.log(time);
//     seconds--;
//   }, 1000);
// };

export const handleTallyCountDown = async ({ room }: { room: string }) => {
  console.log("starting countdown");
  const { round } = await getRoomDetails(room);
  userNameSpace
    .to(room)
    .emit("START_EXIT_TALLY_COUNTDOWN", { seconds: 30, round });
};
