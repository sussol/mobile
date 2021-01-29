export const selectSendingBlinkTo = ({ bluetooth }) => {
  const { blink } = bluetooth || {};
  const { sendingBlinkTo = '' } = blink || {};
  return sendingBlinkTo;
};
