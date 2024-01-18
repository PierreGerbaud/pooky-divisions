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

    tier--;

    return { tier, totalDivisions, divisionsPopulation };
}

function calculateRewardShares(tierCount, multiplierY, topTierExtraSharePercent) {
    // Calculate the number of tiers minus two (excluding the top and bottom tiers from the distribution)
    const tiersMinusTwo = tierCount - 2;

    // Divide the (100 - topTierExtraSharePercent)% by the result to get the base share for each tier
    const baseShare = (100 - topTierExtraSharePercent) / tiersMinusTwo;

    // Compute the bottom multiplier
    const bottomMultiplier = 2 / (2 + multiplierY);

    // Compute the top multiplier
    const topMultiplier = bottomMultiplier * (1 + multiplierY);

    // Compute all reward splits
    const bottomShare = baseShare * bottomMultiplier; // The bottom tier gets nothing
    const increment = (baseShare * topMultiplier - bottomShare) / (tiersMinusTwo - 1);

    // Initialize shares array
    let shares = new Array(tierCount).fill(0);

    // Linear interpolation for the tiers
    for (let i = 1; i < tierCount - 1; i++) {
        shares[i] = baseShare * topMultiplier - increment * (i - 1);
    }

    // The bottom tier (last tier) gets 0%
    shares[tierCount - 1] = 0;

    // Add the extra share to the top tier
    shares[0] = baseShare * topMultiplier + topTierExtraSharePercent;

    // Adjust the shares to ensure they sum up to 100%
    let totalShare = shares.reduce((acc, share) => acc + share, 0);
    let adjustment = 100 - totalShare;
    shares[0] += adjustment;

    // Round shares to two decimal places
    shares = shares.map(share => parseFloat(share.toFixed(2)));

    return shares;
}



// Example usage
const topTierExtraShareExample = 5; // 5% reserved for top tier
const tierCountExample = 10; // Example tier count
const multiplierYExample = 0.5; // 50% more for the top tier
const rewardSharesExample = calculateRewardShares(tierCountExample, multiplierYExample, topTierExtraShareExample);
console.log(rewardSharesExample);



function updateInterface() {
    const playerCount = parseInt(document.getElementById('playerCount').value, 10);
    const minPlayers = parseInt(document.getElementById('minPlayers').value, 10);
    const multiplier = parseFloat(document.getElementById('multiplier').value);
    const silver = parseInt(document.getElementById('silver').value);
    const silverDollarPrice = parseFloat(document.getElementById('silverDollarPrice').value);
    const topTierExtraShare = parseFloat(document.getElementById('topTierExtraShare').value); // Get the top tier extra share from the input

    const { tier, divisionsPopulation } = calculateTiersAndDivisions(playerCount, minPlayers);
    const rewardShares = calculateRewardShares(tier, multiplier, topTierExtraShare); // Pass the top tier extra share to the function

    const tableBody = document.querySelector("#resultsTable tbody");
    tableBody.innerHTML = "";

    let divisionStartIndex = 0;
    for (let t = 1; t <= tier; t++) {
        const numDivisionsInTier = t <= 2 ? 2 : Math.pow(2, t - 1);
        let minPlayersInTier = Number.MAX_VALUE;
        let maxPlayersInTier = -Number.MAX_VALUE;
        let totalPlayersInTier = 0;

        for (let i = divisionStartIndex; i < divisionStartIndex + numDivisionsInTier; i++) {
            minPlayersInTier = Math.min(minPlayersInTier, divisionsPopulation[i]);
            maxPlayersInTier = Math.max(maxPlayersInTier, divisionsPopulation[i]);
            totalPlayersInTier += divisionsPopulation[i];
        }

        const tierRewardShare = rewardShares[t - 1];
        const divisionRewardShare = tierRewardShare / numDivisionsInTier;
        const divisionRewards = Math.round(silver * (divisionRewardShare / 100));
        const averageSilverPerPlayer = divisionRewards / maxPlayersInTier;
        const averageDollarValuePerPlayer = averageSilverPerPlayer * silverDollarPrice;

        const formattedDivisionRewards = divisionRewards.toLocaleString();
        const formattedAverageSilverPerPlayer = averageSilverPerPlayer.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const formattedAverageDollarValuePerPlayer = averageDollarValuePerPlayer.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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
        divisionStartIndex = divisionStartIndex + numDivisionsInTier;
    }
}


document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('updateButton').addEventListener('click', updateInterface);
    updateInterface(); // Initialize with default player count
});