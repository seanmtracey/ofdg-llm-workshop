(function(){

    'use strict';

    const transcript = document.querySelector('#transcript');
    const form = document.querySelector('form');
    const transactions = document.querySelector('#transactions');
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

    function sendMessageToServer(message){

        const docFrag = document.createDocumentFragment();
        const div = document.createElement('div');
        const p = document.createElement('p');
        
        div.classList.add('userInput');
        p.textContent = message;

        div.appendChild(p);
        docFrag.appendChild(div);

        transcript.appendChild(docFrag);

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
        .then(result => {
            console.log(result);
        })
        .catch(err => {
            console.log("getTransactions err:", err);
        })
    ;

    console.log("We good to go 🚀");

}());