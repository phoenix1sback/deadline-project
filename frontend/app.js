async function extract() {
  const text = document.getElementById("msg").value.trim();

  if (!text) {
    alert("Please paste a message first");
    return;
  }

  try {
    const res = await fetch("/api/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });

    const data = await res.json();

    // ---------- FORMAT DATE ----------
    let formattedDate = "Not found";
    if (data.date) {
      const d = new Date(data.date);
      formattedDate = d.toDateString() + " " + d.toLocaleTimeString();
    }

    // ---------- PRIORITY COLOR ----------
    const seriousnessClass =
      data.seriousness === "HIGH" ? "high" :
      data.seriousness === "MEDIUM" ? "medium" : "low";

    // ---------- SHOW RESULT ----------
    document.getElementById("result").innerHTML = `
      <div class="card">
        <div class="value">
          <span class="label">Topic:</span> ${data.topic || "Not detected"}
        </div>

        <div class="value">
          <span class="label">Date:</span> ${formattedDate}
        </div>

        <div class="value">
          <span class="label">Priority:</span>
          <span class="${seriousnessClass}">
            ${data.seriousness || "LOW"}
          </span>
        </div>
      </div>
    `;

    // ---------- START COUNTDOWN TIMER ----------
    if (data.date) {
      startCountdown(data.date);
    }

    // ---------- OPEN GOOGLE CALENDAR (REAL PHONE ALARM) ----------
    if (data.date) {
      addToCalendar(data.date, data.topic);
    }

  } catch (err) {
    console.error(err);
    alert("Something went wrong. Check console.");
  }
}
