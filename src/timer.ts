import { userNameSpace } from "./controllers/socketController";
import { SocketProps } from "./types";

export const handleCountDown = ({ room }: { room: string }) => {
  let seconds = 10;
  const stopTimer = () => {
    clearInterval(timeInterval);
    const time = `time is ${seconds}`;
    console.log(time);
  };

  const timeInterval = setInterval(() => {
    // * WHEN TIMER ENDS
    if (seconds === 0) {
      userNameSpace.to(room).emit("TIME_UP", { seconds });
      stopTimer();
      return;
    }

    // * WHEN TIMER STARTS
    if (seconds === 10) {
      userNameSpace.to(room).emit("START_COUNTDOWN", { seconds });
      const time = `time is ${seconds}`;
      console.log(time);
      seconds--;
      return;
    }
    const time = `time is ${seconds}`;
    console.log(time);
    seconds--;
  }, 1000);
};

export const handleTallyCountDown = ({ room }: { room: string }) => {
  let seconds = 30;
  const stopTimer = () => {
    clearInterval(timeInterval);
    const time = `time is ${seconds}`;
    console.log(time);
  };

  const timeInterval = setInterval(() => {
    // * WHEN TIMER ENDS
    if (seconds === 0) {
      userNameSpace.to(room).emit("SHOW_FINAL_TALLY", { seconds: 30 });
      stopTimer();
      return;
    }

    // * WHEN TIMER STARTS
    if (seconds === 30) {
      userNameSpace
        .to(room)
        .emit("START_EXIT_TALLY_COUNTDOWN", { seconds: 30 });
      const time = `tally time is ${seconds}`;
      console.log(time);
      seconds--;
      return;
    }
    const time = `time is ${seconds}`;
    console.log(time);
    seconds--;
  }, 1000);
};
