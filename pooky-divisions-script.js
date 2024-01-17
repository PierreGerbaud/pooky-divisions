function calculateDivisions(tier, playersPerDivision) {
    return Math.pow(2, tier - 1);
}

function updateTiersAndDivisions() {
    let playerCount = parseInt(document.getElementById('playerCount').value);
    let minPlayers = parseInt(document.getElementById('minPlayers').value);
    let maxPlayers = parseInt(document.getElementById('maxPlayers').value);
    let averagePlayers = (minPlayers + maxPlayers) / 2;

    let tier = 1;
    let totalDivisions = 0;

    while (totalDivisions * averagePlayers < playerCount) {
        totalDivisions += calculateDivisions(tier, averagePlayers);
        tier++;
    }

    document.getElementById('output').innerHTML = `Total Tiers: ${tier - 1}, Total Divisions: ${totalDivisions}`;
}

window.onload = updateTiersAndDivisions;
