const radius = 50;
const allItems = [];

class Ingredient{
    constructor(itemNum, image, x, y){
        this.itemNum = itemNum;

        this.centerX = x;
        this.centerY = y;

        this.id = "a" + allItems.length;

        this.item = new Image(); //html image object
        
        //this.item.src = "{{ url_for('static', filename='img/fire-pixel-art-bonfire-pixelated-260nw-2309263493.webp') }}";
        this.item.src = "/static/img/fire-pixel-art-bonfire-pixelated-260nw-2309263493.webp";
        this.item.id = this.id;
        this.item.width = radius * 2;
        this.item.height = radius * 2;

        this.item.style.position = "absolute";
        document.body.appendChild(this.item);

        allItems[allItems.length] = this;
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
        if (document.getElementById(this.id)){
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

        function dragElement(e){
            pos1 = mouseX - e.clientX;
            pos2 = mouseY - e.clientY;
            

            mouseX = e.clientX;
            mouseY = e.clientY;

            that.item.style.top = (that.item.offsetTop - pos2) + "px";
            that.item.style.left = (that.item.offsetLeft - pos1) + "px";

            that.centerY = (that.item.offsetTop - pos2) + radius;
            that.centerX = (that.item.offsetLeft - pos1) + radius;

            document.getElementById("x").innerHTML = "x: " +  that.centerY;
            document.getElementById("y").innerHTML = "y: " +  that.centerX;

            checkCollision(that.centerX, that.centerY);

        }

        function stopDrag() {
            document.onmouseup = null;
            document.onmousemove = null;
        }

        function checkCollision(x, y) {
            for (let i = 0; i < allItems.length; i ++) {
                let distance = Math.sqrt((x - allItems[i].x) ** 2 + (y - allItems[i].y) ** 2);
                if (distance > 0 && distance <= radius) {
                    console.log("collision!");
                }
                
            }
            return (null);
        }


    }

}

document.addEventListener("DOMContentLoaded", function () {
    const fire = new Ingredient(0, "a", 0, 0);
    const water = new Ingredient(0, "b" , 0, 0);
});