let whitePlayer = null;
let blackPlayer = null;
let game = null;

function getPlayer(color) {
  return color === COLORS.WHITE ? whitePlayer : blackPlayer;
}

initDeckBuilder();
