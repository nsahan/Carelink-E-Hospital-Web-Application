const playAlertSound = () => {
  const audio = new Audio(
    "https://assets.mixkit.co/sfx/preview/mixkit-urgent-simple-notification-951.mp3"
  );
  audio.volume = 0.5;
  return audio.play();
};

export default playAlertSound;
