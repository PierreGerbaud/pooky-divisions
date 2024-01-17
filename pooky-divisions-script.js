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
    // Calculate the number of tiers minus one
    const tiersMinusOne = tierCount - 1;

    // Divide 100% by the result to get the base share for each tier except the top and bottom
    const baseShare = 95 / tiersMinusOne;

    // Compute the bottom multiplier
    const bottomMultiplier = 2 / (2 + multiplierY);

    // Compute the top multiplier
    const topMultiplier = bottomMultiplier * (1 + multiplierY);

    // Compute all reward splits
    const topShare = baseShare * topMultiplier;
    const bottomShare = baseShare * bottomMultiplier; // This will actually be 0 since the bottom tier gets nothing

    // Initialize shares array
    let shares = new Array(tierCount).fill(0);

    // Set the top tier's share
    shares[0] = topShare;

    // Linear interpolation for the other tiers
    const increment = (topShare - bottomShare) / (tierCount - 2);
    for (let i = 1; i < tierCount - 1; i++) {
        shares[i] = shares[i - 1] - increment;
    }

    // The bottom tier (last tier) gets 0%
    shares[tierCount - 1] = 0;

    // Round shares to two decimal places and adjust to ensure the sum is 100%
    let totalShare = shares.reduce((acc, share) => acc + share, 0);
    let adjustment = 95 - totalShare;

    // Apply the adjustment to the top tier
    shares[0] += adjustment;
    shares[0] += 5;

    // Round the shares to two decimal places
    shares = shares.map(share => parseFloat(share.toFixed(2)));

    return shares;
}

// Example usage
const tierCountExample = 10; // Example tier count
const multiplierYExample = 0.25; // Multiplier for the top tier
const rewardSharesExample = calculateRewardShares(tierCountExample, multiplierYExample);
console.log(rewardSharesExample);


function updateInterface() {
    const playerCount = parseInt(document.getElementById('playerCount').value, 10);
    const minPlayers = parseInt(document.getElementById('minPlayers').value, 10);
    const multiplier = parseFloat(document.getElementById('multiplier').value); // Get the multiplier from the input
    const { tier, totalDivisions, divisionsPopulation } = calculateTiersAndDivisions(playerCount, minPlayers);
    const rewardShares = calculateRewardShares(tier, multiplier); // Use the multiplier from the input
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