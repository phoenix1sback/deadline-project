async function extract() {
  let text = document.getElementById("msg").value;
  let res = await fetch("/api/extract", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  });

  let data = await res.json();

  let seriousnessClass =
    data.seriousness === "HIGH" ? "high" :
    data.seriousness === "MEDIUM" ? "medium" : "low";

  document.getElementById("result").innerHTML = `
    <div class="card">
      <div class="value"><span class="label">Topic:</span> ${data.topic}</div>
      <div class="value"><span class="label">Date:</span> ${data.date || "Not found"}</div>
      <div class="value">
        <span class="label">Priority:</span>
        <span class="${seriousnessClass}">${data.seriousness}</span>
      </div>
    </div>
  `;
}
