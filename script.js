const PIECES = {
  KING: 'k', QUEEN: 'q', ROOK: 'r', BISHOP: 'b', KNIGHT: 'n', PAWN: 'p'
};

const COLORS = { WHITE: 'w', BLACK: 'b' };

const UNICODE = {
  'wk': '&#9812;', 'wq': '&#9813;', 'wr': '&#9814;', 'wb': '&#9815;', 'wn': '&#9816;', 'wp': '&#9817;',
  'bk': '&#9818;', 'bq': '&#9819;', 'br': '&#9820;', 'bb': '&#9821;', 'bn': '&#9822;', 'bp': '&#9823;'
};

const FILES = 'abcdefgh';

let whitePlayer = null;
let blackPlayer = null;
let game = null;

function getPlayer(color) {
  return color === COLORS.WHITE ? whitePlayer : blackPlayer;
}

class ChessGame {
  constructor() {
    this.board = [];
    this.turn = COLORS.WHITE;
    this.selected = null;
    this.legalMoves = [];
    this.moveHistory = [];
    this.capturedWhite = [];
    this.capturedBlack = [];
    this.kingPositions = { w: null, b: null };
    this.castlingRights = { wK: true, wQ: true, bK: true, bQ: true };
    this.enPassantTarget = null;
    this.gameOver = false;
    this.lastMove = null;
    this.pendingPromotion = null;
    this.init();
  }

  init() {
    this.board = Array(8).fill(null).map(() => Array(8).fill(null));
    this.setupPieces();
    this.turn = COLORS.WHITE;
    this.selected = null;
    this.legalMoves = [];
    this.moveHistory = [];
    this.capturedWhite = [];
    this.capturedBlack = [];
    this.castlingRights = { wK: true, wQ: true, bK: true, bQ: true };
    this.enPassantTarget = null;
    this.gameOver = false;
    this.lastMove = null;
    this.pendingPromotion = null;
    document.getElementById('promotion-modal').classList.add('hidden');
    this.updateBoard();
  }

  setupPieces() {
    const backRank = [PIECES.ROOK, PIECES.KNIGHT, PIECES.BISHOP, PIECES.QUEEN,
                      PIECES.KING, PIECES.BISHOP, PIECES.KNIGHT, PIECES.ROOK];
    for (let f = 0; f < 8; f++) {
      this.board[0][f] = { type: backRank[f], color: COLORS.BLACK };
      this.board[1][f] = { type: PIECES.PAWN, color: COLORS.BLACK };
      this.board[6][f] = { type: PIECES.PAWN, color: COLORS.WHITE };
      this.board[7][f] = { type: backRank[f], color: COLORS.WHITE };
    }
    this.kingPositions = { w: [7, 4], b: [0, 4] };
  }

  at(row, col) { return this.board[row]?.[col] ?? null; }

  isEnemy(row, col, color) {
    const p = this.at(row, col);
    return p && p.color !== color;
  }

  inBounds(row, col) { return row >= 0 && row < 8 && col >= 0 && col < 8; }

  cloneBoard() {
    return this.board.map(r => r.map(c => c ? { ...c } : null));
  }

  findKing(color, board) {
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++)
        if (board[r][c] && board[r][c].type === PIECES.KING && board[r][c].color === color)
          return [r, c];
    return null;
  }

  isInCheck(color, board) {
    const pos = this.findKing(color, board);
    if (!pos) return true;
    const enemy = color === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (board[r][c] && board[r][c].color === enemy) {
          const moves = this.getPseudoLegalMoves(r, c, board, true);
          if (moves.some(m => m[0] === pos[0] && m[1] === pos[1]))
            return true;
        }
      }
    }
    return false;
  }

  getPseudoLegalMoves(row, col, board, forAttack) {
    const piece = board[row][col];
    if (!piece) return [];
    const moves = [];
    const { type, color } = piece;
    const enemy = color === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
    const dir = color === COLORS.WHITE ? -1 : 1;

    if (type === PIECES.PAWN) {
      const startRow = color === COLORS.WHITE ? 6 : 1;
      if (!forAttack) {
        if (this.inBounds(row + dir, col) && !board[row + dir][col])
          moves.push([row + dir, col]);
        if (row === startRow && this.inBounds(row + 2 * dir, col) && !board[row + dir][col] && !board[row + 2 * dir][col])
          moves.push([row + 2 * dir, col]);
      }
      for (const dc of [-1, 1]) {
        const nr = row + dir, nc = col + dc;
        if (this.inBounds(nr, nc)) {
          if (board[nr][nc] && board[nr][nc].color === enemy)
            moves.push([nr, nc]);
          if (this.enPassantTarget && this.enPassantTarget[0] === nr && this.enPassantTarget[1] === nc)
            moves.push([nr, nc]);
        }
      }
      return moves;
    }

    if (type === PIECES.KNIGHT) {
      for (const [dr, dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]) {
        const nr = row + dr, nc = col + dc;
        if (this.inBounds(nr, nc) && (!board[nr][nc] || board[nr][nc].color === enemy))
          moves.push([nr, nc]);
      }
      return moves;
    }

    if (type === PIECES.KING) {
      for (const [dr, dc] of [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]) {
        const nr = row + dr, nc = col + dc;
        if (this.inBounds(nr, nc) && (!board[nr][nc] || board[nr][nc].color === enemy))
          moves.push([nr, nc]);
      }
      if (!forAttack) {
        const kSide = color === COLORS.WHITE ? 'wK' : 'bK';
        const qSide = color === COLORS.WHITE ? 'wQ' : 'bQ';
        const backRow = color === COLORS.WHITE ? 7 : 0;
        if (this.castlingRights[kSide] && this.canCastle(row, col, 7, backRow, board))
          moves.push([backRow, 6]);
        if (this.castlingRights[qSide] && this.canCastle(row, col, 0, backRow, board))
          moves.push([backRow, 2]);
      }
      return moves;
    }

    if (type === PIECES.ROOK || type === PIECES.QUEEN) {
      for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
        for (let i = 1; i < 8; i++) {
          const nr = row + dr * i, nc = col + dc * i;
          if (!this.inBounds(nr, nc)) break;
          if (board[nr][nc]) {
            if (board[nr][nc].color === enemy) moves.push([nr, nc]);
            break;
          }
          moves.push([nr, nc]);
        }
      }
    }

    if (type === PIECES.BISHOP || type === PIECES.QUEEN) {
      for (const [dr, dc] of [[-1,-1],[-1,1],[1,-1],[1,1]]) {
        for (let i = 1; i < 8; i++) {
          const nr = row + dr * i, nc = col + dc * i;
          if (!this.inBounds(nr, nc)) break;
          if (board[nr][nc]) {
            if (board[nr][nc].color === enemy) moves.push([nr, nc]);
            break;
          }
          moves.push([nr, nc]);
        }
      }
    }

    return moves;
  }

  canCastle(kRow, kCol, rCol, backRow, board) {
    const color = board[kRow][kCol].color;
    const enemy = color === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
    const rook = board[backRow][rCol];
    if (!rook || rook.type !== PIECES.ROOK || rook.color !== color) return false;

    const step = rCol === 0 ? -1 : 1;
    for (let c = kCol + step; c !== rCol; c += step) {
      if (board[backRow][c]) return false;
    }
    for (let c = kCol; c !== (rCol === 0 ? 2 : 6); c += step) {
      if (this.isSquareAttacked(backRow, c, enemy, board)) return false;
    }
    return true;
  }

  isSquareAttacked(row, col, byColor, board) {
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++)
        if (board[r][c] && board[r][c].color === byColor) {
          const attacks = this.getPseudoLegalMoves(r, c, board, true);
          if (attacks.some(a => a[0] === row && a[1] === col)) return true;
        }
    return false;
  }

  getLegalMoves(row, col) {
    const piece = this.at(row, col);
    if (!piece) return [];
    const pseudo = this.getPseudoLegalMoves(row, col, this.board, false);
    const legal = [];
    for (const [tr, tc] of pseudo) {
      const sim = this.simulateMove(row, col, tr, tc);
      if (sim) {
        const kingPos = sim.kingPos;
        const enemy = piece.color === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
        if (!this.isSquareAttacked(kingPos[0], kingPos[1], enemy, sim.board))
          legal.push([tr, tc]);
      }
    }
    return legal;
  }

  simulateMove(fromR, fromC, toR, toC) {
    const b = this.cloneBoard();
    const piece = b[fromR][fromC];
    if (!piece) return null;

    const isEnPassant = piece.type === PIECES.PAWN && this.enPassantTarget &&
      toR === this.enPassantTarget[0] && toC === this.enPassantTarget[1];
    const isCastle = piece.type === PIECES.KING && Math.abs(toC - fromC) === 2;

    b[toR][toC] = piece;
    b[fromR][fromC] = null;
    if (isEnPassant) b[fromR][toC] = null;

    if (isCastle) {
      const backRow = toR;
      const rookFromC = toC === 6 ? 7 : 0;
      const rookToC = toC === 6 ? 5 : 3;
      b[backRow][rookToC] = b[backRow][rookFromC];
      b[backRow][rookFromC] = null;
    }

    if (piece.type === PIECES.PAWN && (toR === 0 || toR === 7))
      b[toR][toC] = { type: PIECES.QUEEN, color: piece.color };

    const kingPos = this.findKing(piece.color, b);
    return { board: b, kingPos };
  }

  makeMove(fromR, fromC, toR, toC) {
    const piece = this.at(fromR, fromC);
    if (!piece || this.gameOver) return false;

    const legal = this.getLegalMoves(fromR, fromC);
    if (!legal.some(m => m[0] === toR && m[1] === toC)) return false;

    const captured = this.at(toR, toC);
    const isEnPassant = piece.type === PIECES.PAWN && this.enPassantTarget &&
      toR === this.enPassantTarget[0] && toC === this.enPassantTarget[1];
    const isCastle = piece.type === PIECES.KING && Math.abs(toC - fromC) === 2;

    let capturedPieceRef = null;

    if (isEnPassant) {
      capturedPieceRef = this.at(fromR, toC);
      if (capturedPieceRef) {
        if (capturedPieceRef.color === COLORS.WHITE) this.capturedWhite.push(capturedPieceRef);
        else this.capturedBlack.push(capturedPieceRef);
      }
      this.board[fromR][toC] = null;
    }

    if (captured) {
      capturedPieceRef = captured;
      if (capturedPieceRef.color === COLORS.WHITE) this.capturedWhite.push(capturedPieceRef);
      else this.capturedBlack.push(capturedPieceRef);
    }

    this.board[toR][toC] = piece;
    this.board[fromR][fromC] = null;

    if (isCastle) {
      const rookFromC = toC === 6 ? 7 : 0;
      const rookToC = toC === 6 ? 5 : 3;
      this.board[toR][rookToC] = this.board[toR][rookFromC];
      this.board[toR][rookFromC] = null;
    }

    if (piece.type === PIECES.PAWN && (toR === 0 || toR === 7)) {
      this.pendingPromotion = { fromR, fromC, toR, toC, color: piece.color, captured };
      this.showPromotionModal(toR, toC, piece.color);
      this.selected = null;
      this.legalMoves = [];
      this.updateBoard();
      return true;
    }

    if (piece.type === PIECES.KING) {
      this.kingPositions[piece.color] = [toR, toC];
      if (piece.color === COLORS.WHITE) { this.castlingRights.wK = false; this.castlingRights.wQ = false; }
      else { this.castlingRights.bK = false; this.castlingRights.bQ = false; }
    }

    if (piece.type === PIECES.ROOK) {
      if (fromR === 7 && fromC === 0) this.castlingRights.wQ = false;
      if (fromR === 7 && fromC === 7) this.castlingRights.wK = false;
      if (fromR === 0 && fromC === 0) this.castlingRights.bQ = false;
      if (fromR === 0 && fromC === 7) this.castlingRights.bK = false;
    }

    if (piece.type === PIECES.PAWN && Math.abs(toR - fromR) === 2)
      this.enPassantTarget = [(fromR + toR) / 2, fromC];
    else
      this.enPassantTarget = null;

    const player = getPlayer(this.turn);
    if (player) {
      player.addPoints(1);
      if (capturedPieceRef) {
        const typeMap = { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen' };
        player.addPoints(getCaptureBonus(typeMap[capturedPieceRef.type] || 'pawn'));
      }
    }

    this.lastMove = [[fromR, fromC], [toR, toC]];
    this.moveHistory.push({ from: [fromR, fromC], to: [toR, toC], piece, captured });

    this.turn = this.turn === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
    this.selected = null;
    this.legalMoves = [];

    this.checkGameState();
    this.updateBoard();
    return true;
  }

  checkGameState() {
    const hasLegal = this.hasLegalMoves(this.turn);
    const inCheck = this.isInCheck(this.turn, this.board);

    if (!hasLegal) {
      this.gameOver = true;
      if (inCheck) {
        const winner = this.turn === COLORS.WHITE ? 'Black' : 'White';
        this.statusText = `Checkmate! ${winner} wins!`;
      } else {
        this.statusText = 'Stalemate! Draw!';
      }
    } else if (inCheck) {
      this.statusText = `${this.turn === COLORS.WHITE ? 'White' : 'Black'} is in check.`;
    } else {
      this.statusText = `${this.turn === COLORS.WHITE ? 'White' : 'Black'}'s turn`;
    }
  }

  hasLegalMoves(color) {
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++)
        if (this.board[r][c] && this.board[r][c].color === color)
          if (this.getLegalMoves(r, c).length > 0) return true;
    return false;
  }

  selectSquare(row, col) {
    if (this.gameOver || this.pendingPromotion) return;

    const piece = this.at(row, col);

    if (this.selected) {
      if (this.legalMoves.some(m => m[0] === row && m[1] === col)) {
        this.makeMove(this.selected[0], this.selected[1], row, col);
        return;
      }
      if (piece && piece.color === this.turn) {
        this.selected = [row, col];
        this.legalMoves = this.getLegalMoves(row, col);
        this.updateBoard();
        return;
      }
      this.selected = null;
      this.legalMoves = [];
      this.updateBoard();
      return;
    }

    if (piece && piece.color === this.turn) {
      this.selected = [row, col];
      this.legalMoves = this.getLegalMoves(row, col);
      this.updateBoard();
    }
  }

  showPromotionModal(row, col, color) {
    const choices = document.getElementById('promotion-choices');
    const types = [PIECES.QUEEN, PIECES.ROOK, PIECES.BISHOP, PIECES.KNIGHT];
    choices.innerHTML = '';
    for (const type of types) {
      const el = document.createElement('div');
      el.className = 'promo-option';
      el.classList.add(color === 'w' ? 'piece-white' : 'piece-black');
      el.dataset.piece = type;
      el.innerHTML = UNICODE[color + type];
      el.addEventListener('click', () => this.completePromotion(type));
      choices.appendChild(el);
    }
    document.getElementById('promotion-modal').classList.remove('hidden');
  }

  completePromotion(type) {
    const { toR, toC, color, fromR, fromC, captured } = this.pendingPromotion;
    this.board[toR][toC] = { type, color };
    this.enPassantTarget = null;
    this.lastMove = [[fromR, fromC], [toR, toC]];
    this.moveHistory.push({ from: [fromR, fromC], to: [toR, toC], piece: { type: PIECES.PAWN, color }, captured });
    const player = getPlayer(this.turn);
    if (player) {
      player.addPoints(1);
      if (captured) {
        const typeMap = { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen' };
        player.addPoints(getCaptureBonus(typeMap[captured.type] || 'pawn'));
      }
    }
    this.turn = this.turn === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
    this.pendingPromotion = null;
    document.getElementById('promotion-modal').classList.add('hidden');
    this.checkGameState();
    this.updateBoard();
  }

  updateBoard() {
    const boardEl = document.getElementById('board');
    boardEl.innerHTML = '';
    const inCheck = !this.gameOver && this.isInCheck(this.turn, this.board);
    const checkKingPos = inCheck ? this.findKing(this.turn, this.board) : null;

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const sq = document.createElement('div');
        sq.className = `square ${(r + c) % 2 === 0 ? 'light' : 'dark'}`;
        sq.dataset.row = r;
        sq.dataset.col = c;

        if (this.selected && this.selected[0] === r && this.selected[1] === c)
          sq.classList.add('selected');

        if (checkKingPos && checkKingPos[0] === r && checkKingPos[1] === c)
          sq.classList.add('check');

        if (this.lastMove) {
          if ((this.lastMove[0][0] === r && this.lastMove[0][1] === c) ||
              (this.lastMove[1][0] === r && this.lastMove[1][1] === c))
            sq.classList.add('last-move');
        }

        if (this.legalMoves.some(m => m[0] === r && m[1] === c)) {
          if (this.board[r][c]) sq.classList.add('legal-capture');
          else sq.classList.add('legal-move');
        }

        const piece = this.at(r, c);
        if (piece) {
          const span = document.createElement('span');
          span.className = 'piece';
          span.classList.add(piece.color === 'w' ? 'piece-white' : 'piece-black');
          span.innerHTML = UNICODE[piece.color + piece.type] || '?';
          sq.appendChild(span);
        }

        sq.addEventListener('click', () => this.selectSquare(r, c));
        boardEl.appendChild(sq);
      }
    }

    document.getElementById('status').textContent = this.statusText || '';

    const wEl = document.getElementById('captured-white');
    const bEl = document.getElementById('captured-black');
    wEl.innerHTML = this.capturedWhite.map(p => UNICODE['w' + p.type]).join('');
    bEl.innerHTML = this.capturedBlack.map(p => UNICODE['b' + p.type]).join('');
    this.updateCardsPanel();
  }

  updateCardsPanel() {
    for (const color of [COLORS.WHITE, COLORS.BLACK]) {
      const player = getPlayer(color);
      if (!player) continue;
      const ptsEl = document.getElementById(`points-${color}`);
      if (ptsEl) ptsEl.textContent = player.points;
      const slotsEl = document.getElementById(`card-slots-${color}`);
      if (!slotsEl) continue;
      slotsEl.innerHTML = '';
      for (let i = 0; i < player.hand.length; i++) {
        const card = player.hand[i];
        const div = document.createElement('div');
        div.className = 'card-mini' + (card.isMaxLevel() ? ' card-max' : ' card-clickable');
        div.innerHTML = `
          <span class="card-icon">${card.emoji}</span>
          <span class="card-info">
            <span class="card-name">${card.pieceName}</span>
            <span class="card-path">${card.pathName}</span>
          </span>
          <span class="card-level">Lv${card.currentLevel}/3</span>
        `;
        if (!card.isMaxLevel()) {
          const btn = document.createElement('button');
          btn.className = 'card-lvl-btn';
          btn.textContent = `${card.getLevelUpCost()} pts`;
          btn.disabled = !player.canAffordLevelUp(i);
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (player.purchaseLevelUp(i)) {
              this.updateCardsPanel();
            }
          });
          div.appendChild(btn);
        }
        div.addEventListener('mouseenter', (e) => showCardTooltip(e, card));
        div.addEventListener('mouseleave', hideCardTooltip);
        slotsEl.appendChild(div);
      }
    }
  }
}

const CHESS_UNICODE = { pawn: '♟', knight: '♞', bishop: '♝', rook: '♜', queen: '♛' };
const SLOT_UNICODE = { pawn: '&#9817;', knight: '&#9816;', bishop: '&#9815;', rook: '&#9814;', queen: '&#9813;' };
const PIECE_NAMES = { pawn: 'Pawn', knight: 'Knight', bishop: 'Bishop', rook: 'Rook', queen: 'Queen' };

let dbState = { turn: 'b', activeSlot: null, w: {}, b: {} };
let poolFilter = 'all';

function initDeckBuilder() {
  document.getElementById('deck-builder').classList.remove('hidden');
  dbState = { turn: 'b', activeSlot: null, w: {}, b: {} };
  poolFilter = 'all';
  document.getElementById('db-confirm-btn').disabled = true;
  document.getElementById('db-confirm-btn').textContent = "Start Game";
  updateTurnUI();
  renderSlots();
  renderPoolCards();
  setStatus('Black picks first — click a piece slot, then pick a card from the pool below', 'ok');
}

function updateTurnUI() {
  const el = document.getElementById('db-turn-indicator');
  if (dbState.turn === 'w') {
    el.className = 'db-turn-w';
    el.textContent = "White's turn — click a piece slot, then pick a card from the pool";
  } else {
    el.className = 'db-turn-b';
    el.textContent = "Black's turn — click a piece slot, then pick a card from the pool";
  }
}

function renderSlots() {
  const container = document.getElementById('db-slots');
  container.innerHTML = '';

  const players = [
    { color: 'b', label: 'Black', picks: dbState.b },
    { color: 'w', label: 'White', picks: dbState.w }
  ];

  for (const player of players) {
    const row = document.createElement('div');
    row.className = 'db-player-row';

    const label = document.createElement('div');
    label.className = 'db-player-label';
    label.textContent = player.label;
    row.appendChild(label);

    const slotsDiv = document.createElement('div');
    slotsDiv.className = 'db-slots-row';

    for (const pieceType of PIECE_ORDER) {
      const pathType = player.picks[pieceType];
      const data = pathType ? CARD_DATA[pieceType][pathType] : null;
      const isCurrent = dbState.turn === player.color;
      const isFilled = !!pathType;
      const isActive = isCurrent && dbState.activeSlot === pieceType;

      const PATH_LABELS = { movement: 'Movement', attack: 'Attack', defense: 'Defense' };

      const slot = document.createElement('div');
      slot.className = 'db-slot';
      if (isFilled) slot.classList.add('filled', 'path-' + pathType);
      if (isActive) slot.classList.add('active');
      if (!isCurrent) slot.classList.add('opponent');

      slot.dataset.piece = pieceType;
      slot.dataset.color = player.color;

      slot.innerHTML = `
        <span class="slot-icon">${SLOT_UNICODE[pieceType]}</span>
        <span class="slot-label">${PIECE_NAMES[pieceType]}</span>
        <span class="slot-card-name ${data ? 'path-' + pathType : ''}">${data ? PATH_LABELS[pathType] : '—'}</span>
      `;

      if (isCurrent && !isFilled) {
        slot.addEventListener('click', () => handleSlotClick(pieceType));
        slot.addEventListener('dragover', (e) => { e.preventDefault(); slot.classList.add('drag-over'); });
        slot.addEventListener('dragleave', () => slot.classList.remove('drag-over'));
          slot.addEventListener('drop', (e) => {
            e.preventDefault();
            slot.classList.remove('drag-over');
            const d = e.dataTransfer.getData('text/plain');
            if (d) {
              const [pType, pathT] = d.split(',');
              if (pType === pieceType) {
                const picks2 = dbState.turn === 'w' ? dbState.w : dbState.b;
                if (wouldMakeValid(pType, pathT, picks2)) assignCard(pType, pathT);
              }
            }
          });
      }

      slotsDiv.appendChild(slot);
    }

    row.appendChild(slotsDiv);
    container.appendChild(row);
  }
}

function handleSlotClick(pieceType) {
  dbState.activeSlot = pieceType;
  setStatus(`Pick a card for ${PIECE_NAMES[pieceType]} from the pool below`, 'ok');
  renderSlots();
  renderPoolCards();
  updateConfirmBtn();
}

function wouldMakeValid(pieceType, pathType, picks) {
  const test = { ...picks, [pieceType]: pathType };
  const filled = PIECE_ORDER.filter(pt => test[pt]).length;
  const remaining = 5 - filled;
  const counts = { movement: 0, attack: 0, defense: 0 };
  for (const pt of Object.values(test)) { if (counts[pt] !== undefined) counts[pt]++; }
  for (const p of ['movement', 'attack', 'defense']) {
    if (counts[p] > 3) return false;
  }
  const needed = ['movement', 'attack', 'defense'].filter(p => counts[p] === 0);
  return remaining >= needed.length;
}

function assignCard(pieceType, pathType) {
  const picks = dbState.turn === 'w' ? dbState.w : dbState.b;
  if (!wouldMakeValid(pieceType, pathType, picks)) {
    dbState.activeSlot = null;
    renderSlots();
    renderPoolCards();
    setStatus(`Can't pick that — deck must have 1-3 of each path type and at least 1 of each.`, 'err');
    return;
  }
  picks[pieceType] = pathType;
  dbState.activeSlot = null;

  const currentDone = PIECE_ORDER.every(pt => picks[pt]);
  const otherPicks = dbState.turn === 'w' ? dbState.b : dbState.w;
  const otherDone = PIECE_ORDER.every(pt => otherPicks[pt]);

  if (currentDone && otherDone) {
    const el = document.getElementById('db-turn-indicator');
    el.className = 'db-turn-w';
    el.textContent = 'Both players ready! Click "Start Game" above.';
    renderSlots();
    renderPoolCards();
    updateConfirmBtn();
    setStatus('Both players ready! Click "Start Game" to begin.', 'ok');
    return;
  }

  dbState.turn = dbState.turn === 'w' ? 'b' : 'w';
  updateTurnUI();
  renderSlots();
  renderPoolCards();
  updateConfirmBtn();

  if (currentDone) {
    setStatus(`${dbState.turn === 'w' ? 'White' : 'Black'} has all slots filled! ${dbState.turn === 'w' ? "White's" : "Black's"} turn to pick.`, 'ok');
  } else {
    const next = PIECE_ORDER.find(pt => !(dbState.turn === 'w' ? dbState.w : dbState.b)[pt]);
    setStatus(`${dbState.turn === 'w' ? "White's" : "Black's"} turn — pick a card for ${PIECE_NAMES[next]}`, 'ok');
  }
}

function renderPoolCards() {
  const container = document.getElementById('pool-cards');
  container.innerHTML = '';
  const picks = dbState.turn === 'w' ? dbState.w : dbState.b;
  const otherPicks = dbState.turn === 'w' ? dbState.b : dbState.w;

  for (const pieceType of PIECE_ORDER) {
    for (const pathType of [PATH_TYPES.MOVEMENT, PATH_TYPES.ATTACK, PATH_TYPES.DEFENSE]) {
      if (poolFilter !== 'all' && pathType !== poolFilter) continue;
      const data = CARD_DATA[pieceType][pathType];
      const card = new Card(pieceType, pathType);
      const isTakenByCurrent = picks[pieceType] === pathType;
      const slotFilled = picks[pieceType] !== undefined;
      const isTakenByOther = otherPicks[pieceType] === pathType;
      const isTaken = isTakenByCurrent || isTakenByOther || slotFilled;

      const div = document.createElement('div');
      div.className = 'pool-card path-' + pathType + (isTaken ? ' taken' : '');
      div.draggable = !isTaken;
      div.innerHTML = `
        <div class="pc-header">
          <span class="pc-chess-icon">${CHESS_UNICODE[pieceType]}</span>
          <span class="pc-piece">${card.pieceName}</span>
          <span class="pc-icon">${data.emoji}</span>
        </div>
        <span class="pc-path path-${pathType}">${data.name}</span>
        <div class="pc-name">${data.levels[0].name} → ${data.levels[2].name}</div>
        <div class="pc-levels">${data.levels[0].description.slice(0, 50)}${data.levels[0].description.length > 50 ? '...' : ''}</div>
        ${isTakenByOther ? '<div style="font-size:0.65rem;color:#ff6;margin-top:2px">Taken by opponent</div>' : ''}
        ${isTakenByCurrent ? '<div style="font-size:0.65rem;color:#4c4;margin-top:2px">✓ Selected</div>' : ''}
      `;

      if (!isTaken && dbState.activeSlot === pieceType) {
        div.addEventListener('click', () => assignCard(pieceType, pathType));
      } else if (!isTaken && !dbState.activeSlot && !isTakenByCurrent) {
        div.addEventListener('click', () => {
          dbState.activeSlot = pieceType;
          renderSlots();
          renderPoolCards();
          setStatus(`Pick a card for ${PIECE_NAMES[pieceType]}`, 'ok');
        });
      }

      div.addEventListener('dragstart', (e) => {
        if (isTaken) { e.preventDefault(); return; }
        if (dbState.activeSlot && dbState.activeSlot !== pieceType) { e.preventDefault(); return; }
        e.dataTransfer.setData('text/plain', `${pieceType},${pathType}`);
        if (!dbState.activeSlot) {
          dbState.activeSlot = pieceType;
          renderSlots();
        }
      });

      container.appendChild(div);
    }
  }
}

function updateConfirmBtn() {
  const btn = document.getElementById('db-confirm-btn');
  const wDone = PIECE_ORDER.every(pt => dbState.w[pt]);
  const bDone = PIECE_ORDER.every(pt => dbState.b[pt]);

  if (!wDone || !bDone) {
    btn.disabled = true;
    btn.textContent = 'Start Game';
    return;
  }

  const wCards = PIECE_ORDER.map(pt => new Card(pt, dbState.w[pt]));
  const bCards = PIECE_ORDER.map(pt => new Card(pt, dbState.b[pt]));
  const wErrs = validateDeck(wCards);
  const bErrs = validateDeck(bCards);

  if (wErrs || bErrs) {
    setStatus('Deck validation failed!', 'err');
    btn.disabled = true;
  } else {
    setStatus('Both players ready! Click "Start Game" to begin.', 'ok');
    btn.disabled = false;
    btn.textContent = 'Start Game';
  }
}

function setStatus(msg, type) {
  const el = document.getElementById('db-status');
  el.textContent = msg;
  el.className = type === 'err' ? 'db-status-err' : 'db-status-ok';
}

function handleConfirm() {
  if (PIECE_ORDER.some(pt => !dbState.w[pt]) || PIECE_ORDER.some(pt => !dbState.b[pt])) return;

  whitePlayer = new Player('White', COLORS.WHITE);
  blackPlayer = new Player('Black', COLORS.BLACK);
  for (const pieceType of PIECE_ORDER) {
    whitePlayer.addCard(new Card(pieceType, dbState.w[pieceType]));
    blackPlayer.addCard(new Card(pieceType, dbState.b[pieceType]));
  }
  document.getElementById('deck-builder').classList.add('hidden');
  if (game) game.init();
  else { game = new ChessGame(); game.init(); }
}

function handleSkip() {
  whitePlayer = null;
  blackPlayer = null;
  document.getElementById('deck-builder').classList.add('hidden');
  if (game) game.init();
  else { game = new ChessGame(); game.init(); }
}

function showCardTooltip(event, card) {
  const existing = document.querySelector('.card-tooltip');
  if (existing) existing.remove();
  const ability = card.getCurrentAbility();
  const div = document.createElement('div');
  div.className = 'card-tooltip visible';
  div.innerHTML = `
    <div class="tt-name">${card.emoji} ${card.pieceName} — ${ability.name}</div>
    <div class="tt-level">Level ${card.currentLevel}/3 · ${card.pathName}</div>
    <div class="tt-desc">${ability.description}</div>
    <div class="tt-use">${ability.strategicUse}</div>
  `;
  document.body.appendChild(div);
  const rect = event.target.getBoundingClientRect();
  div.style.left = Math.min(rect.left, window.innerWidth - 340) + 'px';
  div.style.top = (rect.bottom + 8) + 'px';
}

function hideCardTooltip() {
  const existing = document.querySelector('.card-tooltip');
  if (existing) existing.remove();
}

document.getElementById('db-confirm-btn').addEventListener('click', handleConfirm);
document.getElementById('db-skip-btn').addEventListener('click', handleSkip);
document.getElementById('reset-btn').addEventListener('click', initDeckBuilder);

document.getElementById('deck-pool').addEventListener('click', (e) => {
  const tab = e.target.closest('.pool-tab');
  if (!tab) return;
  document.querySelectorAll('.pool-tab').forEach(t => t.classList.remove('active'));
  tab.classList.add('active');
  poolFilter = tab.dataset.path;
  renderPoolCards();
});

initDeckBuilder();
