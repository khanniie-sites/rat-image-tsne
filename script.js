function readTextFile(file)
{
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                var allText = rawFile.responseText;
                CSVToArray(allText, ",");
            }
        }
    }
    rawFile.send(null);
}

function CSVToArray( strData, strDelimiter ){
    strDelimiter = (strDelimiter || ",");
    var objPattern = new RegExp(
        (
            // Delimiters.
            "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

            // Quoted fields.
            "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

            // Standard fields.
            "([^\"\\" + strDelimiter + "\\r\\n]*))"
        ),
        "gi"
        );
    var arrData = [[]];
    var arrMatches = null;
    while (arrMatches = objPattern.exec( strData )){
        var strMatchedDelimiter = arrMatches[ 1 ];
        if (
            strMatchedDelimiter.length &&
            strMatchedDelimiter !== strDelimiter
            ){
            arrData.push( [] );
        }
        var strMatchedValue;
        if (arrMatches[ 2 ]){
            strMatchedValue = arrMatches[ 2 ].replace(
                new RegExp( "\"\"", "g" ),
                "\""
                );
        } else {
            strMatchedValue = arrMatches[ 3 ];
        }
        arrData[ arrData.length - 1 ].push( strMatchedValue );
    }

    // Return the parsed data.
    setup( arrData );
}

window.onload = function (e) {readTextFile("tsne_data_labels2.csv")}
let rat_images = []
let loaded = 0;
let border = 10;
let img_wid = 240;

var bigCanvas;
var smallCanvas;
let ctx2;
let ctx3;

let colorMapping = {"night": "#BBBBBB", "pizza": "#BB4733", "outdoors": "#558888", "indoors": "#FF7788", "subway": "#EEEE33", "union": "#4444FF", "art": "#FF33FF", "man":"#115577", "trash": "#000033", "nature":"#33FF44"}
let textMapping = {"night": ["Rats at Night", "Lorum ipsum"], 
                    "pizza": ["Rats love food!", "Lorum ipsum"], 
                    "outdoors": ["Rats out in the streets", "Lorum ipsum"], 
                    "indoors": ["Rats found indoors", "Lorum ipsum"], 
                    "subway": ["Rats in the subway!", "Lorum ipsum"], 
                    "union": ["Union rats", "Lorum ipsum"], 
                    "art": ["Rats, immortalized as art", "Lorum ipsum"], 
                    "man": ["Man's best friend?", "Lorum ipsum"], 
                    "trash": ["Rats live on trash", "Lorum ipsum"], 
                    "nature": ["Rats also like nature!", "Lorum ipsum"]}
let categories = ["night", "pizza", "outdoors", "indoors", "subway", "union", "art", "man", "trash", "nature"]
let tsne_preloaded = []

function setup(img_data){
    bigCanvas = document.getElementById("can");
    smallCanvas = document.getElementById("grid-canvas");
    ctx2 = bigCanvas.getContext("2d");
    ctx3 = smallCanvas.getContext("2d");

    for(let i = 0; i < img_data.length; i++){
        image = new Image();
        image.onload = function() {
            if(loaded == img_data.length - 1){

                rat_images 
                drawCanvas();
                draw();
            } else {
               loaded++; 
           }
        }
        // Load the sprite sheet from an image file
        image.src = '/' + img_data[i][0];
        rat_images.push([image, img_data[i][1], img_data[i][2], img_data[i][3], false])
    }
    
}


var canvas;
var ctx;
var widthCanvas;
var heightCanvas;

// View parameters
var xleftView = 0;
var ytopView = 0;
var widthViewOriginal = 1.0;           //actual width and height of zoomed and panned display
var heightViewOriginal = 1.0;
var widthView = widthViewOriginal;           //actual width and height of zoomed and panned display
var heightView = heightViewOriginal;

var detailView = false;

window.addEventListener("load",setup2,false);

var title;
var description;
var infoBox;

var dTitle = "New York's best wildlife: rats?"
var dDes = "Drag to pan, Scroll or double-click to zoom."

function setup2() {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");

    widthCanvas = canvas.width;
    heightCanvas = canvas.height;

    title = document.getElementById("title")
    description = document.getElementById("description")
    infoBox = document.getElementById("info")

    title.innerHTML = dTitle;
    description.innerHTML = dDes;

    canvas.addEventListener("dblclick", handleDblClick, false);  // dblclick to zoom in at point, shift dblclick to zoom out.
    canvas.addEventListener("click", handleClick, false); 
    canvas.addEventListener("mousedown", handleMouseDown, false); // click and hold to pan
    canvas.addEventListener("mousemove", handleMouseMove, false);
    canvas.addEventListener("mouseup", handleMouseUp, false);
    canvas.addEventListener("mousewheel", handleMouseWheel, false); // mousewheel duplicates dblclick function
    canvas.addEventListener("DOMMouseScroll", handleMouseWheel, false); // for Firefox
}

function drawCanvas(){
    ctx2.clearRect(0, 0, bigCanvas.width, bigCanvas.height);

    for(let j = 0; j < rat_images.length; j++){
        img = rat_images[j][0];
        ctx2.beginPath();
        let x = rat_images[j][1] * (bigCanvas.width )
        let y = rat_images[j][2] * (bigCanvas.height )
        if(rat_images[j][4]){
            border2 = 20
            ctx2.rect(x - border2, y - border2, img_wid + border2 * 2, img.height/img.width * img_wid + border2 * 2);
        } else {
            ctx2.rect(x - border, y - border, img_wid + border * 2, img.height/img.width * img_wid + border * 2);
        }
        
        ctx2.fillStyle = colorMapping[rat_images[j][3]];
        ctx2.fill();
        ctx2.drawImage(img, x, y, img_wid, img.height/img.width * img_wid);
        if(!rat_images[j][4]){
            ctx2.rect(x - border, y - border, img_wid + border * 2, img.height/img.width * img_wid + border * 2);
            ctx2.fillStyle = "#FFFFFFAA";
            ctx2.fill();
        }
    }
    rat_images.map((r) => r[4] = false)
}

function drawGrid(elements){
    ctx3.clearRect(0, 0, smallCanvas.width, smallCanvas.height);
    let eleGrid = []
    let eleCopy = elements.slice()
    let numElements = elements.length
    let width = Math.floor(Math.sqrt(numElements))
    let pixelWidth = smallCanvas.width / width;
    let pixelHeight = smallCanvas.height / width;
    let xCounter = 0;
    let yCounter = 0;
    while(eleCopy.length > 0){
        let ele = eleCopy.pop();
        eleGrid.push([ele[0], xCounter * pixelWidth, yCounter * pixelHeight])
        xCounter++;
        if(xCounter == width){
            xCounter = 0;
            yCounter++;
        }
    }
    console.log("drawing grid loop")
    gridDrawLoop(elements, eleGrid, 0, pixelWidth, pixelHeight)

}

function gridDrawLoop(original_pos, new_pos, progress, pixelWidth, pixelHeight){
    //ctx3.clearRect(0, 0, smallCanvas.width, smallCanvas.height);
    for(let i = 0; i < new_pos.length; i++){
        let img = new_pos[i]
        let rW = img[0].width
        let rH = img[0].height
        let scaleW; let scaleH;
        if(rW > rH){
            scaleW = rH * (pixelWidth / pixelHeight);
            scaleH = rH;
        } else {
            scaleW = rW;
            scaleH = rW * (pixelHeight / pixelWidth);
        }
        let o_x = parseFloat(original_pos[i][1] * smallCanvas.width)
        let o_y = parseFloat(original_pos[i][2] * smallCanvas.height)
        let calcX = o_x + progress * (parseFloat(img[1]) - o_x)
        let calcY = o_y + progress * (parseFloat(img[2]) - o_y)

        let img_hei = rH/rW * img_wid

        //console.log(img_hei, img_wid, progress, pixelWidth, pixelHeight)

        let calcScaleX = img_wid + progress * (pixelWidth - img_wid)
        let calcScaleY = img_hei + progress * (pixelHeight - img_wid)

        console.log(progress)

        ctx3.drawImage(img[0], 0, 0, scaleW, scaleH, calcX, calcY, calcScaleX, calcScaleY);
    }

    //draw()

    // if(progress < 1){
    //     console.log("calling grid loop with progress " + (progress + 0.05))
    //     setInterval(() => gridDrawLoop(original_pos, new_pos, progress + 0.05, pixelWidth, pixelHeight), 1000)
    // }
}

function draw() {
    console.log("draw", detailView)
    if(detailView){
        // ctx.clearRect(0, 0, canvas.width, canvas.height);
        // ctx.drawImage(smallCanvas, 0, 0, 1, 1);
    } else {
        ctx.setTransform(1,0,0,1,0,0);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.scale(widthCanvas/widthView, heightCanvas/heightView);
    ctx.translate(-xleftView,-ytopView);

    ctx.drawImage(bigCanvas, 0, 0, 1, 1);
    }

    
}

function handleDblClick(event) {

    var X = event.clientX - this.offsetLeft - this.clientLeft + this.scrollLeft - document.documentElement.scrollLeft; //Canvas coordinates
    var Y = event.clientY - this.offsetTop - this.clientTop + this.scrollTop - document.documentElement.scrollTop;
    var x = X/widthCanvas * widthView + xleftView;  // View coordinates
    var y = Y/heightCanvas * heightView + ytopView;

    var scale = event.shiftKey == 1 ? 1.5 : 0.5; // shrink (1.5) if shift key pressed
    widthView *= scale;
    heightView *= scale;

    if (widthView > widthViewOriginal || heightView > heightViewOriginal) {
        widthView = widthViewOriginal;
        heightView = heightViewOriginal;
        x = widthView/2;
        y = heightView/2;
    }

    xleftView = x - widthView/2;
    ytopView = y - heightView/2;

    draw();
}

var mouseDown = false;

function handleMouseDown(event) {
    mouseDown = true;
}

function handleClick(event){

    console.log("click")
    detailView = !detailView;

    var X = event.clientX - this.offsetLeft - this.clientLeft + this.scrollLeft - document.documentElement.scrollLeft; //Canvas coordinates
    var Y = event.clientY - this.offsetTop - this.clientTop + this.scrollTop - document.documentElement.scrollTop;

    for(let i = 0; i < rat_images.length; i++){
        img = rat_images[i]
        real_img = img[0]
        imgX = parseFloat(img[1]) - xleftView;
        imgX2 = imgX + img_wid/bigCanvas.width
        imgY = parseFloat(img[2]) - ytopView;
        imgY2 = imgY + real_img.height/real_img.width * img_wid / bigCanvas.height;


        imgX = imgX / scaleX;
        imgX2 = imgX2 / scaleX;
        imgY = imgY / scaleY;
        imgY2 = imgY2 / scaleY;
        //console.log("searching", imgX, imgY, imgX2, imgY2, nX, nY)
        if(nX > imgX && nX < imgX2 && nY > imgY && nY < imgY2){
            let hit_category = rat_images[i][3]
            title.innerHTML = textMapping[hit_category][0]
            description.innerHTML = textMapping[hit_category][1]
            infoBox.style.borderLeft = "4px solid " + colorMapping[hit_category];
            drawGrid(rat_images.filter((r) => r[3] == hit_category))
            break;
        }
    }
}

function handleMouseUp(event) {
    mouseDown = false;
}

var lastX = 0;
var lastY = 0;
function handleMouseMove(event) {

    if(detailView) return;

    var X = event.clientX - this.offsetLeft - this.clientLeft + this.scrollLeft + document.documentElement.scrollLeft;
    var Y = event.clientY - this.offsetTop - this.clientTop + this.scrollTop + document.documentElement.scrollTop;

    console.log(document.documentElement.scrollTop)

    if (mouseDown) {
        var dx = (X - lastX) / widthCanvas * widthView;
        var dy = (Y - lastY)/ heightCanvas * heightView;
        xleftView -= dx;
        ytopView -= dy;

    } else {
        
        nX = X/widthCanvas;
        nY = Y/heightCanvas;

        scaleX = widthView;
        scaleY = heightView;

        let hit = false;

        for(let i = 0; i < rat_images.length; i++){
            img = rat_images[i]
            real_img = img[0]
            imgX = parseFloat(img[1]) - xleftView;
            imgX2 = imgX + img_wid/bigCanvas.width
            imgY = parseFloat(img[2]) - ytopView;
            imgY2 = imgY + real_img.height/real_img.width * img_wid / bigCanvas.height;


            imgX = imgX / scaleX;
            imgX2 = imgX2 / scaleX;
            imgY = imgY / scaleY;
            imgY2 = imgY2 / scaleY;
            //console.log("searching", imgX, imgY, imgX2, imgY2, nX, nY)
            if(nX > imgX && nX < imgX2 && nY > imgY && nY < imgY2){
                let hit_category = rat_images[i][3]
                rat_images.map((r) => {if(r[3] === hit_category) { r[4] = true}})
                hit = true;
                title.innerHTML = textMapping[hit_category][0]
                description.innerHTML = textMapping[hit_category][1]
                infoBox.style.borderLeft = "4px solid " + colorMapping[hit_category];
                drawCanvas()
                break;
            }
        }

        if(!hit){
            title.innerHTML = dTitle;
            description.innerHTML = dDes;
            infoBox.style.borderLeft = "4px solid grey";
            rat_images.map((r) => r[4] = false)
            drawCanvas()
        }
    }

    lastX = X;
    lastY = Y;

    draw();
}

function handleMouseWheel(event) {
    var x = widthView/2 + xleftView;  // View coordinates
    var y = heightView/2 + ytopView;

    var scale = (event.wheelDelta < 0 || event.detail > 0) ? 1.1 : 0.9;
    widthView *= scale;
    heightView *= scale;

    if (widthView > widthViewOriginal || heightView > heightViewOriginal) {
        widthView = widthViewOriginal;
        heightView = heightViewOriginal;
        x = widthView/2;
        y = heightView/2;
    }

    // scale about center of view, rather than mouse position. This is different than dblclick behavior.
    xleftView = x - widthView/2;
    ytopView = y - heightView/2;

    draw();
}
