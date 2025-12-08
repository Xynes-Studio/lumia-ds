
const fs = require('fs');
const path = require('path');

const coveragePath = path.join(__dirname, 'coverage/coverage-final.json');
if (!fs.existsSync(coveragePath)) {
    console.log('No coverage file found');
    process.exit(1);
}

const coverageData = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
let totalStatements = 0;
let coveredStatements = 0;

const fileCoverages = [];

for (const filePath in coverageData) {
    const fileData = coverageData[filePath];
    const statements = fileData.s;
    let fileTotal = 0;
    let fileCovered = 0;

    for (const key in statements) {
        fileTotal++;
        if (statements[key] > 0) {
            fileCovered++;
        }
    }

    totalStatements += fileTotal;
    coveredStatements += fileCovered;

    const percentage = fileTotal === 0 ? 100 : (fileCovered / fileTotal) * 100;
    fileCoverages.push({
        file: path.relative(__dirname, filePath),
        percentage: percentage,
        total: fileTotal,
        covered: fileCovered
    });
}

const totalPercentage = totalStatements === 0 ? 100 : (coveredStatements / totalStatements) * 100;
console.log(`Total Coverage: ${totalPercentage.toFixed(2)}%`);

fileCoverages.sort((a, b) => a.percentage - b.percentage);

console.log('Lowest Coverage Files:');
fileCoverages.slice(0, 20).forEach(f => {
    console.log(`${f.file}: ${f.percentage.toFixed(2)}% (${f.covered}/${f.total})`);
});
