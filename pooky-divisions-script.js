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
    const tiersMinusOne = tierCount - 2; // Changed from tierCount - 1 to tierCount - 2

    // Divide 95% (excluding the last 2 tiers) by the result to get the base share for each tier
    const baseShare = 95 / tiersMinusOne;

    // Compute the bottom multiplier
    const bottomMultiplier = 2 / (2 + multiplierY);

    // Compute the top multiplier
    const topMultiplier = bottomMultiplier * (1 + multiplierY);

    // Initialize shares array
    let shares = new Array(tierCount).fill(0);

    // Set the top tier's share
    shares[0] = baseShare * topMultiplier;

    // Linear interpolation for the other tiers
    const increment = (shares[0] - baseShare) / (tiersMinusOne - 1);
    for (let i = 1; i < tierCount - 2; i++) { // Changed from tierCount - 1 to tierCount - 2
        shares[i] = shares[i - 1] - increment;
    }

    // The last two tiers (second-to-last and last tier) get 0%
    shares[tierCount - 2] = 0;
    shares[tierCount - 1] = 0;

    // Add the flat 5% to the Tier 1 value
    shares[0] += 5;

    // Round shares to two decimal places
    shares = shares.map(share => parseFloat(share.toFixed(2)));

    // Ensure the sum of shares is 100%
    const total = shares.reduce((sum, share) => sum + share, 0);
    if (total !== 100) {
        // Adjust the top tier to make the sum 100%
        shares[0] += (100 - total);
    }

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
    const multiplier = parseFloat(document.getElementById('multiplier').value);
    const silver = parseInt(document.getElementById('silver').value); // Round silver to the nearest integer
    const silverDollarPrice = parseFloat(document.getElementById('silverDollarPrice').value);
    const { tier, totalDivisions, divisionsPopulation } = calculateTiersAndDivisions(playerCount, minPlayers);
    const rewardShares = calculateRewardShares(tier, multiplier);
    const tableBody = document.querySelector("#resultsTable tbody");
    tableBody.innerHTML = "";

    let divisionStartIndex = 0;
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
        const divisionRewardShare = tierRewardShare / numDivisionsInTier;
        const divisionRewards = Math.round(silver * (divisionRewardShare / 100));
        const averageSilverPerPlayer = divisionRewards / maxPlayersInTier;
        const averageDollarValuePerPlayer = averageSilverPerPlayer * silverDollarPrice;

        // Format numbers with thousands separator
        const formattedDivisionRewards = divisionRewards.toLocaleString();
        const formattedAverageSilverPerPlayer = averageSilverPerPlayer.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
        const formattedAverageDollarValuePerPlayer = averageDollarValuePerPlayer.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});

        let row = `<tr>
            <td>${t}</td>
            <td>${numDivisionsInTier}</td>
            <td>${minPlayersInTier}</td>
            <td>${maxPlayersInTier}</td>
            <td>${totalPlayersInTier}</td>
            <td>${tierRewardShare.toFixed(2)}%</td>
            <td>${divisionRewardShare.toFixed(2)}%</td>
            <td>${formattedDivisionRewards}</td>
            <td>${formattedAverageSilverPerPlayer}</td>
            <td>${formattedAverageDollarValuePerPlayer}</td>
        </tr>`;

        tableBody.innerHTML += row;
        divisionStartIndex = divisionEndIndex;
    }
}

document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('updateButton').addEventListener('click', updateInterface);
    updateInterface(); // Initialize with default player count
});