const CARD_DATA = {
  pawn: {
    movement: {
      name: 'Movement',
      emoji: '\u{1F680}',
      levels: [
        {
          name: 'Rocket Start',
          description: 'Pawns can jump up to 3 squares forward on their very first move of the game (instead of the usual 2).',
          strategicUse: 'Insane early-game center control.'
        },
        {
          name: 'Overdrive',
          description: 'Pawns can move 2 squares forward at any time, not just on their first move. (Can still only capture diagonally 1 square away).',
          strategicUse: 'Blitzing down the board to force promotions or create sudden blockers.'
        },
        {
          name: 'Retribution',
          description: 'Pawns gain the ability to move 1 square backwards.',
          strategicUse: 'Completely breaks traditional chess theory. Pawns are no longer "use-it-or-lose-it" pieces; they can retreat to defend or reform lines.'
        }
      ]
    },
    attack: {
      name: 'Attack',
      emoji: '\u{2694}\u{FE0F}',
      levels: [
        {
          name: 'Bayonet Charge',
          description: 'Pawns can now capture the piece directly in front of them (in addition to their normal diagonal capture).',
          strategicUse: 'Destroys the classic chess strategy of "locking" pawn chains head-to-head.'
        },
        {
          name: 'Shatranj Shatter',
          description: 'Pawns can attack exactly 2 squares away diagonally, jumping over any piece in the middle.',
          strategicUse: 'Perfect for unexpected "forks" (attacking two major pieces at once from a safe distance).'
        },
        {
          name: 'Checker Leap',
          description: 'When capturing an enemy piece diagonally, if the square immediately behind that piece is empty, the pawn jumps over it and lands there (like Checkers). Limit 1 jump per turn.',
          strategicUse: 'Incredibly punishing against tightly packed enemy defenses.'
        }
      ]
    },
    defense: {
      name: 'Defense & Utility',
      emoji: '\u{1F6E1}\u{FE0F}',
      levels: [
        {
          name: 'Soul Capture',
          description: 'If an ally pawn is captured, any adjacent ally pawn can move onto that empty square on the very next turn to capture the piece that just killed it.',
          strategicUse: 'Punishes the opponent heavily for taking trades.'
        },
        {
          name: 'Rear Guard',
          description: 'Pawns can attack 1 square directly behind them diagonally or straight back if an enemy piece infiltrates the backline.',
          strategicUse: 'Defends against sneaky Knight or Rook flanks without needing to turn around.'
        },
        {
          name: 'Vanguard',
          description: 'Trade-off. The pawn forfeits all forward attacking capabilities. In exchange, it can now attack the 5 squares directly behind it and to its immediate left/right sides.',
          strategicUse: 'Turns your advanced pawns into impenetrable shields that protect your Queen and Rooks from behind.'
        }
      ]
    }
  },
  knight: {
    movement: {
      name: 'Movement',
      emoji: '\u{1F680}',
      levels: [
        {
          name: 'Extended L',
          description: 'Can move in a longer 3x1 L-shape.',
          strategicUse: 'Extended reach for unexpected attacks.'
        },
        {
          name: 'Pegasus Lane Jump',
          description: 'Can move in a wider 3x2 L-shape and can land on any square along that lane. Only delivers a check if it lands at the exact 3x2 destination.',
          strategicUse: 'Flexible positioning with partial lane landing.'
        },
        {
          name: 'Tactical Fallback',
          description: 'Can instantly teleport back to its original starting square, provided that square remains empty and unobstructed.',
          strategicUse: 'Emergency escape or rapid defense repositioning.'
        }
      ]
    },
    attack: {
      name: 'Attack',
      emoji: '\u{2694}\u{FE0F}',
      levels: [
        {
          name: 'Sword Skills',
          description: 'Can capture enemy pieces 1 square diagonally forward (like a base pawn). Cannot be used to deliver a check.',
          strategicUse: 'Extra capture options without moving.'
        },
        {
          name: 'Trample',
          description: 'Captures all enemy pieces on every square along its movement path to its final destination. Cannot be used to deliver a check.',
          strategicUse: 'Devastating against clustered formations.'
        },
        {
          name: 'Seismic Slam',
          description: 'Upon landing, stuns all horizontally and vertically adjacent enemy pieces for 1 turn. Cannot be used to deliver a check.',
          strategicUse: 'Crowd control and board disruption.'
        }
      ]
    },
    defense: {
      name: 'Defense & Utility',
      emoji: '\u{1F6E1}\u{FE0F}',
      levels: [
        {
          name: 'Smoke Bomb',
          description: 'When the Knight is captured, it stuns the capturing piece for 1 turn, preventing it from moving or attacking.',
          strategicUse: 'Makes opponents think twice before capturing.'
        },
        {
          name: 'Iron Brotherhood',
          description: 'When two friendly Knights protect each other, they form a solid 2x3 wall between them. Enemy pieces cannot move or jump through this zone, but friendly pieces can pass through freely. The wall breaks if one Knight is captured or moved.',
          strategicUse: 'Creates impenetrable defensive zones.'
        },
        {
          name: 'Last Stand',
          description: 'If this is the last surviving Knight on your team, it gains immunity to all enemy modifier card effects.',
          strategicUse: 'Guaranteed value even when outnumbered.'
        }
      ]
    }
  },
  bishop: {
    movement: {
      name: 'Movement',
      emoji: '\u{1F680}',
      levels: [
        {
          name: 'Billiard Bounce',
          description: 'Once per move, when hitting the edge of the board, the Bishop can bounce 90 degrees and continue its diagonal movement path.',
          strategicUse: 'Doubles the reach and flexibility of diagonal movement.'
        },
        {
          name: 'Color Phase',
          description: 'Once per game, the Bishop can switch to an adjacent square of the opposite color, permanently changing the color complex it operates on.',
          strategicUse: 'Overcomes the inherent Bishop color limitation.'
        },
        {
          name: 'Crusade Shift',
          description: 'Once per game, the Bishop can choose to move and capture exactly like a Rook or a Knight for a single turn, but this move cannot be used to deliver a check.',
          strategicUse: 'Surprise tactical flexibility in critical moments.'
        }
      ]
    },
    attack: {
      name: 'Attack',
      emoji: '\u{2694}\u{FE0F}',
      levels: [
        {
          name: 'Piercing Gaze',
          description: 'Delivers a check to the enemy King through intervening pieces, but only if exactly one piece is blocking the path. If two or more pieces are blocking, it does not deliver a check.',
          strategicUse: 'Pressure through defensive lines.'
        },
        {
          name: 'Chain Reaction',
          description: 'When capturing an enemy piece, if there is another enemy piece diagonally adjacent to the target, that second piece is also captured.',
          strategicUse: 'Chain kills to break through dense formations.'
        },
        {
          name: 'Divine Wrath',
          description: 'Can target any single square on any diagonal in its line of sight, ignoring blocking pieces. Upon targeting, the square turns red to warn the opponent, and the Bishop freezes for 2 turns (1 turn to announce, 1 turn to charge, firing on the 3rd turn). The Bishop is fully vulnerable to capture while charging. Capturing the King results in an automatic win.',
          strategicUse: 'High-risk, high-reward sniper ability.'
        }
      ]
    },
    defense: {
      name: 'Defense & Utility',
      emoji: '\u{1F6E1}\u{FE0F}',
      levels: [
        {
          name: 'Holy Ground',
          description: 'The squares directly adjacent to the Bishop give any friendly pawns standing on them immunity to frontline captures.',
          strategicUse: 'Creates safe zones for pawns in contested areas.'
        },
        {
          name: 'Divine Intervention',
          description: 'When a friendly piece is captured anywhere within the Bishop\'s diagonal line of sight, you have exactly one turn to activate this ability. Activating it completely sacrifices the Bishop to reincarnate the fallen piece back onto the square where it died.',
          strategicUse: 'Powerful trade reversal at the cost of the Bishop.'
        },
        {
          name: 'Necromancer',
          description: 'You can spend your entire turn to revive a fallen friendly pawn onto its original starting square of the match. The revived pawn will have no upgrades and loses the ability to promote for the rest of the game.',
          strategicUse: 'Late-game pawn recovery for board presence.'
        }
      ]
    }
  },
  rook: {
    movement: {
      name: 'Movement',
      emoji: '\u{1F680}',
      levels: [
        {
          name: 'Steamroller',
          description: 'When moving, the Rook can push a single friendly piece out of its way into an empty adjacent square instead of being blocked by it.',
          strategicUse: 'Clears friendly traffic jams without wasted tempo.'
        },
        {
          name: 'Freight Train',
          description: 'Can move through any number of friendly pieces in its straight path, landing on an empty square past them.',
          strategicUse: 'Roams freely across friendly lines for rapid repositioning.'
        },
        {
          name: 'Corner Drift',
          description: 'Once per turn, the Rook can make a single 90-degree turn during its movement, letting it move both horizontally and vertically in one go.',
          strategicUse: 'Covers two directions in one move, opening new attack angles.'
        }
      ]
    },
    attack: {
      name: 'Attack',
      emoji: '\u{2694}\u{FE0F}',
      levels: [
        {
          name: 'Cannon Shot',
          description: 'Moves like a normal Rook when not capturing, but captures by jumping over exactly one piece (friend or foe) along its straight line of sight to land on the enemy target. Cannot be used to deliver a check.',
          strategicUse: 'Ranged elimination through blocking pieces.'
        },
        {
          name: 'Wrecking Ball',
          description: 'Instead of moving, the Rook can target a square exactly 2 spaces away in a straight line and destroy the piece standing there (friendly or enemy) to clear the path or open up a discovered attack. The Rook stays in its original square.',
          strategicUse: 'Demolishes key structures without committing the Rook.'
        },
        {
          name: 'Juggernaut Engine',
          description: 'Lock the Rook into a chosen horizontal or vertical direction. For the rest of the game, the Rook automatically moves exactly 1 square in that direction every turn until it rolls completely off the board. It destroys every single piece (friendly or enemy) in its path. It cannot be stopped, redirected, or captured, unless it is struck directly by an opposing Rook also using this ability.',
          strategicUse: 'Apocalyptic board clearer with massive collateral damage.'
        }
      ]
    },
    defense: {
      name: 'Defense & Utility',
      emoji: '\u{1F6E1}\u{FE0F}',
      levels: [
        {
          name: 'Iron Sentry',
          description: 'Any friendly piece standing directly adjacent to the Rook cannot be moved or pushed by enemy card effects or abilities.',
          strategicUse: 'Anchors your pieces against displacement effects.'
        },
        {
          name: 'Bunker Down',
          description: 'The Rook freezes in place permanently and can no longer move or capture. In exchange, it becomes completely immortal and acts as an unbreakable block for the rest of the match.',
          strategicUse: 'Creates a permanent indestructible obstacle.'
        },
        {
          name: 'Magnetic Castle',
          description: 'If the King and this Rook are ever on the same file (column) or rank (row) with no pieces between them, they can castle regardless of distance. The King jumps to the square next to the Rook, and the Rook hops over it. This cannot be done if the King must pass through or lands in check.',
          strategicUse: 'Distant emergency castling for King safety.'
        }
      ]
    }
  },
  queen: {
    movement: {
      name: 'Movement',
      emoji: '\u{1F680}',
      levels: [
        {
          name: 'Royal Apex',
          description: 'The Queen gains the permanent ability to move and capture exactly like a Knight, in addition to her standard diagonal and straight-line movement.',
          strategicUse: 'Combines the two most powerful movement patterns.'
        },
        {
          name: 'Warp Drive',
          description: 'Once per game, the Queen can swap places with any friendly pawn on the board as her move.',
          strategicUse: 'Rapid relocation or pawn advancement trick.'
        },
        {
          name: 'Dimension Fold',
          description: 'When the Queen reaches any edge of the board, she can instantly teleport to the exact corresponding square on the opposite edge of the board to continue her move line.',
          strategicUse: 'Boundless board coverage and escape options.'
        }
      ]
    },
    attack: {
      name: 'Attack',
      emoji: '\u{2694}\u{FE0F}',
      levels: [
        {
          name: 'Majestic Sweep',
          description: 'When capturing an enemy piece, all enemy pawns in the squares directly adjacent to the target are also swept off the board.',
          strategicUse: 'Wipes out supporting pawn structures in one blow.'
        },
        {
          name: 'Empress Command',
          description: 'Instead of moving, the Queen can force an adjacent enemy piece to move 1 square in a direction of her choice (cannot force them into a self-capture or off the board).',
          strategicUse: 'Disrupts enemy positioning without putting the Queen at risk.'
        },
        {
          name: 'Absolute Dominance',
          description: 'Once per game, the Queen can consume her own turn to target any enemy piece she can see in her line of sight. On your next turn, the Queen teleports directly to that square, capturing the piece regardless of any other pieces blocking her path or defending the target.',
          strategicUse: 'Guaranteed elimination of any visible threat.'
        }
      ]
    },
    defense: {
      name: 'Defense & Utility',
      emoji: '\u{1F6E1}\u{FE0F}',
      levels: [
        {
          name: 'Sovereign Shield',
          description: 'The Queen is completely immune to being captured by enemy pawns.',
          strategicUse: 'Removes the most common threat to the Queen.'
        },
        {
          name: 'Long Live the Queen',
          description: 'If the King is placed in checkmate, you can choose to sacrifice the Queen instead to instantly teleport the King to any safe, empty square on your half of the board, continuing the match.',
          strategicUse: 'Get-out-of-jail-free card for checkmate scenarios.'
        },
        {
          name: 'Royal Broodmother',
          description: 'When the Queen is sitting on her original starting square, you can spend your turn to spawn a brand-new friendly pawn on the D-file. This new pawn inherits all current global pawn upgrades. If there is already a pawn on the spawn square, the existing pawn is pushed forward 1 square to make room.',
          strategicUse: 'Infinite pawn generation for overwhelming numbers.'
        }
      ]
    }
  }
};
