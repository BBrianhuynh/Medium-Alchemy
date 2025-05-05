const radius = 50;
const elementsOnScreen = [];
const discovered = {};
const allItems = {};

class Ingredient {
    constructor(id,itemNum, name, image, x, y) {
        this.id = id;
        this.itemNum = itemNum;
        this.name = name;
        this.image = image;
        
        this.centerX = x;
        this.centerY = y;

        this.DomId = "a" + allItems.length;

        this.item = new Image();
        this.item.src = this.image;
        this.item.id = this.DomId;
        this.item.width = radius * 2;
        this.item.height = radius * 2;
        
        this.item.style.position = "absolute";
        document.body.appendChild(this.item);

        allItems[id]= this;
        elementsOnScreen.push(this);
        this.dragItem();
    }

    get x() {
        return this.centerX;
    }

    get y() {
        return this.centerY;
    }

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

            that.centerY = that.item.offsetTop;
            that.centerX = that.item.offsetLeft;

            document.getElementById("x").innerHTML = "x: " + that.centerY;
            document.getElementById("y").innerHTML = "y: " + that.centerX;
        }

        function stopDrag() {
            document.onmouseup = null;
            document.onmousemove = null;
            const collidedElementId = checkCollision(that.centerX, that.centerY)
            if (collidedElementId) {
                combine(that.id, collidedElementId);
            }
        }

        function checkCollision(x, y) {
            for (let i = 0; i < elementsOnScreen.length; i++) {
                const item = elementsOnScreen[i];
                let distance = Math.sqrt((x - item.x) ** 2 + (y - item.y) ** 2);
                if (distance > 0 && distance <= radius) {
                    console.log("collision with:", item.id);
                    return item.id;
                }
            }
            return null;
        }
    }

    destroy() {
        document.body.removeChild(this.item);
        const index = elementsOnScreen.indexOf(this);
        if (index != -1) {
            elementsOnScreen.splice(index, 1);
        }
    }

}

function updateInventory() {
    const inventoryList = document.getElementById("inventory-list");
    inventoryList.innerHTML = "";
    Object.keys(discovered).forEach(itemId => {
        const itemData = discovered[itemId];
        const list = document.createElement("li");
        list.textContent = itemData.itemName;
        list.style.cursor = "pointer";
        list.onclick = (e) => {
            // Limiting to a max of 5 items on screen, otherwise last in first out
            if (elementsOnScreen.length >= 5*2) {
                const first = elementsOnScreen.splice(0, 1)[0];
                first.destroy();
            }            console.log(elementsOnScreen[0]);

            new Ingredient(itemId, itemData.itemName, itemData.imageIcon, e.clientX, e.clientY);
        };

        inventoryList.appendChild(list);
    });
}

function combine(elementOneId, elementTwoId) {
    Object.keys(allItems).forEach(itemId =>{
        const itemData = allItems[itemId];
        const combinations = itemData.parents;
        if (Array.isArray(combinations)){
            for (const combination of combinations) {
                // Check if we can combine elements to create it's parent element
                if ((combination[0] == elementOneId && combination[1] == elementTwoId) || (combination[0] == elementTwoId && combination[1] == elementOneId)) {
                    // Since it can be combined, check if the element is what we already found.  If not add it to the discovered list.
                    Object.keys(discovered).forEach(discoveredItemId => {
                        if (discoveredItemId == itemId){
                            return itemId;
                        }
                    })
                    discovered[itemId] = allItems[itemId];
                    const loc = {"x": elementOneId.x, "y": elementOneId.y};
                    const newIngredient = new Ingredient(itemId, itemData.itemName, itemData.itemIcon, loc["x"], loc["y"]);
                    elementsOnScreen.push(newIngredient);
                    elementsOnScreen.find(item => item.id == elementOneId).destroy();
                    elementsOnScreen.find(item => item.id == elementTwoId).destroy();
                    updateInventory();
                    return itemId;
                }
            }
        }
    });
}

function clearScreen() {
    elementsOnScreen.forEach(item => item.destroy());
    elementsOnScreen.length = 0;
    
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
    }; discovered["003"] = {
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

    updateInventory();
});