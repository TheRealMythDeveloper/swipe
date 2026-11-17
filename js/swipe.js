const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const player = { x: 300, y: 220, size: 32, speed: 240 };

ctx.fillStyle = "hotpink";
ctx.fillRect(player.x, player.y, player.size, player.size);