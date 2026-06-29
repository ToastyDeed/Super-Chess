const CAPTURE_BONUS = { pawn: 3, knight: 5, bishop: 5, rook: 8, queen: 8 };
const LEVEL_UP_COST = [0, 5, 10];

class Card {
  constructor(pieceType, pathType) {
    const data = CARD_DATA[pieceType][pathType];
    const pieceNames = { pawn: 'Pawn', knight: 'Knight', bishop: 'Bishop', rook: 'Rook', queen: 'Queen' };
    this.pieceType = pieceType;
    this.pieceName = pieceNames[pieceType];
    this.pathType = pathType;
    this.pathName = data.name;
    this.emoji = data.emoji;
    this.currentLevel = 1;
    this.abilities = data.levels.map(l => ({
      name: l.name,
      description: l.description,
      strategicUse: l.strategicUse
    }));
  }

  getCurrentAbility() {
    return this.abilities[this.currentLevel - 1];
  }

  getNextAbility() {
    if (this.currentLevel >= 3) return null;
    return this.abilities[this.currentLevel];
  }

  getLevelUpCost() {
    if (this.currentLevel >= 3) return Infinity;
    return LEVEL_UP_COST[this.currentLevel];
  }

  isMaxLevel() {
    return this.currentLevel >= 3;
  }

  levelUp() {
    if (this.isMaxLevel()) return false;
    this.currentLevel++;
    return true;
  }
}

class Player {
  constructor(name, color) {
    this.name = name;
    this.color = color;
    this.points = 0;
    this.hand = [];
    this.totalEarned = 0;
  }

  addCard(card) {
    this.hand.push(card);
  }

  addPoints(amount) {
    this.points += amount;
    this.totalEarned += amount;
  }

  canAffordLevelUp(cardIndex) {
    const card = this.hand[cardIndex];
    if (!card || card.isMaxLevel()) return false;
    return this.points >= card.getLevelUpCost();
  }

  purchaseLevelUp(cardIndex) {
    const card = this.hand[cardIndex];
    if (!this.canAffordLevelUp(cardIndex)) return false;
    this.points -= card.getLevelUpCost();
    card.levelUp();
    return true;
  }

  getCardByPieceType(pieceType) {
    return this.hand.find(c => c.pieceType === pieceType);
  }
}

function validateDeck(cards) {
  const errors = [];
  if (cards.length !== 5)
    errors.push('Must select exactly 5 cards (one per piece type).');

  const types = cards.map(c => c.pieceType);
  for (const pt of PIECE_ORDER) {
    if (!types.includes(pt))
      errors.push(`Missing card for ${pt.charAt(0).toUpperCase() + pt.slice(1)}.`);
  }

  const pathCounts = { movement: 0, attack: 0, defense: 0 };
  for (const c of cards) {
    pathCounts[c.pathType]++;
  }

  if (pathCounts.movement < 1)
    errors.push('Must include at least 1 Movement Path card.');
  if (pathCounts.attack < 1)
    errors.push('Must include at least 1 Attack Path card.');
  if (pathCounts.defense < 1)
    errors.push('Must include at least 1 Defense & Utility Path card.');

  return errors.length > 0 ? errors : null;
}

function getCaptureBonus(pieceType) {
  return CAPTURE_BONUS[pieceType] || 0;
}

function getPathTypeLabel(pathType) {
  const labels = { movement: 'Movement', attack: 'Attack', defense: 'Defense & Utility' };
  return labels[pathType] || pathType;
}
