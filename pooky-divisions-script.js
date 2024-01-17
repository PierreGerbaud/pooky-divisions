function calculateTiersAndDivisions(playerCount, minPlayers) {
    let tier = 1;
    let totalDivisions = 2; // Starting with 2 divisions in Tier 1

    // Adjust tier and total divisions based on player count
    while (true) {
        let maxPlayersInCurrentTier = totalDivisions * minPlayers * 2;
        if (playerCount <= maxPlayersInCurrentTier) break;

        tier++;
        totalDivisions = tier === 2 ? 4 : totalDivisions * 2; // Tier 2 has 4 divisions, doubling for each subsequent tier
    }

    // Distribute players across divisions
    let divisionsPopulation = new Array(totalDivisions).fill(minPlayers);
    let excessPlayers = playerCount - (totalDivisions * minPlayers);

    let index = 0;
    while (excessPlayers > 0) {
        if (divisionsPopulation[index] < minPlayers * 2) {
            divisionsPopulation[index]++;
            excessPlayers--;
        }
        index = (index + 1) % totalDivisions; // Loop back to the first division
    }

    return { tier, divisionsPopulation };
}

function updateInterface() {
    const playerCount = parseInt(document.getElementById('playerCount').value, 10);
    const minPlayers = parseInt(document.getElementById('minPlayers').value, 10);
    const { tier, divisionsPopulation } = calculateTiersAndDivisions(playerCount, minPlayers);

    const tableBody = document.querySelector("#resultsTable tbody");
    tableBody.innerHTML = ""; // Clear previous results

    if (playerCount >= minPlayers * 2) {
        let divisionStartIndex = 0;
        for (let t = 1; t <= tier; t++) {
            const numDivisionsInTier = t === 1 ? 2 : Math.pow(2, t - 2);
            const minPlayersInTier = divisionsPopulation.slice(divisionStartIndex, divisionStartIndex + numDivisionsInTier).reduce((a, b) => a + b, 0);
            const maxPlayersInTier = minPlayersInTier + numDivisionsInTier; // Assuming the difference is at most 1

            let row = `<tr>
                <td>${t}</td>
                <td>${numDivisionsInTier}</td>
                <td>${minPlayersInTier}</td>
                <td>${maxPlayersInTier}</td>
                <td></td> <!-- Tier Share of Rewards -->
                <td></td> <!-- Division Share of Rewards -->
                <td></td> <!-- Division Rewards ($SILVER) -->
            </tr>`;

            tableBody.innerHTML += row;
            divisionStartIndex += numDivisionsInTier;
        }
    } else {
        tableBody.innerHTML = `<tr><td colspan="7">Not enough players to start the game. Minimum required: ${minPlayers * 2}</td></tr>`;
    }
}

document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('updateButton').addEventListener('click', updateInterface);
});
