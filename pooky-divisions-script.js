function calculateTiersAndDivisions(playerCount, minPlayers) {
    let tier = 0;
    let totalPlayersInTiers = 0;

    // Loop to determine the number of tiers
    while (totalPlayersInTiers < playerCount) {
        tier++;
        totalPlayersInTiers = (Math.pow(2, tier) - 1) * minPlayers;
    }

    // Determine the number of divisions and their populations
    const divisionsPopulation = new Array(Math.pow(2, tier - 1)).fill(minPlayers);
    let remainingPlayers = playerCount - (Math.pow(2, tier - 1) - 1) * minPlayers;

    // Distribute remaining players across divisions
    let index = 0;
    while (remainingPlayers > 0) {
        divisionsPopulation[index]++;
        remainingPlayers--;
        index = (index + 1) % divisionsPopulation.length;
    }

    return { tier, divisionsPopulation };
}

function calculateRewardShares(tierCount, multiplierY) {
    if (tierCount < 3) return Array(tierCount).fill(100 / tierCount);

    const tiersMinusTwo = tierCount - 2;
    const baseShare = (95 / tiersMinusTwo);
    const shares = new Array(tierCount).fill(baseShare);
    shares[tierCount - 1] = 0; // Last tier gets 0%
    shares[tierCount - 2] = 0; // Second to last tier gets 0%

    // Calculate the remaining shares for the top tier
    const remainingShare = 100 - (baseShare * tiersMinusTwo);
    shares[0] = remainingShare; // Top tier gets the remaining share

    // Distribute shares linearly
    const increment = (shares[0] - baseShare) / (tiersMinusTwo - 1);
    for (let i = 1; i < tierCount - 2; i++) {
        shares[i] += increment * (i - 1);
    }

    // Round to two decimal places
    return shares.map(share => Math.round(share * 100) / 100);
}

function updateInterface() {
    const playerCount = parseInt(document.getElementById('playerCount').value, 10);
    const minPlayers = parseInt(document.getElementById('minPlayers').value, 10);
    const multiplier = parseFloat(document.getElementById('multiplier').value);
    const silver = parseInt(document.getElementById('silver').value);
    const silverDollarPrice = parseFloat(document.getElementById('silverDollarPrice').value);

    // Calculate tiers and populations
    let { tier, divisionsPopulation } = calculateTiersAndDivisions(playerCount, minPlayers);

    // Adjust the number of tiers if the last tier has no players
    if (divisionsPopulation[divisionsPopulation.length - 1] === minPlayers && playerCount <= (Math.pow(2, tier - 1) - 1) * minPlayers) {
        tier -= 1; // Remove the last tier
        divisionsPopulation.pop(); // Remove the last division since it's empty
    }

    // Calculate reward shares excluding the last and second-to-last tiers from rewards
    const rewardShares = calculateRewardShares(tier, multiplier);

    // Update the table body with new data
    const tableBody = document.querySelector("#resultsTable tbody");
    tableBody.innerHTML = "";

    let divisionIndex = 0;
    for (let t = 1; t <= tier; t++) {
        const numDivisionsInTier = Math.pow(2, t - 1);
        const divisionRewardShare = rewardShares[t - 1] / numDivisionsInTier;

        for (let d = 0; d < numDivisionsInTier; d++) {
            const playersInDivision = divisionsPopulation[divisionIndex];
            const divisionRewards = Math.round(silver * (divisionRewardShare / 100));
            const averageSilverPerPlayer = divisionRewards / playersInDivision;
            const averageDollarValuePerPlayer = averageSilverPerPlayer * silverDollarPrice;

            // Format numbers with thousands separator
            const formattedDivisionRewards = divisionRewards.toLocaleString();
            const formattedAverageSilverPerPlayer = averageSilverPerPlayer.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            const formattedAverageDollarValuePerPlayer = averageDollarValuePerPlayer.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

            let row = `<tr>
                <td>${t}</td>
                <td>${numDivisionsInTier}</td>
                <td>${playersInDivision}</td>
                <td>${playersInDivision}</td>
                <td>${playersInDivision * numDivisionsInTier}</td>
                <td>${rewardShares[t - 1].toFixed(2)}%</td>
                <td>${divisionRewardShare.toFixed(2)}%</td>
                <td>${formattedDivisionRewards}</td>
                <td>${formattedAverageSilverPerPlayer}</td>
                <td>${formattedAverageDollarValuePerPlayer}</td>
            </tr>`;

            tableBody.innerHTML += row;
            divisionIndex++;
        }
    }
}

document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('updateButton').addEventListener('click', updateInterface);
    // Perform initial update
    updateInterface();
});
