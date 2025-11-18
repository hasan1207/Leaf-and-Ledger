const path = window.location.pathname;
const isIndexPage = path.endsWith("home.html") || path.endsWith("/") || path === "";
const isReportPage = path.endsWith("report.html");

let chart;
let areaUnit = "m2";
let adWatched = false;
let selectedUnit = "m2";
let calculatedResults = null;
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

// const tooltipContent = {
//   "green-tab": ["Estimated carbon captured annually by the trees. Removes harmful carbon dioxide from the atmosphere each year, helping slow climate change.", "Relative biodiversity score based on species richness per area. Shows how effectively the green space can support diverse plant and animal life.", "Cooling potential created by green space. Reduces surrounding temperatures naturally, improving comfort and lowering heat stress.", "Amount of PM2.5 removed by trees annually. Filters pollutants like PM2.5 from the air, providing cleaner and healthier air to breathe.", "Rainwater intercepted by green surfaces annually. Absorbs rainfall and reduces flooding risk while improving groundwater replenishment.", "A maturity indicator combining age, species, and trees. Reflects the environmental leadership and maturity of your green initiative.", "Equivalent number of average petrol cars' annual CO₂ emissions avoided.", "Number of average households' annual electricity use offset by saved emissions.", "Approximate number of 1-tonne CO₂ credits represented."],
//   "energy-tab": ["Total energy consumed annually. Represents the total energy consumed annually, helping track operational efficiency.", "Estimated cost of consumed electricity. Shows the annual financial cost of electricity consumption to highlight savings opportunities.", "Percentage share of renewable energy. Indicates how much of your total energy comes from clean, renewable sources.", "Energy needed per unit of user-defined output. Reveals the amount of energy required per unit of output, showing operational efficiency.", "Reduction in energy use relative to baseline. Shows how much energy you have saved compared to the baseline, demonstrating improvement.", "Emissions caused by electricity usage. Quantifies the climate-impacting emissions generated from electricity use.", "Equivalent months of an average household's electricity supplied by saved energy.", "Volume of petrol whose combustion equals the energy saved.", "Energy savings expressed in gigajoules."],
//   "water-tab": ["Total water withdrawn from all sources. Measures the total water withdrawn from all sources for your operations.", "Water consumed after reuse and discharge. Shows the actual water consumed after subtracting reused and discharged water.", "Percentage of withdrawn water reused. Indicates how effectively your system recycles water, reducing freshwater demand.", "Estimated annual stormwater infiltration. Estimates how much rainwater your site can naturally filter back into the ground.", "Water consumption per output unit. Shows how much water is consumed per unit of output, helping identify efficiency gains.", "Water retained or released by site. Indicates whether your site retains or releases water overall.", "Number of typical household showers that volume of water could supply.", "Months of water supply for one household (basic use) provided.", "Number of standard Olympic pools worth of water saved."],
//   "waste-tab": ["Combined hazardous and non-hazardous waste. Represents the combined hazardous and non-hazardous waste produced annually.", "Percentage of waste recycled. Shows the percentage of waste diverted from disposal through recycling.", "Percentage of waste landfilled. Indicates how much waste ends up in landfills, supporting zero-waste goals.", "Potential energy from recoverable waste. Shows how much usable energy can be recovered from organic waste.", "Waste generated per output unit. Measures waste generated per unit of output, highlighting efficiency improvements.", "Reduction in waste compared to baseline. Shows how effectively waste has been reduced compared to your baseline levels.", "Number of standard 10-tonne truckloads reduced.", "Approximate trees' worth of carbon avoided by diverting waste.", "Potential electricity from waste-to-energy for organic fraction."]
// }

let tooltipContent = [];

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


  function initAreaDivValues() {
    document.querySelectorAll(".area-div").forEach(areaDiv => {
      const numInput = areaDiv.querySelector(".number-with-unit input[type='number']");
      if (!numInput) return;
      const checkedUnit = areaDiv.querySelector("input[type='radio']:checked")?.value || "m2";
      const displayVal = parseFloat(numInput.value) || 0;
      numInput.dataset.m2 = m2FromDisplay(displayVal, checkedUnit);
    });
  }


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


  document.addEventListener("change", e => {
    if (!e.target.matches(".area-div input[type='radio']")) return;
    const radio = e.target;
    const areaDiv = radio.closest(".area-div");
    const chosenUnit = radio.value;
    updateAreaDiv(areaDiv, chosenUnit);
  });


  initAreaDivValues();


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

    const co2 = trees * 21.8;
    const biodiversity = area > 0 ? ((species / area) * 100) : 0;
    const cooling = (area / 100) * 0.2;
    const air = trees * 0.12;
    const stormwater = area * 100;
    const branding = Math.log(trees + species + duration || 1);


    const cars = co2 / 1710;
    const households = co2 / 3000;
    const credits = co2 / 1000;


      ids = [
      "co2",
      "biodiversity",
      "cooling",
      "air",
      "stormwater",
      "branding",
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
      "🚗",
      "🏠",
      "🌲"
    ];

    tooltipContent = ["Estimated carbon captured annually by the trees. Removes harmful carbon dioxide from the atmosphere each year, helping slow climate change.", "Relative biodiversity score based on species richness per area. Shows how effectively the green space can support diverse plant and animal life.", "Cooling potential created by green space. Reduces surrounding temperatures naturally, improving comfort and lowering heat stress.", "Amount of PM2.5 removed by trees annually. Filters pollutants like PM2.5 from the air, providing cleaner and healthier air to breathe.", "Rainwater intercepted by green surfaces annually. Absorbs rainfall and reduces flooding risk while improving groundwater replenishment.", "A maturity indicator combining age, species, and trees. Reflects the environmental leadership and maturity of your green initiative.", "Equivalent number of average petrol cars' annual CO₂ emissions avoided.", "Number of average households' annual electricity use offset by saved emissions.", "Approximate number of 1-tonne CO₂ credits represented."];


    calculatedResults = {
      co2: co2.toFixed(1),
      biodiversity: biodiversity.toFixed(2),
      cooling: cooling.toFixed(2),
      air: air.toFixed(2),
      stormwater: stormwater.toFixed(0),
      branding: branding.toFixed(2),


      cars: cars.toFixed(2),
      households: households.toFixed(2),
      credits: credits.toFixed(2)
    };
  }


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


  const tariff = 8;
  const gridEF = 0.82;
  const baseline = 10000;


  ids = [
    "annualEnergy",
    "energyCost",
    "renewableShare",
    "energyIntensity",
    "energySavings",
    "ghg",
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
    "🏠",
    "⛽",
    "🔥"
  ];

  tooltipContent = ["Total energy consumed annually. Represents the total energy consumed annually, helping track operational efficiency.", "Estimated cost of consumed electricity. Shows the annual financial cost of electricity consumption to highlight savings opportunities.", "Percentage share of renewable energy. Indicates how much of your total energy comes from clean, renewable sources.", "Energy needed per unit of user-defined output. Reveals the amount of energy required per unit of output, showing operational efficiency.", "Reduction in energy use relative to baseline. Shows how much energy you have saved compared to the baseline, demonstrating improvement.", "Emissions caused by electricity usage. Quantifies the climate-impacting emissions generated from electricity use.", "Equivalent months of an average household's electricity supplied by saved energy.", "Volume of petrol whose combustion equals the energy saved.", "Energy savings expressed in gigajoules."];
  

  const annualEnergy = power * hours * 365;

  const energyCost = electricity * tariff;
  const renewableShare = electricity > 0 ? (renewable / electricity) * 100 : 0;
  const energyIntensity = annualEnergy / 100;
  const energySavings = ((baseline - electricity) / baseline) * 100;
  const ghg = electricity * gridEF;


  const householdMonths = annualEnergy / 90;
  const petrolAvoided = annualEnergy / 9.7;
  const energyGJ = annualEnergy / 277.778;


  calculatedResults = {
    annualEnergy: annualEnergy.toFixed(2),
    energyCost: energyCost.toFixed(2),
    renewableShare: renewableShare.toFixed(2),
    energyIntensity: energyIntensity.toFixed(2),
    energySavings: energySavings.toFixed(2),
    ghg: ghg.toFixed(2),


    householdMonths: householdMonths.toFixed(2),
    petrolAvoided: petrolAvoided.toFixed(2),
    energyGJ: energyGJ.toFixed(2)
  };
}


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


  ids = [
    "totalUse",
    "netConsumption",
    "reusePercent",
    "stormInfiltration",
    "waterIntensity",
    "hydroBalance",
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
    "🚿",
    "🏠",
    "🏊‍♂️"
  ];

  tooltipContent = ["Total water withdrawn from all sources. Measures the total water withdrawn from all sources for your operations.", "Water consumed after reuse and discharge. Shows the actual water consumed after subtracting reused and discharged water.", "Percentage of withdrawn water reused. Indicates how effectively your system recycles water, reducing freshwater demand.", "Estimated annual stormwater infiltration. Estimates how much rainwater your site can naturally filter back into the ground.", "Water consumption per output unit. Shows how much water is consumed per unit of output, helping identify efficiency gains.", "Water retained or released by site. Indicates whether your site retains or releases water overall.", "Number of typical household showers that volume of water could supply.", "Months of water supply for one household (basic use) provided.", "Number of standard Olympic pools worth of water saved."];
  


  const totalUse = withdrawal;
  const reusePercent = withdrawal > 0 ? (reuse / withdrawal) * 100 : 0;
  const stormInfiltration = siteArea * 80;
  const waterIntensity = netConsumption / 100;
  const hydroBalance = withdrawal - discharge;


  const litresSaved = reuse;
  const showersSupplied = litresSaved / 50;
  const householdMonthsWater = litresSaved / 3000;
  const olympicPools = litresSaved / 2_500_000;


  calculatedResults = {
    totalUse: totalUse.toFixed(2),
    netConsumption: netConsumption.toFixed(2),
    reusePercent: reusePercent.toFixed(2),
    stormInfiltration: stormInfiltration.toFixed(0),
    waterIntensity: waterIntensity.toFixed(2),
    hydroBalance: hydroBalance.toFixed(2),


    showersSupplied: showersSupplied.toFixed(2),
    householdMonthsWater: householdMonthsWater.toFixed(2),
    olympicPools: olympicPools.toFixed(4)
  };
}


  else if (category === "waste-tab") {
  const haz = +document.getElementById("hazardousWaste").value || 0;
  const nonHaz = +document.getElementById("nonHazardousWaste").value || 0;
  const recycled = +document.getElementById("wasteRecycled").value || 0;
  const landfill = +document.getElementById("wasteLandfill").value || 0;

  inputData = [haz, nonHaz, recycled, landfill];

  const organicFraction = 0.3;
  const energyFactor = 0.7;

  const total = haz + nonHaz;
  const organicWaste = total * organicFraction;


  ids = [
    "totalWaste",
    "recycleRate",
    "landfillRate",
    "energyPotential",
    "wasteIntensity",
    "reductionPercent",
    "truckloadsAvoided",
    "treeCarbonEquivalent",
    "energyGenPotential"
  ];

  units = [
    "kg/year",
    "%",
    "%",
    "kWh/year",
    "kg/m²",
    "%",
    "truckloads",
    "tree-equivalents",
    "kWh/year"
  ];

  labels = [
    "Total Waste",
    "Recycle Rate",
    "Landfill Rate",
    "Energy Potential",
    "Waste Intensity",
    "Reduction %",
    "Truckloads of Waste Avoided",
    "Trees Worth of Carbon Avoided",
    "Energy Generation Potential"
  ];

  emojis = [
    "🗑️",
    "♻️",
    "🏭",
    "⚡",
    "📊",
    "📉",
    "🚛",
    "🌳",
    "🔋"
  ];

  tooltipContent = ["Combined hazardous and non-hazardous waste. Represents the combined hazardous and non-hazardous waste produced annually.", "Percentage of waste recycled. Shows the percentage of waste diverted from disposal through recycling.", "Percentage of waste landfilled. Indicates how much waste ends up in landfills, supporting zero-waste goals.", "Potential energy from recoverable waste. Shows how much usable energy can be recovered from organic waste.", "Waste generated per output unit. Measures waste generated per unit of output, highlighting efficiency improvements.", "Reduction in waste compared to baseline. Shows how effectively waste has been reduced compared to your baseline levels.", "Number of standard 10-tonne truckloads reduced.", "Approximate trees' worth of carbon avoided by diverting waste.", "Potential electricity from waste-to-energy for organic fraction."]



  const recycleRate = total > 0 ? (recycled / total) * 100 : 0;
  const landfillRate = total > 0 ? (landfill / total) * 100 : 0;
  const energyPotential = total * organicFraction * energyFactor;
  const wasteIntensity = total / 100;
  const reductionPercent = ((10000 - total) / 10000) * 100;


  const truckloadsAvoided = total / 10_000;
  const treeCarbonEquivalent = total / 1000;
  const energyGenPotential = organicWaste * 0.7;


  calculatedResults = {
    totalWaste: total.toFixed(2),
    recycleRate: recycleRate.toFixed(2),
    landfillRate: landfillRate.toFixed(2),
    energyPotential: energyPotential.toFixed(2),
    wasteIntensity: wasteIntensity.toFixed(2),
    reductionPercent: reductionPercent.toFixed(2),


    truckloadsAvoided: truckloadsAvoided.toFixed(2),
    treeCarbonEquivalent: treeCarbonEquivalent.toFixed(2),
    energyGenPotential: energyGenPotential.toFixed(2)
  };
}




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

    document.querySelectorAll("#report-section .custom-tooltip").forEach((el, index) => {
      el.textContent = tooltipContent[index];
    });



    


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
 
  const category = document.querySelector('.nav-link.active')?.id;

  
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

  
  const ids = placeholders[category] || [];

  
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


  adOverlay.style.display = 'flex';
  adVideo.currentTime = 0;
  adVideo.play();


  document.body.style.overflow = 'hidden';

  
  adVideo.onended = () => {
    adOverlay.style.display = 'none';
    document.body.style.overflow = 'auto';
    onAdComplete();
  };

 
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


function generateAgain() {
  adWatched = false;
  calculatedResults = null;

  document.getElementById('report-section').style.display = 'none';
  
  //showPlaceholders();
  enableForm();
  hideActionButtons();
  updateAllSliderFills();

  document.querySelectorAll('.metric-value').forEach(el => {
    el.classList.remove('unlocked');
  });
  
  
  const adButton = document.getElementById('watchAdBtn');
  const generateAgainBtn = document.getElementById('generateAgainBtn');
  if (adButton) {
    adButton.style.display = 'inline-block';
    adButton.innerHTML = "<i class='bi bi-play-circle'></i> Generate Metrics";
    adButton.disabled = false;
  }

  if(generateAgainBtn) {
    generateAgainBtn.style.display = 'none';
  }
  
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}











const reportIds = [];

async function generatePDFBlob() {
      const response = await fetch("report.html");
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      

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



      



      
      const now = new Date();
      const formattedDate = now.toLocaleDateString('en-GB').replace(/\//g, '.') + 
                           ', ' + 
                           now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      doc.querySelector("#report-date").textContent = formattedDate;


      const reportDiv = doc.getElementById("report");
      reportDiv.style.width = "210mm";
      reportDiv.style.minHeight = "297mm";
      reportDiv.style.background = "#fff";
      reportDiv.style.boxSizing = "border-box";


      document.body.appendChild(reportDiv);

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


      reportDiv.remove();
      
      return blob;
    }

