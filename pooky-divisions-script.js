function calculateTiersAndDivisions(playerCount, minPlayers, maxPlayers) {
    let tier = 1;
    let totalDivisions = 2; // Start with 2 divisions for Tier 1 as per the new rule
    let playersInCurrentTier = totalDivisions * maxPlayers;

    // Handle the special case for Tier 2, which also has 2 divisions
    if (playerCount > playersInCurrentTier) {
        tier++;
        // No doubling here, just add 2 more divisions for Tier 2
        totalDivisions += 2;
        playersInCurrentTier = totalDivisions * maxPlayers;
    }

    // Now apply the doubling logic for Tier 3 and onwards
    while (playerCount > playersInCurrentTier) {
        tier++;
        totalDivisions += Math.pow(2, tier - 2); // tier-2 because we've already handled the first two tiers
        playersInCurrentTier = totalDivisions * maxPlayers;
    }

    // Calculate the number of players in each division, starting from the last tier
    let playersRemaining = playerCount;
    let divisionsPopulation = Array(totalDivisions).fill(0);
    for (let i = totalDivisions - 1; i >= 0; i--) {
        let playersInDivision = Math.min(playersRemaining, maxPlayers);
        divisionsPopulation[i] = playersInDivision;
        playersRemaining -= playersInDivision;
        if (playersRemaining <= 0) break;
    }

    return { tier, divisionsPopulation };
}

function updateInterface() {
    const playerCount = parseInt(document.getElementById('playerCount').value);
    const minPlayers = parseInt(document.getElementById('minPlayers').value);
    const maxPlayers = minPlayers * 3; // Assuming max is always three times the min

    const { tier, divisionsPopulation } = calculateTiersAndDivisions(playerCount, minPlayers, maxPlayers);

    // Update the interface with the results
    document.getElementById('output').innerHTML = `Total Tiers: ${tier}<br>Division Populations: ${divisionsPopulation.join(', ')}`;
}

window.onload = updateInterface;
