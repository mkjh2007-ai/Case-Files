const scenes = [
`📰 BREAKING NEWS

Dana McGillies has reported that Martin LeBourje's research has disappeared after dinner near the Louvre.

Mission:
Find the missing research.`,

`✈️ PARIS

You have landed safely in Paris.

Martin LeBourje is waiting for you.

He looks nervous.`,

`👨‍🏫 MARTIN

"Thank goodness you're here.

Someone stole my research.

But...

I don't think they were after my research."

🤔`,

`🗄️ OFFICE

You notice:

📚 Books

☕ Warm coffee

🖼️ Empty picture frame

🗄️ One drawer open

Something feels wrong...`,

`📸 DISCOVERY

Only ONE photograph is missing.

Not the whole folder.

Why would someone steal only one picture?`,

`📞 PHONE CALL

Martin's phone rings.

...

Nobody speaks.

Then a voice whispers:

"Stop looking."

The call ends.`,

`⚠️ CLIFFHANGER

Martin suddenly freezes.

"I remember now..."

"The research wasn't the target.

The PHOTOGRAPH was."

TO BE CONTINUED...
`
];

let currentScene = 0;

function nextScene(){

    document.getElementById("story").innerHTML =
        scenes[currentScene].replace(/\n/g,"<br>");

    if(currentScene < scenes.length-1){
        currentScene++;
    }

}
