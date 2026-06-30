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
    this.soulCaptureTarget = null;
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
    this.soulCaptureTarget = null;
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
      const piece = { type: backRank[f], color: COLORS.BLACK };
      if (backRank[f] === PIECES.KNIGHT) piece.startPos = [0, f];
      this.board[0][f] = piece;
      this.board[1][f] = { type: PIECES.PAWN, color: COLORS.BLACK, moved: false };
      this.board[6][f] = { type: PIECES.PAWN, color: COLORS.WHITE, moved: false };
      const piece2 = { type: backRank[f], color: COLORS.WHITE };
      if (backRank[f] === PIECES.KNIGHT) piece2.startPos = [7, f];
      this.board[7][f] = piece2;
    }
    this.kingPositions = { w: [7, 4], b: [0, 4] };
  }

  at(row, col) { return this.board[row]?.[col] ?? null; }

  isEnemy(row, col, color) {
    const p = this.at(row, col);
    return p && p.color !== color;
  }

  inBounds(row, col) { return row >= 0 && row < 8 && col >= 0 && col < 8; }

  getPawnMovementLevel(color) {
    const player = getPlayer(color);
    if (!player) return 0;
    const card = player.getCardByPieceType('pawn');
    if (!card || card.pathType !== PATH_TYPES.MOVEMENT) return 0;
    return card.currentLevel;
  }

  getPawnAttackLevel(color) {
    const player = getPlayer(color);
    if (!player) return 0;
    const card = player.getCardByPieceType('pawn');
    if (!card || card.pathType !== PATH_TYPES.ATTACK) return 0;
    return card.currentLevel;
  }

  getPawnDefenseLevel(color) {
    const player = getPlayer(color);
    if (!player) return 0;
    const card = player.getCardByPieceType('pawn');
    if (!card || card.pathType !== PATH_TYPES.DEFENSE) return 0;
    return card.currentLevel;
  }

  getKnightMovementLevel(color) {
    const player = getPlayer(color);
    if (!player) return 0;
    const card = player.getCardByPieceType('knight');
    if (!card || card.pathType !== PATH_TYPES.MOVEMENT) return 0;
    return card.currentLevel;
  }

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
      const moveLevel = this.getPawnMovementLevel(color);
      const atkLevel = this.getPawnAttackLevel(color);
      const defLevel = this.getPawnDefenseLevel(color);
      if (!forAttack) {
        if (this.inBounds(row + dir, col) && !board[row + dir][col])
          moves.push([row + dir, col]);
        const canDoublePush = row === startRow || moveLevel >= 2;
        if (canDoublePush && this.inBounds(row + 2 * dir, col) && !board[row + dir][col] && !board[row + 2 * dir][col])
          moves.push([row + 2 * dir, col]);
        if (moveLevel >= 1 && row === startRow && !piece.moved) {
          if (this.inBounds(row + 3 * dir, col) && !board[row + dir][col] && !board[row + 2 * dir][col] && !board[row + 3 * dir][col])
            moves.push([row + 3 * dir, col]);
        }
        if (moveLevel >= 3) {
          if (this.inBounds(row - dir, col) && !board[row - dir][col])
            moves.push([row - dir, col]);
        }
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
      if (atkLevel >= 1) {
        const nr = row + dir, nc = col;
        if (this.inBounds(nr, nc) && board[nr][nc] && board[nr][nc].color === enemy)
          moves.push([nr, nc]);
      }
      if (atkLevel >= 2) {
        for (const dc of [-1, 1]) {
          const nr = row + 2 * dir, nc = col + 2 * dc;
          if (this.inBounds(nr, nc) && board[nr][nc] && board[nr][nc].color === enemy)
            moves.push([nr, nc]);
        }
      }
      if (!forAttack && atkLevel >= 3) {
        for (const dc of [-1, 1]) {
          const midR = row + dir, midC = col + dc;
          const landR = row + 2 * dir, landC = col + 2 * dc;
          if (this.inBounds(landR, landC) && board[midR] && board[midR][midC] && board[midR][midC].color === enemy && !board[landR][landC])
            moves.push([landR, landC]);
        }
      }
      if (!forAttack && this.soulCaptureTarget && this.soulCaptureTarget.color === color) {
        if (Math.abs(row - this.soulCaptureTarget.row) <= 1 && Math.abs(col - this.soulCaptureTarget.col) <= 1) {
          moves.push([this.soulCaptureTarget.row, this.soulCaptureTarget.col]);
        }
      }
      if (defLevel >= 2) {
        const nr = row - dir, nc = col;
        if (this.inBounds(nr, nc) && board[nr][nc] && board[nr][nc].color === enemy)
          moves.push([nr, nc]);
      }
      if (defLevel >= 3) {
        for (const dc of [-1, 1]) {
          const nr = row - dir, nc = col + dc;
          if (this.inBounds(nr, nc) && board[nr][nc] && board[nr][nc].color === enemy)
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

      const mLevel = this.getKnightMovementLevel(color);
      if (mLevel >= 1) {
        for (const [dr, dc] of [[-3,-1],[-3,1],[-1,-3],[-1,3],[1,-3],[1,3],[3,-1],[3,1]]) {
          const nr = row + dr, nc = col + dc;
          if (this.inBounds(nr, nc) && (!board[nr][nc] || board[nr][nc].color === enemy))
            moves.push([nr, nc]);
        }
      }

      if (mLevel >= 2) {
        for (const [dr, dc] of [[-3,-2],[-3,2],[-2,-3],[-2,3],[2,-3],[2,3],[3,-2],[3,2]]) {
          const nr = row + dr, nc = col + dc;
          if (this.inBounds(nr, nc) && (!board[nr][nc] || board[nr][nc].color === enemy))
            moves.push([nr, nc]);
        }
      }

      if (mLevel >= 3 && piece.startPos) {
        const [sr, sc] = piece.startPos;
        if (!board[sr][sc]) moves.push([sr, sc]);
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

    if (piece.type === PIECES.PAWN && Math.abs(toR - fromR) === 2 && Math.abs(toC - fromC) === 2 && !b[toR][toC]) {
      const midR = (fromR + toR) / 2;
      const midC = (fromC + toC) / 2;
      b[midR][midC] = null;
    }

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
    let soulCaptureActivated = false;

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

    if (capturedPieceRef && capturedPieceRef.type === PIECES.PAWN) {
      const defLevel = this.getPawnDefenseLevel(capturedPieceRef.color);
      if (defLevel >= 1) {
        this.soulCaptureTarget = { row: toR, col: toC, color: capturedPieceRef.color };
        soulCaptureActivated = true;
      }
    }

    const isCheckerLeap = piece.type === PIECES.PAWN && !captured &&
      Math.abs(toR - fromR) === 2 && Math.abs(toC - fromC) === 2;
    if (isCheckerLeap) {
      const midR = (fromR + toR) / 2;
      const midC = (fromC + toC) / 2;
      capturedPieceRef = this.at(midR, midC);
      if (capturedPieceRef) {
        if (capturedPieceRef.color === COLORS.WHITE) this.capturedWhite.push(capturedPieceRef);
        else this.capturedBlack.push(capturedPieceRef);
      }
      this.board[midR][midC] = null;
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

    if (piece.type === PIECES.PAWN) {
      piece.moved = true;
      if (Math.abs(toR - fromR) >= 2) {
        const dir2 = piece.color === COLORS.WHITE ? -1 : 1;
        this.enPassantTarget = [toR - dir2, fromC];
      } else {
        this.enPassantTarget = null;
      }
    } else {
      this.enPassantTarget = null;
    }

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

    if (!soulCaptureActivated) {
      this.soulCaptureTarget = null;
    }

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
