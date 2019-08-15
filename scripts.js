let users = [];
let Dues = [];
let receiverCount = 1;

$(document).ready(function(){

    // Submitting new purchase
    $('form').on('submit', function(event){
        event.preventDefault();
        const nameOfPurchaser = $('#purchaser').val();
        const item = $('#item').val();
        const totalCost = parseFloat($('#cost').val());
        const cost = totalCost/(receiverCount+1).toFixed(2);

        // Find the purchaser. Store in user array if not found. Store transaction if found
        findUser(nameOfPurchaser, item, cost, 'self');

        // Display transactions and find receivers. Store user in array if not found. Store transaction if found
        $('#transactionHistory').append(`<li>${nameOfPurchaser} had purchased ${item} for $${totalCost}`);
        for (let x =0; x < receiverCount; x++){
            const receiverName = $(`#receiver${x}`).val(); 
            findUser(receiverName, item, cost, nameOfPurchaser);
            $('#transactionHistory').append(`${receiverName} owes $${cost.toFixed(2)}<br>`);
        }  
        $('#transactionHistory').append(`</li>`);

        // Display settle up
        SettleAmount()
        displayDues();

        // Clean up input fields
        $('form').trigger("reset");
    });

    // Add more splitters
    $('form').on('click', '.add_field', function(event){
        event.preventDefault();
        $(this).parent('div').append(`<div class="Splitters${receiverCount}><label id="receiver${receiverCount}" for="Purchaser">Split with: </label><input id="receiver${receiverCount}" type="text" placeholder="Name" size="51"/><a href="#" class="add_field">Add</a> <a href="#" class="remove_field">Remove</a></div>`)
        receiverCount ++;
    })

    // Remove splitters
    $('form').on('click','.remove_field', function(event){
        if (receiverCount > 0){
            event.preventDefault();
            $(this).parent('div').remove();
            receiverCount --;
        }
    })

    // Find if user exist in the users array. If not, create a new person
    function findUser(name, item, cost, Purchaser) {
        if(users.find(person => person.name === name)){
            users.filter((person) => {
                if (person.name === name) {
                    const newPurchase = {item:'', Purchaser:'', cost:''}
                    newPurchase.item = item;
                    newPurchase.cost = cost;
                    newPurchase.Purchaser = Purchaser;
                    person.owing.push(newPurchase);
                }
            })
        }
        else {
            if (name !== undefined) {
                if (name.trim() !== '') {
                    createNewPerson(name, item, cost, Purchaser);
                }
            }
        }
    }
    // Create new people in the users array
    function createNewPerson(name1, item, cost, name2) {
        const newPerson = { name:'', owing:[]};
        const newPurchase = {item:'', Purchaser:'', cost:''}
        newPerson.name = name1;
        newPurchase.item = item;
        newPurchase.Purchaser = name2;
        newPurchase.cost = cost;
        newPerson.owing.push(newPurchase);
        users.push(newPerson);
    }

    // Analyze owe back and store information in the Dues array
    function SettleAmount(){
        Dues = [];
        users.forEach((personA) => {
            users.forEach((personB) => {
                let personASum = 0;
                let personBSum = 0;
                const newBalance = {ower:'', amount:'', receiver:''};
                personA.owing.filter(item => item.Purchaser === personB.name).forEach(lineItem => {
                    personASum = personASum + parseFloat(lineItem.cost).toFixed(2);
                })
                personB.owing.filter(item => item.Purchaser === personA.name).forEach(lineItem => {
                    personBSum = personBSum + parseFloat(lineItem.cost).toFixed(2);
                })
                if (personASum !== 0 || personBSum !== 0){
                     if (personASum < personBSum) { 
                        newBalance.ower = personB.name;
                        newBalance.amount = personBSum-personASum;
                        newBalance.receiver = personA.name;
                        Dues.push(newBalance);
                    }
                }   
            });
        });
    }  

    // Display Dues in the "Settle All Debt" section
    function displayDues(){
        $('#settleup').empty();
        Dues.forEach((balance) => {
            $('#settleup').append(`<li>${balance.ower} owes $${balance.amount} to ${balance.receiver}</li>`);
        })
    }

});
