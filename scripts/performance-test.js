const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');

async function runLighthouse(url, options = {}) {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  options.port = chrome.port;

  const runnerResult = await lighthouse(url, options);
  await chrome.kill();

  return runnerResult;
}

async function generatePerformanceReport() {
  const url = process.env.TEST_URL || 'http://localhost:3000';
  const outputDir = path.join(__dirname, '../reports');
  
  // Create reports directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log(`Running Lighthouse performance test on ${url}...`);

  try {
    const result = await runLighthouse(url, {
      output: ['html', 'json'],
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      settings: {
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
          requestLatencyMs: 0,
          downloadThroughputKbps: 0,
          uploadThroughputKbps: 0
        },
        screenEmulation: {
          mobile: false,
          width: 1350,
          height: 940,
          deviceScaleFactor: 1,
          disabled: false
        }
      }
    });

    // Save HTML report
    const htmlReportPath = path.join(outputDir, 'lighthouse-report.html');
    fs.writeFileSync(htmlReportPath, result.report[0]);
    console.log(`HTML report saved to: ${htmlReportPath}`);

    // Save JSON report
    const jsonReportPath = path.join(outputDir, 'lighthouse-report.json');
    fs.writeFileSync(jsonReportPath, result.report[1]);
    console.log(`JSON report saved to: ${jsonReportPath}`);

    // Display scores
    const scores = result.lhr.categories;
    console.log('\n=== Performance Scores ===');
    console.log(`Performance: ${Math.round(scores.performance.score * 100)}`);
    console.log(`Accessibility: ${Math.round(scores.accessibility.score * 100)}`);
    console.log(`Best Practices: ${Math.round(scores['best-practices'].score * 100)}`);
    console.log(`SEO: ${Math.round(scores.seo.score * 100)}`);

    // Check if scores meet requirements
    const minScore = 80;
    const failedCategories = Object.entries(scores)
      .filter(([_, category]) => Math.round(category.score * 100) < minScore)
      .map(([name, _]) => name);

    if (failedCategories.length > 0) {
      console.log(`\n⚠️  Warning: The following categories scored below ${minScore}:`);
      failedCategories.forEach(category => {
        console.log(`  - ${category}: ${Math.round(scores[category].score * 100)}`);
      });
      process.exit(1);
    } else {
      console.log(`\n✅ All categories scored above ${minScore}!`);
    }

  } catch (error) {
    console.error('Error running Lighthouse:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  generatePerformanceReport();
}

module.exports = { generatePerformanceReport };
