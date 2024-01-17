function calculateTiersAndDivisions(playerCount, minPlayers) {
    let tier = 0;
    let totalDivisions = 2; // Starting with 2 divisions in Tier 1
    let playersInCurrentTier = totalDivisions * minPlayers -1;

    // Calculate how many tiers we need
    while (playerCount > playersInCurrentTier) {
        tier++;
        if (tier === 2) {
            totalDivisions += 2; // Tier 2 also has 2 divisions
        } else {
            totalDivisions *= 2; // Doubling the divisions for the next tier
        }
        playersInCurrentTier = totalDivisions * minPlayers;
    }

    // Distribute players as equally as possible
    let divisionsPopulation = new Array(totalDivisions).fill(minPlayers);
    let excessPlayers = playerCount - (minPlayers * totalDivisions);

    let i = 0;
    // Distribute excess players one by one to each division until all are allocated
    while (excessPlayers > 0) {
        divisionsPopulation[i]++;
        excessPlayers--;
        i = (i + 1) % totalDivisions; // Loop back to the first division after the last
    }

    return { tier, divisionsPopulation };
}

function updateInterface() {
    const playerCount = parseInt(document.getElementById('playerCount').value);
    const minPlayers = parseInt(document.getElementById('minPlayers').value);

    const { tier, divisionsPopulation } = calculateTiersAndDivisions(playerCount, minPlayers);

    // Update the interface with the results
    document.getElementById('output').innerHTML = `Total Tiers: ${tier}<br>Division Populations: ${divisionsPopulation.join(', ')}`;
}

window.onload = updateInterface;
