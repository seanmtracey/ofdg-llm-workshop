(function(){

    'use strict';

    const transcript = document.querySelector('#transcript');
    const form = document.querySelector('form');
    const transactions = document.querySelector('#transactions');
    const transactionsList = transactions.querySelector('ol');
    const transactionsToggle = transactions.querySelector('#tab');

    function getTransactions(){
        return fetch('/transactions')
            .then(res => {
                if(res.ok){
                    return res.json();
                } else {
                    throw res;
                }
            })
            .catch(err => {
                console.log("/transactions err:", err);
                return {};
            });
        ;
    }

    function addResponseToTranscript(data){

        const docFrag = document.createDocumentFragment();
        const div = document.createElement('div');
        const pre = document.createElement('pre');
        
        div.dataset.messageid = data.id;
        div.classList.add('aiResponse');
        pre.textContent = data.message;

        div.appendChild(pre);
        docFrag.appendChild(div);

        transcript.appendChild(docFrag);

    }

    function sendMessageToServer(message){

        const docFrag = document.createDocumentFragment();
        const div = document.createElement('div');
        const p = document.createElement('p');
        
        div.classList.add('userInput');
        p.textContent = message;

        div.appendChild(p);
        docFrag.appendChild(div);

        transcript.appendChild(docFrag);

        const lastMessage = Array.from(transcript.querySelectorAll('.aiResponse')).pop();

        const parentMessageId = lastMessage ? lastMessage.dataset.messageid : "";
        console.log(parentMessageId);

        fetch('/chat', {
            method : "POST",
            headers : {
                "Content-Type" : "application/json"
            },
            body : JSON.stringify({
                message,
                parentMessageId
            })
        })
        .then(res => {
            if(res.ok){
                return res.json();
            } else {
                throw res;
            }
        })
        .then(response => {
            console.log(response);
            addResponseToTranscript(response);
        })
        .catch(err => {
            console.log("sendMessageToServer err:", err);
        });

    }

    form.addEventListener('submit', function(e){
        e.preventDefault();
        e.stopImmediatePropagation();

        console.log(this[0].value);

        sendMessageToServer(this[0].value);
        form.reset();

    }, false);

    transactionsToggle.addEventListener('click', function(){
        transactions.dataset.state = transactions.dataset.state === "closed" ? "open" : "closed";
    }, false);

    getTransactions()
        .then(results => {
            console.log(results);
            const docFrag = document.createDocumentFragment();

            results.data.forEach(datum => {

                const li = document.createElement('li');

                const h4 = document.createElement('h4');
                const h5 = document.createElement('h5');
                const span = document.createElement('span');

                h4.textContent = datum.amount.value;
                h5.textContent = datum.shortDescription;
                span.textContent = datum.longDescription;

                li.appendChild(h4);
                li.appendChild(h5);
                li.appendChild(span);

                docFrag.appendChild(li);

            });

            transactionsList.innerHTML = "";
            transactionsList.appendChild(docFrag);

        })
        .catch(err => {
            console.log("getTransactions err:", err);
        })
    ;

    console.log("We good to go 🚀");

}());