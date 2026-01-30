function setReminder(date) {
  if (!("Notification" in window)) {
    alert("Notifications not supported on this device");
    return;
  }

  Notification.requestPermission().then(permission => {
    if (permission !== "granted") {
      alert("Please allow notifications to set reminder");
      return;
    }

    const reminderTime = new Date(date).getTime();
    const now = Date.now();
    const delay = reminderTime - now;

    if (delay <= 0) {
      alert("Deadline time already passed");
      return;
    }

    setTimeout(() => {
      new Notification("⏰ Deadline Reminder", {
        body: "Your deadline is now!",
        vibrate: [200, 100, 200]
      });
    }, delay);
  });
}

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
  // ---- SET REMINDER ON PHONE ----
  if (data.date) {
    setReminder(data.date);
    alert("Reminder set for 10 minutes before deadline");
  }
  function testNotification() {
  if (!("Notification" in window)) {
    alert("Notifications not supported");
    return;
  }

  Notification.requestPermission().then(permission => {
    if (permission === "granted") {
      new Notification("🔔 Test Notification", {
        body: "If you see this, notifications work!",
        vibrate: [200, 100, 200]
      });
    } else {
      alert("Permission not granted");
    }
  });
}


