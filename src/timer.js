/**
 * Handles the countdown by emitting a "DECREASE_SECONDS" event to the socket
 * every second until the countdown reaches 0. The countdown starts at 10 seconds
 * and is decremented by 1 every second. When the countdown reaches 0, the timer
 * is stopped and a "Time up" message is logged to the console.
 *
 * @param {Object} options - An object containing the following properties:
 *   @property {Socket} socket - The socket object used for emitting events.
 * @return {void}
 */
export const handleCountDown = ({ socket }) => {
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
