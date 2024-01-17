function calculateTiersAndDivisions(playerCount, minPlayers) {
    let tier = 0;
    let totalDivisions = 0;
    let playersInCurrentTier = -1;

    // Find the correct tier and number of divisions
    while (playerCount > playersInCurrentTier) {
        tier++;
        totalDivisions = tier === 1 ? 2 : totalDivisions * 2; // Tier 1 has 2 divisions, double for each subsequent tier
        playersInCurrentTier = totalDivisions * minPlayers - 1; // Your adjustment
    }

    // Distribute players across divisions
    let divisionsPopulation = Array(totalDivisions).fill(minPlayers);
    let excessPlayers = playerCount - (minPlayers * totalDivisions);

    // Spread excess players as evenly as possible across divisions
    let index = 0;
    while (excessPlayers > 0) {
        divisionsPopulation[index]++;
        excessPlayers--;
        index = (index + 1) % totalDivisions; // Ensure we loop back to the first division
    }

    return { tier, divisionsPopulation };
}

function updateInterface() {
    const playerCount = parseInt(document.getElementById('playerCount').value, 10);
    const minPlayers = parseInt(document.getElementById('minPlayers').value, 10);

    const { tier, divisionsPopulation } = calculateTiersAndDivisions(playerCount, minPlayers);

    // Update the interface with the results
    document.getElementById('output').innerHTML = `Total Tiers: ${tier}<br>Division Populations: ${divisionsPopulation.join(', ')}`;
}

window.onload = updateInterface;
