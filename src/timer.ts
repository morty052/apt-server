import { Socket } from "socket.io";

export const handleCountDown = ({ socket }: { socket: Socket }) => {
  let seconds = 10;
  const stopTimer = () => {
    clearInterval(timeInterval);
    const time = `time is ${seconds}`;
    console.log(time);
  };

  const timeInterval = setInterval(() => {
    if (seconds === 0) {
      socket.emit("DECREASE_SECONDS", { seconds });
      socket.emit("TIME_UP", { seconds });
      stopTimer();
      return;
    }
    const time = `time is ${seconds}`;
    console.log(time);
    socket.emit("DECREASE_SECONDS", { seconds });
    seconds--;
  }, 1000);
};
