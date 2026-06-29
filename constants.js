const PIECES = {
  KING: 'k', QUEEN: 'q', ROOK: 'r', BISHOP: 'b', KNIGHT: 'n', PAWN: 'p'
};

const COLORS = { WHITE: 'w', BLACK: 'b' };

const UNICODE = {
  'wk': '&#9812;', 'wq': '&#9813;', 'wr': '&#9814;', 'wb': '&#9815;', 'wn': '&#9816;', 'wp': '&#9817;',
  'bk': '&#9818;', 'bq': '&#9819;', 'br': '&#9820;', 'bb': '&#9821;', 'bn': '&#9822;', 'bp': '&#9823;'
};

const FILES = 'abcdefgh';

const CHESS_UNICODE = { pawn: '\u265F', knight: '\u265E', bishop: '\u265D', rook: '\u265C', queen: '\u265B' };
const SLOT_UNICODE = { pawn: '&#9817;', knight: '&#9816;', bishop: '&#9815;', rook: '&#9814;', queen: '&#9813;' };
const PIECE_NAMES = { pawn: 'Pawn', knight: 'Knight', bishop: 'Bishop', rook: 'Rook', queen: 'Queen' };

const PATH_TYPES = { MOVEMENT: 'movement', ATTACK: 'attack', DEFENSE: 'defense' };
const PIECE_ORDER = ['pawn', 'knight', 'bishop', 'rook', 'queen'];
