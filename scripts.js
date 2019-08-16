let users = [];
let dues = [];
let transactionLog = [];
let receiverCount = 1;

$(document).ready(function(){
    // If local storage exist, populate users and transaction logs
    if (localStorage.getItem("users") != null){
        users = JSON.parse(localStorage.getItem("users"));
        settleAmount()
        displayDues();
    }
    if (localStorage.getItem("logs") != null){
        transactionLog = JSON.parse(localStorage.getItem("logs"));
    }

    // Display transaction log from Local Storage
    transactionLog.forEach((transaction) => {
        $('#transactionHistory').append(transaction);
    });

    // Submitting new purchase
    $('form').on('submit', function(event){
        event.preventDefault();
        
        // Set variables
        const nameOfPurchaser = $('#purchaser').val();
        const item = $('#item').val();
        const totalCost = parseFloat($('#cost').val());
        const cost = totalCost/(receiverCount+1).toFixed(2);
        let tempListItem = "";

        // Find the purchaser. Store in user array if not found. Store transaction if found
        findUser(nameOfPurchaser, item, cost, 'self');

        // Display transactions and find receivers. Store user in array if not found. Store transaction if found
        tempListItem = `<li>${nameOfPurchaser} had purchased ${item} for $${totalCost}`;
        transactionLog.push(tempListItem);
        $('#transactionHistory').append(tempListItem);
        for (let x =0; x < receiverCount; x++){
            const receiverName = $(`#receiver${x}`).val(); 
            findUser(receiverName, item, cost, nameOfPurchaser);
            tempListItem = `${receiverName} owes $${cost.toFixed(2)}<br>`
            transactionLog.push(tempListItem);
            $('#transactionHistory').append(tempListItem);
        }  
        tempListItem = `</li>`;
        transactionLog.push(tempListItem);
        $('#transactionHistory').append(tempListItem);

        // Store values in the local Storage
        localStorage.setItem("users", JSON.stringify(users));
        localStorage.setItem("logs", JSON.stringify(transactionLog));

        // Display settle up
        settleAmount()
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

    // Clear page and local storage
    $('form').on('click','.clearStorage', function(event){
        window.localStorage.clear();
        users = [];
        transactionLog = [];
        location.reload();
    })

    // Find if user exist in the users array. If not, create a new person
    function findUser(name, item, cost, Purchaser) {
        if(users.find((person) => person.name === name)){
            users.filter((personSearched) => {
                if (personSearched.name === name) {
                    const newPurchase = {item:'', Purchaser:'', cost:''}
                    newPurchase.item = item;
                    newPurchase.cost = cost;
                    newPurchase.Purchaser = Purchaser;
                    personSearched.owing.push(newPurchase);
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

    // Analyze owe back and store information in the dues array
    function settleAmount(){
        dues = [];
        users.forEach((personA) => {
            users.forEach((personB) => {
                let personASum = 0;
                let personBSum = 0;
                const newBalance = [];
                personA.owing.filter(item => item.Purchaser === personB.name).forEach(lineItem => {
                    personASum = personASum + parseFloat(lineItem.cost);
                })
                personB.owing.filter(item => item.Purchaser === personA.name).forEach(lineItem => {
                    personBSum = personBSum + parseFloat(lineItem.cost);
                })
                if (personASum !== 0 || personBSum !== 0){
                     if (personASum < personBSum) { 
                        newBalance.push(personB.name);
                        newBalance.push(personA.name);
                        newBalance.push((personBSum-personASum).toFixed(2));
                        dues.push(newBalance);
                    }
                }   
            });
        });
    }  

    // Display dues in the "Settle All Debt" section
    function displayDues(){
        let dataAnalysis = [];
        // Deinitialize the data table by tearing it
        if ($.fn.DataTable.isDataTable("#settleup")) {
            $('#settleup').DataTable().clear().destroy();
        } 
        // Copy the dues table to avoid corrupting from the above destroy function
        dues.forEach((item) => {
            dataAnalysis.push(item);
        });
        // Initialize the DataTable
        $('#settleup').DataTable( {
            data: dataAnalysis,
            columns: [
                {title: "Debitor"},
                {title: "Creditor"},
                {title: "Amount ($)"}
            ]
        });
    }
});
