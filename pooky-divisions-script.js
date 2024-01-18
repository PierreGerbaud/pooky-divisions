function calculateTiersAndDivisions(playerCount, minPlayers) {
    let tier = 0;
    let maxPlayersInCurrentTier = 0;
    let divisionsPopulation = [];

    // Calculate the number of tiers based on player count and minimum players
    while (maxPlayersInCurrentTier < playerCount) {
        tier++;
        let divisionsInThisTier = Math.pow(2, tier - 1);
        maxPlayersInCurrentTier += divisionsInThisTier * minPlayers;
        divisionsPopulation = divisionsPopulation.concat(new Array(divisionsInThisTier).fill(minPlayers));
    }

    // Distribute any remaining players starting from the lower tier
    let playersToDistribute = playerCount - (maxPlayersInCurrentTier - Math.pow(2, tier - 1) * minPlayers);
    for (let i = divisionsPopulation.length - 1; i >= 0 && playersToDistribute > 0; i--) {
        divisionsPopulation[i]++;
        playersToDistribute--;
    }

    // If last tier has no players, remove it
    if (playersToDistribute < 0) {
        divisionsPopulation.splice(-Math.pow(2, tier - 1));
        tier--;
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
    const { tier, divisionsPopulation } = calculateTiersAndDivisions(playerCount, minPlayers);
    const rewardShares = calculateRewardShares(tier, multiplier);
    const tableBody = document.querySelector("#resultsTable tbody");
    tableBody.innerHTML = ""; // Clear previous results

    for (let t = 1; t <= tier; t++) {
        const numDivisionsInTier = Math.pow(2, t - 1);
        const divisionStartIndex = numDivisionsInTier - 2;
        const divisionEndIndex = divisionStartIndex + numDivisionsInTier;

        let totalPlayersInTier = divisionsPopulation.slice(divisionStartIndex, divisionEndIndex).reduce((a, b) => a + b, 0);
        const tierRewardShare = rewardShares[t - 1];
        const divisionRewardShare = tierRewardShare / numDivisionsInTier;

        let row = `<tr>
            <td>${t}</td>
            <td>${numDivisionsInTier}</td>
            <td>${Math.min(...divisionsPopulation.slice(divisionStartIndex, divisionEndIndex))}</td>
            <td>${Math.max(...divisionsPopulation.slice(divisionStartIndex, divisionEndIndex))}</td>
            <td>${totalPlayersInTier}</td>
            <td>${tierRewardShare.toFixed(2)}%</td>
            <td>${divisionRewardShare.toFixed(2)}%</td>
            <td></td> <!-- SILVER per division -->
            <td></td> <!-- Average SILVER per player -->
            <td></td> <!-- Average USD per player -->
        </tr>`;

        tableBody.innerHTML += row;
    }
}

document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('updateButton').addEventListener('click', updateInterface);
});