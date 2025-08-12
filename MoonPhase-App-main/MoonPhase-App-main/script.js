document.addEventListener("DOMContentLoaded", () => {
  const dateInput = document.getElementById("dateInput");
  const phaseImage = document.getElementById("moonImage");
  const phaseName = document.getElementById("phaseName");
  const description = document.getElementById("description");
  const phaseDetails = document.getElementById("phaseDetails");

  const moonPhases = [
    {
      name: "New Moon",
      image: "images/nnew-moon.jpg",
      description: "A time for new beginnings and fresh starts.",
    },
    {
      name: "Waxing Crescent",
      image: "images/waxing-crescent.jpg",
      description: "Set intentions and focus on growth.",
    },
    {
      name: "First Quarter",
      image: "images/first-quarter.jpg",
      description: "Take action and overcome obstacles.",
    },
    {
      name: "Waxing Gibbous",
      image: "images/waxing-gibbous.jpg",
      description: "Refine your goals and keep pushing forward.",
    },
    {
      name: "Full Moon",
      image: "images/full-moon.jpg",
      description: "Celebrate achievements and gain clarity.",
    },
    {
      name: "Waning Gibbous",
      image: "images/waning-gibbous.jpg",
      description: "Share knowledge and express gratitude.",
    },
    {
      name: "Last Quarter",
      image:"images/last-quarter.jpg",
      description: "Let go of what's no longer needed.",
    },
    {
      name: "Waning Crescent",
      image: "images/waning-crescent.jpg",
      description: "Rest, reflect, and prepare for the new cycle.",
    }
  ];

  // Simple moon phase calculator (based on lunar age)
  function calculateMoonPhase(dateStr) {
    const date = new Date(dateStr);
    const knownNewMoon = new Date("2000-01-06T18:14:00Z"); // reference new moon
    const lunarCycle = 29.53058867; // days
    const diff = (date - knownNewMoon) / 1000 / 60 / 60 / 24;
    const age = diff % lunarCycle;

    if (age < 1.84566) return 0; // New Moon
    if (age < 5.53699) return 1; // Waxing Crescent
    if (age < 9.22831) return 2; // First Quarter
    if (age < 12.91963) return 3; // Waxing Gibbous
    if (age < 16.61096) return 4; // Full Moon
    if (age < 20.30228) return 5; // Waning Gibbous
    if (age < 23.99361) return 6; // Last Quarter
    if (age < 27.68493) return 7; // Waning Crescent
    return 0; // New Moon again
  }

  dateInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const selectedDate = dateInput.value;
      if (!selectedDate) {
        phaseDetails.style.display = "none";
        return;
      }

      const index = calculateMoonPhase(selectedDate);
      const info = moonPhases[index];

      phaseName.textContent = info.name;
      description.textContent = info.description;
      phaseImage.src = info.image;
      phaseImage.alt = info.name;

      phaseDetails.style.display = "block";
    }
  });
});
