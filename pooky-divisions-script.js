function calculateTiersAndDivisions(playerCount, minPlayers) {
    let tier = 1;
    let totalDivisions = 2; // Starting with 2 divisions in Tier 1

    // Adjust tier and total divisions based on player count
    while (true) {
        let maxPlayersInCurrentTier = totalDivisions * minPlayers * 2;
        if (playerCount <= maxPlayersInCurrentTier) break;

        tier++;
        totalDivisions = tier === 2 ? 4 : totalDivisions * 2; // Tier 2 has 4 divisions, doubling for each subsequent tier
    }

    // Distribute players across divisions
    let divisionsPopulation = new Array(totalDivisions).fill(minPlayers);
    let excessPlayers = playerCount - (totalDivisions * minPlayers);

    let index = 0;
    while (excessPlayers > 0) {
        if (divisionsPopulation[index] < minPlayers * 2) {
            divisionsPopulation[index]++;
            excessPlayers--;
        }
        index = (index + 1) % totalDivisions; // Loop back to the first division
    }

    return { tier, divisionsPopulation };
}

function updateInterface() {
    const playerCount = parseInt(document.getElementById('playerCount').value, 10);
    const minPlayers = parseInt(document.getElementById('minPlayers').value, 10);
    const { tier, divisionsPopulation } = calculateTiersAndDivisions(playerCount, minPlayers);

    let outputHtml = playerCount >= minPlayers * 2 ? `<strong>Total Tiers:</strong> ${tier}<br><strong>Division Populations:</strong> <ul>` : `Not enough players to start the game. Minimum required: ${minPlayers * 2}`;
    divisionsPopulation.forEach((pop, index) => {
        outputHtml += `<li>Division ${index + 1}: ${pop} players</li>`;
    });
    outputHtml += '</ul>';

    document.getElementById('output').innerHTML = outputHtml;
}

document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('updateButton').addEventListener('click', updateInterface);
});
