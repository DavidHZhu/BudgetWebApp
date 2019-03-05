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


  // Object with 2 objects
  var data = {
    allItems:{
        exp: [],
        inc: []
    },
    totals: {
        exp: 0,
        inc: 0
    }
  }


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
    }
  };

}());

// IIFE standalone for UI
var UIController = (function() {

  var DOMstrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputButton: ".add__btn"
  };

  // Gets input from text field (public) -> returns a public function that is an object containing three variables
  return {
    getInput: function() {
      return {
        // This will be either 'inc' or 'exp'
        type: document.querySelector(DOMstrings.inputType).value,
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: document.querySelector(DOMstrings.inputValue).value
      };
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

  // Standalone function (private)
  var ctrlAddItem = function() {

    var input, newItem;

    // Get input data from field
    input = UICtrl.getInput();
    // Add the item to the budget controller
    newItem = budgetCtrl.addItem(input.type, input.description, input.value);
    // Add the item to the UI

    // Calculate budget
    // Display budget on UI
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
