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

const radioButtons = document.querySelectorAll('input[name="btnradio"]');

radioButtons.forEach(radioButton => {
  const unitValue = document.querySelector(".number-with-unit > input[type='number']");
  const unitRange = document.querySelector("#areaRange");
  const unitType = document.querySelector(".number-with-unit > span");

  radioButton.addEventListener('change', function() {
    let rawValue = parseFloat(unitValue.value) || 0;
    selectedUnit = document.querySelector('input[name="btnradio"]:checked').value;

    if (selectedUnit === "m2") {
      unitType.textContent = "m²";
      rawValue = rawValue * 4046.86;
      unitRange.max = 100000;
    } else {
      unitType.textContent = "ac";
      rawValue = rawValue / 4046.86;
      unitRange.max = 25;
    }

    rawValue = Math.min(Math.max(rawValue, unitRange.min), unitRange.max);
    unitValue.value = rawValue;
    unitRange.value = rawValue;

    updateAllSliderFills();
    if (adWatched) {
      calculate();
    }
  });
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
function calculate() {
  if (!adWatched) {
    // Don't calculate - show placeholder
    showPlaceholders();
    return;
  }

  const trees = +document.getElementById("trees").value || 0;
  const species = +document.getElementById("species").value || 0;
  let area = +document.getElementById("area").value || 0;
  const duration = +document.getElementById("duration").value || 0;

  if(selectedUnit == "ac") {
    area = area * 4046.86;
  }

  // Store calculated results
  calculatedResults = {
    co2: (trees * 21.8).toFixed(1),
    biodiversity: area > 0 ? ((species / area) * 100).toFixed(2) : 0,
    cooling: ((area / 100) * 0.2).toFixed(2),
    air: (trees * 0.12).toFixed(2),
    stormwater: (area * 100).toFixed(0),
    branding: Math.log(trees + species + duration || 1).toFixed(2)
  };


  
  // Display the results
  formatMetricValues(calculatedResults.co2, "co2");
  formatMetricValues(calculatedResults.biodiversity, "biodiversity");
  formatMetricValues(calculatedResults.cooling, "cooling");
  formatMetricValues(calculatedResults.air, "air");
  formatMetricValues(calculatedResults.stormwater.toLocaleString(), "stormwater");
  formatMetricValues(calculatedResults.branding, "branding");
  document.querySelectorAll('.metric-value').forEach(el => {
    el.classList.add('unlocked');
  });
}

function showPlaceholders() {
  // Show dummy placeholder text (not real values)
  document.getElementById("co2").textContent = "••••";
  document.getElementById("biodiversity").textContent = "••••";
  document.getElementById("cooling").textContent = "••••";
  document.getElementById("air").textContent = "••••";
  document.getElementById("stormwater").textContent = "••••";
  document.getElementById("branding").textContent = "••••";
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
  document.getElementById(className).innerHTML = `${intPartFormatted}.<span class="decimal">${decPart}</span>`;
}

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
    calculate();
    disableForm();

    const adButton = document.getElementById('watchAdBtn');
    if (adButton) adButton.style.display = 'none';
    showActionButtons();
  }
  
  

  
  try {
    const zip = new JSZip();

    const csvBlob = exportToCSVBlob("", "", "", "", "");
    zip.file("Leaf_Ledger_Results.csv", csvBlob);

    const pngBlob = await exportToPNGBlob("", "", "", "", "");
    zip.file("Leaf_Ledger_Results.png", pngBlob);

    const pdfBlob = await generatePDFBlob("", "", "", "", "");
    zip.file("Leaf_Ledger_Report.pdf", pdfBlob);

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "Leaf_Ledger_Results.zip");
  } catch (err) {
    console.error("Error generating zip:", err);
  }
}

// Generate Again functionality
function generateAgain() {
  adWatched = false;
  calculatedResults = null; // Clear stored results
  
  showPlaceholders();
  enableForm();
  hideActionButtons();

  document.querySelectorAll('.metric-value').forEach(el => {
    el.classList.remove('unlocked');
  });
  
  // Show watch ad button again
  const adButton = document.getElementById('watchAdBtn');
  if (adButton) {
    adButton.style.display = 'inline-block';
    adButton.textContent = 'Watch Ad to View Results';
    adButton.disabled = false;
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

async function generatePDFBlob(trees, species, area, duration, unit) {
  const response = await fetch("report.html");
  const html = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  if(trees == "" || species == "" || area == "" || duration == "" || unit == ""){
    trees = document.getElementById("trees")?.value || 0;
    species = document.getElementById("species")?.value || 0;
    area = document.getElementById("area")?.value || 0;
    duration = document.getElementById("duration")?.value || 0;
    unit = document.getElementById("areaUnit")?.textContent || "m²";
  }



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