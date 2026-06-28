const PIECES = {
  KING: 'k', QUEEN: 'q', ROOK: 'r', BISHOP: 'b', KNIGHT: 'n', PAWN: 'p'
};

const COLORS = { WHITE: 'w', BLACK: 'b' };

const UNICODE = {
  'wk': '&#9812;', 'wq': '&#9813;', 'wr': '&#9814;', 'wb': '&#9815;', 'wn': '&#9816;', 'wp': '&#9817;',
  'bk': '&#9818;', 'bq': '&#9819;', 'br': '&#9820;', 'bb': '&#9821;', 'bn': '&#9822;', 'bp': '&#9823;'
};

const FILES = 'abcdefgh';

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
    const endCol = rCol === 0 ? 3 : 5;
    for (let c = kCol + step; c !== endCol + step; c += step) {
      if (c === kCol) continue;
      if (board[backRow][c]) return false;
    }
    for (let c = kCol; c !== endCol + step; c += step) {
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

    if (isEnPassant) {
      const epCaptured = this.at(fromR, toC);
      if (epCaptured) {
        if (epCaptured.color === COLORS.WHITE) this.capturedWhite.push(epCaptured);
        else this.capturedBlack.push(epCaptured);
      }
      this.board[fromR][toC] = null;
    }

    if (captured) {
      if (captured.color === COLORS.WHITE) this.capturedWhite.push(captured);
      else this.capturedBlack.push(captured);
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
  }
}

const game = new ChessGame();
document.getElementById('reset-btn').addEventListener('click', () => game.init());
