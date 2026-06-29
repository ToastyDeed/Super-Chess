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
