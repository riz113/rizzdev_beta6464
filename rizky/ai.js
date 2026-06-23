/*==================================================
            AI CHAT PART 2
==================================================*/

const chatBody = document.querySelector(".ai-body");
const input = document.getElementById("userMessage");
const send = document.getElementById("sendMessage");


async function sendMessage(){

    const message = input.value.trim();

    if(message==="") return;

    addMessage(message,"user");

    input.value="";

    /* -----------------------------
       Cek Knowledge Lokal
    ----------------------------- */

    const localAnswer=getLocalAnswer(message);

    if(localAnswer){

        typingAnimation();

        setTimeout(()=>{

            removeTyping();

            addMessage(localAnswer,"bot");

            saveHistory();

        },800);

        return;

    }

    /* -----------------------------
       Loading
    ----------------------------- */

    typingAnimation();

    try{

        const response=await fetch("/api/chat",{

            method:"POST",

            headers:{

                "Content-Type":"application/json"

            },

            body:JSON.stringify({

                message:message,

                knowledge:KNOWLEDGE

            })

        });

        if(!response.ok){

            throw new Error("Network Error");

        }

        const data=await response.json();

        removeTyping();

        addMessage(data.reply,"bot");

        saveHistory();

    }

    catch(error){

        removeTyping();

        addMessage(

            "⚠️ AI sedang tidak tersedia.<br><br>Saya masih bisa menjawab pertanyaan umum mengenai profil Rizky Adimuti.",

            "bot"

        );

    }

}

/*==================================================
            TYPING
==================================================*/

function typingAnimation(){

    const typing=document.createElement("div");

    typing.className="chat-message bot typing";

    typing.id="typing";

    typing.innerHTML=`

        <span></span>

        <span></span>

        <span></span>

    `;

    chatBody.appendChild(typing);

    chatBody.scrollTop=chatBody.scrollHeight;

}

function removeTyping(){

    const typing=document.getElementById("typing");

    if(typing){

        typing.remove();

    }

}

/*==================================================
            LOCAL STORAGE
==================================================*/

function saveHistory(){

    localStorage.setItem(

        "rizky_ai_history",

        chatBody.innerHTML

    );

}

function loadHistory(){

    const history=localStorage.getItem(

        "rizky_ai_history"

    );

    if(history){

        chatBody.innerHTML=history;

    }

}

loadHistory();

/*==================================================
            CLEAR CHAT
==================================================*/

const clearButton=document.createElement("button");

clearButton.innerHTML="🗑️";

clearButton.className="clear-chat";

document.querySelector(".ai-header").appendChild(clearButton);

clearButton.onclick=function(){

    if(confirm("Hapus semua percakapan?")){

        chatBody.innerHTML="";

        localStorage.removeItem("rizky_ai_history");

        addMessage(

            "Halo 👋 Saya siap membantu menjawab pertanyaan mengenai Rizky Adimuti.",

            "bot"

        );

    }

}

/*==================================================
            AUTO SCROLL
==================================================*/

const observer=new MutationObserver(()=>{

    chatBody.scrollTop=chatBody.scrollHeight;

});

observer.observe(chatBody,{

    childList:true

});

/*==================================================
            WELCOME MESSAGE
==================================================*/

if(chatBody.innerHTML.trim()===""){

    addMessage(

`👋 Halo!

Saya adalah AI Assistant milik <b>Rizky Adimuti</b>.

Saya dapat menjawab pertanyaan mengenai:

• Profil
• Skill
• Project
• Pengalaman
• Organisasi
• Kontak

Silakan tanyakan apa saja 😊`,

"bot"

);

}