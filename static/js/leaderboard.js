document.getElementById("showLeaderboardBtn").onclick = async function() {
    const leaderTable = document.getElementById("leaderboardList");
    leaderTable.innerHTML = "";
    var headerRow = leaderTable.insertRow(0);
    headerRow.innerHTML = "<th>Rank</th><th>Username</th><th>Score</th>";

    data = await loadLeaderboard();
    console.log(data);
    
    for(let i = 0; i < data.length; i ++){
        var newRow = leaderTable.insertRow(1);
        var cell1 = newRow.insertCell(0);
        var cell2 = newRow.insertCell(1);
        var cell3 = newRow.insertCell(2)

        cell1.innerHTML = data.length - i;
        cell2.innerHTML = data[i][0];
        cell3.innerHTML = data[i][1];
    }

    document.getElementById("leaderboardPopup").style.display = "flex";

};

async function loadLeaderboard() {
    let leaderData = "";
    await fetch(`/getLeaderboardRecords`)
    .then(response => response.json())
    .then(data => {
        leaderData = data;
    });
    return leaderData;
}

document.querySelector(".close-btn-leaderboard").onclick = () => {
    document.getElementById("leaderboardPopup").style.display = "none";
};