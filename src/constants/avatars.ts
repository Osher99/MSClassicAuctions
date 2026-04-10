export const AVATAR_OPTIONS = [
  "/assets/bubble1.jpg",
  "/assets/bubble2.jpg",
  "/assets/bubble3.png",
  "/assets/bubble4.jpg",
  "/assets/bubble5.png",
  "/assets/bubble6.jpg",
  "/assets/bubble7.jpg",
  "/assets/bubble8.png",
  "/assets/bubble9.png",
  "/assets/bubble10.png",
  "/assets/bubble11.png",
  "/assets/bubble12.jpg",
];

export const getRandomAvatar = (): string =>
  AVATAR_OPTIONS[Math.floor(Math.random() * AVATAR_OPTIONS.length)];
