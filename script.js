const path = window.location.pathname;
const isIndexPage = path.endsWith("home.html") || path.endsWith("/") || path === "";
const isReportPage = path.endsWith("report.html");

let chart;
let areaUnit = "m2";
let adWatched = false;
let selectedUnit = "m2";
let calculatedResults = null; // Store results only after ad
let category = "green-tab";
let inputData = ["0", "0", "0", "0"];

// const placeholders = {
//     "green-tab": ["co2", "biodiversity", "cooling", "air", "stormwater", "branding", "cars", "households", "credits"],
//     "energy-tab": ["annualEnergy", "energyCost", "renewableShare", "energyIntensity", "energySavings", "ghg", ],
//     "water-tab": ["totalUse", "netConsumption", "reusePercent", "stormInfiltration", "waterIntensity", "hydroBalance"],
//     "waste-tab": ["totalWaste", "recycleRate", "landfillRate", "energyPotential", "wasteIntensity", "reductionPercent"]
//   };

const inputHeaders = {
  "green-tab": ["Number of Trees", "Number of Species", "Area", "Project Duration"],
  "energy-tab": ["Electricity Consumption", "Renewable Electricity Used", "Power Rating of Equipment", "Operating Hours per Day"],
  "water-tab": ["Water Withdrawal", "Water Discharged", "Water Reused", "Site Area"],
  "waste-tab": ["Hazardous Waste", "Non-Hazardous Waste", "Waste Recycled", "Waste Sent to Landfill"]
}

const inputUnits = {
  "green-tab": ["", "", "m²", "years"],
  "energy-tab": ["kWh/year", "kWh/year", "kW", "hours/day"],
  "water-tab": ["Litres/year", "Litres/year", "Litres/year", "m²"],
  "waste-tab": ["kg/year", "kg/year", "kg", "m²"]
}

let labels = [];
let units = [];
let ids = [];



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




document.addEventListener("DOMContentLoaded", () => {
  const AC_TO_M2 = 4046.86;

  function displayFromM2(m2, unit) {
    return unit === "ac" ? m2 / AC_TO_M2 : m2;
  }

  function m2FromDisplay(displayValue, unit) {
    return unit === "ac" ? displayValue * AC_TO_M2 : displayValue;
  }

  // Initialize canonical m² dataset values for all area-divs
  function initAreaDivValues() {
    document.querySelectorAll(".area-div").forEach(areaDiv => {
      const numInput = areaDiv.querySelector(".number-with-unit input[type='number']");
      if (!numInput) return;
      const checkedUnit = areaDiv.querySelector("input[type='radio']:checked")?.value || "m2";
      const displayVal = parseFloat(numInput.value) || 0;
      numInput.dataset.m2 = m2FromDisplay(displayVal, checkedUnit);
    });
  }

  // Convert displayed value and unit when toggling m² ↔ ac
  function updateAreaDiv(areaDiv, chosenUnit) {
    const numInput = areaDiv.querySelector(".number-with-unit input[type='number']");
    const unitSpan = areaDiv.querySelector(".number-with-unit span");
    const rangeInput = areaDiv.closest(".form-group")?.querySelector("input[type='range']");

    if (!numInput || !unitSpan) return;

    const m2 = parseFloat(numInput.dataset.m2) || 0;
    const newDisplay = displayFromM2(m2, chosenUnit);

    numInput.value = Number(newDisplay.toFixed(chosenUnit === "ac" ? 4 : 2));
    unitSpan.textContent = chosenUnit === "ac" ? "ac" : "m²";

    if (rangeInput) {
      rangeInput.max = chosenUnit === "ac" ? 50 : 200000;
      rangeInput.value = numInput.value;
    }

    updateAllSliderFills?.();
    if (typeof adWatched !== "undefined" && adWatched) calculate?.();
  }

  // When typing in the number input
  document.addEventListener("input", e => {
    if (!e.target.matches(".area-div .number-with-unit input[type='number']")) return;

    const numInput = e.target;
    const areaDiv = numInput.closest(".area-div");
    const curUnit = areaDiv.querySelector("input[type='radio']:checked")?.value || "m2";
    const displayVal = parseFloat(numInput.value) || 0;

    numInput.dataset.m2 = m2FromDisplay(displayVal, curUnit);

    const rangeInput = areaDiv.closest(".form-group")?.querySelector("input[type='range']");
    if (rangeInput) rangeInput.value = displayVal;

    updateAllSliderFills?.();
    if (typeof adWatched !== "undefined" && adWatched) calculate?.();
  });

  // When toggling between m² and ac
  document.addEventListener("change", e => {
    if (!e.target.matches(".area-div input[type='radio']")) return;
    const radio = e.target;
    const areaDiv = radio.closest(".area-div");
    const chosenUnit = radio.value;
    updateAreaDiv(areaDiv, chosenUnit);
  });

  // Initialize at load
  initAreaDivValues();

  // Reinitialize after "Generate Again" (if that button exists)
  const generateBtn = document.getElementById("generateAgain");
  if (generateBtn) {
    generateBtn.addEventListener("click", () => {
      requestAnimationFrame(initAreaDivValues);
    });
  }
});






function updateAllSliderFills() {
  console.log("update slider fills");
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


function calculate() {
  if (!adWatched) {
    //showPlaceholders();
    return;
  }

  // let category = document.querySelector('.nav-link.active')?.id;
  category = document.querySelector('.nav-link.active')?.id;

  //let ids = [];
  //let units = [];
  //let labels = [];
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

    inputData = [trees, species, area, duration];

    inputUnits[category][2] = "m²";

    if (areaUnit === "ac"){
      area *= 4046.86;
      inputUnits[category][2] = "ac";

    } 

    // calculatedResults = {
    //   co2: (trees * 21.8).toFixed(1),
    //   biodiversity: area > 0 ? ((species / area) * 100).toFixed(2) : 0,
    //   cooling: ((area / 100) * 0.2).toFixed(2),
    //   air: (trees * 0.12).toFixed(2),
    //   stormwater: (area * 100).toFixed(0),
    //   branding: Math.log(trees + species + duration || 1).toFixed(2)
    // };

    const co2 = trees * 21.8; // kg/year (average sequestration per mature tree)
    const biodiversity = area > 0 ? ((species / area) * 100) : 0;
    const cooling = (area / 100) * 0.2; // °C reduction
    const air = trees * 0.12; // kg/year of PM2.5 removed
    const stormwater = area * 100; // L/year intercepted
    const branding = Math.log(trees + species + duration || 1); // index

    // --- Relatable Equivalents ---
    const cars = co2 / 1710;        // cars/year
    const households = co2 / 3000;  // household-years
    const credits = co2 / 1000;     // 1 tCO₂ credits


      ids = [
      "co2",
      "biodiversity",
      "cooling",
      "air",
      "stormwater",
      "branding",
      // new equivalents
      "cars",
      "households",
      "credits"
    ];

    units = [
      "kg/year",
      "",
      "°C",
      "kg/year",
      "L/year",
      "",
      // new equivalents
      "cars/year",
      "household years",
      "credits (1 tCO₂)"
    ];

    labels = [
      "Annual CO₂ Sequestration",
      "Biodiversity Potential Index",
      "Localized Cooling Effect",
      "Air Quality Improvement",
      "Stormwater Runoff Reduction",
      "Green Branding Score",
      // new equivalents
      "Cars Taken Off the Road",
      "Household Electricity Offset (Annual)",
      "Carbon Credits (Approx.)"
    ];

    emojis = [
      "🌳",
      "🌿",
      "🌡️",
      "💨",
      "💧",
      "⭐",
      // new equivalents
      "🚗",
      "🏠",
      "🌲"
    ];

    // --- Bundle Results ---
    calculatedResults = {
      co2: co2.toFixed(1),
      biodiversity: biodiversity.toFixed(2),
      cooling: cooling.toFixed(2),
      air: air.toFixed(2),
      stormwater: stormwater.toFixed(0),
      branding: branding.toFixed(2),

      // new equivalents
      cars: cars.toFixed(2),
      households: households.toFixed(2),
      credits: credits.toFixed(2)
    };
  }

  // ⚡ 2. Energy & Built Environment
  else if (category === "energy-tab") {
  const electricity = +document.getElementById("electricity").value || 0;
  const renewable = +document.getElementById("renewable").value || 0;
  const power = +document.getElementById("powerRating").value || 0;
  const hours = +document.getElementById("operatingHours").value || 0;

  inputData = [
    electricity,
    renewable,
    power,
    hours
  ];

  // Constants
  const tariff = 8;      // ₹ per kWh (example)
  const gridEF = 0.82;   // kg CO₂ per kWh (example)
  const baseline = 10000; // baseline kWh for savings%

  // Display fields
  ids = [
    "annualEnergy",
    "energyCost",
    "renewableShare",
    "energyIntensity",
    "energySavings",
    "ghg",
    // new equivalents
    "householdMonths",
    "petrolAvoided",
    "energyGJ"
  ];

  units = [
    "kWh/year",
    "₹/year",
    "%",
    "kWh/unit",
    "%",
    "kg CO₂/year",
    // new equivalents
    "months",
    "litres",
    "GJ/year"
  ];

  labels = [
    "Annual Energy",
    "Energy Cost",
    "Renewable Share",
    "Energy Intensity",
    "Energy Savings",
    "GHG Emissions",
    // new equivalents
    "Household Electricity (Months)",
    "Petrol Avoided",
    "Annual GJ Saved"
  ];

  emojis = [
    "⚡️",
    "💰",
    "🌞",
    "📊",
    "💡",
    "🌍",
    // new equivalents
    "🏠",
    "⛽",
    "🔥"
  ];

  // --- Calculations ---
  const annualEnergy = power * hours * 365; // total energy in kWh/year

  const energyCost = electricity * tariff; // ₹/year
  const renewableShare = electricity > 0 ? (renewable / electricity) * 100 : 0;
  const energyIntensity = annualEnergy / 100; // arbitrary "per 100 units" example
  const energySavings = ((baseline - electricity) / baseline) * 100;
  const ghg = electricity * gridEF; // kg CO₂/year

  // --- Relatable Equivalents ---
  const householdMonths = annualEnergy / 90;      // kWh ÷ 90 = months of avg household use
  const petrolAvoided = annualEnergy / 9.7;       // kWh ÷ 9.7 = litres petrol avoided
  const energyGJ = annualEnergy / 277.778;        // kWh ÷ 277.778 = GJ saved

  // --- Final Results Object ---
  calculatedResults = {
    annualEnergy: annualEnergy.toFixed(2),
    energyCost: energyCost.toFixed(2),
    renewableShare: renewableShare.toFixed(2),
    energyIntensity: energyIntensity.toFixed(2),
    energySavings: energySavings.toFixed(2),
    ghg: ghg.toFixed(2),

    // new equivalents
    householdMonths: householdMonths.toFixed(2),
    petrolAvoided: petrolAvoided.toFixed(2),
    energyGJ: energyGJ.toFixed(2)
  };
}

  // 💧 3. Water Use & Management
  else if (category === "water-tab") {
  const withdrawal = +document.getElementById("waterWithdrawal").value || 0;
  const discharge = +document.getElementById("waterDischarged").value || 0;
  const reuse = +document.getElementById("waterReused").value || 0;
  let siteArea = +document.getElementById("siteArea").value || 0;
  const siteAreaUnit = document.querySelector('input[name="btnradio-siteArea"]:checked')?.value || "m2";

  inputData = [
    withdrawal,
    discharge,
    reuse,
    siteArea
  ];

  inputUnits[category][3] = "m²";

  if (siteAreaUnit === "ac"){
    siteArea *= 4046.86;
    inputUnits[category][3] = "ac";
  } 

  const netConsumption = withdrawal - discharge - reuse;

  // Display fields
  ids = [
    "totalUse",
    "netConsumption",
    "reusePercent",
    "stormInfiltration",
    "waterIntensity",
    "hydroBalance",
    // new equivalents
    "showersSupplied",
    "householdMonthsWater",
    "olympicPools"
  ];

  units = [
    "L/year",
    "L/year",
    "%",
    "L/year",
    "L/m²",
    "L/year",
    // new equivalents
    "showers",
    "household-months",
    "pools"
  ];

  labels = [
    "Total Use",
    "Net Consumption",
    "Reuse %",
    "Storm Infiltration",
    "Water Intensity",
    "Hydro Balance",
    // new equivalents
    "Household Showers Supplied",
    "Months of Household Water Supply",
    "Olympic Pools Equivalent"
  ];

  emojis = [
    "💧",
    "🚰",
    "🔁",
    "🌧️",
    "📊",
    "⚖️",
    // new equivalents
    "🚿",
    "🏠",
    "🏊‍♂️"
  ];

  // --- Core Calculations ---
  const totalUse = withdrawal;
  const reusePercent = withdrawal > 0 ? (reuse / withdrawal) * 100 : 0;
  const stormInfiltration = siteArea * 80; // L/year
  const waterIntensity = netConsumption / 100; // L/m²
  const hydroBalance = withdrawal - discharge;

  // --- Relatable Equivalents ---
  const litresSaved = reuse; // Using reused/saved water volume
  const showersSupplied = litresSaved / 50;          // 50 L per shower
  const householdMonthsWater = litresSaved / 3000;   // 3000 L per household-month
  const olympicPools = litresSaved / 2_500_000;      // 2.5 million L per pool

  // --- Final Results Object ---
  calculatedResults = {
    totalUse: totalUse.toFixed(2),
    netConsumption: netConsumption.toFixed(2),
    reusePercent: reusePercent.toFixed(2),
    stormInfiltration: stormInfiltration.toFixed(0),
    waterIntensity: waterIntensity.toFixed(2),
    hydroBalance: hydroBalance.toFixed(2),

    // new equivalents
    showersSupplied: showersSupplied.toFixed(2),
    householdMonthsWater: householdMonthsWater.toFixed(2),
    olympicPools: olympicPools.toFixed(4)
  };
}

  // 🗑️ 4. Waste & Circularity
  else if (category === "waste-tab") {
  const haz = +document.getElementById("hazardousWaste").value || 0;
  const nonHaz = +document.getElementById("nonHazardousWaste").value || 0;
  const recycled = +document.getElementById("wasteRecycled").value || 0;
  const landfill = +document.getElementById("wasteLandfill").value || 0;

  inputData = [haz, nonHaz, recycled, landfill];

  const organicFraction = 0.3; // fraction of waste that is organic
  const energyFactor = 0.7; // kWh per kg of organic waste

  const total = haz + nonHaz;
  const organicWaste = total * organicFraction;

  // --- Field IDs ---
  ids = [
    "totalWaste",
    "recycleRate",
    "landfillRate",
    "energyPotential",
    "wasteIntensity",
    "reductionPercent",
    // new equivalents
    "truckloadsAvoided",
    "treeCarbonEquivalent",
    "energyGenPotential"
  ];

  // --- Units ---
  units = [
    "kg/year",
    "%",
    "%",
    "kWh/year",
    "kg/m²",
    "%",
    // new equivalents
    "truckloads",
    "tree-equivalents",
    "kWh/year"
  ];

  // --- Labels ---
  labels = [
    "Total Waste",
    "Recycle Rate",
    "Landfill Rate",
    "Energy Potential",
    "Waste Intensity",
    "Reduction %",
    // new equivalents
    "Truckloads of Waste Avoided",
    "Trees Worth of Carbon Avoided",
    "Energy Generation Potential"
  ];

  // --- Emojis ---
  emojis = [
    "🗑️",
    "♻️",
    "🏭",
    "⚡",
    "📊",
    "📉",
    // new equivalents
    "🚛",
    "🌳",
    "🔋"
  ];

  // --- Core Metrics ---
  const recycleRate = total > 0 ? (recycled / total) * 100 : 0;
  const landfillRate = total > 0 ? (landfill / total) * 100 : 0;
  const energyPotential = total * organicFraction * energyFactor; // kWh
  const wasteIntensity = total / 100; // kg/m²
  const reductionPercent = ((10000 - total) / 10000) * 100; // vs baseline

  // --- Relatable Equivalents ---
  const truckloadsAvoided = total / 10_000; // 10-tonne trucks
  const treeCarbonEquivalent = total / 1000; // 1 tree ≈ 1000 kg CO₂e
  const energyGenPotential = organicWaste * 0.7; // kWh (same as above for clarity)

  // --- Final Results Object ---
  calculatedResults = {
    totalWaste: total.toFixed(2),
    recycleRate: recycleRate.toFixed(2),
    landfillRate: landfillRate.toFixed(2),
    energyPotential: energyPotential.toFixed(2),
    wasteIntensity: wasteIntensity.toFixed(2),
    reductionPercent: reductionPercent.toFixed(2),

    // new equivalents
    truckloadsAvoided: truckloadsAvoided.toFixed(2),
    treeCarbonEquivalent: treeCarbonEquivalent.toFixed(2),
    energyGenPotential: energyGenPotential.toFixed(2)
  };
}


  //if(category == 'energy-tab' || category == 'water-tab' || category == 'waste-tab'){

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

    
  //}

    

  // 🎯 Display results (only if on calculator.html)
  if (window.location.pathname.endsWith("calculator.html")) {
    for (const key in calculatedResults) {
      if (document.getElementById(key))
        //console.log("Key: " + key + ", Value: " + calculatedResults[key]);
        formatMetricValues(calculatedResults[key], key);
    }

    document.querySelectorAll('.metric-value').forEach(el =>
      el.classList.add('unlocked')
    );
  }
}






function showPlaceholders() {
  // Detect which tab is active
  const category = document.querySelector('.nav-link.active')?.id;

  // Define placeholders for each category
  // const placeholders = {
  //   "green-tab": ["co2", "biodiversity", "cooling", "air", "stormwater", "branding"],
  //   "energy-tab": ["annualEnergy", "energyCost", "renewableShare", "energyIntensity", "energySavings", "ghg"],
  //   "water-tab": ["totalUse", "netConsumption", "reusePercent", "stormInfiltration", "waterIntensity", "hydroBalance"],
  //   "waste-tab": ["totalWaste", "recycleRate", "landfillRate", "energyPotential", "wasteIntensity", "reductionPercent"]
  // };
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
  //showPlaceholders();
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




function disableForm() {
  document.querySelectorAll('input[type="number"], input[type="range"], input[type="radio"]').forEach(input => {
    input.disabled = true;
    input.style.borderColor = '#e9ebee';
    
  });
  // const spans = document.querySelectorAll('input[type="number"]+span');
  // spans.forEach(span => {
  //   span.style.backgroundColor = '#e9ebee';
  // });
  document.querySelectorAll('.number-with-unit').forEach(el => {
    el.style.backgroundColor = '#e9ebee';
    el.style.border = "1px solid #e9ebee";
  });
}

function enableForm() {
  document.querySelectorAll('input[type="number"], input[type="range"], input[type="radio"]').forEach(input => {
    input.disabled = false;
    input.style.borderColor = '#a7e6bf';
    updateAllSliderFills();
  });
  document.querySelectorAll('input[type="number"], input[type="range"]').forEach(input => {
    input.value = 0;
  });
  document.querySelectorAll('.number-with-unit').forEach(el => {
    el.style.backgroundColor = '#e9fbf4';
    el.style.border = "1px solid rgba(167, 230, 191, 1)";
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
  
  


  try {

    const pdfBlob = await generatePDFBlob();
    saveAs(pdfBlob, "Leaf_Ledger_Report.pdf");

    
    
  } catch (err) {
    console.error("Error generating PDF:", err);
  }
}

// Generate Again functionality
function generateAgain() {
  adWatched = false;
  calculatedResults = null; // Clear stored results

  document.getElementById('report-section').style.display = 'none';
  
  //showPlaceholders();
  enableForm();
  hideActionButtons();
  updateAllSliderFills();

  document.querySelectorAll('.metric-value').forEach(el => {
    el.classList.remove('unlocked');
  });
  
  // Show watch ad button again
  const adButton = document.getElementById('watchAdBtn');
  const generateAgainBtn = document.getElementById('generateAgainBtn');
  if (adButton) {
    adButton.style.display = 'inline-block';
    //adButton.textContent = 'Watch Ad to View Results';
    adButton.innerHTML = "<i class='bi bi-play-circle'></i> Generate Metrics";
    adButton.disabled = false;
  }

  if(generateAgainBtn) {
    generateAgainBtn.style.display = 'none';
  }
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}








// async function generatePDFBlob() {
//   const response = await fetch("report.html");
//   const html = await response.text();
//   const parser = new DOMParser();
//   const doc = parser.parseFromString(html, "text/html");

//     trees = document.getElementById("trees")?.value || 0;
//     species = document.getElementById("species")?.value || 0;
//     area = document.getElementById("area")?.value || 0;
//     duration = document.getElementById("duration")?.value || 0;
//     unit = document.getElementById("areaUnit")?.textContent || "m²";
  



//   doc.querySelector(".report-overview-table tr:nth-child(3) td:nth-child(1)").textContent = trees;
//   doc.querySelector(".report-overview-table tr:nth-child(3) td:nth-child(2)").textContent = species;
//   doc.querySelector(".report-overview-table tr:nth-child(5) td:nth-child(1)").textContent = `${area} ${unit}`;
//   doc.querySelector(".report-overview-table tr:nth-child(5) td:nth-child(2)").textContent = `${duration} years`;

//   doc.querySelector("#co2Cell > span > span").textContent = calculatedResults.co2;
//   doc.querySelector("#bioCell > span > span").textContent = calculatedResults.biodiversity;
//   doc.querySelector("#coolingCell > span > span").textContent = calculatedResults.cooling;
//   doc.querySelector("#airCell > span > span").textContent = calculatedResults.air;
//   doc.querySelector("#stormCell > span > span").textContent = calculatedResults.stormwater;
//   doc.querySelector("#scoreCell > span > span").textContent = calculatedResults.branding;
//   doc.querySelector(".score-table tr:nth-child(2) td").textContent = calculatedResults.branding;

//   const now = new Date();
//   doc.querySelector("#report-date").textContent = now.toLocaleDateString() + ", " + now.toLocaleTimeString();

//   const reportDiv = doc.getElementById("report");
//   reportDiv.style.width = "210mm";
//   reportDiv.style.minHeight = "297mm";
//   reportDiv.style.padding = "10mm";
//   reportDiv.style.background = "#fff";
//   reportDiv.style.boxSizing = "border-box";

//   document.body.appendChild(reportDiv);

//   const canvas = await html2canvas(reportDiv, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
//   const imgData = canvas.toDataURL("image/jpeg");

//   const pdf = new jspdf.jsPDF("p", "mm", "a4");
//   const pageWidth = pdf.internal.pageSize.getWidth();
//   const pageHeight = pdf.internal.pageSize.getHeight();

//   const imgWidth = pageWidth;
//   const imgHeight = (canvas.height * imgWidth) / canvas.width;
//   const finalHeight = imgHeight > pageHeight ? pageHeight : imgHeight;
//   const finalWidth = imgHeight > pageHeight ? (pageHeight * canvas.width) / canvas.height : imgWidth;
//   const xOffset = (pageWidth - finalWidth) / 2;
//   const yOffset = (pageHeight - finalHeight) / 2;

//   pdf.addImage(imgData, "JPEG", xOffset, yOffset, finalWidth, finalHeight);
//   const blob = pdf.output("blob");

//   reportDiv.remove();
//   return blob;
// }


// async function generatePDFBlob() {
//   const response = await fetch("report.html");
//   const html = await response.text();
//   const parser = new DOMParser();
//   const doc = parser.parseFromString(html, "text/html");

//   // --- Retrieve input values ---
//   const trees = document.getElementById("trees")?.value || 0;
//   const species = document.getElementById("species")?.value || 0;
//   const area = document.getElementById("area")?.value || 0;
//   const duration = document.getElementById("duration")?.value || 0;
//   const unit = document.getElementById("areaUnit")?.textContent || "m²";

//   // --- Update Overview Table ---
//   doc.querySelector(".report-overview-table tr:nth-child(3) td:nth-child(1)").textContent = trees;
//   doc.querySelector(".report-overview-table tr:nth-child(3) td:nth-child(2)").textContent = species;
//   doc.querySelector(".report-overview-table tr:nth-child(5) td:nth-child(1)").textContent = `${area} ${unit}`;
//   doc.querySelector(".report-overview-table tr:nth-child(5) td:nth-child(2)").textContent = `${duration} years`;

//   // --- Update Main Metrics ---
//   doc.querySelector("#co2Cell > span > span").textContent = calculatedResults.co2;
//   doc.querySelector("#bioCell > span > span").textContent = calculatedResults.biodiversity;
//   doc.querySelector("#coolingCell > span > span").textContent = calculatedResults.cooling;
//   doc.querySelector("#airCell > span > span").textContent = calculatedResults.air;
//   doc.querySelector("#stormCell > span > span").textContent = calculatedResults.stormwater;
//   doc.querySelector("#scoreCell > span > span").textContent = calculatedResults.branding;

//   // --- Update Extra Metrics (new row) ---
//   if (calculatedResults.homesCooled !== undefined) {
//     doc.querySelector("#shadeCell > span > span").textContent = calculatedResults.homesCooled;
//   }
//   if (calculatedResults.oxygenSupplied !== undefined) {
//     doc.querySelector("#oxygenCell > span > span").textContent = calculatedResults.oxygenSupplied;
//   }
//   if (calculatedResults.lpgOffset !== undefined) {
//     doc.querySelector("#carbonCell > span > span").textContent = calculatedResults.lpgOffset;
//   }

//   // --- Update Branding Score ---
//   doc.querySelector(".score-table tr:nth-child(2) td").textContent = calculatedResults.branding;

//   // --- Update Timestamp ---
//   const now = new Date();
//   doc.querySelector("#report-date").textContent =
//     now.toLocaleDateString() + ", " + now.toLocaleTimeString();

//   // --- Prepare for PDF Rendering ---
//   const reportDiv = doc.getElementById("report");
//   reportDiv.style.width = "210mm";
//   reportDiv.style.minHeight = "297mm";
//   reportDiv.style.padding = "10mm";
//   reportDiv.style.background = "#fff";
//   reportDiv.style.boxSizing = "border-box";

//   document.body.appendChild(reportDiv);

//   // --- Generate Canvas and PDF ---
//   const canvas = await html2canvas(reportDiv, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
//   const imgData = canvas.toDataURL("image/jpeg");

//   const pdf = new jspdf.jsPDF("p", "mm", "a4");
//   const pageWidth = pdf.internal.pageSize.getWidth();
//   const pageHeight = pdf.internal.pageSize.getHeight();

//   const imgWidth = pageWidth;
//   const imgHeight = (canvas.height * imgWidth) / canvas.width;
//   const finalHeight = imgHeight > pageHeight ? pageHeight : imgHeight;
//   const finalWidth = imgHeight > pageHeight ? (pageHeight * canvas.width) / canvas.height : imgWidth;
//   const xOffset = (pageWidth - finalWidth) / 2;
//   const yOffset = (pageHeight - finalHeight) / 2;

//   pdf.addImage(imgData, "JPEG", xOffset, yOffset, finalWidth, finalHeight);
//   const blob = pdf.output("blob");

//   reportDiv.remove();
//   return blob;
// }


const reportIds = [];

async function generatePDFBlob() {
      const response = await fetch("report.html");
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      // if(category == "green-tab"){
        

      // }
      // else if(category == "energy-tab"){
        
      // }
      // else if(category == "water-tab"){
        
      // }
      // else if(category == "waste-tab"){
        
      // }

      // document.querySelectorAll("#report-section .metric-value").forEach((value, index) => {
      //     reportIds.push(value.id);
      //   });

      //   doc.querySelectorAll(".overview-value > span").forEach((unit, index) => {
      //   console.log(unit);
      //   unit.innerHTML = inputUnits[category][index];
      // });

      


      // --- Update Overview Section ---
      // doc.querySelector("#overview-trees").textContent = inputData.trees;
      // doc.querySelector("#overview-species").textContent = inputData.species;
      // doc.querySelector("#overview-area").innerHTML = `${inputData.area} <span>${inputData.unit}</span>`;
      // doc.querySelector("#overview-duration").innerHTML = `${inputData.duration} <span>years</span>`;

      doc.querySelectorAll(".overview-label").forEach((label, index) => {
        //console.log(label);
        label.textContent = inputHeaders[category][index];
      });

      doc.querySelectorAll(".overview-value").forEach((value, index) => {
        //value.textContent = inputData[index];
        value.innerHTML = `${inputData[index]} <span>${inputUnits[category][index]}</span>`;
      });

      // doc.querySelectorAll(".overview-value span").forEach((unit, index) => {
      //   console.log(unit);
      //   unit.innerHTML = inputUnits[category][index];
      // });

      

      doc.querySelectorAll(".impact-section .impact-card .impact-label").forEach((label, index) => {
        label.textContent = labels[index];
      });

      //console.log(reportIds);

      console.log(doc.querySelectorAll(".overview-value"));

      doc.querySelectorAll(".impact-section .impact-card .impact-unit").forEach((unit, index) => {
        unit.textContent = units[index];
      });

      doc.querySelectorAll(".impact-section .impact-card .impact-value").forEach((value, index) => {
        //value.textContent = calculatedResults[index];
        //value.id = reportIds[index] + "-value";
        value.id = ids[index] + "-value";
      });

    //   for (const key in calculatedResults) {
    //     //console.log(key);
    //   if (doc.getElementById(key + "-value")){
    //     //console.log(doc.getElementById(key + "-value"));
    //     //console.log(calculatedResults[key]);
    //     doc.getElementById(key + "-value").textContent = calculatedResults[key];
    //   }
    //     //console.log("Key: " + key + ", Value: " + calculatedResults[key]);
    //     //formatMetricValues(calculatedResults[key], key);
    //     //console.log(document.getElementById(key + "-value"));

        
    // }

    for(const key in calculatedResults){
      console.log(key + "-value");
      doc.getElementById(key + "-value").textContent = calculatedResults[key];
    }



      



      // // --- Update Impact Metrics ---
      // doc.querySelector("#co2-value").textContent = calculatedResults.co2Sequestration;
      // doc.querySelector("#bio-value").textContent = calculatedResults.biodiversityIndex;
      // doc.querySelector("#cooling-value").textContent = calculatedResults.coolingEffect;
      // doc.querySelector("#air-value").textContent = calculatedResults.airQuality;
      // doc.querySelector("#storm-value").textContent = calculatedResults.stormwaterReduction;
      // doc.querySelector("#score-value").textContent = calculatedResults.brandingScore;

      // // --- Update Green Branding Score ---
      // //doc.querySelector("#final-score").textContent = calculatedResults.brandingScore;

      // // --- Update Relatable Equivalents ---
      // if (calculatedResults.equivalents) {
      //   doc.querySelector("#eq1-value").textContent = calculatedResults.equivalents.co2Tonnes;
      //   doc.querySelector("#eq2-value").textContent = calculatedResults.equivalents.carsOffRoad;
      //   doc.querySelector("#eq3-value").textContent = calculatedResults.equivalents.coolingEffect;
      //   doc.querySelector("#eq4-value").textContent = calculatedResults.equivalents.airConditioners;
      //   doc.querySelector("#eq5-value").textContent = calculatedResults.equivalents.stormwaterLiters;
      //   doc.querySelector("#eq6-value").textContent = calculatedResults.equivalents.householdShowers;
      // }

      // --- Update Timestamp ---
      const now = new Date();
      const formattedDate = now.toLocaleDateString('en-GB').replace(/\//g, '.') + 
                           ', ' + 
                           now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      doc.querySelector("#report-date").textContent = formattedDate;

      // --- Prepare for PDF Rendering ---
      const reportDiv = doc.getElementById("report");
      reportDiv.style.width = "210mm";
      reportDiv.style.minHeight = "297mm";
      reportDiv.style.background = "#fff";
      reportDiv.style.boxSizing = "border-box";

      // Temporarily append to body for rendering
      document.body.appendChild(reportDiv);

      // --- Generate Canvas and PDF ---
      const canvas = await html2canvas(reportDiv, { 
        scale: 2, 
        useCORS: true, 
        backgroundColor: "#ffffff",
        logging: false
      });
      const imgData = canvas.toDataURL("image/jpeg", 0.95);

      const pdf = new jspdf.jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let finalHeight, finalWidth, xOffset, yOffset;
      
      if (imgHeight > pageHeight) {
        finalHeight = pageHeight;
        finalWidth = (pageHeight * canvas.width) / canvas.height;
      } else {
        finalHeight = imgHeight;
        finalWidth = imgWidth;
      }
      
      xOffset = (pageWidth - finalWidth) / 2;
      yOffset = (pageHeight - finalHeight) / 2;

      pdf.addImage(imgData, "JPEG", xOffset, yOffset, finalWidth, finalHeight);
      const blob = pdf.output("blob");

      // Clean up
      reportDiv.remove();
      
      return blob;
    }




// document.addEventListener('change', e => {
//   if (e.target.matches('.area-div input[type="radio"]')) {
//     console.log('🔥 Radio toggled:', e.target.value);
//   }
// });