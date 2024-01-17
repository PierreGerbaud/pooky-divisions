function calculateTiersAndDivisions(playerCount, minPlayers) {
    let tier = 0;
    let totalDivisions = 0;
    let playersInCurrentTier = 0;
    let minPlayersToStart = minPlayers * 2; // The game starts with at least double the minimum players per division

    // Initialize divisionsPopulation as an empty array
    let divisionsPopulation = []; 

    if (playerCount >= minPlayersToStart) {
        while (playerCount > playersInCurrentTier) {
            tier++;
            if (tier === 1) {
                totalDivisions = 2;
            } else if (tier === 2) {
                totalDivisions += 2; // Tier 2 also has 2 divisions
            } else {
                totalDivisions += Math.pow(2, tier - 2); // Doubling the divisions for subsequent tiers
            }
            playersInCurrentTier = totalDivisions * minPlayers;
        }

        // Calculate the number of players in each division
        divisionsPopulation = new Array(totalDivisions).fill(minPlayers);
        let excessPlayers = playerCount - (totalDivisions * minPlayers);

        let index = 0;
        while (excessPlayers > 0) {
            if (divisionsPopulation[index] < minPlayers * 2) { // Ensuring no division exceeds twice the minimum
                divisionsPopulation[index]++;
                excessPlayers--;
            }
            index = (index + 1) % totalDivisions; // Loop back to the first division
        }
    }

    return { tier, divisionsPopulation };
}
