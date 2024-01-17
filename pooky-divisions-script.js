function calculateTiersAndDivisions(playerCount, minPlayers) {
    let tier = 0;
    let totalDivisions = 0;
    let playersInCurrentTier = 0;

    // Check if the player count is at least the minimum to start the game
    if (playerCount >= minPlayers) {
        // Calculate the tier and total divisions needed to accommodate the player count
        while (playerCount > playersInCurrentTier) {
            tier++;
            if (tier === 1) {
                totalDivisions = 2; // Tier 1 starts with 2 divisions
            } else {
                totalDivisions += Math.pow(2, tier - 2); // Adding 2^(tier-2) divisions for each subsequent tier
            }
            playersInCurrentTier = totalDivisions * minPlayers;
        }

        // Distribute players across divisions
        let divisionsPopulation = new Array(totalDivisions).fill(minPlayers);
        let excessPlayers = playerCount - playersInCurrentTier;

        // Spread excess players across divisions as evenly as possible
        let index = 0;
        while (excessPlayers > 0) {
            divisionsPopulation[index]++;
            excessPlayers--;
            index = (index + 1) % totalDivisions; // Loop back to the first division after the last
        }
    }

    return { tier, divisionsPopulation };
}

function updateInterface() {
    const playerCount = parseInt(document.getElementById('playerCount').value, 10);
    const minPlayers = parseInt(document.getElementById('minPlayers').value, 10);

    const { tier, divisionsPopulation } = calculateTiersAndDivisions(playerCount, minPlayers);

    // Update the interface with the results
    document.getElementById('output').innerHTML = playerCount >= minPlayers ?
        `Total Tiers: ${tier}<br>Division Populations: ${divisionsPopulation.join(', ')}` :
        `Not enough players to start the game. Minimum required: ${minPlayers}`;
}

window.onload = updateInterface;
