const path = window.location.pathname;
const isIndexPage = path.endsWith("home.html") || path.endsWith("/") || path === "";
const isReportPage = path.endsWith("report.html");

let chart;
let areaUnit = "m2";
let adWatched = false;
let selectedUnit = "m2";
let calculatedResults = null; // Store results only after ad


const infoIcons = document.querySelectorAll(".branding-info");
const tooltips = document.querySelectorAll(".branding-tooltip");

infoIcons.forEach((infoIcon, index) => {
  const tooltip = tooltips[index];
  infoIcon.addEventListener('click', (e) => {
    tooltips.forEach(t => {
      if (t !== tooltip) t.style.display = 'none';
    });
    
    tooltip.style.display = tooltip.style.display === 'block' ? 'none' : 'block';
    e.stopPropagation();
  });
});

document.addEventListener('click', (e) => {
  infoIcons.forEach((infoIcon, index) => {
    const tooltip = tooltips[index];
    if (!infoIcon.contains(e.target) && !tooltip.contains(e.target)) {
      tooltip.style.display = 'none';
    }
  });
});

// const radioButtons = document.querySelectorAll('input[name="btnradio"]');

// radioButtons.forEach(radioButton => {
//   const unitValue = document.querySelector(".number-with-unit > input[type='number']");
//   const unitRange = document.querySelector("#areaRange");
//   const unitType = document.querySelector(".number-with-unit > span");

//   radioButton.addEventListener('change', function() {
//     let rawValue = parseFloat(unitValue.value) || 0;
//     selectedUnit = document.querySelector('input[name="btnradio"]:checked').value;

//     if (selectedUnit === "m2") {
//       unitType.textContent = "m²";
//       rawValue = rawValue * 4046.86;
//       unitRange.max = 200000;
//     } else {
//       unitType.textContent = "ac";
//       rawValue = rawValue / 4046.86;
//       unitRange.max = 50;
//     }

//     rawValue = Math.min(Math.max(rawValue, unitRange.min), unitRange.max);
//     unitValue.value = rawValue;
//     unitRange.value = rawValue;

//     updateAllSliderFills();
//     if (adWatched) {
//       calculate();
//     }
//   });
// });


// const AC_TO_M2 = 4046.86;
// function displayFromM2(m2, unit) {
//   return unit === 'ac' ? m2 / AC_TO_M2 : m2;
// }
// function m2FromDisplay(displayValue, unit) {
//   return unit === 'ac' ? displayValue * AC_TO_M2 : displayValue;
// }

// // Initialize and wire up each .area-div unit group
// document.querySelectorAll('.area-div').forEach(areaDiv => {
//   const numInput = areaDiv.querySelector('.number-with-unit input[type="number"]');
//   const unitSpan = areaDiv.querySelector('.number-with-unit span');
//   const radios = areaDiv.querySelectorAll('input[type="radio"]');
//   // find the associated range in the same form-group (if any)
//   const formGroup = areaDiv.closest('.form-group');
//   const rangeInput = formGroup ? formGroup.querySelector('input[type="range"]') : null;

//   // Determine current unit and initialize canonical m2 value on the input dataset
//   const initialUnit = areaDiv.querySelector('input[type="radio"]:checked')?.value || 'm2';
//   const initialDisplay = parseFloat(numInput.value) || 0;
//   numInput.dataset.m2 = m2FromDisplay(initialDisplay, initialUnit);

//   // When user types a new numeric value, update canonical m2 and sync range
//   numInput.addEventListener('input', () => {
//     const curUnit = areaDiv.querySelector('input[type="radio"]:checked')?.value || 'm2';
//     const displayVal = parseFloat(numInput.value) || 0;
//     numInput.dataset.m2 = m2FromDisplay(displayVal, curUnit);

//     if (rangeInput) {
//       // Keep range in sync (we assume range uses same units as displayed value)
//       rangeInput.value = displayVal;
//     }

//     updateAllSliderFills();
//     if (adWatched) calculate();
//   });

//   // When a radio changes in this group, convert display value from canonical m2
//   radios.forEach(radio => {
//     radio.addEventListener('change', () => {
//       const chosenUnit = radio.value; // 'm2' or 'ac'
//       const m2 = parseFloat(numInput.dataset.m2) || 0;
//       const newDisplay = displayFromM2(m2, chosenUnit);

//       // Update visible number, unit label, and range max/val
//       numInput.value = Number(newDisplay.toFixed(chosenUnit === 'ac' ? 4 : 2));
//       unitSpan.textContent = chosenUnit === 'ac' ? 'ac' : 'm²';

//       if (rangeInput) {
//         if (chosenUnit === 'ac') {
//           rangeInput.max = 50;
//         } else {
//           rangeInput.max = 200000;
//         }
//         rangeInput.value = numInput.value;
//       }

//       updateAllSliderFills();
//       if (adWatched) calculate();
//     });
//   });
// });



// document.addEventListener("DOMContentLoaded", () => {
//   const AC_TO_M2 = 4046.86;
//   function displayFromM2(m2, unit) {
//     return unit === 'ac' ? m2 / AC_TO_M2 : m2;
//   }
//   function m2FromDisplay(displayValue, unit) {
//     return unit === 'ac' ? displayValue * AC_TO_M2 : displayValue;
//   }

//   // Initialize and wire up each .area-div unit group
//   document.querySelectorAll('.area-div').forEach(areaDiv => {
//     const numInput = areaDiv.querySelector('.number-with-unit input[type="number"]');
//     const unitSpan = areaDiv.querySelector('.number-with-unit span');
//     const radios = areaDiv.querySelectorAll('input[type="radio"]');
//     const formGroup = areaDiv.closest('.form-group');
//     const rangeInput = formGroup ? formGroup.querySelector('input[type="range"]') : null;

//     if (!numInput || !unitSpan || radios.length === 0) return; // skip invalid

//     // Determine current unit and initialize canonical m2 value
//     const initialUnit = areaDiv.querySelector('input[type="radio"]:checked')?.value || 'm2';
//     const initialDisplay = parseFloat(numInput.value) || 0;
//     numInput.dataset.m2 = m2FromDisplay(initialDisplay, initialUnit);

//     // When user types a new numeric value, update canonical m2 and sync range
//     numInput.addEventListener('input', () => {
//       const curUnit = areaDiv.querySelector('input[type="radio"]:checked')?.value || 'm2';
//       const displayVal = parseFloat(numInput.value) || 0;
//       numInput.dataset.m2 = m2FromDisplay(displayVal, curUnit);

//       if (rangeInput) rangeInput.value = displayVal;
//       updateAllSliderFills();
//       if (adWatched) calculate();
//     });

//     // When a radio changes in this group, convert display value from canonical m2
//     radios.forEach(radio => {
//       radio.addEventListener('change', () => {
//         const chosenUnit = radio.value;
//         const m2 = parseFloat(numInput.dataset.m2) || 0;
//         const newDisplay = displayFromM2(m2, chosenUnit);

//         numInput.value = Number(newDisplay.toFixed(chosenUnit === 'ac' ? 4 : 2));
//         unitSpan.textContent = chosenUnit === 'ac' ? 'ac' : 'm²';

//         if (rangeInput) {
//           rangeInput.max = chosenUnit === 'ac' ? 50 : 200000;
//           rangeInput.value = numInput.value;
//         }

//         updateAllSliderFills();
//         if (adWatched) calculate();
//       });
//     });
//   });
// });




document.addEventListener("DOMContentLoaded", () => {
  const AC_TO_M2 = 4046.86;

  function displayFromM2(m2, unit) {
    return unit === 'ac' ? m2 / AC_TO_M2 : m2;
  }

  function m2FromDisplay(displayValue, unit) {
    return unit === 'ac' ? displayValue * AC_TO_M2 : displayValue;
  }

  // Only sets the canonical m2 dataset on each area-div's number input.
  // Safe to call repeatedly after DOM updates / regenerations.
  function initAreaDivValues() {
    document.querySelectorAll('.area-div').forEach(areaDiv => {
      const numInput = areaDiv.querySelector('.number-with-unit input[type="number"]');
      if (!numInput) return;

      const initialUnit = areaDiv.querySelector('input[type="radio"]:checked')?.value || 'm2';
      const initialDisplay = parseFloat(numInput.value) || 0;
      numInput.dataset.m2 = m2FromDisplay(initialDisplay, initialUnit);
      // Ensure unit label shows correct initially
      const unitSpan = areaDiv.querySelector('.number-with-unit span');
      if (unitSpan) unitSpan.textContent = initialUnit === 'ac' ? 'ac' : 'm²';

      // Ensure range element (if present) matches the numeric value and unit limits
      const formGroup = areaDiv.closest('.form-group');
      const rangeInput = formGroup ? formGroup.querySelector('input[type="range"]') : null;
      if (rangeInput) {
        rangeInput.max = initialUnit === 'ac' ? 50 : 200000;
        rangeInput.value = Number(initialDisplay);
      }
    });
  }

  // Delegated handler for number inputs (sync canonical m2 and range)
  document.addEventListener('input', event => {
    const target = event.target;
    if (!target.matches('.area-div .number-with-unit input[type="number"]')) return;

    const areaDiv = target.closest('.area-div');
    if (!areaDiv) return;

    const curUnit = areaDiv.querySelector('input[type="radio"]:checked')?.value || 'm2';
    const displayVal = parseFloat(target.value) || 0;
    target.dataset.m2 = m2FromDisplay(displayVal, curUnit);

    const formGroup = areaDiv.closest('.form-group');
    const rangeInput = formGroup ? formGroup.querySelector('input[type="range"]') : null;
    if (rangeInput) rangeInput.value = displayVal;

    updateAllSliderFills();
    if (typeof adWatched !== 'undefined' && adWatched) calculate();
  });

  // Delegated handler for radio changes (unit toggle) — conversion happens here.
  document.addEventListener('change', event => {
    const target = event.target;
    if (!target.matches('.area-div input[type="radio"]')) return;

    const areaDiv = target.closest('.area-div');
    if (!areaDiv) return;

    const numInput = areaDiv.querySelector('.number-with-unit input[type="number"]');
    const unitSpan = areaDiv.querySelector('.number-with-unit span');
    if (!numInput || !unitSpan) return;

    const chosenUnit = target.value;
    const m2 = parseFloat(numInput.dataset.m2) || 0;
    const newDisplay = displayFromM2(m2, chosenUnit);

    numInput.value = Number(newDisplay.toFixed(chosenUnit === 'ac' ? 4 : 2));
    unitSpan.textContent = chosenUnit === 'ac' ? 'ac' : 'm²';

    const formGroup = areaDiv.closest('.form-group');
    const rangeInput = formGroup ? formGroup.querySelector('input[type="range"]') : null;
    if (rangeInput) {
      rangeInput.max = chosenUnit === 'ac' ? 50 : 200000;
      rangeInput.value = numInput.value;
    }

    updateAllSliderFills();
    if (typeof adWatched !== 'undefined' && adWatched) calculate();

    // Update the canonical dataset (in case other code reads dataset.m2 later)
    numInput.dataset.m2 = m2; // unchanged in canonical units (m²)
  });

  // Initialize values on first load
  initAreaDivValues();

  // If your generateAgain button recreates elements, call initAreaDivValues afterwards
  const generateBtn = document.getElementById("generateAgain");
  if (generateBtn) {
    generateBtn.addEventListener("click", () => {
      // If generateAgain is asynchronous (e.g. fetch then inject),
      // you must call initAreaDivValues AFTER the DOM replacement completes.
      // If generation is synchronous here, this call is enough:
      initAreaDivValues();

      // If your generation replaces elements asynchronously, you can:
      // setTimeout(initAreaDivValues, 50); // small hacky delay
      // OR better: call initAreaDivValues from the code that finishes DOM replacement.
    });
  }
});






function updateAllSliderFills() {
  document.querySelectorAll('input[type="range"]').forEach(slider => {
    const min = parseFloat(slider.min) || 0;
    const max = parseFloat(slider.max) || 100;
    const val = parseFloat(slider.value);
    const percent = ((val - min) / (max - min)) * 100;

    slider.style.background = `linear-gradient(to right, #7acb8a 0%, #7acb8a ${percent}%, #f0f0f0 ${percent}%, #f0f0f0 100%)`;
  });
}

function validateNonNegative(input) {
  if (input.value.startsWith("-")) {
    input.value = input.value.replace("-", "");
  }
}

function syncInput(numId, rangeId) {
  const numInput = document.getElementById(numId);
  const rangeInput = document.getElementById(rangeId);
  numInput.value = rangeInput.value;
  updateAllSliderFills();
  if (adWatched) {
    calculate();
  }
}

function syncSlider(numId, rangeId) {
  const numInput = document.getElementById(numId);
  const rangeInput = document.getElementById(rangeId);
  rangeInput.value = numInput.value;
  updateAllSliderFills();
  if (adWatched) {
    calculate();
  }
}

// ONLY calculate and display after ad is watched
// function calculate() {
//   if (!adWatched) {
//     // Don't calculate - show placeholder
//     showPlaceholders();
//     return;
//   }

//   const trees = +document.getElementById("trees").value || 0;
//   const species = +document.getElementById("species").value || 0;
//   let area = +document.getElementById("area").value || 0;
//   const duration = +document.getElementById("duration").value || 0;

//   if(selectedUnit == "ac") {
//     area = area * 4046.86;
//   }

//   // Store calculated results
//   calculatedResults = {
//     co2: (trees * 21.8).toFixed(1),
//     biodiversity: area > 0 ? ((species / area) * 100).toFixed(2) : 0,
//     cooling: ((area / 100) * 0.2).toFixed(2),
//     air: (trees * 0.12).toFixed(2),
//     stormwater: (area * 100).toFixed(0),
//     branding: Math.log(trees + species + duration || 1).toFixed(2)
//   };


  
//   // Display the results
//   formatMetricValues(calculatedResults.co2, "co2");
//   formatMetricValues(calculatedResults.biodiversity, "biodiversity");
//   formatMetricValues(calculatedResults.cooling, "cooling");
//   formatMetricValues(calculatedResults.air, "air");
//   formatMetricValues(calculatedResults.stormwater.toLocaleString(), "stormwater");
//   formatMetricValues(calculatedResults.branding, "branding");
//   document.querySelectorAll('.metric-value').forEach(el => {
//     el.classList.add('unlocked');
//   });
// }



function calculate() {
  if (!adWatched) {
    showPlaceholders();
    return;
  }

  let category = document.querySelector('.nav-link.active')?.id;

  let ids = [];
  let units = [];
  let labels = [];
  let emojis = [];
  let tooltips = [];

  calculatedResults = {};

  // 🌿 1. Green Space & Biodiversity
  if (category === "green-tab") {
    const trees = +document.getElementById("trees").value || 0;
    const species = +document.getElementById("species").value || 0;
    let area = +document.getElementById("area").value || 0;
    const duration = +document.getElementById("duration").value || 0;
    const areaUnit = document.querySelector('input[name="btnradio-area"]:checked')?.value || "m2";

    if (areaUnit === "ac") area *= 4046.86;

    calculatedResults = {
      co2: (trees * 21.8).toFixed(1),
      biodiversity: area > 0 ? ((species / area) * 100).toFixed(2) : 0,
      cooling: ((area / 100) * 0.2).toFixed(2),
      air: (trees * 0.12).toFixed(2),
      stormwater: (area * 100).toFixed(0),
      branding: Math.log(trees + species + duration || 1).toFixed(2)
    };
  }

  // ⚡ 2. Energy & Built Environment
  else if (category === "energy-tab") {
    const electricity = +document.getElementById("electricity").value || 0;
    const renewable = +document.getElementById("renewable").value || 0;
    const power = +document.getElementById("powerRating").value || 0;
    const hours = +document.getElementById("operatingHours").value || 0;
    const tariff = 8; // ₹/kWh (example)
    const gridEF = 0.82; // kg CO2/kWh (example)
    const baseline = 10000; // baseline example for savings%

    ids = [
      "annualEnergy",
      "energyCost",
      "renewableShare",
      "energyIntensity",
      "energySavings",
      "ghg"
    ];

    units = [
      "kWh/year",
      "₹/year",
      "%",
      "kWh/unit",
      "%",
      "kg CO2/year"
    ];

    labels = [
      "Annual Energy",
      "Energy Cost",
      "Renewable Share",
      "Energy Intensity",
      "Energy Savings",
      "GHG Emissions"
    ];

    
    emojis = [
      "⚡️",
      "💰",
      "🌞",
      "📊",
      "💡",
      "🌍"
    ];

    tooltips = [];

    


    const annualEnergy = (power * hours * 365).toFixed(2);
    calculatedResults = {
      annualEnergy,
      energyCost: (electricity * tariff).toFixed(2),
      renewableShare: electricity > 0 ? ((renewable / electricity) * 100).toFixed(2) : 0,
      energyIntensity: (annualEnergy / 100).toFixed(2),
      energySavings: (((baseline - electricity) / baseline) * 100).toFixed(2),
      ghg: (electricity * gridEF).toFixed(2)
    };
  }

  // 💧 3. Water Use & Management
  else if (category === "water-tab") {
    const withdrawal = +document.getElementById("waterWithdrawal").value || 0;
    const discharge = +document.getElementById("waterDischarged").value || 0;
    const reuse = +document.getElementById("waterReused").value || 0;
    let siteArea = +document.getElementById("siteArea").value || 0;
    const siteAreaUnit = document.querySelector('input[name="btnradio-siteArea"]:checked')?.value || "m2";

    if (siteAreaUnit === "ac") siteArea *= 4046.86;

    const netConsumption = withdrawal - discharge - reuse;

    ids = [
      "totalUse",
      "netConsumption",
      "reusePercent",
      "stormInfiltration",
      "waterIntensity",
      "hydroBalance"
    ];

    units = [
      "L/year",
      "L/year",
      "%",
      "L/year",
      "L/m²",
      "L/year"
    ];

    labels = [
      "Total Use",
      "Net Consumption",
      "Reuse %",
      "Storm Infiltration",
      "Water Intensity",
      "Hydro Balance"
    ];

    emojis = ["💧", "🚰", "🔁", "🌧️", "📊", "⚖️"];

    

    calculatedResults = {
      totalUse: withdrawal,
      netConsumption,
      reusePercent: withdrawal > 0 ? ((reuse / withdrawal) * 100).toFixed(2) : 0,
      stormInfiltration: (siteArea * 80).toFixed(0),
      waterIntensity: (netConsumption / 100).toFixed(2),
      hydroBalance: (withdrawal - discharge).toFixed(2)
    };
  }

  // 🗑️ 4. Waste & Circularity
  else if (category === "waste-tab") {
    const haz = +document.getElementById("hazardousWaste").value || 0;
    const nonHaz = +document.getElementById("nonHazardousWaste").value || 0;
    const recycled = +document.getElementById("wasteRecycled").value || 0;
    const landfill = +document.getElementById("wasteLandfill").value || 0;
    const organicFraction = 0.3; // example
    const energyFactor = 0.7; // kWh per kg

    const total = haz + nonHaz;

    ids = [
      "totalWaste",
      "recycleRate",
      "landfillRate",
      "energyPotential",
      "wasteIntensity",
      "reductionPercent"
    ];

    units = [
      "kg/year",
      "%",
      "%",
      "kWh/year",
      "kg/m²",
      "%"
    ];

    labels = [
      "Total Waste",
      "Recycle Rate",
      "Landfill Rate",
      "Energy Potential",
      "Waste Intensity",
      "Reduction %"
    ];

    emojis = ["🗑️", "♻️", "🏭", "⚡", "📊", "📉"];

    

    calculatedResults = {
      totalWaste: total,
      recycleRate: total > 0 ? ((recycled / total) * 100).toFixed(2) : 0,
      landfillRate: total > 0 ? ((landfill / total) * 100).toFixed(2) : 0,
      energyPotential: (total * organicFraction * energyFactor).toFixed(2),
      wasteIntensity: (total / 100).toFixed(2),
      reductionPercent: ((10000 - total) / 10000 * 100).toFixed(2) // baseline example
    };
  }


  if(category == 'energy-tab' || category == 'water-tab' || category == 'waste-tab'){

    document.querySelectorAll("#report-section .metric-value").forEach((el, index) => {
      el.id = ids[index];

    });

    document.querySelectorAll("#report-section .metric-unit").forEach((el, index) => {
      el.textContent = units[index];
    });

    document.querySelectorAll("#report-section .metric-label").forEach((el, index) => {
      el.textContent = labels[index];
    });

    document.querySelectorAll("#report-section .metric-icon").forEach((el, index) => {
      el.textContent = emojis[index];
    });

    // documents.querySelectorAll("#report-section .branding-tooltip.custom-tooltip").forEach((el, index) => {
    //   el.textContent = tooltips[index];
    // });
  }

    

  // 🎯 Display results (only if on calculator.html)
  if (window.location.pathname.endsWith("calculator.html")) {
    for (const key in calculatedResults) {
      if (document.getElementById(key))
        console.log("Key: " + key + ", Value: " + calculatedResults[key]);
        formatMetricValues(calculatedResults[key], key);
    }

    document.querySelectorAll('.metric-value').forEach(el =>
      el.classList.add('unlocked')
    );
  }
}





// function showPlaceholders() {
//   // Show dummy placeholder text (not real values)
//   document.getElementById("co2").textContent = "••••";
//   document.getElementById("biodiversity").textContent = "••••";
//   document.getElementById("cooling").textContent = "••••";
//   document.getElementById("air").textContent = "••••";
//   document.getElementById("stormwater").textContent = "••••";
//   document.getElementById("branding").textContent = "••••";
// }

function showPlaceholders() {
  // Detect which tab is active
  const category = document.querySelector('.nav-link.active')?.id;

  // Define placeholders for each category
  const placeholders = {
    "green-tab": ["co2", "biodiversity", "cooling", "air", "stormwater", "branding"],
    "energy-tab": ["annualEnergy", "energyCost", "renewableShare", "energyIntensity", "energySavings", "ghg"],
    "water-tab": ["totalUse", "netConsumption", "reusePercent", "stormInfiltration", "waterIntensity", "hydroBalance"],
    "waste-tab": ["totalWaste", "recycleRate", "landfillRate", "energyPotential", "wasteIntensity", "reductionPercent"]
  };

  // Get relevant metric IDs for this category
  const ids = placeholders[category] || [];

  // Loop and replace their text with placeholders
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = "••••";
  });
}

if(isIndexPage){
  updateAllSliderFills();
  showPlaceholders();
  hideActionButtons();
}

function formatMetricValues(value, className) {
  const [intPart, decPart] = Number(value).toFixed(2).split('.');
  if(decPart === undefined) {
    document.getElementById(className).innerHTML = value;
    return;
  }
  intPartFormatted = parseInt(intPart.replace(/,/g, '')).toLocaleString();

  //console.log(value + " : " + className);


  document.getElementById(className).innerHTML = `${intPartFormatted}.<span class="decimal">${decPart}</span>`;
}




// function formatMetricValues(results) {
//   const category = document.querySelector('.nav-link.active')?.id;

//   // Define layout, labels, units, icons, and tooltips for each category
//   const categoryConfigs = {
//     "green-tab": [
//       { id: "co2", label: "Annual CO₂<br>Sequestration", unit: "kg/year", icon: "🌳", tooltip: "Estimates the annual CO₂ absorbed by trees. A mature tree sequesters ~21.8 kg CO₂ annually on average." },
//       { id: "biodiversity", label: "Biodiversity<br>Potential Index", unit: "", icon: "🌿", tooltip: "Indicates habitat complexity based on species richness per area." },
//       { id: "cooling", label: "Localized<br>Cooling Effect", unit: "°C", icon: "🌡️", tooltip: "Estimates ambient temperature reduction due to canopy cover." },
//       { id: "air", label: "Air Quality<br>Improvement", unit: "kg/year", icon: "💨", tooltip: "Estimates annual removal of fine particulate matter (PM2.5)." },
//       { id: "stormwater", label: "Stormwater<br>Runoff Reduction", unit: "L/year", icon: "💧", tooltip: "Estimates rainwater intercepted by vegetation reducing drainage loads." },
//       { id: "branding", label: "Green<br>Branding Score", unit: "", icon: "⭐", tooltip: "Reflects the initiative's scale and maturity based on logarithmic growth." }
//     ],
//     "energy-tab": [
//       { id: "annualEnergy", label: "Annual Energy<br>Generation", unit: "kWh", icon: "⚡", tooltip: "Total energy generated annually based on power and operating hours." },
//       { id: "energyCost", label: "Energy<br>Cost", unit: "₹/year", icon: "💰", tooltip: "Annual energy expenditure estimated from consumption and tariff." },
//       { id: "renewableShare", label: "Renewable<br>Share", unit: "%", icon: "☀️", tooltip: "Proportion of total electricity sourced from renewable systems." },
//       { id: "energyIntensity", label: "Energy<br>Intensity", unit: "kWh/unit", icon: "🏗️", tooltip: "Energy used per functional unit (e.g., floor area or output)." },
//       { id: "energySavings", label: "Energy<br>Savings", unit: "%", icon: "💡", tooltip: "Percent reduction in consumption compared to baseline." },
//       { id: "ghg", label: "GHG<br>Emissions", unit: "kg CO₂e/year", icon: "🌍", tooltip: "Greenhouse gas emissions based on grid emission factor." }
//     ],
//     "water-tab": [
//       { id: "totalUse", label: "Total Water<br>Use", unit: "L/year", icon: "💧", tooltip: "Total annual water withdrawn from all sources." },
//       { id: "netConsumption", label: "Net Water<br>Consumption", unit: "L/year", icon: "🚰", tooltip: "Water withdrawn minus discharged and reused water." },
//       { id: "reusePercent", label: "Reuse<br>Percentage", unit: "%", icon: "🔁", tooltip: "Percent of total water reused or recycled annually." },
//       { id: "stormInfiltration", label: "Stormwater<br>Infiltration", unit: "L/year", icon: "🌦️", tooltip: "Estimated infiltration based on site area." },
//       { id: "waterIntensity", label: "Water<br>Intensity", unit: "L/unit", icon: "🏞️", tooltip: "Water use per functional unit or m²." },
//       { id: "hydroBalance", label: "Hydrological<br>Balance", unit: "L/year", icon: "⚖️", tooltip: "Difference between withdrawal and discharge." }
//     ],
//     "waste-tab": [
//       { id: "totalWaste", label: "Total<br>Waste Generated", unit: "kg/year", icon: "🗑️", tooltip: "Total annual waste generated, both hazardous and non-hazardous." },
//       { id: "recycleRate", label: "Recycle<br>Rate", unit: "%", icon: "♻️", tooltip: "Percentage of total waste that is recycled." },
//       { id: "landfillRate", label: "Landfill<br>Rate", unit: "%", icon: "🏞️", tooltip: "Percentage of total waste sent to landfills." },
//       { id: "energyPotential", label: "Energy<br>Potential", unit: "kWh/year", icon: "🔥", tooltip: "Estimated recoverable energy from organic waste fraction." },
//       { id: "wasteIntensity", label: "Waste<br>Intensity", unit: "kg/unit", icon: "📦", tooltip: "Waste generated per functional unit (e.g., output, area, or people)." },
//       { id: "reductionPercent", label: "Waste<br>Reduction", unit: "%", icon: "🧹", tooltip: "Reduction in total waste relative to baseline." }
//     ]
//   };

//   const config = categoryConfigs[category];
//   if (!config) return;

//   const resultsContainer = document.getElementById("results");
//   resultsContainer.innerHTML = ""; // Clear old cards

//   // Build new metric cards
//   config.forEach(metric => {
//     const value = results[metric.id] ?? "••••";
//     const [intPart, decPart] = Number(value).toFixed(2).split('.');
//     const formattedValue = isNaN(intPart)
//       ? "••••"
//       : `${parseInt(intPart).toLocaleString()}.${decPart ? `<span class="decimal">${decPart}</span>` : ""}`;

//     const cardHTML = `
//       <div class="col-custom">
//         <div class="metric-card p-4 text-center shadow-sm">
//           <div class="metric-row">
//             <div class="metric-icon">${metric.icon}</div>
//             <i class="bi bi-info-circle info-icon branding-info"></i>
//           </div>
//           <div class="metric-label">${metric.label}</div>
//           <div class="metric-value-outer">
//             <div class="metric-value" id="${metric.id}">${formattedValue}</div>
//             ${metric.unit ? `<div class="metric-unit">${metric.unit}</div>` : ""}
//           </div>
//           <div class="custom-tooltip branding-tooltip">${metric.tooltip}</div>
//         </div>
//       </div>
//     `;
//     resultsContainer.insertAdjacentHTML("beforeend", cardHTML);
//   });
// }

// Form control functionality
function disableForm() {
  document.querySelectorAll('input[type="number"], input[type="range"], input[type="radio"]').forEach(input => {
    input.disabled = true;
  });
  // const spans = document.querySelectorAll('input[type="number"]+span');
  // spans.forEach(span => {
  //   span.style.backgroundColor = '#e9ebee';
  // });
  document.querySelectorAll('.number-with-unit').forEach(el => {
    el.style.backgroundColor = '#e9ebee';
  });
}

function enableForm() {
  document.querySelectorAll('input[type="number"], input[type="range"], input[type="radio"]').forEach(input => {
    input.disabled = false;
    input.value = 0;
    updateAllSliderFills();
  });
  document.querySelectorAll('.number-with-unit').forEach(el => {
    el.style.backgroundColor = '#e9fbf4';
  });
}

// Action buttons visibility
function showActionButtons() {
  const actionContainer = document.getElementById('action-buttons');
  if (actionContainer) {
    actionContainer.style.display = 'flex';
  }
}

function hideActionButtons() {
  const actionContainer = document.getElementById('action-buttons');
  if (actionContainer) {
    actionContainer.style.display = 'none';
  }
}

// Watch Ad button functionality
// function watchAd() {
//   // Simulate ad watching - Replace this with actual ad integration
//   const adButton = document.getElementById('watchAdBtn');
//   adButton.textContent = 'Loading Ad...';
//   adButton.disabled = true;
  
//   // Simulate ad duration (replace with actual ad callback)
//   setTimeout(() => {
//     onAdComplete();
//   }, 3000); // 3 second simulated ad
  
//   // For actual implementation, integrate with ad networks like:
//   // - Google AdSense
//   // - AdMob
//   // - Custom video ad networks
//   // Call onAdComplete() after ad finishes
// }

function watchAd() {
  let adButton;
  if(window.location.pathname == '/calculator.html') {
    
    adButton = document.getElementById('watchAdBtn');
  }
  
  const adOverlay = document.getElementById('adOverlay');
  const adVideo = document.getElementById('adVideo');

  // Show overlay and play video
  adOverlay.style.display = 'flex';
  adVideo.currentTime = 0;
  adVideo.play();

  // Hide main scroll to prevent background interaction
  document.body.style.overflow = 'hidden';

  // When the video ends, close overlay and continue
  adVideo.onended = () => {
    adOverlay.style.display = 'none';
    document.body.style.overflow = 'auto';
    onAdComplete(); // same function you already have
  };

  // In case video can't load (fallback)
  adVideo.onerror = () => {
    alert('Ad failed to load. Simulating completion.');
    adOverlay.style.display = 'none';
    document.body.style.overflow = 'auto';
    setTimeout(onAdComplete, 1000);
  };

  if(window.location.pathname == '/calculator.html') {
    adButton.disabled = true;
    adButton.textContent = 'Playing Ad...';
  }
  }
  

async function onAdComplete() {

  adWatched = true;

  //console.log(window.location.pathname);

  if(window.location.pathname == '/calculator.html') {

     document.getElementById('report-section').style.display = 'block';
    document.getElementById('report-section').scrollIntoView({ behavior: 'smooth' });
    calculate();
    disableForm();
   

    const adButton = document.getElementById('watchAdBtn');
    const againButton = document.getElementById('generateAgainBtn');
    if (adButton) adButton.style.display = 'none';
    if (againButton) againButton.style.display = 'inline-block';
    showActionButtons();
  }
  
  

  
  // try {
  //   const zip = new JSZip();

  //   const csvBlob = exportToCSVBlob("", "", "", "", "");
  //   zip.file("Leaf_Ledger_Results.csv", csvBlob);

  //   const pngBlob = await exportToPNGBlob("", "", "", "", "");
  //   zip.file("Leaf_Ledger_Results.png", pngBlob);

  //   const pdfBlob = await generatePDFBlob("", "", "", "", "");
  //   zip.file("Leaf_Ledger_Report.pdf", pdfBlob);

  //   const content = await zip.generateAsync({ type: "blob" });
  //   saveAs(content, "Leaf_Ledger_Results.zip");
  // } catch (err) {
  //   console.error("Error generating zip:", err);
  // }

  try {
    // Generate only PDF
    // const pdfBlob = await generatePDFBlob();

    // // Use FileSaver.js (saveAs) to download directly
    // saveAs(pdfBlob, "Leaf_Ledger_Report.pdf");
  } catch (err) {
    console.error("Error generating PDF:", err);
  }
}

// Generate Again functionality
function generateAgain() {
  adWatched = false;
  calculatedResults = null; // Clear stored results

  document.getElementById('report-section').style.display = 'none';
  
  showPlaceholders();
  enableForm();
  hideActionButtons();

  document.querySelectorAll('.metric-value').forEach(el => {
    el.classList.remove('unlocked');
  });
  
  // Show watch ad button again
  const adButton = document.getElementById('watchAdBtn');
  const generateAgainBtn = document.getElementById('generateAgainBtn');
  if (adButton) {
    adButton.style.display = 'inline-block';
    adButton.textContent = 'Watch Ad to View Results';
    adButton.disabled = false;
  }

  if(generateAgainBtn) {
    generateAgainBtn.style.display = 'none';
  }
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Export to CSV
function exportToCSV() {
  if (!adWatched || !calculatedResults) {
    alert('Please watch the ad first to unlock results.');
    return;
  }
  
  const trees = document.getElementById("trees").value;
  const species = document.getElementById("species").value;
  const area = document.getElementById("area").value;
  const duration = document.getElementById("duration").value;
  const unit = document.getElementById("areaUnit").textContent;
  
  const csvContent = `Metric,Value,Unit
Number of Trees,${trees},trees
Number of Species,${species},species
Area,${area},${unit}
Project Duration,${duration},years
Annual CO2 Sequestration,${calculatedResults.co2},kg/year
Biodiversity Potential Index,${calculatedResults.biodiversity},
Localized Cooling Effect,${calculatedResults.cooling},°C
Air Quality Improvement,${calculatedResults.air},kg/year
Stormwater Runoff Reduction,${calculatedResults.stormwater},L/year
Green Branding Score,${calculatedResults.branding},`;

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'leaf_ledger_results.csv';
  a.click();
  window.URL.revokeObjectURL(url);
}



async function exportToPNG() {
  if (!adWatched || !calculatedResults) {
    alert('Please watch the ad first to unlock results.');
    return;
  }

  const resultsSection = document.getElementById("results");
  if (!resultsSection) {
    alert("Results section not found on page.");
    return;
  }

  try {
    // Capture the visible results area as an image
    const canvas = await html2canvas(resultsSection, {
      scale: 2, // high-quality capture
      useCORS: true, // allow external images if needed
      backgroundColor: "#ffffff"
    });

    // Convert to PNG data URL
    const imageData = canvas.toDataURL("image/png");

    // Create a temporary <a> element to download
    const link = document.createElement("a");
    link.href = imageData;
    link.download = "Leaf_Ledger_Results.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log("✅ PNG exported successfully.");
  } catch (error) {
    console.error("Error generating PNG:", error);
    alert("Sorry, there was a problem exporting your PNG.");
  }
}

// PDF Generation (existing function, modified to check ad status)
async function generatePDF() {
  if (!adWatched || !calculatedResults) {
    alert('Please watch the ad first to unlock results.');
    return;
  }
  
  const response = await fetch("report.html");
  const html = await response.text();

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const trees = document.getElementById("trees")?.value || 0;
  const species = document.getElementById("species")?.value || 0;
  const area = document.getElementById("area")?.value || 0;
  const duration = document.getElementById("duration")?.value || 0;
  const unit = document.getElementById("areaUnit")?.textContent || "m²";

  doc.querySelector(".report-overview-table tr:nth-child(3) td:nth-child(1)").textContent = trees;
  doc.querySelector(".report-overview-table tr:nth-child(3) td:nth-child(2)").textContent = species;
  doc.querySelector(".report-overview-table tr:nth-child(5) td:nth-child(1)").textContent = `${area} ${unit}`;
  doc.querySelector(".report-overview-table tr:nth-child(5) td:nth-child(2)").textContent = `${duration} years`;

  doc.querySelector("#co2Cell > span > span").textContent = calculatedResults.co2;
  doc.querySelector("#bioCell > span > span").textContent = calculatedResults.biodiversity;
  doc.querySelector("#coolingCell > span > span").textContent = calculatedResults.cooling;
  doc.querySelector("#airCell > span > span").textContent = calculatedResults.air;
  doc.querySelector("#stormCell > span > span").textContent = calculatedResults.stormwater;
  doc.querySelector("#scoreCell > span > span").textContent = calculatedResults.branding;
  doc.querySelector(".score-table tr:nth-child(2) td").textContent = calculatedResults.branding;

  const now = new Date();
  doc.querySelector("#report-date").textContent =
    now.toLocaleDateString() + ", " + now.toLocaleTimeString();

  const reportDiv = doc.getElementById("report");

  reportDiv.style.width = "210mm";
  reportDiv.style.minHeight = "297mm";
  reportDiv.style.padding = "10mm";
  reportDiv.style.background = "#fff";
  reportDiv.style.boxSizing = "border-box";

  document.body.appendChild(reportDiv);

  const canvas = await html2canvas(reportDiv, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    scrollY: 0,
    windowWidth: reportDiv.scrollWidth,
    windowHeight: reportDiv.scrollHeight
  });

  const imgData = canvas.toDataURL("image/jpeg");

  const pdf = new jspdf.jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  const finalHeight = imgHeight > pageHeight ? pageHeight : imgHeight;
  const finalWidth = imgHeight > pageHeight ? (pageHeight * canvas.width) / canvas.height : imgWidth;

  const xOffset = (pageWidth - finalWidth) / 2;
  const yOffset = (pageHeight - finalHeight) / 2;

  pdf.addImage(imgData, "JPEG", xOffset, yOffset, finalWidth, finalHeight);
  pdf.save("GreenCalculatorReport.pdf");

  reportDiv.remove();
}

async function generatePDFBlob() {
  const response = await fetch("report.html");
  const html = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

    trees = document.getElementById("trees")?.value || 0;
    species = document.getElementById("species")?.value || 0;
    area = document.getElementById("area")?.value || 0;
    duration = document.getElementById("duration")?.value || 0;
    unit = document.getElementById("areaUnit")?.textContent || "m²";
  



  doc.querySelector(".report-overview-table tr:nth-child(3) td:nth-child(1)").textContent = trees;
  doc.querySelector(".report-overview-table tr:nth-child(3) td:nth-child(2)").textContent = species;
  doc.querySelector(".report-overview-table tr:nth-child(5) td:nth-child(1)").textContent = `${area} ${unit}`;
  doc.querySelector(".report-overview-table tr:nth-child(5) td:nth-child(2)").textContent = `${duration} years`;

  doc.querySelector("#co2Cell > span > span").textContent = calculatedResults.co2;
  doc.querySelector("#bioCell > span > span").textContent = calculatedResults.biodiversity;
  doc.querySelector("#coolingCell > span > span").textContent = calculatedResults.cooling;
  doc.querySelector("#airCell > span > span").textContent = calculatedResults.air;
  doc.querySelector("#stormCell > span > span").textContent = calculatedResults.stormwater;
  doc.querySelector("#scoreCell > span > span").textContent = calculatedResults.branding;
  doc.querySelector(".score-table tr:nth-child(2) td").textContent = calculatedResults.branding;

  const now = new Date();
  doc.querySelector("#report-date").textContent = now.toLocaleDateString() + ", " + now.toLocaleTimeString();

  const reportDiv = doc.getElementById("report");
  reportDiv.style.width = "210mm";
  reportDiv.style.minHeight = "297mm";
  reportDiv.style.padding = "10mm";
  reportDiv.style.background = "#fff";
  reportDiv.style.boxSizing = "border-box";

  document.body.appendChild(reportDiv);

  const canvas = await html2canvas(reportDiv, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
  const imgData = canvas.toDataURL("image/jpeg");

  const pdf = new jspdf.jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  const finalHeight = imgHeight > pageHeight ? pageHeight : imgHeight;
  const finalWidth = imgHeight > pageHeight ? (pageHeight * canvas.width) / canvas.height : imgWidth;
  const xOffset = (pageWidth - finalWidth) / 2;
  const yOffset = (pageHeight - finalHeight) / 2;

  pdf.addImage(imgData, "JPEG", xOffset, yOffset, finalWidth, finalHeight);
  const blob = pdf.output("blob");

  reportDiv.remove();
  return blob;
}

async function exportToPNGBlob(trees, species, area, duration, unit) {
  if(trees != "" || species != "" || area != "" || duration != "" || unit != ""){
    return;
  }
  const resultsSection = document.getElementById("results");
  const canvas = await html2canvas(resultsSection, { scale: 2, useCORS: true });
  const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/png"));
  return blob;
}

function exportToCSVBlob(trees, species, area, duration, unit) {

  //let trees, species, area, duration, unit;

  if(trees == "" || species == "" || area == "" || duration == "" || unit == "") {
    trees = document.getElementById("trees").value;
    species = document.getElementById("species").value;
    area = document.getElementById("area").value;
    duration = document.getElementById("duration").value;
    unit = document.getElementById("areaUnit").textContent;
  }


  const csvContent = `Metric,Value,Unit
Number of Trees,${trees},trees
Number of Species,${species},species
Area,${area},${unit}
Project Duration,${duration},years
Annual CO2 Sequestration,${calculatedResults.co2},kg/year
Biodiversity Potential Index,${calculatedResults.biodiversity},
Localized Cooling Effect,${calculatedResults.cooling},°C
Air Quality Improvement,${calculatedResults.air},kg/year
Stormwater Runoff Reduction,${calculatedResults.stormwater},L/year
Green Branding Score,${calculatedResults.branding},`;

  return new Blob([csvContent], { type: "text/csv" });
}