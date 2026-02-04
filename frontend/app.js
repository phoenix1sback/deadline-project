let countdownInterval = null;

/* ================= COUNTDOWN ================= */

function startCountdown(deadline) {
  const timerDiv = document.getElementById("timer");
  if (!timerDiv) return;

  if (countdownInterval) clearInterval(countdownInterval);

  function update() {
    const now = Date.now();
    const target = new Date(deadline).getTime();
    const diff = target - now;

if (diff <= 0) {
  clearInterval(countdownInterval);
  timerDiv.innerHTML = "⏰ Deadline reached!";

  if (Notification.permission === "granted") {
    new Notification("⏰ Deadline Alert", {
      body: "Your deadline time has arrived!",
      vibrate: [200, 100, 200]
    });
  }
  return;
}


    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    timerDiv.innerHTML = `⏳ Time left: ${h}h ${m}m ${s}s`;
  }

  update();
  countdownInterval = setInterval(update, 1000);
}

/* ================= MAIN FUNCTION ================= */

function requestNotificationPermission() {
  if (!("Notification" in window)) {
    alert("Notifications not supported");
    return;
  }

  Notification.requestPermission().then(permission => {
    if (permission === "granted") {
      new Notification("🔔 Notifications Enabled", {
        body: "You will receive deadline alerts",
        vibrate: [200, 100, 200]
      });
    } else {
      alert("Permission not granted");
    }
  });
}



async function extract() {
  try {
    const text = document.getElementById("msg").value;

    const res = await fetch("/api/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });

    const data = await res.json();

    // ---- DATE FORMAT ----
    let formattedDate = "Not found";
    let formattedTime = "";

    if (data.date) {
      const d = new Date(data.date);

      formattedDate = d.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric"
      });

      formattedTime = d.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });
    }

    // ---- PRIORITY COLOR ----
    let seriousnessClass =
      data.seriousness === "HIGH" ? "high" :
      data.seriousness === "MEDIUM" ? "medium" : "low";

    // ---- SHOW RESULT ----
    document.getElementById("result").innerHTML = `
      <div class="card">

        <div class="value center">
          <strong>${data.topic || "Deadline"}</strong>
        </div>

        <div class="datetime">
          <div class="date">📅 ${formattedDate}</div>
          <div class="time">⏰ ${formattedTime}</div>
        </div>

        <div class="value">
          <span class="label">Priority:</span>
          <span class="${seriousnessClass}">
            ${data.seriousness || "LOW"}
          </span>
        </div>

      </div>
    `;

    // ---- START TIMER ----
    if (data.date) {
      startCountdown(data.date);
    }

  } catch (err) {
    console.error("Extract failed:", err);
    alert("Something went wrong. Check console.");
  }
}
