// Zählwerte für Tennis/Padel
const POINTS_TEXT = ["0", "15", "30", "40"];

// Spielstände & Status
let pointsA = 0, pointsB = 0, gamesA = 0, gamesB = 0, setsA = 0, setsB = 0;
let tieBreak = false, tieBreakA = 0, tieBreakB = 0;

// Für Einstand/Advantage-Mechanik
let advantage = 0;  // 0 = keiner, 1 = A, -1 = B
let einstandPhase = false; // Erst nach erstem Vorteil true!

let isChanged = false; // Flag, ob Punktestand geändert wurde

function markChanged() {
  if (!isChanged) {
    isChanged = true;
    console.log("Spielstand wurde geändert");
  }
}

// Undo-Stack für Rückgängig
let undoStack = [];
function saveState() {
  undoStack.push({
    pointsA, pointsB, gamesA, gamesB, setsA, setsB,
    tieBreak, tieBreakA, tieBreakB,
    advantage, einstandPhase
  });
  if (undoStack.length > 30) undoStack.shift();
}
function restoreState() {
  if (!undoStack.length) return;
  const s = undoStack.pop();
  if (undoStack.length === 0) {
    // Keine Änderungen mehr, Flag zurücksetzen
    isChanged = false;
  }
  
  pointsA = s.pointsA;
  pointsB = s.pointsB;
  gamesA  = s.gamesA;
  gamesB  = s.gamesB;
  setsA   = s.setsA;
  setsB   = s.setsB;
  tieBreak = s.tieBreak;
  tieBreakA = s.tieBreakA;
  tieBreakB = s.tieBreakB;
  advantage = s.advantage;
  einstandPhase = s.einstandPhase;
  updateAllDisplays();
}

// Punkt hinzufügen mit kompletter Logik für Einstand
function addPoint(player) {
  saveState();
  markChanged();
  if (tieBreak) {
    if (player === 'A') tieBreakA++; else tieBreakB++;
    checkTieBreak();
    updateAllDisplays();
    return;
  }
  // EINSTAND-SITUATION
  if (pointsA === 3 && pointsB === 3) {
    if (!advantage) {
      // Erstmaliger Vorteil → EinstandPhase beginnt
      advantage = (player === 'A' ? 1 : -1);
      einstandPhase = true;
    } else if ((advantage === 1 && player === 'A') || (advantage === -1 && player === 'B')) {
      // Punkt für Spieler mit Vorteil: Spielgewinn!
      if (player === 'A') gamesA++; else gamesB++;
      resetGame();
    } else {
      // Vorteil verloren –> wieder Einstand
      advantage = 0;
      // einstandPhase bleibt true!
    }
  } else {
    // Normales Punktesteigern
    if (player === 'A') pointsA++; else pointsB++;
    // Direktes Spiel bei Punktvorsprung ab 40
    if ((pointsA > 3 || pointsB > 3) && Math.abs(pointsA - pointsB) >= 2) {
      if (pointsA > pointsB) gamesA++; else gamesB++;
      resetGame();
    }
  }
  checkSetWin();
  updateAllDisplays();
}

// Rücksetzen Spielstand nach Spielgewinn
function resetGame() {
  pointsA = 0;
  pointsB = 0;
  advantage = 0;
  einstandPhase = false;
  tieBreak = (gamesA === 6 && gamesB === 6);
}

// Satzlogik (Tie-Break/Eindeutig)
function checkSetWin() {
  if ((gamesA >= 6 && gamesA - gamesB >= 2) || (gamesA === 7 && gamesB <= 5)) {
    setsA++; gamesA = 0; gamesB = 0; tieBreak = false;
  }
  if ((gamesB >= 6 && gamesB - gamesA >= 2) || (gamesB === 7 && gamesA <= 5)) {
    setsB++; gamesA = 0; gamesB = 0; tieBreak = false;
  }
}

// Tie-Break Handling
function checkTieBreak() {
  if ((tieBreakA >= 7 || tieBreakB >= 7) && Math.abs(tieBreakA - tieBreakB) >= 2) {
    if (tieBreakA > tieBreakB) setsA++;
    else setsB++;
    gamesA = 0; gamesB = 0; tieBreakA = 0; tieBreakB = 0; tieBreak = false;
  }
}

// Anzeige aktualisieren
function updateAllDisplays() {
  let displayA, displayB, message = "";

  if (tieBreak) {
    displayA = tieBreakA;
    displayB = tieBreakB;
    message = "Tie-Break!";
  } else if (pointsA === 3 && pointsB === 3) {
    // 40:40 Logik
    if (!einstandPhase) {
      displayA = displayB = "40";
      message = "40:40";
    } else if (advantage === 1) {
      displayA = "Vorteil";
      displayB =  "⬅";
      message = "Vorteil Spieler A";
    } else if (advantage === -1) {
      displayA = "➡";
      displayB = "Vorteil";
      message = "Vorteil Spieler B";
    } else {
      displayA = displayB = "Einstand";
      message = "Einstand";
    }
  } else {
    // Normale Anzeige (außerhalb der Einstand-Phase)
    displayA = pointsA > 3 ? "40" : POINTS_TEXT[pointsA];
    displayB = pointsB > 3 ? "40" : POINTS_TEXT[pointsB];
    message = `Sätze: ${setsA} : ${setsB} | Spiele: ${gamesA} : ${gamesB}`;
  }

  // Anzeige aktualisieren
  document.getElementById("scoreA").textContent = displayA;
  document.getElementById("scoreB").textContent = displayB;
  document.getElementById("setsA").textContent = setsA;
  document.getElementById("setsB").textContent = setsB;
  document.getElementById("gamesA").textContent = gamesA;
  document.getElementById("gamesB").textContent = gamesB;
// document.getElementById("message").textContent = message;
}

function addPointFromBluetooth(player) {
  addPoint(player);
}

function undoFromBluetooth(player) {
  restoreState();
}

// Initialisierung der Bluetooth-Buttons
const btnPlayerA = new BluetoothButtonManager('A', addPointFromBluetooth, undoFromBluetooth);
const btnPlayerB = new BluetoothButtonManager('B', addPointFromBluetooth, undoFromBluetooth);

// Punktebereich als Button zum manuellen Erhöhen
document.getElementById("scoreA").addEventListener("click", () => addPoint('A'));
document.getElementById("scoreB").addEventListener("click", () => addPoint('B'));

// Buttons verdrahten
//document.getElementById("buttonA").addEventListener("click", () => addPoint('A'));
//document.getElementById("buttonB").addEventListener("click", () => addPoint('B'));
// document.getElementById("undoA").addEventListener("click", restoreState);
// document.getElementById("undoB").addEventListener("click", restoreState);
document.getElementById("undo").addEventListener("click", restoreState);

// Buttons zum Verbinden in der UI einbinden, z.B.:
document.getElementById('connectA').addEventListener('click', () => btnPlayerA.connect());
document.getElementById('connectB').addEventListener('click', () => btnPlayerB.connect());

// Warnung beim Verlassen oder Neuladen:
window.addEventListener("beforeunload", (event) => {
  if (isChanged) {
    event.preventDefault();
    // Standardmeldung funktioniert nicht mehr in modernen Browsern,
    // aber diese Zeile zeigt einen Dialog an
    event.returnValue = "Achtung es wurde bereits ein Spielstand erfasst. Möchtest du die Seite wirklich verlassen oder neu laden?";
  }
});

// Init
updateAllDisplays();
