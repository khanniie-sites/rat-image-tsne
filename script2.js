
window.addEventListener("load",() => {readTextFile("tsne_data_labels2.csv"); setup2()}, false);

let rat_images = []
let loaded = 0;
let border = 10;
let img_wid = 240;

var bigCanvas;
var smallCanvas;
let ctx2;
let ctx3;

let dCanvas;
let dctx;

let colorMapping = {"night": "#BBBBBB", "pizza": "#BB4733", "outdoors": "#558888", "indoors": "#FF7788", "subway": "#EEEE33", "union": "#4444FF", "art": "#FF33FF", "man":"#115577", "trash": "#000033", "nature":"#33FF44"}
let textMapping = {"night": ["Rats at Night", "Most rats are nocturnal, though the brown rat is often awake day or night. Rats will come out in the middle of the night, if need be, but most rats prefer to feed at dusk and again just before dawn."], 
                    "pizza": ["Rats love food!", "Recently, Pizza Rat became an internet sensation when a video of a rat carrying a pizza went viral. Hennessy Rat was also a hit."], 
                    "outdoors": ["Rats out in the streets", '"So many rats regularly lurk on a sidewalk in Brooklyn that it is the humans who avoid the rats, not the other way around. Not even cars are safe: Rats have chewed clean through engine wires. A Manhattan avenue lined with trendy restaurants has become a destination for foodies — and rats who help themselves to their leftovers. Tenants at a public housing complex in the South Bronx worry about tripping over rats that routinely run over their feet." - Winnie Hu, New York Times'], 
                    "indoors": ["Rats found indoors", "Rats are looking for some place cozy that will keep them and their babies warm. They also want to stay dry during rainy seasons and winter months, which is why they tend to come indoors during fall and winter months. Rats will get inside using any crack or crevice. Norway rats have been known to climb up sewer pipes and into toilets. They will also use cracks in the cement and foundation. They can even chew their way through wall. Even Black Rats are known to use sewers for transportation and to get inside when they need to."], 
                    "subway": ["Rats in the subway!", "Rats also make subway platforms and trains as their living and hiding place. In 2011, a video of a rat climbing on a sleeping man's face on the subway went viral. In early 2016, another video of a rat climbing on a sleeping subway rider was uploaded to social media."], 
                    "union": ["Union rats", '"Scabby the Rat–one of the most recognizable symbols of unions. The giant inflatable rodent, with its sharp buck teeth and beady red eyes, has been a staple of union construction protests in NYC and across the country for decades, and if there’s a development project that enlists nonunion labor in New York, expect to see Scabby out on the street." - 6sqft, Devin Gannon'], 
                    "art": ["Rats, immortalized as art", "NYC rats also make appearances in the murals found around the city. Many of them are suspected to be Banksy pieces."], 
                    "man": ["The Rat Man", "Siera, former computer technician, is a Brooklyn-born street performer. He lives on 28th Street in Manhattan now, and is foster father of six white rats. He estimates that he makes more than $120k a year from appearances."], 
                    "trash": ["Rats live on trash", 'Urban rats rely mostly on food scraps in trash for food. “The trash is ridiculous and the rats are even more ridiculous,” said Tiffany Joy Murchison, 44. She said in her nearly 15 years of living in the neighborhood, the rats have never been as bad as they are now. She blames piles of garbage left out on the curb and overflowing street waste baskets.'], 
                    "nature": ["Rats also like nature!", "Norway rats are most commonly burrowers. Although they might build their nests in man-made structures, they also burrow in various clumps of vegetation like parks."]}

let categories = ["night", "pizza", "outdoors", "indoors", "subway", "union", "art", "man", "trash", "nature", "all"]
let tsne_preloaded = []

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
var last_category;
var mouseDown = false;

var title;
var description;
var infoBox;

var dTitle = "A Visual Intro to NYC Rats"
var dDes = "Drag to pan, Scroll to zoom, Click to view image group."

var lastX = 0;
var lastY = 0;

var startLeft = 0;
var startTop = 0;

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


function drawCorrectConfig(category){
    let idx = categories.indexOf(category)
    ctx2.clearRect(0, 0, bigCanvas.width, bigCanvas.height);
    ctx2.drawImage(tsne_preloaded[idx][1], 0, 0, bigCanvas.width, bigCanvas.height)
    ctx2.drawImage(tsne_preloaded[idx][0], 0, 0, bigCanvas.width, bigCanvas.height)
}

function setup(img_data){
    for(let i = 0; i < img_data.length; i++){
        image = new Image();
        image.onload = function() {
            if(loaded == img_data.length - 1){
                for(let j = 0; j < categories.length; j++){
                    let in_arr = rat_images.filter((r) => (r[3] === categories[j]))
                    let out = rat_images.filter((r) => (r[3] !== categories[j]))
                    tsne_preloaded.push(createCanvas(in_arr, out));
                }
                drawCorrectConfig("all")
                updateCanvas();
                document.getElementById("warning").style.display = "none"
            } else {
               loaded++; 
           }
        }
        // Load the sprite sheet from an image file
        image.src = '/' + img_data[i][0];
        rat_images.push([image, img_data[i][1] * 0.95, img_data[i][2] * 0.95, img_data[i][3], false])
    } 
}

function setup2() {
    canvas = document.getElementById("canvas");
    dCanvas = document.createElement("canvas")
    dctx = dCanvas.getContext("2d");
    ctx = canvas.getContext("2d");
    bigCanvas = document.getElementById("can");
    smallCanvas = document.getElementById("grid-canvas");
    ctx2 = bigCanvas.getContext("2d");
    ctx3 = smallCanvas.getContext("2d");

    dCanvas.width = canvas.width;
    dCanvas.height = canvas.height;

    widthCanvas = canvas.width;
    heightCanvas = canvas.height;

    title = document.getElementById("title")
    description = document.getElementById("description")
    infoBox = document.getElementById("info")

    title.innerHTML = dTitle;
    description.innerHTML = dDes;

    //canvas.addEventListener("click", handleClick, false); 
    canvas.addEventListener("mousedown", handleMouseDown, false); // click and hold to pan
    canvas.addEventListener("mousemove", handleMouseMove, false);
    canvas.addEventListener("mouseup", handleMouseUp, false);
    canvas.addEventListener("mousewheel", handleMouseWheel, false); // mousewheel duplicates dblclick function
    canvas.addEventListener("DOMMouseScroll", handleMouseWheel, false); // for Firefox
}

function createCanvas(in_arr, out_arr){

    let categoryCanvas2 = document.createElement("canvas")
    categoryCanvas2.width = bigCanvas.width
    categoryCanvas2.height = bigCanvas.height
    let categoryCtx2 = categoryCanvas2.getContext("2d")

    let categoryCanvas3 = document.createElement("canvas")
    categoryCanvas3.width = bigCanvas.width
    categoryCanvas3.height = bigCanvas.height
    let categoryCtx3 = categoryCanvas3.getContext("2d")

    for(let j = 0; j < out_arr.length; j++){
        img = out_arr[j][0];
        categoryCtx3.beginPath();
        let x = out_arr[j][1] * (categoryCanvas3.width )
        let y = out_arr[j][2] * (categoryCanvas3.height )
        categoryCtx3.rect(x - border, y - border, img_wid + border * 2, img.height/img.width * img_wid + border * 2);
        
        categoryCtx3.fillStyle = colorMapping[out_arr[j][3]];
        categoryCtx3.fill();
        categoryCtx3.drawImage(img, x, y, img_wid, img.height/img.width * img_wid);

        categoryCtx3.rect(x - border, y - border, img_wid + border * 2, img.height/img.width * img_wid + border * 2);
        categoryCtx3.fillStyle = "#FFFFFFAA";
        categoryCtx3.fill();
    }

    for(let j = 0; j < in_arr.length; j++){
        img = in_arr[j][0];
        categoryCtx2.beginPath();
        let x = in_arr[j][1] * (categoryCanvas2.width )
        let y = in_arr[j][2] * (categoryCanvas2.height )

        let border2 = 12;
        categoryCtx2.rect(x - border2, y - border2, img_wid + border2 * 2, img.height/img.width * img_wid + border2 * 2);
        
        categoryCtx2.fillStyle = colorMapping[in_arr[j][3]];
        categoryCtx2.fill();
        categoryCtx2.drawImage(img, x, y, img_wid, img.height/img.width * img_wid);
    }

    return [categoryCanvas2, categoryCanvas3]
}

function drawGrid(elements){

    console.log("drawing on grid")
    ctx3.clearRect(0, 0, smallCanvas.width, smallCanvas.height);
    let eleGrid = []
    let eleCopy = elements.slice()
    let numElements = elements.length
    let width = Math.ceil(Math.sqrt(numElements))
    let height = Math.ceil(numElements/width);
    let pixelWidth = smallCanvas.width / width;
    let pixelHeight = smallCanvas.height / height;
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
    for(let i = 0; i < eleGrid.length; i++){
        let img = eleGrid[i]
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

        ctx3.drawImage(img[0], 0, 0, scaleW, scaleH, img[1], img[2], pixelWidth, pixelHeight);
    }
    updateCanvas();
}

function updateCanvas() {
    console.log("draw", detailView)
    if(detailView){
        ctx.setTransform(1,0,0,1,0,0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(smallCanvas, 0, 0, canvas.width, canvas.height);
    } else {
        ctx.setTransform(1,0,0,1,0,0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.scale(widthCanvas/widthView, heightCanvas/heightView);
        ctx.translate(-xleftView,-ytopView);
        ctx.drawImage(bigCanvas, 0, 0, 1, 1);
        //ctx.drawImage(dCanvas, 0, 0, 1, 1);
    }
}

function handleMouseDown(event) {
    mouseDown = true;
    startTop = ytopView;
    startLeft = xleftView;
}

function handleClick(event){

    if(detailView){
        detailView = false;
        resetInfo();
        return;
    }

    var X = event.clientX - this.offsetLeft - this.clientLeft + this.scrollLeft;
    var Y = event.clientY - this.offsetTop - this.clientTop + this.scrollTop;

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
            detailView = true;
            let hit_category = rat_images[i][3]
            title.innerHTML = textMapping[hit_category][0]
            description.innerHTML = textMapping[hit_category][1]
            title.style.borderBottom = "2px solid" + colorMapping[hit_category];
            title.style.backgroundColor = colorMapping[hit_category] + "11";
            drawGrid(rat_images.filter((r) => r[3] == hit_category))
            canvas.style.border= "4px solid " + colorMapping[hit_category];
            break;
        }
    }
    updateCanvas()
}

function handleMouseUp(event) {
    mouseDown = false;
    if(startLeft === xleftView && startTop === ytopView){
        handleClick(event);
    }
}

function handleMouseMove(event) {

    if(detailView) return;

    var xPosition = 0;
    var yPosition = 0;

    let element = this;

    while(element) {
        xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
        yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
        element = element.offsetParent;
    }

    var X = event.clientX - xPosition + document.documentElement.scrollLeft;
    var Y = event.clientY - yPosition + document.documentElement.scrollTop;

    if (mouseDown) {
        var dx = (X - lastX) / widthCanvas * widthView;
        var dy = (Y - lastY)/ heightCanvas * heightView;
        xleftView -= dx;
        ytopView -= dy;
        updateCanvas();

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
            imgY2 = imgY + (real_img.height/real_img.width * img_wid) / bigCanvas.height;

            imgX = imgX / scaleX;
            imgX2 = imgX2 / scaleX;
            imgY = imgY / scaleY;
            imgY2 = imgY2 / scaleY;

            if(nX > imgX && nX < imgX2 && nY > imgY && nY < imgY2){
                // dctx.beginPath();
                // dctx.rect(imgX * canvas.width, imgY * canvas.height, (imgX2 - imgX) * canvas.width, (imgY2 - imgY) * canvas.height)
                // dctx.fillStyle = "red"
                // dctx.fill()

                let hit_category = rat_images[i][3]
                if(last_category === hit_category){
                    return;
                }
                canvas.style.cursor = "pointer"
                rat_images.map((r) => {if(r[3] === hit_category) { r[4] = true}})
                hit = true;
                title.innerHTML = textMapping[hit_category][0]
                description.innerHTML = textMapping[hit_category][1]
                title.style.borderBottom = "2px solid" + colorMapping[hit_category];
                title.style.backgroundColor = colorMapping[hit_category] + "11";
                drawCorrectConfig(hit_category);
                updateCanvas();
                last_category = hit_category
                break;
            }
        }

        if(!hit && last_category != null){
            resetInfo();   
        }
    }

    lastX = X;
    lastY = Y;
    
}

function resetInfo(){
    last_category = null;
    title.innerHTML = dTitle;
    description.innerHTML = dDes;
    title.style.borderBottom = "2px solid black";
    title.style.backgroundColor = "white"
    canvas.style.cursor = "default"
    canvas.style.border = "4px solid white"
    rat_images.map((r) => r[4] = false)
    drawCorrectConfig("all");
    updateCanvas();
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

    updateCanvas();
    event.stopPropagation();

}
