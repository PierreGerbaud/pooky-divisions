function calculateTiersAndDivisions(playerCount, minPlayers) {
    let tier = 1;
    let totalDivisions = 2; // Starting with 2 divisions in Tier 1
    let maxPlayersInCurrentTier = totalDivisions * minPlayers * 2;

    // Adjust tier and total divisions based on player count
    while (playerCount > maxPlayersInCurrentTier) {
        tier++;
        // From Tier 3 onwards, the divisions double with each tier
        totalDivisions = tier === 2 ? totalDivisions : totalDivisions * 2;
        maxPlayersInCurrentTier = totalDivisions * minPlayers * 2;
    }

    // Distribute players across divisions
    let divisionsPopulation = new Array(totalDivisions).fill(minPlayers);
    let excessPlayers = playerCount - (totalDivisions * minPlayers);

    let index = 0;
    while (excessPlayers > 0) {
        divisionsPopulation[index]++;
        excessPlayers--;
        index = (index + 1) % totalDivisions;
    }

    return { tier, divisionsPopulation };
}


function calculateRewardShares(tierCount) {
    let shares = new Array(tierCount).fill(0); // Initialize shares with zeros
    if (tierCount > 1) {
        shares[tierCount - 1] = 0; // Last tier (highest number) gets 0%
        shares[tierCount - 2] = 4; // Second-to-last tier gets 4%

        // Calculate the increment based on the remaining percentage and the remaining tiers to distribute it
        let remainingPercentage = 100 - 4; // Since the second-to-last tier gets 4%
        let tiersToDistribute = tierCount - 2; // Excluding the last tier and the second-to-last tier
        let increment = remainingPercentage / tiersToDistribute;

        // Assign reward shares in descending order
        for (let i = tierCount - 3; i >= 0; i--) {
            shares[i] = shares[i + 1] + increment;
        }
    } else if (tierCount === 1) {
        // If there's only one tier, it gets all the rewards
        shares[0] = 100;
    }
    // Return the shares as percentages
    return shares.map(share => parseFloat(share.toFixed(2)));
}


function updateInterface() {
    const playerCount = parseInt(document.getElementById('playerCount').value, 10);
    const minPlayers = parseInt(document.getElementById('minPlayers').value, 10);
    const { tier, divisionsPopulation } = calculateTiersAndDivisions(playerCount, minPlayers);
    const rewardShares = calculateRewardShares(tier); // Get reward shares for each tier

    const tableBody = document.querySelector("#resultsTable tbody");
    tableBody.innerHTML = ""; // Clear previous results

    let divisionStartIndex = 0;
    for (let t = 1; t <= tier; t++) {
        const numDivisionsInTier = t === 1 ? 2 : Math.pow(2, t - 2);
        const divisionEndIndex = divisionStartIndex + numDivisionsInTier;
        const minPlayersInTier = Math.min(...divisionsPopulation.slice(divisionStartIndex, divisionEndIndex));
        const maxPlayersInTier = Math.max(...divisionsPopulation.slice(divisionStartIndex, divisionEndIndex));
        const totalPlayersInTier = divisionsPopulation.slice(divisionStartIndex, divisionEndIndex).reduce((a, b) => a + b, 0);
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
