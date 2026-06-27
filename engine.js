/* ==========================================================
CASE FILES ENGINE
VERSION 0.1
========================================================== */

const Engine = {

scene:0,

order:[
"boot-screen",
"chief-scene",
"courier-scene",
"package-scene",
"case-title"
],

play(){

this.show(0);

Boot.start();

},

show(index){

this.scene=index;

document
.querySelectorAll(".scene")
.forEach(scene=>scene.classList.remove("active"));

document
.getElementById(this.order[index])
.classList.add("active");

}

};

/* ==========================================================
BOOT
========================================================== */

const Boot={

start(){

setTimeout(()=>{

show("boot-line2");

},1200);

setTimeout(()=>{

show("boot-line3");

},2200);

setTimeout(()=>{

show("agentH");

},4300);

setTimeout(()=>{

show("agentM");

},5100);

setTimeout(()=>{

Engine.show(1);

Chief.play();

},7000);

}

};

/* ==========================================================
CHIEF
========================================================== */

const Chief={

dialogue:[

"*Ahem.*",

"Good morning, Agents.",

"We've received another report.",

"A historian's research has disappeared.",

"The mission package is waiting outside.",

"Good luck."

],

current:0,

play(){

this.current=0;

this.say();

},

say(){

typeSubtitle(this.dialogue[this.current]);

if(this.current===2){

Projection.show(

"https://picsum.photos/600/350?1",

"LOUVRE MUSEUM"

);

}

if(this.current===3){

Projection.show(

"https://picsum.photos/600/350?2",

"CRIME SCENE"

);

}

if(this.current===4){

Projection.show(

"https://picsum.photos/600/350?3",

"PRIMARY SUSPECT"

);

}

this.current++;

if(this.current<this.dialogue.length){

setTimeout(()=>{

this.say();

},3200);

}

else{

setTimeout(()=>{

Engine.show(2);

Courier.play();

},2500);

}

}

};

/* ==========================================================
PROJECTION
========================================================== */

const Projection={

show(image,caption){

const photo=document.getElementById("evidence-photo");

const text=document.getElementById("evidence-caption");

photo.classList.remove("hidden");

text.classList.remove("hidden");

photo.style.opacity=0;

setTimeout(()=>{

photo.src=image;

photo.style.opacity=1;

text.innerHTML=caption;

},250);

}

};

/* ==========================================================
HELPERS
========================================================== */

function show(id){

document
.getElementById(id)
.classList.remove("hidden");

}

function typeSubtitle(text){

const subtitle=document.getElementById("subtitle-text");

subtitle.innerHTML="";

let i=0;

const interval=setInterval(()=>{

subtitle.innerHTML+=text.charAt(i);

i++;

if(i>=text.length){

clearInterval(interval);

}

},28);

}

/* ==========================================================
START
========================================================== */

window.onload=()=>{

Engine.play();

};

/* ==========================================================
COURIER
========================================================== */

const Courier={

lines:[

"...why do mysteries always happen before breakfast?",

"...I'm on my sixth coffee.",

"...Here."

],

current:0,

play(){

this.current=0;

document.body.style.cursor="grab";

Door.open();

this.talk();

},

talk(){

const text=document.getElementById("courier-text");

typeSubtitle("");

text.innerHTML=this.lines[this.current];

this.current++;

if(this.current<this.lines.length){

setTimeout(()=>{

this.talk();

},2200);

}

else{

setTimeout(()=>{

Package.enable();

},1800);

}

}

};

/* ==========================================================
DOOR
========================================================== */

const Door={

open(){

const door=document.getElementById("agency-door");

door.style.transformOrigin="left center";

door.style.transition="transform .8s ease";

door.style.transform="perspective(1200px) rotateY(-70deg)";

},

close(){

const door=document.getElementById("agency-door");

door.style.transform="perspective(1200px) rotateY(0deg)";

}

};

/* ==========================================================
PACKAGE
========================================================== */

const Package={

enable(){

const box=document.getElementById("package");

box.draggable=true;

box.style.cursor="grab";

box.addEventListener("dragstart",()=>{

document.body.style.cursor="grabbing";

});

box.addEventListener("dragend",()=>{

document.body.style.cursor="default";

Door.close();

Engine.show(3);

setTimeout(()=>{

Engine.show(4);

},1800);

},{once:true});

}

};