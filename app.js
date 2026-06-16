// ==========================================
// 1) UI ELEMENTS SELECTION
// ==========================================
const form = document.getElementById("loginForm");
const pw = document.getElementById("password");
const usernameEl = document.getElementById("username");
const ageEl = document.getElementById("age");
const emailEl = document.getElementById("email");
const toggle = document.getElementById("toggle");
const mainCard = document.getElementById("mainCard"); // the .split-card container

// ==========================================
// 2) SUPABASE CLIENT INITIALIZATION
// ==========================================
const supabaseUrl = 'https://evzdxqjvevibtzbmwzub.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2emR4cWp2ZXZpYnR6Ym13enViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0MzkyNjYsImV4cCI6MjA5NzAxNTI2Nn0.-0qyrnKf9EPbAYltuqibkY2y77Qqwnd98opQQg-EOE8';
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

// ==========================================
// 3) AUTOMATIC ANALYTICS TRAFFIC TRACKING
// ==========================================
async function handleAnalytics() {
  try {
    await supabaseClient.from('visits').insert([{}]);
    const { count: totalVisits, error: visitErr } = await supabaseClient
      .from('visits')
      .select('*', { count: 'exact', head: true });
    const { count: totalLogins, error: loginErr } = await supabaseClient
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (!visitErr && !loginErr) {
      console.log(`%c--- BANANAPEEL INC. LIVE STATS ---`, 'color: #4f7cff; font-weight: bold; font-size: 14px;');
      console.log(`👀 Total Website Visits: ${totalVisits}`);
      console.log(`🔐 Total Successful Logins: ${totalLogins}`);
      console.log(`---------------------------------`);
    }
  } catch (err) {
    console.error("Analytics error:", err);
  }
}
handleAnalytics();

// ==========================================
// 4) CLIENT-SIDE VALIDATION & HELPERS
// ==========================================
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

emailEl.addEventListener("input", () => {
  emailEl.style.borderColor = isValidEmail(emailEl.value) ? "" : "red";
});

toggle.addEventListener("click", () => {
  pw.type = pw.type === "password" ? "text" : "password";
});

// ==========================================
// 5) PASSWORD STRENGTH (from strength.js)
// ==========================================
function scorePassword(pw) {
  if (!pw) return { score: 0, label: "Empty", hints: ["Enter a password"] };
  let points = 0;
  const hints = [];
  if (pw.length >= 16) points += 4;
  else if (pw.length >= 12) points += 3;
  else if (pw.length >= 8) points += 2;
  else if (pw.length >= 6) points += 1;
  else hints.push("Use at least 8 characters");
  const hasLower = /[a-z]/.test(pw);
  const hasUpper = /[A-Z]/.test(pw);
  const hasDigit = /[0-9]/.test(pw);
  const hasSymbol = /[^A-Za-z0-9]/.test(pw);
  const classes = [hasLower, hasUpper, hasDigit, hasSymbol].filter(Boolean).length;
  points += classes;
  if (!hasUpper) hints.push("Add an uppercase letter");
  if (!hasLower) hints.push("Add a lowercase letter");
  if (!hasDigit) hints.push("Add a number");
  if (!hasSymbol) hints.push("Add a special character (!?@#...)");
  if (pw.length >= 12 && classes >= 3) points += 2;
  if (/^[0-9]+$/.test(pw)) { points -= 2; hints.push("Numbers only are easy to guess"); }
  if (/(.)\1\1/.test(pw)) { points -= 1; hints.push("Avoid repeated characters (aaa, 111)"); }
  if (/^(?:1234|abcd|qwerty|password|0000|1111)/i.test(pw)) { points -= 2; hints.push("Avoid common/predictable passwords"); }
  let score = Math.max(1, Math.min(10, points));
  let label;
  if (score <= 3) label = "Weak";
  else if (score <= 6) label = "Medium";
  else if (score <= 8) label = "Strong";
  else label = "Very Strong";
  return { score, label, hints };
}

// ==========================================
// 6) FORM SUBMISSION: SAVE TO SUPABASE + SHOW ANALYSIS CARD (no alert, no redirect)
// ==========================================
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!isValidEmail(emailEl.value)) {
    emailEl.style.borderColor = "red";
    return;
  }

  const { score, hints } = scorePassword(pw.value);
  const username = usernameEl.value;
  const age = parseInt(ageEl.value);
  const email = emailEl.value;

  try {
    const { error } = await supabaseClient
      .from('users')
      .insert([{ username, age, email, strength: score }]);

    if (error) {
      console.error("Supabase Insert Error:", error.message);
      alert(`Database save failed: ${error.message}\nMake sure RLS is disabled or policies exist.`);
      return;
    }

    console.log("Data saved to Supabase 'users' table");

    // ----- REPLACE THE FORM WITH THE PASSWORD ANALYSIS CARD -----
    const hintsHtml = hints.map(h => `<li>${h}</li>`).join("");

    mainCard.innerHTML = `
      <div style="font-size: 14px; line-height: 1.6; padding: 20px; margin-bottom: 30px;">
        <p>This is a demonstration — <strong>your password is never saved.</strong> It exists to show how easily you’d be compromised in a real attack. If this were real, a single reused password could unlock your email, bank, and social accounts. Your password is the key to your digital life; hand it to the wrong site and you hand over everything.</p>
        <p>Always verify a site before typing credentials. Use unique passwords and a password manager. Think twice — your money and data depend on it.</p>
        <p style="margin-top: 15px; font-weight: bold; color: var(--accent); font-size: 16px;">
          Your original password has a strength of ${score}/10.
        </p>
        ${score < 6 ? `<p style="color: var(--muted); font-size: 13px;">(If it is under 6, you should change it)</p>` : ''}
        
        ${hints.length > 0 ? `
        <p style="margin-top: 15px;">Here is what your password is missing:</p>
        <ul class="hints" style="margin-top:0">${hintsHtml}</ul>
        ` : ''}

        <div style="margin-top: 25px; border-top: 1px solid var(--border); padding-top: 20px;">
          <label for="testNewPassword">Test a new password</label>
          <div class="pass-wrap">
            <input type="password" id="testNewPassword" placeholder="Type a new password..." style="width:100%; padding: 12px 14px; background: #0f131a; border: 1px solid var(--border); border-radius: 10px; color: var(--text); font-size: 15px; outline: none; margin-bottom: 10px;" />
          </div>
          
          <div class="meter">
            <div class="meter-bar"><div id="newMeterFill" class="meter-fill" style="height: 100%; width: 0; background: red;"></div></div>
            <div class="meter-info" style="display:flex; justify-content:space-between; font-size:12px; color:var(--muted); margin-top:6px;">
              <span id="newMeterLabel">Empty</span>
              <span id="newMeterScore">0/10</span>
            </div>
          </div>
          <ul id="newHints" class="hints" style="margin-top:10px;"></ul>
        </div>
      </div>
    `;

    // Attach live tester for the new password input
    const testInput = document.getElementById("testNewPassword");
    const newFill = document.getElementById("newMeterFill");
    const newLabel = document.getElementById("newMeterLabel");
    const newScoreLabel = document.getElementById("newMeterScore");
    const newHintsEl = document.getElementById("newHints");

    function colorFor(s) {
      if (s <= 3) return "#e5484d";
      if (s <= 6) return "#f5a623";
      if (s <= 8) return "#3aa655";
      return "#1f9d55";
    }

    testInput.addEventListener("input", () => {
      const res = scorePassword(testInput.value);
      const pct = (res.score / 10) * 100;
      newFill.style.width = pct + "%";
      newFill.style.background = colorFor(res.score);
      newLabel.textContent = res.label;
      newScoreLabel.textContent = res.score + "/10";
      newHintsEl.innerHTML = "";
      res.hints.forEach((h) => {
        const li = document.createElement("li");
        li.textContent = h;
        newHintsEl.appendChild(li);
      });
    });

  } catch (err) {
    console.error("Network error:", err);
    alert("Connection lost. Check your internet or Supabase endpoint.");
  }
});
