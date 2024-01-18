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

    // Check if the last tier has no players
    if (playerCount <= (maxPlayersInCurrentTier - totalDivisions * minPlayers)) {
        tier--; // Reduce the tier count by 1 as the last tier has no players
    }

    return { tier, totalDivisions, divisionsPopulation };
}

function calculateRewardShares(tierCount, multiplierY, topShareBonus) {
    // Calculate the number of tiers minus one
    const tiersMinusOne = tierCount - 1;

    // Adjust the total reward pool by the topShareBonus
    const adjustedTotalRewardPool = 100 - topShareBonus;

    // Divide adjustedTotalRewardPool by tiersMinusOne to get the base share for each tier except the top and bottom
    const baseShare = adjustedTotalRewardPool / tiersMinusOne;

    // Compute the multipliers
    const bottomMultiplier = 2 / (2 + multiplierY);
    const topMultiplier = bottomMultiplier * (1 + multiplierY);

    // Initialize shares array with the base share
    let shares = new Array(tierCount).fill(baseShare);

    // Adjust the top tier's share by the topMultiplier and topShareBonus
    shares[0] = baseShare * topMultiplier + topShareBonus;

    // Linear interpolation for the middle tiers
    for (let i = 1; i < tierCount - 1; i++) {
        shares[i] = shares[i - 1] - (shares[0] - baseShare) / (tiersMinusOne - 1);
    }

    // The bottom tier (last tier) gets 0%
    shares[tierCount - 1] = 0;

    // Round shares to two decimal places
    shares = shares.map(share => parseFloat(share.toFixed(2)));

    // Verify the total is 100% and adjust if necessary
    let totalShare = shares.reduce((acc, share) => acc + share, 0);
    if (totalShare !== 100) {
        let discrepancy = 100 - totalShare;
        shares[0] += discrepancy; // Adjust the top tier to fix the total
        shares[0] = parseFloat(shares[0].toFixed(2)); // Ensure two decimal places after adjustment
    }

    return shares;
}



function updateInterface() {
    const playerCount = parseInt(document.getElementById('playerCount').value, 10);
    const minPlayers = parseInt(document.getElementById('minPlayers').value, 10);
    const multiplier = parseFloat(document.getElementById('multiplier').value);
    const silver = parseInt(document.getElementById('silver').value); // Round silver to the nearest integer
    const silverDollarPrice = parseFloat(document.getElementById('silverDollarPrice').value);
    const { tier, totalDivisions, divisionsPopulation } = calculateTiersAndDivisions(playerCount, minPlayers);
    const topShareBonus = parseFloat(document.getElementById('topShareBonus').value);
    const rewardShares = calculateRewardShares(tier, multiplier, topShareBonus);
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
