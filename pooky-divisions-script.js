function calculateTiersAndDivisions(playerCount, minPlayers) {
    let tier = 1;
    let totalDivisions = 2; // Tier 1 starts with 2 divisions
    let maxPlayersInCurrentTier = totalDivisions * minPlayers;

    // Adjust tier and total divisions based on player count
    while (playerCount > maxPlayersInCurrentTier) {
        // Increase tier count and calculate new divisions only if necessary
        tier++;
        totalDivisions = (tier === 2) ? 2 : totalDivisions * 2;
        maxPlayersInCurrentTier += totalDivisions * minPlayers;
    }

    // Check if the last tier has 0 players
    if (playerCount <= (maxPlayersInCurrentTier - totalDivisions * minPlayers)) {
        tier--; // Reduce the tier count by 1 as the last tier has no players
    }

    // Distribute players across divisions
    let divisionsPopulation = new Array(totalDivisions).fill(minPlayers);
    let playersAssigned = totalDivisions * minPlayers;

    // Distribute any remaining players starting from the lower tier
    let index = totalDivisions - 1; // Start from the last division
    while (playersAssigned < playerCount) {
        divisionsPopulation[index]++;
        playersAssigned++;
        index = (index > 0) ? index - 1 : totalDivisions - 1;
    }

    // Return only the populated tiers and divisions
    return { tier, divisionsPopulation: divisionsPopulation.slice(0, tier * 2) };
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
    const multiplier = parseFloat(document.getElementById('multiplier').value);
    const silver = parseInt(document.getElementById('silver').value);
    const silverDollarPrice = parseFloat(document.getElementById('silverDollarPrice').value);
    const { tier, divisionsPopulation } = calculateTiersAndDivisions(playerCount, minPlayers);
    const rewardShares = calculateRewardShares(tier, multiplier);
    const tableBody = document.querySelector("#resultsTable tbody");
    tableBody.innerHTML = ""; // Clear previous results

    let divisionIndex = 0;
    for (let t = 1; t <= tier; t++) {
        const numDivisionsInTier = t === 1 ? 2 : Math.pow(2, t - 1);
        let minPlayersInTier = divisionsPopulation[divisionIndex] || 0;
        let maxPlayersInTier = divisionsPopulation[divisionIndex] || 0;
        let totalPlayersInTier = 0;

        for (let i = divisionIndex; i < divisionIndex + numDivisionsInTier; i++) {
            if (divisionsPopulation[i] !== undefined) {
                minPlayersInTier = Math.min(minPlayersInTier, divisionsPopulation[i]);
                maxPlayersInTier = Math.max(maxPlayersInTier, divisionsPopulation[i]);
                totalPlayersInTier += divisionsPopulation[i];
            }
        }

        const tierRewardShare = rewardShares[t - 1];
        const divisionRewardShare = tierRewardShare / numDivisionsInTier;
        const divisionRewards = Math.round(silver * (divisionRewardShare / 100));
        const averageSilverPerPlayer = divisionRewards / maxPlayersInTier;
        const averageDollarValuePerPlayer = averageSilverPerPlayer * silverDollarPrice;

        // Format numbers with thousands separator
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
        divisionIndex += numDivisionsInTier;
    }
}

document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('updateButton').addEventListener('click', updateInterface);
    updateInterface(); // Initialize with default player count
});
