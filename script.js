// ======================
// Mobile Navigation Toggle
// ======================
document.addEventListener("DOMContentLoaded", function () {
  const hamburger = document.querySelector(".hamburger");
  const navMenu = document.querySelector(".nav-menu");

  if (hamburger && navMenu) {
    hamburger.addEventListener("click", function () {
      hamburger.classList.toggle("active");
      navMenu.classList.toggle("active");
    });

    document.querySelectorAll(".nav-menu a").forEach((link) => {
      link.addEventListener("click", () => {
        hamburger.classList.remove("active");
        navMenu.classList.remove("active");
      });
    });
  }

  // Initialize pages
  initializeTabs();
  initializeFakeNewsDetector();
  initializeDeepfakeAnalyzer();
});

// ======================
// Tab Switching
// ======================
function initializeTabs() {
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.getAttribute("data-tab");

      tabButtons.forEach((b) => b.classList.remove("active"));
      tabContents.forEach((c) => c.classList.remove("active"));

      button.classList.add("active");
      const content = document.getElementById(target + "-tab");
      if (content) content.classList.add("active");
    });
  });
}

// ======================
// Fake News Detector
// ======================
function initializeFakeNewsDetector() {
  const analyzeBtn = document.getElementById("analyzeBtn");
  if (analyzeBtn) analyzeBtn.addEventListener("click", analyzeFakeNews);
}

async function analyzeFakeNews() {
  const textContent = document.getElementById("newsText")?.value.trim();
  const urlContent = document.getElementById("newsUrl")?.value.trim();
  const analyzeBtn = document.getElementById("analyzeBtn");

  if (!textContent && !urlContent) {
    showError("Please enter text or a URL for analysis");
    return;
  }

  analyzeBtn.innerHTML = '<div class="loading"></div> Analyzing...';
  analyzeBtn.disabled = true;

  try {
    const result = await sendToN8NWorkflow({
      content: textContent || urlContent,
      type: "fakeNews",
    });
    displayFakeNewsResults(result);
  } catch (error) {
    console.error(error);
    showError("Analysis failed. Please try again.");
  } finally {
    analyzeBtn.innerHTML = '<i class="fas fa-search"></i> Analyze Content';
    analyzeBtn.disabled = false;
  }
}

function displayFakeNewsResults(result) {
  const resultsContent = document.getElementById("resultsContent");
  const scoreClass =
    result.confidence > 70
      ? "score-low"
      : result.confidence > 40
      ? "score-medium"
      : "score-high";

  resultsContent.innerHTML = `
    <div class="analysis-result">
      <div class="result-header">
        <h3>${result.verdict}</h3>
        <span class="confidence-score ${scoreClass}">
          ${Math.round(result.confidence)}% Risk
        </span>
      </div>
      ${
        result.keyReasons?.length
          ? `<div class="warnings">
               <h4>⚠ Key Reasons:</h4>
               <ul>${result.keyReasons.map((w) => `<li>${w}</li>`).join("")}</ul>
             </div>`
          : ""
      }
      ${
        result.recommendations?.length
          ? `<div class="recommendations">
               <h4>Recommendations:</h4>
               <ul>${result.recommendations.map((r) => `<li>${r}</li>`).join("")}</ul>
             </div>`
          : ""
      }
    </div>
  `;
}

// ======================
// Deepfake Analyzer (URL Only) – English Output
// ======================
function initializeDeepfakeAnalyzer() {
  const analyzeBtn = document.getElementById("analyzeVideoBtn");
  if (analyzeBtn) analyzeBtn.addEventListener("click", analyzeDeepfakeEnglish);
}

async function analyzeDeepfakeEnglish() {
  const videoUrl = document.getElementById("videoUrl")?.value.trim();
  const analyzeBtn = document.getElementById("analyzeVideoBtn");
  const resultsContent = document.getElementById("videoResultsContent");

  if (!videoUrl) {
    showError("Please enter a video URL");
    return;
  }

  analyzeBtn.innerHTML = '<div class="loading"></div> Analyzing Video...';
  analyzeBtn.disabled = true;

  try {
    const response = await fetch(
      "https://pinkp.app.n8n.cloud/webhook-test/4fed089a-df7e-4ece-94e2-23992e3ad029",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: videoUrl, type: "deepfake" })
      }
    );

    if (!response.ok) throw new Error("Webhook execution failed");

    const result = await response.json();

    // Convert webhook response to readable English
    const englishResult = {
      confidence: result.confidence || 0,
      verdict: result.verdict || "Analysis Complete",
      keyReasons: result.keyReasons?.map((r) => r.toString()) || [],
      recommendations: result.recommendations?.map((r) => r.toString()) || []
    };

    // Display in readable English
    resultsContent.innerHTML = `
      <div class="analysis-result">
        <div class="result-header">
          <h3>${englishResult.verdict}</h3>
          <span class="confidence-score">${Math.round(englishResult.confidence)}% Authentic</span>
        </div>

        ${
          englishResult.keyReasons.length
            ? `<div class="warnings">
                 <h4>⚠ Key Reasons:</h4>
                 <ul>${englishResult.keyReasons.map((i) => `<li>${i}</li>`).join("")}</ul>
               </div>`
            : ""
        }

        ${
          englishResult.recommendations.length
            ? `<div class="recommendations">
                 <h4>Recommendations:</h4>
                 <ul>${englishResult.recommendations.map((r) => `<li>${r}</li>`).join("")}</ul>
               </div>`
            : ""
        }
      </div>
    `;
  } catch (error) {
    console.error(error);
    showError("Video analysis failed. Please try again.");
  } finally {
    analyzeBtn.innerHTML = '<i class="fas fa-search"></i> Analyze Video';
    analyzeBtn.disabled = false;
  }
}

// ======================
// Utility
// ======================
function showError(message) {
  alert(message);
}

// ======================
// N8N Workflow Integration
// ======================
async function sendToN8NWorkflow(data) {
  const webhookUrl = "https://pinkp.app.n8n.cloud/webhook-test/4fed089a-df7e-4ece-94e2-23992e3ad029"; // Replace with your webhook

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error("Workflow execution failed");
  return await response.json();
}

// ======================
// Smooth Scroll
// ======================
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) target.scrollIntoView({ behavior: "smooth" });
  });
});
