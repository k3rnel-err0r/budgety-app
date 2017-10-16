/**
 * Module Patter in JavaScript:
 * We create module in the application because we want to keep pieces
 * of code that are related to one another together inside of separate,
 * independent and organizes units.
 * And in each of this modules we'll have variables and functions that
 * are private, which means that they are only accessible inside of
 * the module. We want it so that no other code can overwrite our data.
 */

// MODULE BUDGET CONTROLLER
var budgetController = (function () {

    /** We need a data model for expenses and incomes here. Each new item
     *  will have a description and value and we need to be able to distinguish
     *  different income or expenses, so to store all that data we'll make
     *  use of objects through functions constructors
     */

    var Expense = function (id, descrption, value) {
        this.id = id;
        this.description = descrption;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function (totalIncome) {

        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this. percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    };

    var Income = function (id, descrption, value) {
        this.id = id;
        this.description = descrption;
        this.value = value;
    };

    var calculateTotal = function (type) {
      var sum = 0;

      data.allItems[type].forEach(function (current) {
          sum += current.value;
      });
      data.totals[type] = sum;
    };

    // It will store all the data
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1 // It means non-existent
    };

    return {
        addItem: function (type, des, val) {
            var newItem, ID;

            // [1, 2, 3, 4, 5], next ID = 6
            // [1, 2, 4, 6, 8], next ID = 9
            // ID = last ID + 1;

            // If array is empty id should be zero
            if (data.allItems[type].length > 0) {
                // Create the new ID
                ID = data.allItems[type][data.allItems[type].length-1].id + 1;
            } else {
                ID = 0;
            }

            // Create the new item based upon 'exp' or 'inc' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            // Push the new item into our data structure
            data.allItems[type].push(newItem);

            // Return the new element
            return newItem;
        },

        deleteItem: function (type, id) {

            var ids, index;

            // We create an array with all the id in order to be able to delete the item
            ids = data.allItems[type].map(function (current) {
                return current.id;
            });

            index = ids.indexOf(id);

            // Check if index was found
            if (index !== -1) {
                // Remove the item
                data.allItems[type].splice(index, 1);
            }
        },

        calculatePercentages: function () {

            /*
                Expense a = 20
                Expense b = 10
                Expense c = 40
                Income = 100

                a = 20/100 = 20%
                b = 10/100 = 10%
                c = 40/100 = 40%

             */

            data.allItems.exp.forEach(function (current) {
                current.calcPercentage(data.totals.inc);
            });

        },

        getPercentages: function () {

            var allPerc = data.allItems.exp.map(function (current) {
                return current.getPercentage();
            });

            return allPerc;

        },

        calculateBudget: function () {

            // Calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // Calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // Calculate the percentage of income that we spent if there's an income (we cannot divide by zero)
            if (data.totals.inc > 0) {
                // It rounds to the closer integer
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1; // non-existent
            }
        },

        getBudget: function () {

            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };

        },

        testing: function () {
            console.log(data);
        }
    };

})();

// MODULE UI
var UIController = (function () {

    // Object contains all the classes strings in the UI
    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    // We create a function that will accept our nodelist and a callback function
    var nodeListForEach = function (list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    var formatNumber = function (num, type) {

        var numSplit, int, dec;

        // Add + or - before the number
        // Exactly 2 decimal points
        // Comma separating the thousands
        // Ex: 2310.4567 -> 2,310.46 / 2000 -> 2,000.00

        // Absolute value: remove the sign of the number
        num = Math.abs(num);
        num = num.toFixed(2); // toFixed is a method of the Number prototype. It rounds to two decimals

        numSplit = num.split('.');

        // We divided the number now, de integer part and the decimal as well
        int = numSplit[0];

        if (int.length > 3) {
            // Input 23520 -> 23,510
            int = int.substr(0, int.length -3) + ',' + int.substr(int.length -3, int.length);
        }

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

    };

    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMStrings.inputType).value, // Will be either inc or exp
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            };
        },

        addListItem: function (obj, type) {

            var html, newHtml, element;

            // 1. Create HTML string with placeholder text
            if (type === 'inc') {
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMStrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // 2. Replace the placeholder text with some actual data (received from object)
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // 3. Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function (selectorID) {

            // In JavaScript we remove always the child element, so we need to select the parent first
            var element = document.getElementById(selectorID);
            element.parentNode.removeChild(element);
        },

        clearFields: function () {

            var fields, fieldsArr;

            // Select multiple elements separated by a coma
            fields = document.querySelectorAll(DOMStrings.inputDescription + ',' + DOMStrings.inputValue);

            // Since querySelectorAll is a list, we have to do this trick by making use of call on the slice function
            // of Array.prototype (Array is the function constructor for all arrays)
            // All the methods that the arrays inherit from the array function constructors are in the Array prototype property
            fieldsArr = Array.prototype.slice.call(fields);

            // We can now loop over the array and clear the fields
            // With forEach we have access to three arguments:
            //  1. The current element
            //  2. The index
            //  3. The entire array
            fieldsArr.forEach(function (current, index, array) {
                current.value = '';
            });

            // Set the focus on the first element of the array
            fieldsArr[0].focus();
        },

        displayBudget: function (obj) {

            var type;
            // Check if the budget is positive or negative. We do this to format our budget label
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }
        },

        displayPercentages: function (percentages) {

            // It returns a node list
            var fields = document.querySelectorAll(DOMStrings.expensesPercLabel);

            // This will be our callback function
            nodeListForEach(fields, function (current, index) {

                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
        },

        displayMonth: function () {

            var now, month, months, year;

            months = ['January', 'February', 'March', 'April',
                      'May', 'June', 'July', 'August',
                      'September', 'October', 'November', 'December'];

            // Date Object constructor
            now = new Date(); // To store the day of today
            month = now.getMonth();
            year = now.getFullYear();

            document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year;

        },

        changeType: function (event) {

            // Select the three elements of the form
            var fields = document.querySelectorAll(
                DOMStrings.inputType + ',' +
                DOMStrings.inputDescription + ',' +
                DOMStrings.inputValue
            );

            // This will be our callback function
            nodeListForEach(fields, function (current) {
                // Toggle the class red-focus
                current.classList.toggle('red-focus');
            });

            // Toggle the class red on the button
            document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
        },

        getDOMStrings: function () {
            return DOMStrings;
        }
    };
})();


// MODULE GLOBAL APP CONTROLLER:
// The goal of this module is to control the entire app and basically
// acting as a link between the other two modules
var controller = (function (budgetCtrl, UICtrl) {

    var setupEventListeners = function () {

        // Get the DOMString object from the UICtrl
        var DOM = UICtrl.getDOMStrings();

        // As soon as someone clicks the button:
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        // We add the event listener to the global document, anywhere in the document (when pressing a key)
        document.addEventListener('keypress', function (event) {

            // If the key pressed is ENTER / SOme older browser don't use keyCode but which
            if (event.keyCode === 13 || event.which === 13) {
                // Call the function
                ctrlAddItem();
            }

        });

        // We plan to make us of event delegation. To do so, we add an event listener to the element container
        // which is the parent element of income and expenses.
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        // Event listener that changes the line of the form fields based upon income or expense (+ or -)
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
    };

    var updateBudget = function () {

        // 1. Calculate the budget
        budgetCtrl.calculateBudget();

        // 2. Return the budget
        var budget = budgetCtrl.getBudget();

        // 3. Display the budget on the UI
       UICtrl.displayBudget(budget);
    };

    var updatePercentages = function () {

        // 1. Calculate percentage
        budgetCtrl.calculatePercentages();

        // 2. Read percentages from the budget controller
        var percentages= budgetCtrl.getPercentages();

        // 3. Update the UI with tne new percentages
        UICtrl.displayPercentages(percentages);

    };
    
    var ctrlAddItem = function () {

        var input, newItem;

        // 1. Get the field input data
        input = UICtrl.getInput(); // Public method that we can access

        // Check if the field description is empty and the value isNaN and greater than zero
        if (input.description !== '' && !isNaN(input.value) && input.value > 0) {

            // 2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add new item to the UI
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear the field
            UICtrl.clearFields();

            // 5. Calculate and update budget
            updateBudget();

            // 6. Calculate and update percentages
            updatePercentages();
        }
    };

    var ctrlDeleteItem = function (event) {
        var itemID, splitID, type, ID;

        // To see where the event was triggered (event.target)
        // We use parentNode to move up
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        // If we click somewhere else nothing happens, so we want to make sure it only
        // returns the id of the parent element when it gets clicks on the icon
        if (itemID) {

            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. Delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);

            // 2. We delete the item from the UI
            UICtrl.deleteListItem(itemID);

            // 3. Update and show the new budget
            updateBudget();

            // 4. Calculate and update percentages
            updatePercentages();
        }
    };
    
    return {
        init: function () {
            console.log('Application has started');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    };

})(budgetController, UIController);

// Initialisation
controller.init();