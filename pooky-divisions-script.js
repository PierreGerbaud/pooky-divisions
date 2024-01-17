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


function calculateRewardShares(tierCount, extraShareForTop) {
    // Initialize an array to hold the share of each tier.
    let shares = new Array(tierCount).fill(0);

    if (tierCount === 1) {
        // If there's only one tier, it gets all the rewards.
        shares[0] = 100;
        return shares;
    }

    // Calculate the base share for the second-to-last tier.
    let baseShare = (100 / (tierCount - 1 + extraShareForTop));

    // Assign shares starting from the second-to-last tier and distribute the remaining share linearly.
    for (let i = tierCount - 2; i > 0; i--) {
        shares[i] = baseShare;
    }

    // Set the share for the last tier (0%) and the top tier.
    shares[tierCount - 1] = 0; // Last tier gets 0%
    shares[0] = baseShare * extraShareForTop; // Top tier gets its share.

    // Ensure the total sums up to 100% due to possible floating-point arithmetic issues.
    let totalShare = shares.reduce((acc, share) => acc + share, 0);
    if (totalShare !== 100) {
        let discrepancy = 100 - totalShare;
        shares[1] += discrepancy; // Adjust the second tier to fix the total
    }

    // Round the shares to two decimal places.
    return shares.map(share => Math.round(share * 100) / 100);
}

function updateInterface() {
    const playerCount = parseInt(document.getElementById('playerCount').value, 10);
    const minPlayers = parseInt(document.getElementById('minPlayers').value, 10);
    const { tier, totalDivisions, divisionsPopulation } = calculateTiersAndDivisions(playerCount, minPlayers);
    const rewardShares = calculateRewardShares(tier, 1.5); // Top tier gets 50% more than the second-to-last tier
    const tableBody = document.querySelector("#resultsTable tbody");
    tableBody.innerHTML = ""; // Clear previous results

    let divisionStartIndex = 0; // Ensure this is defined outside the for loop
    for (let t = 1; t <= tier; t++) {
        const numDivisionsInTier = t <= 2 ? 2 : Math.pow(2, t - 1);
        const divisionEndIndex = divisionStartIndex + numDivisionsInTier;
        
        // Initialize the variables with the first element of the current tier or default values if out of bounds
        let minPlayersInTier = Number.MAX_VALUE;
        let maxPlayersInTier = -Number.MAX_VALUE;
        let totalPlayersInTier = 0;
    
        for (let i = divisionStartIndex; i < divisionEndIndex; i++) {
            if (i < divisionsPopulation.length) { // Check bounds to avoid undefined
                minPlayersInTier = Math.min(minPlayersInTier, divisionsPopulation[i]);
                maxPlayersInTier = Math.max(maxPlayersInTier, divisionsPopulation[i]);
                totalPlayersInTier += divisionsPopulation[i];
            }
        }
        
        // Check if no divisions were found for this tier, and set values to 0 to avoid NaN or undefined
        if(minPlayersInTier === Number.MAX_VALUE) {
            minPlayersInTier = 0;
            maxPlayersInTier = 0;
            totalPlayersInTier = 0;
        }
    
        const tierRewardShare = rewardShares[t - 1];
        const divisionRewardShare = (tierRewardShare / numDivisionsInTier).toFixed(2);
    
        let row = `<tr>
            <td>${t}</td>
            <td>${numDivisionsInTier}</td>
            <td>${minPlayersInTier}</td>
            <td>${maxPlayersInTier}</td>
            <td>${totalPlayersInTier}</td>
            <td>${tierRewardShare.toFixed(2)}%</td>
            <td>${divisionRewardShare}%</td>
            <td></td> <!-- Division Rewards ($SILVER) -->
        </tr>`;
    
        tableBody.innerHTML += row;
        divisionStartIndex = divisionEndIndex; // Update the start index for the next iteration
    }
    
}

document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('updateButton').addEventListener('click', updateInterface);
    updateInterface(); // Initialize with default player count
});