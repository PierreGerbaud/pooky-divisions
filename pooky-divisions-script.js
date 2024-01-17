function calculateTiersAndDivisions(playerCount, minPlayers) {
    let tier = 0;
    let totalDivisions = 0;
    let playersInCurrentTier = 0;
    let minPlayersToStart = minPlayers * 2; // The game starts with at least double the minimum players per division
    let divisionsPopulation = []; // Initialize divisionsPopulation as an empty array

    // Check if the player count is at least the minimum to start the game
    if (playerCount >= minPlayersToStart) {
        // Calculate the tier and total divisions needed to accommodate the player count
        while (playerCount > playersInCurrentTier) {
            tier++;
            totalDivisions = tier === 1 ? 2 : totalDivisions * 2; // Tier 1 starts with 2 divisions, double for each subsequent tier
            playersInCurrentTier = totalDivisions * minPlayers;
        }

        // Initialize divisionsPopulation with the minimum number of players in each division
        divisionsPopulation = new Array(totalDivisions).fill(minPlayers);
        let excessPlayers = playerCount - (totalDivisions * minPlayers);

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
    console.log("Update interface called");
    const playerCount = parseInt(document.getElementById('playerCount').value, 10);
    const minPlayers = parseInt(document.getElementById('minPlayers').value, 10);
    const minPlayersToStart = minPlayers * 2;
    const { tier, divisionsPopulation } = calculateTiersAndDivisions(playerCount, minPlayers);

    // Update the interface with the results
    document.getElementById('output').innerHTML = playerCount >= minPlayersToStart ?
        `Total Tiers: ${tier}<br>Division Populations: ${divisionsPopulation.join(', ')}` :
        `Not enough players to start the game. Minimum required: ${minPlayersToStart}`;
}
// ... JavaScript logic for calculateTiersAndDivisions and updateInterface ...

document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('updateButton').addEventListener('click', updateInterface);
});

