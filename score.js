const POINTS_TEXT = ["0", "15", "30", "40", "Vorteil"];
let pointsA = 0, pointsB = 0, gamesA = 0, gamesB = 0, setsA = 0, setsB = 0;
let tieBreak = false, tieBreakA = 0, tieBreakB = 0;

function updateDisplay() {
  if (tieBreak) {
    document.getElementById("scoreA").textContent = tieBreakA;
    document.getElementById("scoreB").textContent = tieBreakB;
    document.getElementById("status").textContent = `Tie-Break! Sätze: ${setsA} : ${setsB}, Spiele: ${gamesA} : ${gamesB}`;
  } else {
    document.getElementById("scoreA").textContent =
      POINTS_TEXT[Math.min(pointsA, 4)] + (pointsA > 3 && pointsA > pointsB ? " (Vorteil)" : "");
    document.getElementById("scoreB").textContent =
      POINTS_TEXT[Math.min(pointsB, 4)] + (pointsB > 3 && pointsB > pointsA ? " (Vorteil)" : "");
    document.getElementById("status").textContent =
      `Sätze: ${setsA} : ${setsB}, Spiele: ${gamesA} : ${gamesB}`;
  }
}

function addPoint(player) {
  if (tieBreak) {
    player === 'A' ? tieBreakA++ : tieBreakB++;
    checkTieBreak();
    updateDisplay();
    return;
  }
  if (player === 'A') pointsA++; else pointsB++;
  handleGameLogic();
  updateDisplay();
}

function handleGameLogic() {
  if (pointsA >= 3 && pointsB >= 3) {
    if (pointsA === pointsB) return; // Einstand
    if (Math.abs(pointsA - pointsB) === 1) return; // Vorteil
  }
  if (pointsA >= 4 && pointsA - pointsB >= 2) { gamesA++; pointsA = 0; pointsB = 0; }
  else if (pointsB >= 4 && pointsB - pointsA >= 2) { gamesB++; pointsA = 0; pointsB = 0; }
  if (gamesA === 6 && gamesB === 6) tieBreak = true;
  if ((gamesA >= 6 && gamesA - gamesB >= 2) || (gamesA === 7 && gamesB <= 5)) { setsA++; gamesA = 0; gamesB = 0; tieBreak = false; }
  if ((gamesB >= 6 && gamesB - gamesA >= 2) || (gamesB === 7 && gamesA <= 5)) { setsB++; gamesA = 0; gamesB = 0; tieBreak = false; }
}

function checkTieBreak() {
  if ((tieBreakA >= 7 || tieBreakB >= 7) && Math.abs(tieBreakA - tieBreakB) >= 2) {
    if (tieBreakA > tieBreakB) setsA++;
    else setsB++;
    gamesA = 0; gamesB = 0; tieBreak = false;
    tieBreakA = 0; tieBreakB = 0;
  }
}

document.getElementById("buttonA").addEventListener("click", () => addPoint('A'));
document.getElementById("buttonB").addEventListener("click", () => addPoint('B'));

updateDisplay();
