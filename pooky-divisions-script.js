function calculateTiersAndDivisions(playerCount, minPlayers) {
    let tier = 1;
    let totalDivisions = 2; // Tier 1 starts with 2 divisions
    let maxPlayersInCurrentTier = totalDivisions * minPlayers * 2; // Maximum capacity of the current tier

    // Adjust tier and total divisions based on player count
    while (playerCount > maxPlayersInCurrentTier) {
        tier++;
        // Tier 2 has the same number of divisions as Tier 1
        // Tier 3 and beyond double the number of divisions from the previous tier
        totalDivisions = tier === 2 ? 2 : Math.pow(2, tier - 1);
        maxPlayersInCurrentTier = totalDivisions * minPlayers * 2; // Update the capacity for the new tier
    }

    // Distribute players across divisions
    let divisionsPopulation = new Array(totalDivisions).fill(minPlayers);
    let playersAssigned = totalDivisions * minPlayers;

    // Distribute any remaining players starting from the lower tier
    let index = totalDivisions - 1; // Start from the last division
    while (playersAssigned < playerCount) {
        divisionsPopulation[index]++;
        playersAssigned++;
        index--; // Move to the previous division
        if (index < 0) { // If we've reached the first division, loop back to the last division
            index = totalDivisions - 1;
        }
    }

    return { tier, totalDivisions, divisionsPopulation };
}

function calculateRewardShares(tierCount, multiplierY) {
    if (tierCount <= 2) {
        // If there are 2 or fewer tiers, distribute all rewards to the top tier
        return tierCount === 1 ? [100] : [100, 0];
    }

    const tiersToDistribute = tierCount - 2; // Distribute rewards to top (N-2) tiers
    const baseShare = 100 / (tiersToDistribute + multiplierY);

    // Initialize shares array
    let shares = new Array(tierCount).fill(0);
    shares[0] = baseShare * (1 + multiplierY); // Top tier share
    shares.fill(baseShare, 1, tiersToDistribute); // Distribute evenly across (N-2) tiers
    shares[tierCount - 1] = 0; // Last tier (Nth tier) gets 0

    // Correct the total to account for rounding errors
    const total = shares.reduce((acc, share) => acc + share, 0);
    const discrepancy = 100 - total;
    if (discrepancy !== 0) {
        shares[1] += discrepancy; // Adjust the second tier to fix the total
    }

    // Round shares to two decimal places
    shares = shares.map(share => parseFloat(share.toFixed(2)));

    return shares;
}

function updateInterface() {
    const playerCount = parseInt(document.getElementById('playerCount').value, 10);
    const minPlayers = parseInt(document.getElementById('minPlayers').value, 10);
    const multiplier = parseFloat(document.getElementById('multiplier').value); // Get the multiplier from the input
    const { tier, totalDivisions, divisionsPopulation } = calculateTiersAndDivisions(playerCount, minPlayers);
    const rewardShares = calculateRewardShares(tier, multiplier); // Use the multiplier from the input
    const tableBody = document.querySelector("#resultsTable tbody");
    tableBody.innerHTML = ""; // Clear previous results

    for (let t = 1; t <= tier; t++) {
        const numDivisionsInTier = t <= 2 ? 2 : Math.pow(2, t - 1);
        const divisionEndIndex = divisionStartIndex + numDivisionsInTier;
        
        let minPlayersInTier = Number.MAX_VALUE;
        let maxPlayersInTier = -Number.MAX_VALUE;
        let totalPlayersInTier = 0;
    
        for (let i = divisionStartIndex; i < divisionEndIndex; i++) {
            if (i < divisionsPopulation.length) {
                minPlayersInTier = Math.min(minPlayersInTier, divisionsPopulation[i]);
                maxPlayersInTier = Math.max(maxPlayersInTier, divisionsPopulation[i]);
                totalPlayersInTier += divisionsPopulation[i];
            }
        }
        
        if(minPlayersInTier === Number.MAX_VALUE) {
            minPlayersInTier = 0;
            maxPlayersInTier = 0;
            totalPlayersInTier = 0;
        }
    
        const tierRewardShare = rewardShares[t - 1];
        const divisionRewardShare = (tierRewardShare / numDivisionsInTier).toFixed(2);
    
        // Update the row template to include conditionals for handling the last tier with no rewards
        let row = `<tr>
            <td>${t}</td>
            <td>${numDivisionsInTier}</td>
            <td>${minPlayersInTier}</td>
            <td>${maxPlayersInTier}</td>
            <td>${totalPlayersInTier}</td>
            <td>${t === tier ? '0.00' : tierRewardShare.toFixed(2)}%</td>
            <td>${t === tier ? '0.00' : divisionRewardShare}%</td>
            <td></td> <!-- SILVER per division will be calculated later -->
            <td></td> <!-- Average SILVER per player -->
            <td></td> <!-- Average USD per player -->
        </tr>`;
    
        tableBody.innerHTML += row;
        divisionStartIndex = divisionEndIndex; // Update the start index for the next iteration
    }
}

document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('updateButton').addEventListener('click', updateInterface);
    updateInterface(); // Initialize with default player count
});
