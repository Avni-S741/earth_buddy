document.querySelectorAll(".faq-question").forEach(q => {
  q.addEventListener("click", () => {
    const parent = q.parentElement;
    const ans = parent.querySelector(".faq-answer");

    document.querySelectorAll(".faq-answer").forEach(a => {
      if (a !== ans) a.style.display = "none";
    });

    ans.style.display = ans.style.display === "block" ? "none" : "block";
  });
});

// ECO TIPS ROTATION
const tips = [
  "Carry a reusable bottle instead of buying plastic water bottles.",
  "Switch off lights when not in use to save energy.",
  "Use public transport or cycle whenever possible.",
  "Plant a tree and take care of it regularly.",
  "Avoid single-use plastics in daily life.",
  "Reuse water from washing vegetables for plants."
];

// change daily
const today = new Date().getDate();
const tip = tips[today % tips.length];

document.getElementById("ecoTip").innerText = tip;

