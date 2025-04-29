

class Ingredient{
    constructor(itemNum, image, x, y){
        this.itemNum = itemNum;

        this.x = x;
        this.y = y;
        this.id = "im1";

        this.item = new Image();
        
        this.item.src = "C:/Users/5325n/OneDrive/Documents/CSE 108 Labs/FinalProject/static/fire-pixel-art-bonfire-pixelated-260nw-2309263493.webp";
        this.item.id = this.id;
        this.item.style.position = "absolute";
        document.body.appendChild(this.item);

        this.dragItem();
        
        
    }

    get xPos() {
        return this.x;
    }

    get yPos() {
        return this.y;
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

        }

        function stopDrag() {
            document.onmouseup = null;
            document.onmousemove = null;
        }


    }

}

document.addEventListener("DOMContentLoaded", function () {
    const fire = new Ingredient(0, "a", 0, 0);
});