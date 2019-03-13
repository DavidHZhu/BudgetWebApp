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
    this.percentage = -1;
  };

  // calculates Percentage for Expenses (prototype)
  Expense.prototype.calcPercentage = function (totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  // Expense method (prototype)
  Expense.prototype.getPercentage = function () {
    return this.percentage;
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

    deleteItem: function (type, id) {
      var ids, index;

      // map is a callback function which can take up to 3 args: current, index and array, and returns an array
      ids = data.allItems[type].map(function (current) {
        return current.id;
      });
      
      // Finds element index for the ID of the income/expense
      index = ids.indexOf(id)

      // Deletes items from array
      if (index !== -1 ) {
        // Goes to index and removes specified number of elements to delete (1)
        data.allItems[type].splice(index, 1);
      }

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

    // Calculates percentage display next to item
    calculatePercentages: function () {
      data.allItems.exp.forEach(function (cur) {
        cur.calcPercentage(data.totals.inc);
      });
    },

    getBudget: function () {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage,
      };
    },

    getPercentages: function () {
      var percArr = data.allItems.exp.map(function (cur) {
        return cur.getPercentage();
      });
      return percArr;
    },

    testing: function () {
      console.log(data);
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
    expensesContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expensesPercentageLabel: '.item__percentage',
    dateLabel: '.budget__title--month'
  };

      
    // Adds formatting to money display
  var formatNumber = function (num, type) {
    var numSplit, int, decimal;

    num = Math.abs(num);
    // 2 decimal places
    num = num.toFixed(2);
    // numSplit is a string
    numSplit = num.split('.');
    int = numSplit[0];
    // checks for thousand's place
    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
    }

    decimal = numSplit[1];
      
    return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + decimal;

  };

  var nodeListForEach = function (list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
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

    // Add the HTML into the DOM
    addListItem: function (obj, type) {
      var html, newHtml, element;

      // Create HTML string with placeholder text
      if (type === 'inc') {
        element = DOMstrings.incomeContainer;
        html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === 'exp') {
        element = DOMstrings.expensesContainer;
        html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      // Replace placeholder text with user input
      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

      // Insert the HTML into the DOM
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

    },

    // Deletes the HTML from the DOM
    deleteListItem: function (selectorID) {
      var element = document.getElementById(selectorID);
      element.parentNode.removeChild(element);

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

    // Displays new budget
    displayBudget: function (obj) {
      obj.budget >= 0 ? type = 'inc' : type = 'exp';

      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
      document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

      //adds % sign for valid percentages
      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = '---';
      }
    },

    // Display percentages array
    displayPercentages: function (percentages) {
      // Node list
      var fields = document.querySelectorAll(DOMstrings.expensesPercentageLabel);
      
      // First class function -> pass a callback function and it will run the code on the array above
      nodeListForEach(fields, function (current, index) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + '%';
        } else {
          current.textContent = '---';
        }
      }); 
    },

    displayMonth: function () {
      var now, year, month, monthArr; 
      now = new Date();
      year = now.getFullYear();
      month = now.getMonth();
      monthsArr = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      document.querySelector(DOMstrings.dateLabel).textContent = monthsArr[month] + ' ' + year;

    },

    changedType: function () {
      var fields = document.querySelectorAll(
        DOMstrings.inputType + ',' +
        DOMstrings.inputDescription + ',' +
        DOMstrings.inputValue);
      
      nodeListForEach(fields, function (cur) {
        cur.classList.toggle('red-focus');
      });

      document.querySelector(DOMstrings.inputButton).classList.toggle('red');
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

    // Keypress happens on the entire page -> adds item to controller
    document.addEventListener("keypress", function(event) {
      if (event.keyCode === 13 || event.key === "Enter") {
        ctrlAddItem();
      }
    });

    // Event Handler - Similar to ctrlAddItem (callback function). DOM.container holds both Income and Expenses
    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

    // Event Handler - changes background color of input boxes
    document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
  };

  // Private function
  var updateBudget = function () {
    // Calculate the budget
    budgetCtrl.calculateBudget();
    // Return the budget
    var budget = budgetCtrl.getBudget();
    // Display budget on the UI
    UICtrl.displayBudget(budget);
  };

  // Private function
  var updatePercentages = function () {
    // Calculate percentages
    budgetController.calculatePercentages();
    // Read percentages from budgetCtrl
    var percentages = budgetController.getPercentages();
    // Update user interface
    UICtrl.displayPercentages(percentages);
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
      // Update percentages
      updatePercentages();

    }
  };

  // Standalone function (private)
  var ctrlDeleteItem = function (event) {
    var itemID, splitID, type, ID;    
    // .parentNode moves up one parent in the HTML elements (DOM traversing) HARD CODED
    itemID = (event.target.parentNode.parentNode.parentNode.parentNode.id);

    // All other Html elements have no ID
    if (itemID) {

      // Splits the array where it finds '-' (example: inc-3 will return ["inc", "3"], same for exp)
      splitID = itemID.split('-');
      type = splitID[0];
      ID = parseInt(splitID[1]);

      // Delete the item from the data structure
      budgetController.deleteItem(type, ID);
      // Delete the item from the UI
      UIController.deleteListItem(itemID);
      // Update budget
      updateBudget();

    }
  };

  return {
    // Initializes empty data structure
    init: function() {
      console.log("init")
      UICtrl.displayMonth();
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      });
      setupEventListeners();
    }
  }


}(budgetController, UIController));


// Starts program:
controller.init();
