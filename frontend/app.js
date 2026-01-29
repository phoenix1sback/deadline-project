async function extract() {
  let text = document.getElementById("msg").value;

  let res = await fetch("/api/extract", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  });

  let data = await res.json();

  // ---- FORMAT DATE PROPERLY ----
  let formattedDate = "Not found";
  if (data.date) {
    const d = new Date(data.date);
    formattedDate = d.toDateString() + " " + d.toLocaleTimeString();
  }

  // ---- PRIORITY COLOR ----
  let seriousnessClass =
    data.seriousness === "HIGH" ? "high" :
    data.seriousness === "MEDIUM" ? "medium" : "low";

  // ---- SHOW RESULT ----
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
}
