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

    let divisionStartIndex = 0;
    for (let t = 1; t <= tier; t++) {
        const numDivisionsInTier = t === 1 ? 2 : Math.pow(2, t - 2);
        const divisionEndIndex = divisionStartIndex + numDivisionsInTier;
        const minPlayersInTier = Math.min(...divisionsPopulation.slice(divisionStartIndex, divisionEndIndex));
        const maxPlayersInTier = Math.max(...divisionsPopulation.slice(divisionStartIndex, divisionEndIndex));

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
}

document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('updateButton').addEventListener('click', updateInterface);
    updateInterface(); 
});