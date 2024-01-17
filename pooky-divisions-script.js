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


function calculateRewardShares(tierCount, extraShareForTopTier) {
    if (tierCount === 1) {
        // If there's only one tier, it gets all the rewards.
        return [100];
    }

    // Initialize shares with zeros for all tiers.
    let shares = new Array(tierCount).fill(0);
    shares[tierCount - 1] = 0; // Last tier gets 0%.

    // The top tier gets the extra share. Second to last tier is the baseline for calculation.
    let baseShare = (100 / (tierCount - 1)) / (1 + extraShareForTopTier);
    shares[tierCount - 2] = baseShare;
    shares[0] = baseShare * extraShareForTopTier;

    // Calculate the increment based on the remaining percentage and the remaining tiers to distribute it.
    let remainingShare = 100 - (shares[0] + shares[tierCount - 2]);
    let increment = remainingShare / (tierCount - 2);

    // Assign reward shares in ascending order, excluding the first and last tier.
    for (let i = 1; i < tierCount - 2; i++) {
        shares[i] = shares[i - 1] + increment;
    }

    // Round the shares to two decimal places and ensure the sum is 100%.
    let roundedShares = shares.map(share => parseFloat(share.toFixed(2)));
    let sumOfShares = roundedShares.reduce((a, b) => a + b, 0);

    // Adjust the last rewarding tier slightly if rounding errors caused the sum to deviate from 100%.
    if (sumOfShares !== 100) {
        roundedShares[tierCount - 2] += 100 - sumOfShares;
    }

    return roundedShares;
}


function updateInterface() {
    const playerCount = parseInt(document.getElementById('playerCount').value, 10);
    const minPlayers = parseInt(document.getElementById('minPlayers').value, 10);
    const { tier, totalDivisions, divisionsPopulation } = calculateTiersAndDivisions(playerCount, minPlayers);
    const extraShareForTopTier = 1.5; // Top tier gets 50% more than the second-to-last tier
    const rewardShares = calculateRewardShares(tier, extraShareForTopTier);   
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