const pathParts = window.location.pathname.split('/');
const username = pathParts[2];
const radius = 50;
const elementsOnScreen = [];
const inventoryLeftEdge = document.getElementById('inventory-list').getBoundingClientRect().left;
const MAX_ELEMS_ON_SCREEN = 7;

let discovered = [];
let unlockedAchievements = [];
const allItems = {};
const allCombos = {};
const allAchievements = {};
let ingredientCounter = 0;
let musicStarted = false;
var activeLetter = "";
let settings = {};

var dropSound = document.getElementById('drop-sound');
var combineSound = document.getElementById('combined-sound');
var pickupSound = document.getElementById('pickup-sound');
var discoveredSound = document.getElementById('discovered-sound');


function generateIconName(itemName){
    return itemName.toLowerCase().replace(/ /g, '_');
}

class Ingredient {
    constructor(id, name, x, y) {
        this.id = id
        this.name = name;
        this.centerX = x;
        this.centerY = y;
        this.iconPath = generateIconName(this.name);

        this.item = new Image();
        this.item.title = name;
        this.item.src = `/static/icons/${this.iconPath}.png`;
        this.item.width = radius * 2;
        this.item.height = radius * 2;
        this.item.style.position = "absolute";
        this.item.style.zIndex = 1100;

        document.body.appendChild(this.item);
        this.item.style.top = y + "px" ;
        this.item.style.left = x + "px";
         
        elementsOnScreen.push(this);
        this.dragItem();
    }

    get x() { return this.centerX; }
    get y() { return this.centerY; }

    dragItem() {
        var mouseX, mouseY, pos1, pos2;
        if (document.getElementById(this.id)) {
            document.getElementById(this.id).onmousedown = dragDown;
        }
        else {
            this.item.onmousedown = dragDown;
            this._internalDragStart = dragDown;
        }
        const that = this;
        function dragDown(e) {
            e = e || window.event;
            e.preventDefault();

            mouseX = e.clientX;
            mouseY = e.clientY;

            document.onmouseup = stopDrag;
            document.onmousemove = dragElement;
        }

        function dragElement(e) {
            pos1 = mouseX - e.clientX;
            pos2 = mouseY - e.clientY;

            mouseX = e.clientX;
            mouseY = e.clientY;

            that.item.style.top = (that.item.offsetTop - pos2) + "px";
            that.item.style.left = (that.item.offsetLeft - pos1) + "px";

            that.centerY = parseInt(that.item.style.top.slice(0,-2));
            that.centerX = parseInt(that.item.style.left.slice(0,-2));

            document.getElementById("x").innerHTML = "x: " + that.centerX;
            document.getElementById("y").innerHTML = "y: " + that.centerY;
        }

        function stopDrag() {
            document.onmouseup = null;
            document.onmousemove = null;
            const collidedElement = checkCollision(that.centerX, that.centerY)
            if (collidedElement) {
                combine(that, collidedElement);
            }
            
            const itemRight = that.item.getBoundingClientRect().right;

            if (itemRight >= inventoryLeftEdge + radius / 2) {
                that.destroy();
                saveWorkspace();
            }
            saveWorkspace();
            drop.play();
        }

        function checkCollision(x, y) {
            for (let i = 0; i < elementsOnScreen.length; i++) {
                const item = elementsOnScreen[i];
                let distance = Math.sqrt((x - item.x) ** 2 + (y - item.y) ** 2);
                if (distance > 0 && distance <= radius) {
                    console.log(that.name, "| collision detected with", item.name);
                    return item;
                }
            }
            return null;
        }

        this.startDragFromInventory = function (e) {
            dragDown(e); // manually trigger drag
        };
    }

    destroy() {
        if (this.item && this.item.parentNode == document.body) {
            document.body.removeChild(this.item);
        }
        const index = elementsOnScreen.indexOf(this);
        if (index != -1) {
            elementsOnScreen.splice(index, 1);
        }
        saveWorkspace();
    }
}

function updateInventory(e) {
    e = e || window.event;

    const inventoryList = document.getElementById("inventory-list");
    inventoryList.innerHTML = '';
    discovered.forEach(itemId => {
        const itemData = allItems[itemId];
        if (!itemData) return; // item is missing from all items

        const list = document.createElement("li");
        list.textContent = itemData.itemName;
        list.style.cursor = "pointer";
        list.onmousedown = (e) => {
            // Limiting max items on screen, otherwise last in first out
            if (elementsOnScreen.length >= MAX_ELEMS_ON_SCREEN) {
                const first = elementsOnScreen.splice(0, 1)[0];
                first.destroy();
            }
            console.log("Creating item: ", itemId, ",", itemData.itemName, ",", e.clientX - radius, ",", e.clientY - radius)
            const created = new Ingredient(itemId, itemData.itemName, e.clientX - radius, e.clientY - radius);
            created.startDragFromInventory(e);
        };

        inventoryList.appendChild(list);
    });
}

async function combine(elementOne, elementTwo) {
    parentIds = [elementOne.id, elementTwo.id]
    comboExists = false;
    resultElemId = "";
    const keys = Object.keys(allItems);
    for (const allItemsIndex in keys) {
        resItemId = keys[allItemsIndex]
        currParents = allItems[resItemId].parents;
        if(currParents.length > 0) {
            for(let i = 0; i < currParents.length; i++){
                if(currParents[i].length < 2) continue;
                if((currParents[i][0] == parentIds[0] && currParents[i][1] == parentIds[1]) || (currParents[i][1] == parentIds[0] && currParents[i][0] == parentIds[1])){
                    comboExists = true;
                    resultElemId = resItemId;
                    break;
                }
            }
        }
        if(comboExists) break;
    }

    if(comboExists){
        let newElement = !discovered.includes(resultElemId)
        if(newElement) {
            discovered.push(resultElemId);
            await addToDiscovered(discovered);
            // checkAchievements(newIngredient);
            discoveredSound.play();
        }else{
            sound.play();
        }
        const newIngredient = new Ingredient(resultElemId, allItems[resultElemId].itemName, elementTwo.x, elementTwo.y);
        if(newElement) checkAchievements(newIngredient);
        elementOne.destroy();
        elementTwo.destroy();
        updateDiscoveryCounter();
        updateInventory();
        saveWorkspace();
        return resultElemId;
    }
}

async function addToDiscovered(discovered){
    const data = {
        discovered: discovered
    }
    const request = await fetch(`/game/${username}/addToDiscovered`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    const response = await request.json();
    console.log("Response addToDiscovered: ", response)
    console.log("New discovered list in DB: ", getDiscoveredData())
}

async function getDiscoveredData(){
    let newDiscovered = "";
    await fetch(`/game/${username}/getDiscoveredData`)
    .then(response => response.json())
    .then(data => {
        console.log(data);
        newDiscovered = data; // discovered will just be a list of ids. data enriching can be done by crossref with allitems
    });
    return newDiscovered;
}

async function loadAllDiscovered(){
    discovered = await getDiscoveredData();
    updateDiscoveryCounter();
    updateInventory();
}

async function loadWorkspace(){
    let newWorkspace = [];
    await fetch(`/game/${username}/getWorkspace`)
    .then(response => response.json())
    .then(data => {
        console.log(data);
        newWorkspace = data;

        for(let i = 0; i < newWorkspace.length; i++){
            const id = newWorkspace[i][0];
            const centerX = newWorkspace[i][1];
            const centerY = newWorkspace[i][2];
            const itemName = allItems[id].itemName;
            const newIng = new Ingredient(id, itemName, centerX, centerY);
            elementsOnScreen.push(newIng);
        }
    });
}

async function saveWorkspace(){
    let workspace = []
    for(let i = 0; i < elementsOnScreen.length; i++){
        const currIng = elementsOnScreen[i];
        const newWorkspaceElem = [currIng.id, currIng.centerX, currIng.centerY];
        workspace.push(newWorkspaceElem)
    }

    const data = {
        "workspace":workspace
    }
    console.log("saveWorkspace data: ", data)

    const request = await fetch(`/game/${username}/saveWorkspace`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    const response = await request.json();
    console.log("Response saveWorkspace: ", response)
}

async function loadAchievements(){
    let newAchievements = "";
    await fetch(`/game/${username}/getAchievements`)
    .then(response => response.json())
    .then(data => {
        console.log(data);
        newAchievements = data;
    });
    unlockedAchievements = newAchievements;
    displayAchievements();

}

async function saveAchievements(){
    const data = {
        achievements: unlockedAchievements
    }
    const request = await fetch(`/game/${username}/saveAchievements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    const response = await request.json();
    console.log("Response saveAchievements: ", response)
}

function clearScreen() {
    while (elementsOnScreen.length > 0) {
        elementsOnScreen[0].destroy();
    }
    saveWorkspace();
}

function displayAchievements(){
    for(let i = 0; i < unlockedAchievements.length; i++){
        console.log("Unlocked Achievement: ", allAchievements[unlockedAchievements[i]].name);
    }
}

function checkAchievements(newIngredient){
    const keys = Object.keys(allAchievements);
    for (const allAchievementIndex in keys) {
        if(!unlockedAchievements.includes(keys[allAchievementIndex])){
            if (allAchievements[keys[allAchievementIndex]].type == "count"){
                const countRequired = allAchievements[keys[allAchievementIndex]].unlockCondition;
                const discoveredLength = Object.keys(discovered).length;
                if (discoveredLength == countRequired){
                    unlockedAchievements.push(keys[allAchievementIndex]);
                    saveAchievements();
                    showAchievementBanner(allAchievements[keys[allAchievementIndex]].name, allAchievements[keys[allAchievementIndex]].description);
                }
            }
            else if (allAchievements[keys[allAchievementIndex]].type == "discover"){
                const itemId = allAchievements[keys[allAchievementIndex]].unlockCondition;
                if (newIngredient.id == itemId){
                    unlockedAchievements.push(keys[allAchievementIndex]);
                    saveAchievements();
                    showAchievementBanner(allAchievements[keys[allAchievementIndex]].name, allAchievements[keys[allAchievementIndex]].description);

                }
            }
        }
    }
    displayAchievements();
}

function updateDiscoveryCounter() {
    const counter = document.getElementById("discovery-counter");
    counter.textContent = `Discovered: ${discovered.length} / ${Object.keys(allItems).length}`;
}

document.getElementById("showAchievementsBtn").onclick = () => {
    const unlockedList = document.getElementById("unlockedAchievements");
    const lockedList = document.getElementById("lockedAchievements");
    unlockedList.innerHTML = "";
    lockedList.innerHTML = "";

    // Unlocked achievements
    for (let i = 0; i < unlockedAchievements.length; i++) {
        const unlockedAchievementId = unlockedAchievements[i];
        const unlockedAchievement = allAchievements[unlockedAchievementId];
        const li = document.createElement("li");    
        const name = document.createElement("strong");
        const desc = document.createElement("p");
        name.textContent = unlockedAchievement.name + "🏆";    
        desc.textContent = unlockedAchievement.description;
        desc.style.margin = "4px 0 10px 0";    
        li.appendChild(name);
        li.appendChild(desc);

        unlockedList.appendChild(li);
    }
    // Locked achievements
    const keys = Object.keys(allAchievements);
    for (let achievementId of keys) {
        let locked = true;
        if (unlockedAchievements.includes(achievementId)) {
            locked = false;
        }
        if (locked) {
            const lockedAchievement = allAchievements[achievementId];
            const li = document.createElement("li");    
            const name = document.createElement("strong");
            const desc = document.createElement("p");
            name.textContent = lockedAchievement.name;    
            desc.textContent = lockedAchievement.description;
            desc.style.margin = "4px 0 10px 0";    
            li.appendChild(name);
            li.appendChild(desc);

            lockedList.appendChild(li);
        }
    }

    document.getElementById("achievementsPopup").style.display = "flex";
};

document.getElementById("showSettingsBtn").onclick = () => {
    const settingsList = document.getElementById("settingsList");
    settingsList.innerHTML = "";

    settingNames = Object.keys(settings);
    for (let i = 0; i < settingNames.length; i++) {
        const settingName = settingNames[i];
        const li = document.createElement("li");    
        const name = document.createElement("strong");
        const checkbox = document.createElement("input")

        checkbox.type = "checkbox";
        checkbox.id = settingName;
        name.textContent = settingName;
        name.style.margin = "6px 0 10px 0"

        if (settings[settingName]) {
            checkbox.checked = true
        }

        li.appendChild(checkbox);
        li.appendChild(name);
        settingsList.appendChild(li);
    }

    document.getElementById("settingsPopup").style.display = "flex";
};

document.querySelector(".close-btn-achievements").onclick = () => {
    document.getElementById("achievementsPopup").style.display = "none";
};
document.querySelector(".close-btn-settings").onclick = () => {
    const nightModeElements = ["body", "inventory-panel"];
    const nightModeColors = ["#171319", "#201a24", "#5c4b65"];
    const lightModeColors = [""];
    const wasDark = settings["Night mode"];

    settings["Night mode"] = document.getElementById("Night mode").checked;
    settings["Mute music"] = document.getElementById("Mute music").checked;
    settings["Hide final elements from library"] = document.getElementById("Hide final elements from library").checked;
    settings["Turn off notifications"] = document.getElementById("Turn off notifications").checked;

    if(settings["Night mode"] && ! wasDark ){ //if night mode was switched on 
        for(let i = 0; i < nightModeElements.length; i ++) {
            let item = document.getElementById(nightModeElements[i]);
            item.style.backgroundColor = nightModeColors[i];
            item.classList.add("text-nightmode");
        }
        document.getElementById("discovery-counter").color = nightModeColors[2];
    }
     else if (!settings["Night mode"] && wasDark){
        for(let i = 0; i < nightModeElements.length; i ++) {
            let item = document.getElementById(nightModeElements[i]);
            item.style.backgroundColor = lightModeColors[i];
            item.classList.remove("counter-nightmode");
        }
    }

    if(settings["Mute music"]){
        
    } else {

    }

    if(settings["Hide final elements from library"]){
        
    } else {

    }

    if(settings["Turn off notifications"]){
        
    } else {
        
    }

    document.getElementById("settingsPopup").style.display = "none";
};

function showAchievementBanner(achievementName, achievementDescription) {
    const banner = document.getElementById("achievementBanner");
    const bannerText = document.getElementById("achievementBannerText");
    const closeBtn = document.getElementById("closeBannerBtn");
    bannerText.innerHTML = `<strong>${achievementName} 🏆</strong><br>${achievementDescription}`;
    banner.style.display = "block";
    closeBtn.onclick = function () {
        banner.style.display = "none";
    };
}

function startMusicOnMouseMove() {
    return;
    if (musicStarted) return;
    const music = document.getElementById('background-music');
    music.loop = true;
    music.play().then(() => {
        musicStarted = true;
        document.body.removeEventListener('mousemove', startMusicOnMouseMove);
    }).catch(err => {
        console.log("Autoplay blocked:", err);
    });

    window.addEventListener('blur', () => {
        const music = document.getElementById('background-music');
        if (!music.paused) {
            music.pause();
            console.log("Music paused on tab blur");
        }
    });

    window.addEventListener('focus', () => {
        const music = document.getElementById('background-music');
        if (musicStarted) {
            music.play().catch(err => {
                console.log("Autoplay blocked on focus:", err);
            });
        }
    })
}

function filterInventoryByLetter(letter, button) {
    const items = document.querySelectorAll("#inventory-list li");
    items.forEach(item => {
        if (letter == activeLetter) {
            item.style.display = "";
        } else {
            if (item.textContent[0] == (letter)) {
                // Unhides an item displayed
                item.style.display = "";
            } else {
                item.style.display = "none";
            }
        }
    });
    if (activeLetter == letter){
        activeLetter = "";
    } else{
        activeLetter = letter;
    }
};

document.addEventListener("DOMContentLoaded", async function () {
    // Load allItems from JSON file
    const responseItems = await fetch("/static/data/items.json");
    const itemData = await responseItems.json();
    Object.assign(allItems, itemData); // fill allItems from the file

    const responseAchievement = await fetch("/static/data/achievements.json");
    const achievementData = await responseAchievement.json();
    Object.assign(allAchievements, achievementData); // fill allAchievement from the file

    settings = {
        "Night mode":false,
        "Mute music":false,
        "Hide final elements from library":false,
        "Turn off notifications":false
    }
    
    document.addEventListener('mousemove', startMusicOnMouseMove);
    loadAllDiscovered();
    updateInventory();
    loadWorkspace();
    loadAchievements();
    displayAchievements();
    updateDiscoveryCounter();

    const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
    const letterButtons = document.getElementById("letter-buttons");
    letters.forEach(letter => {
        const button = document.createElement("button");
        button.textContent = letter;
        button.onclick = () => filterInventoryByLetter(letter);
        letterButtons.appendChild(button);
    });
});