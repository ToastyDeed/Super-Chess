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
