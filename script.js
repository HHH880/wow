const $ = (id) => document.getElementById(id);

const stepQuestion = $("step-question");
const stepNote = $("step-note");
const stepDone = $("step-done");

let selected = null;

// Personalise with ?to=Ama in the link
const params = new URLSearchParams(location.search);
const to = (params.get("to") || "").trim().slice(0, 40);
if (to) $("name").textContent = to;

// Floating hearts
function spawnHeart() {
  const h = document.createElement("span");
  h.className = "heart";
  h.textContent = ["💖", "💗", "💕", "🌸", "✨"][Math.floor(Math.random() * 5)];
  h.style.left = Math.random() * 100 + "vw";
  h.style.fontSize = 14 + Math.random() * 22 + "px";
  h.style.animationDuration = 7 + Math.random() * 6 + "s";
  $("hearts").appendChild(h);
  setTimeout(() => h.remove(), 14000);
}
setInterval(spawnHeart, 700);

function burst() {
  for (let i = 0; i < 30; i++) setTimeout(spawnHeart, i * 50);
}

// Choose "Yes"
const yesBtn = $("yes");
const noBtn = $("no");

yesBtn.addEventListener("click", () => {
  selected = yesBtn.dataset.answer;
  $("chosen-text").textContent = selected;
  stepQuestion.classList.add("hidden");
  stepNote.classList.remove("hidden");
  $("from").focus();
});

// The "No" button runs away from the pointer
let spacer = null;
let attempts = 0;
const noLabels = ["No", "Nope", "Are you sure?", "Too slow 😜", "Can't catch me!", "Just say yes 💖"];

function runAway(e) {
  if (e && e.cancelable) e.preventDefault();

  // First escape: leave a spacer so the layout doesn't jump
  if (!noBtn.classList.contains("runaway")) {
    const rect = noBtn.getBoundingClientRect();
    spacer = document.createElement("div");
    spacer.className = "no-spacer";
    spacer.style.height = rect.height + "px";
    noBtn.parentNode.insertBefore(spacer, noBtn);
    noBtn.style.width = rect.width + "px";
    noBtn.style.left = rect.left + "px";
    noBtn.style.top = rect.top + "px";
    noBtn.classList.add("runaway");
    // force a reflow so the first move animates
    void noBtn.offsetWidth;
  }

  const pad = 12;
  const w = noBtn.offsetWidth;
  const h = noBtn.offsetHeight;
  const maxX = window.innerWidth - w - pad;
  const maxY = window.innerHeight - h - pad;
  const cur = noBtn.getBoundingClientRect();

  // Pick a random spot that is far from where the button is now
  let x, y, tries = 0;
  do {
    x = pad + Math.random() * Math.max(0, maxX - pad);
    y = pad + Math.random() * Math.max(0, maxY - pad);
    tries++;
  } while (Math.hypot(x - cur.left, y - cur.top) < 160 && tries < 25);

  noBtn.style.left = x + "px";
  noBtn.style.top = y + "px";

  // Playful label + the Yes button grows a little each time
  attempts++;
  noBtn.textContent = noLabels[attempts % noLabels.length];
  yesBtn.style.transform = "scale(" + Math.min(1 + attempts * 0.06, 1.5) + ")";
}

["mouseover", "pointerenter", "touchstart", "focus"].forEach((evt) =>
  noBtn.addEventListener(evt, runAway, { passive: false })
);
// If it somehow gets clicked, it still just runs away
noBtn.addEventListener("click", runAway);

$("back").addEventListener("click", () => {
  stepNote.classList.add("hidden");
  stepQuestion.classList.remove("hidden");
});

// ====== CONFIG: put YOUR WhatsApp number here ======
// Country code + number, digits only, no "+" or spaces. Example: "233501234567"
const MY_WHATSAPP = "+233530549757";
// ====================================================

let receiptBlob = null;
let note = "";
let fromName = "";

// Pre-fill her name if it was in the link (?to=Ama)
if (to) $("from").value = to;

$("send").addEventListener("click", () => {
  fromName = $("from").value.trim();
  if (!fromName) {
    $("error").textContent = "Please type your name first 💕";
    $("error").classList.remove("hidden");
    $("from").focus();
    return;
  }
  $("error").classList.add("hidden");
  note = $("note").value.trim();
  showDone();
  drawReceipt();
  setupButtons();
});

function nowText() {
  return new Date().toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

function waitMessage() {
  return (
    "💌 My answer\n\n" +
    "From: " + fromName + "\n" +
    "Answer: " + selected + "\n" +
    (note ? "Note: " + note + "\n" : "") +
    nowText()
  );
}

function wrapText(ctx, text, maxWidth) {
  const lines = [];
  text.split("\n").forEach((para) => {
    let line = "";
    para.split(" ").forEach((word) => {
      const test = line ? line + " " + word : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    });
    lines.push(line);
  });
  return lines;
}

function drawReceipt() {
  const c = $("receipt");
  const ctx = c.getContext("2d");
  const W = c.width, H = c.height;

  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, "#ffe3ec");
  g.addColorStop(1, "#e8d5ff");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // inner white sheet
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.roundRect(60, 60, W - 120, H - 120, 40);
  ctx.fill();

  ctx.textAlign = "center";
  ctx.fillStyle = "#e11d6a";
  ctx.font = "700 64px 'Playfair Display', Georgia, serif";
  ctx.fillText("A Love Note", W / 2, 190);
  ctx.font = "90px serif";
  ctx.fillText("💌", W / 2, 310);

  // dashed divider
  ctx.strokeStyle = "#f1c6d6";
  ctx.lineWidth = 4;
  ctx.setLineDash([16, 12]);
  ctx.beginPath(); ctx.moveTo(120, 360); ctx.lineTo(W - 120, 360); ctx.stroke();

  ctx.textAlign = "left";
  let y = 450;
  const row = (label, value, color) => {
    ctx.fillStyle = "#7a6672";
    ctx.font = "500 34px Inter, Arial, sans-serif";
    ctx.fillText(label, 120, y);
    y += 56;
    ctx.fillStyle = color || "#2a1a24";
    ctx.font = "600 44px Inter, Arial, sans-serif";
    wrapText(ctx, value, W - 240).forEach((l) => { ctx.fillText(l, 120, y); y += 56; });
    y += 36;
  };

  row("FROM", fromName);
  row("ANSWER", selected + (selected === "Yes" ? " 💖" : ""), "#e11d6a");
  row("NOTE", note || "—");

  ctx.setLineDash([16, 12]);
  ctx.beginPath(); ctx.moveTo(120, H - 270); ctx.lineTo(W - 120, H - 270); ctx.stroke();

  ctx.textAlign = "center";
  ctx.fillStyle = "#7a6672";
  ctx.font = "500 32px Inter, Arial, sans-serif";
  ctx.fillText("With love 💖", W / 2, H - 200);
  ctx.fillText(nowText(), W / 2, H - 150);
}

function setupButtons() {
  // WhatsApp button: always visible
  const wa = $("wa");
  const text = encodeURIComponent(waitMessage());
  wa.href = MY_WHATSAPP
    ? "https://wa.me/" + MY_WHATSAPP + "?text=" + text
    : "https://wa.me/?text=" + text;

  $("receipt").toBlob((blob) => {
    receiptBlob = blob;
    const file = new File([blob], "love-note.png", { type: "image/png" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      $("share").classList.remove("hidden");
    }
  }, "image/png");
}

$("download").addEventListener("click", () => {
  if (!receiptBlob) return;
  const a = document.createElement("a");
  a.href = URL.createObjectURL(receiptBlob);
  a.download = "love-note.png";
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
});

$("share").addEventListener("click", async () => {
  if (!receiptBlob) return;
  const file = new File([receiptBlob], "love-note.png", { type: "image/png" });
  try {
    await navigator.share({ files: [file], text: waitMessage() });
  } catch (e) { /* cancelled */ }
});

function showDone() {
  stepNote.classList.add("hidden");
  stepDone.classList.remove("hidden");

  if (selected === "Yes") {
    $("done-emoji").textContent = "🥰";
    $("done-title").textContent = "You made my day!";
    $("done-text").textContent = "Thank you for saying yes. I'll reach out soon. 💖";
    burst();
  } else if (selected.startsWith("I need")) {
    $("done-emoji").textContent = "🌷";
    $("done-title").textContent = "Take all the time you need";
    $("done-text").textContent = "Thank you for being honest. There's no pressure at all.";
  } else {
    $("done-emoji").textContent = "🤝";
    $("done-title").textContent = "Thank you for your honesty";
    $("done-text").textContent = "I really appreciate you answering, and I respect your decision. Wishing you all the best.";
  }
}
