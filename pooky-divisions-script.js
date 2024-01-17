function calculateDivisions(tier) {
    return Math.pow(2, tier - 1);
}

function updateTiersAndDivisions() {
    let playerCount = document.getElementById('playerCount').value;
    let tier = 1;
    let totalDivisions = 0;

    while (totalDivisions < playerCount / 16) {
        totalDivisions += calculateDivisions(tier);
        tier++;
    }

    document.getElementById('output').innerHTML = `Total Tiers: ${tier - 1}, Total Divisions: ${totalDivisions}`;
}

window.onload = updateTiersAndDivisions;
