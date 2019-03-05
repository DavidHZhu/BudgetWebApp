// IIFE -> anonymous function whose scope is only the budgetController (better encapsulation)
var budgetController = (function() {

  // Function constructor that returns objects (private)
  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  // Can be refactored using prototypes since expenses will have more methods, but they share some
  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  // Private function. Note forEach() takes a callback function with up to 3 arguments. (Current, index, array).
  var calculateTotal = function (type) {
    var sum = 0;
    data.allItems[type].forEach(function (current) {
      sum += current.value;
    });

    // Stores in data object
    data.totals[type] = sum;
  };

  // Object with 4 objects -> first two are objects themselves.
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
    percentage: -1
  };


  return {
    addItem: function (type, des, val) {
        var newItem;

        // Id= last ID + 1
        if (data.allItems[type].length > 0){
          ID = data.allItems[type][data.allItems[type].length-1].id + 1;
        } else {
          ID = 0;
        }
        
        // Create new Item
        if (type === "exp") {
          newItem = new Expense(ID, des, val);
        } else {
          newItem = new Income(ID, des, val);
        }

        // Type is exp or inc
        data.allItems[type].push(newItem);

        return newItem;
    },

    // Calculates total income and expenses
    calculateBudget: function () {
      // Totals for expenses and income
      calculateTotal('exp');
      calculateTotal('inc');
      // Calculate budget
      data.budget = data.totals.inc - data.totals.exp;
      // Calculate % of income spent. Note the -1 signifies not-initialized or error
      if (data.totals.inc > 0) {
        data.percentage = Math.round(data.totals.exp / data.totals.inc * 100);
      } else {
        data.percentage = -1;
      }
    },

    getBudget: function () {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage,
      };
    }
  };

}());

// IIFE standalone for UI
var UIController = (function() {

  var DOMstrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputButton: '.add__btn',
    incomeContainer: '.income__list',
    expensesContainer: '.expenses__list'
  };

  // Gets input from text field (public) -> returns a public function that is an object containing three variables
  return {
    getInput: function() {
      return {
        // This will be either 'inc' or 'exp'
        type: document.querySelector(DOMstrings.inputType).value,
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      };
    },

    addListItem: function (obj, type) {
      var html, newHtml, element;

      // Create HTML string with placeholder text
      if (type === 'inc') {
        element = DOMstrings.incomeContainer;
        html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === 'exp') {
        element = DOMstrings.expensesContainer;
        html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      // Replace placeholder text with user input
      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', obj.value);

      // Insert the HTML into the DOM
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

    },

    clearFields: function () {
      var fields, fieldsArr;
      fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
      
      // Note fields, is initially a list. Slice() is a method of Array. Here we use the prototype to call it, setting *this to fields
      fieldsArr = Array.prototype.slice.call(fields);

      // Clears each element. Note: forEach() accepts up to 3 arguments as shown below.
      fieldsArr.forEach(function (current, index, array) {
        current.value = "";
      });

      // resets focus to first input element (inputDescription)
      fieldsArr[0].focus();
    },

    getDOMstrings: function () {
      return DOMstrings;
    }
  };

}());

// App controller that combines both Controllers
var controller = (function(budgetCtrl, UICtrl) {

  // Private function to check if input is entered
  var setupEventListeners = function () {

    var DOM = UICtrl.getDOMstrings();

    // Event Handler - NOTE: there is no function braces () around ctrlAddItem since we don't call it there. Instead, it is a callback that will be called by addEventListener.
    document.querySelector(DOM.inputButton).addEventListener("click", ctrlAddItem);

    // Keypress happens on the entire page
    document.addEventListener("keypress", function(event) {
      if (event.keyCode === 13 || event.key === "Enter") {
        ctrlAddItem();
      }
    });
  };

  // Private function
  var updateBudget = function () {
    // Calculate the budget
    budgetCtrl.calculateBudget();
    // Return the budget
    var budget = budgetCtrl.getBudget();
    // Display budget on the UI
    console.log(budget);
  };


  // Standalone function (private)
  var ctrlAddItem = function() {

    var input, newItem;

    // Get input data from field
    input = UICtrl.getInput();

    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      // Add the item to the budget controller
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);
      // Add the item to the UI
      UICtrl.addListItem(newItem, input.type);
      // Clear the fields
      UICtrl.clearFields();
      // Update budget
      updateBudget();
    }
  };

  return {
    init: function() {
      console.log("init")
      setupEventListeners();
    }
  }


}(budgetController, UIController));


// Starts program:
controller.init();
