const pathParts = window.location.pathname.split('/');
const username = pathParts[2];
const radius = 50;
const elementsOnScreen = [];

const discovered = {};
const allItems = {};
const allCombos = {};
let ingredientCounter = 0;

class Ingredient {
    constructor(id, name, x, y) {
        this.id = id

        this.name = name;

        
        this.centerX = x;
        this.centerY = y;

        //this.DomId = "a" + ingredientCounter++;

        this.item = new Image();
        this.item.alt = name;
        this.item.src = this.image;
        //this.item.id = this.DomId;
        this.item.width = radius * 2;
        this.item.height = radius * 2;
        this.item.style.position = "absolute";
        this.item.style.border= "1px solid black";
        this.item.style.zIndex = 1100;

        document.body.appendChild(this.item);
        console.log(x);
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
            //console.log("center coordinates: x: " + that.centerX + " y: " + that.centerY);
            const collidedElement = checkCollision(that.centerX, that.centerY)
            if (collidedElement) {
                combine(that, collidedElement);
            }
            const invListLeftEdge = document.getElementById('inventory-list').getBoundingClientRect().left
            
            if(that.centerX + radius / 4 >= invListLeftEdge){
                that.destroy();
            }
        }

        function checkCollision(x, y) {
            for (let i = 0; i < elementsOnScreen.length; i++) {
                const item = elementsOnScreen[i];
                let distance = Math.sqrt((x - item.x) ** 2 + (y - item.y) ** 2);
                if (distance > 0 && distance <= radius) {
                    console.log("collision with");
                    return item;
                }
            }
            return null;
        }
    }

    destroy() {
        if (this.item && this.item.parentNode == document.body) {
            document.body.removeChild(this.item);
        }
        const index = elementsOnScreen.indexOf(this);
        if (index != -1) {
            elementsOnScreen.splice(index, 1);
        }
    }
}

function updateInventory(e) {
    e = e || window.event;

    const inventoryList = document.getElementById("inventory-list");
    inventoryList.innerHTML = '';
    Object.keys(discovered).forEach(itemId => {
        const itemData = discovered[itemId];
        const list = document.createElement("li");
        list.textContent = itemData.itemName;
        list.style.cursor = "pointer";
        list.onclick = (e) => {
            // Limiting to a max of 5 items on screen, otherwise last in first out
            if (elementsOnScreen.length >= 5) {
                const first = elementsOnScreen.splice(0, 1)[0];
                first.destroy();
            }
            const created = new Ingredient(itemId, itemData.itemName, e.clientX - radius, e.clientY - radius);
            
        };

        inventoryList.appendChild(list);
    });
}

async function combine(elementOne, elementTwo) {
    var combinedID;
    if (parseInt(elementOne.id) < parseInt(elementTwo.id)) {
        combinedID = elementOne.id + "," + elementTwo.id;
    }
    else { 
        combinedID = elementTwo.id + "," + elementOne.id;
    }

    console.log (combinedID);
    let index = Object.keys(allCombos).indexOf(combinedID);
    if (index !== -1) {
        
        itemId = allCombos[combinedID];

        if (!discovered[itemId]) {
            console.log(discovered);
            discovered[itemId] = allItems[itemId];
            await addToDiscovered(itemId, allItems[itemId].itemName);
        }

        const newIngredient = new Ingredient(itemId, allItems[itemId].itemName, elementTwo.x, elementTwo.y);
        //const newIngredient = new Ingredient(itemId, allItems[itemId].itemName, allItems[itemId].itemIcon, 272, 768);

        //elementsOnScreen.push(newIngredient);
        elementOne.destroy();
        elementTwo.destroy();
        updateInventory();
        return itemId;
    }

    /*for (const itemId of Object.keys(allItems)){
        const itemData = allItems[itemId];
        const combinations = itemData.parents;
        if (Array.isArray(combinations)){
            for (const combination of combinations) {
                // Check if we can combine elements to create it's parent element
                if ((combination[0] == elementOne.id && combination[1] == elementTwo.id) || (combination[0] == elementTwo.id && combination[1] == elementOne.id)) {
                    // Since it can be combined, check if the element is what we already found.  If not add it to the discovered list.
                    if (!discovered[itemId]) {
                        discovered[itemId] = allItems[itemId];
                        await addToDiscovered(itemId, allItems[itemId].itemName);
                    }
                    const newIngredient = new Ingredient(itemId, itemData.itemName, itemData.itemIcon, elementOne.x, elementOne.x);
                    elementsOnScreen.push(newIngredient);
                    elementOne.destroy();
                    elementTwo.destroy();
                    updateInventory();
                    return itemId;
                }
            }
        }
    };*/
}

async function addToDiscovered(discovered){
    const data = discovered;
    const request = await fetch(`/game/${username}/addToDiscovered`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    const response = await request.json();
}

async function loadAllDiscovered(){
    await fetch(`/game/${username}/getDiscoveredData`)
    .then(response => response.json())
    .then(data => {
        console.log(data);
        for (let item in data){
            console.log(data[itemId]);
            discovered[itemId] = data[item];
        }
        updateInventory();
    });
}

function clearScreen() {
    while (elementsOnScreen.length > 0) {
        elementsOnScreen[0].destroy();
    }
}

document.addEventListener("DOMContentLoaded", function () {
    discovered["001"] = {
        "itemName": "Flour",
        "parents": [],
        "isFinal": false,
        "itemIcon": "Flour.png"
    };
    discovered["002"] = {
        "itemName": "Water",
        "parents": [],
        "isFinal": false,
        "itemIcon": "Water.png"
    };
    discovered["003"] = {
        "itemName": "Milk",
        "parents": [],
        "isFinal": false,
        "itemIcon": "Milk.png"
    };
    allItems["001"] = {
        "itemName": "Flour",
        "parents": [],
        "isFinal": false,
        "itemIcon": "Flour.png"
    };
    allItems["002"] = {
        "itemName": "Water",
        "parents": [],
        "isFinal": false,
        "itemIcon": "Water.png"
    }; 
    allItems["003"] = {
        "itemName": "Milk",
        "parents": [],
        "isFinal": false,
        "itemIcon": "Milk.png"
    };
    allItems["004"] = {
        "itemName": "Bread",
        "parents": [
            [
                "001",
                "002"
            ]
        ],
        "isFinal": false,
        "itemIcon": "Bread.png"
    };
    allItems["005"] = {
        "itemName": "Dough",
        "parents": [
          [
            "001",
            "003"
          ]
        ],
        "isFinal": false,
        "itemIcon": "Dough.png"
      }

    for (const item of Object.keys(allItems)) {
        for (let i = 0; i < allItems[item]["parents"].length; i ++){
            allCombos[allItems[item]["parents"][i]]= item;
        }
    }
    console.log(discovered);

    updateInventory();
    loadAllDiscovered();
});