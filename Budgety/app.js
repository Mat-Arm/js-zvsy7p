

//BUDGET CONTROLLER
var budgetController = (function() {

// Set up Data Structure Model
	var Expense = function (id, description, value) {
    this.id= id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

        // Here we create 2 methods in the Expense Prototype to calculate and get Percentages so that we can use them eveytime an expense is created
        Expense.prototype.calcPercentage = function(totalIncome) {
         if (totalIncome > 0) {
          this.percentage =  Math.round((this.value / totalIncome) * 100);
         } else {
          this.percentage = -1;
           }
   
        };

        Expense.prototype.getPercentage = function() {
         return this.percentage;

        };


  var Income = function(id, description, value) {
    this.id= id;
    this.description = description;
    this.value = value;
  };

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


// Calculate Total Income and Expenses
  var calculateTotal = function(type) {
  var sum = 0
  data.allItems[type].forEach(function(cur) {
  sum = sum + cur.value; 
     });
  data.totals[type] = sum;
  };


  return {

// Add Item informations to Data Structure Model
    addItem: function(type, des, val) {
    var newItem, ID;
    
    // Create new ID
    if (data.allItems[type].length > 0) {
       ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
    } else {
       ID = 0;
    }
     
    // Create new Item based on 'inc' or  'exp' type
    if (type === 'exp') {
      newItem = new Expense (ID, des, val); 
      } else if ( type === 'inc') { 
      newItem = new Income (ID, des, val); 
      } 
    
    // Push Item in data structure
    data.allItems[type].push(newItem);

    // Return the new Item
    return newItem; 

    },


// Delete an Item from Data Structure Model
   deleteItem: function(type,id) {
     var ids, index;

     // id = 6
     // ids = [1 2 4 6 8]
     // index = 3

     ids = data.allItems[type].map(function(current) {
        return current.id;
     });

     index = ids.indexOf(id);

     if ( index !== -1) {
         data.allItems[type].splice(index, 1);
     }
    
   },
   

// Calculate the Budget
    calculateBudget: function() {
    
    // calculate total income and expenses
    calculateTotal('exp');
    calculateTotal('inc');

    // calculate the Budget: income - expenses
    data.budget = data.totals.inc - data.totals.exp;

    // calculate the percentage of income spent
    if(data.totals.inc > 0) { 
       data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
    } else {
      data.percentage = -1;
    }
    
    },   
    
// Calculate Percentage
    calculatePercentages : function() {
     
     /*
     a=20
     b=10
     c=40
     income=100
     a=20/100=20%
     */
     
     data.allItems.exp.forEach(function(cur) {
         cur.calcPercentage(data.totals.inc);
     } );

    },

//Get the Percentages
    getPercentages: function() {
      var allPerc = data.allItems.exp.map(function(cur){
          return cur.getPercentage();
      });
      return allPerc;
    },


// Get the Budget
    getBudget: function() {
      return {
       budget: data.budget,
       totalInc: data.totals.inc,
       totalExp: data.totals.exp,
       percentage: data.percentage
      };
    },


// Function to test in the console if data are saved corrently in the data Object where are supposed to be stored
    testing: function() {
      console.log (data);
    }

  }

})();



//UI CONTROLLER
var UIController = (function() {
  
	var DOMstrings = {
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

  // Create a function to be called everytime a number is displayed in the UI to make the Numbers look better
      var formatNumber = function(num, type) {
       var numSplit, int, dec, type; 

       /*
       + or - before number
       2 decimal points
       comma separeting the thousands
       */

       //calculate the absolute number without working with + o -
       num = Math.abs(num);  
       //display 2 decimals
       num = num.toFixed(2);
       //comma separeting thousands. Split integer and decimal and then work on integer part
       numSplit = num.split('.');
       
       int = numSplit[0];
       if (int.length > 3) {
          int = int.substr(0, int.length - 3) +  ',' + int.substr(int.length - 3, 3);
       }
       dec = numSplit[1];
       // insert + or - and return everything 
       return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
      };


      var nodeListForEach = function(list, callback) {
          for (var i = 0; i < list.length; i++) {
           callback(list[i], i);
          }
      };

    return {
// Create a function to get the data input by the user
    getInput: function() {

      	 return {
         type: document.querySelector(DOMstrings.inputType).value,
         description: document.querySelector(DOMstrings.inputDescription).value,
         value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      	 };
       
      } ,
      
// Create a function to show the Item in the UI
      addListItem: function(obj, type) {
       var html, newHtml, element;

         // Create HTML string with placeholder test
       if (type === 'inc') {
       element = DOMstrings.incomeContainer;
       
       html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

       } else if ( type === 'exp') {
       element = DOMstrings.expensesContainer;

       html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
       }

         // Replace placeholders with actual data
       newHtml = html.replace('%id%', obj.id);
       newHtml = newHtml.replace('%description%', obj.description);
       newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

         // Insert HTML string into the DOM
       document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

      },
    
      deleteListItem: function(selectorID) {

        var el = document.getElementById(selectorID);
        el.parentNode.removeChild(el);
      },
       


// Create a function to clear inputs from UI        
      clearFields: function() {
         var fields, fieldsArr;

         fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

         fieldsArr = Array.prototype.slice.call(fields);

         fieldsArr.forEach(function(current, index, array) {
            current.value = ''; 
         });

         fieldsArr[0].focus();

      },

// Create a function to Display the Budget
      displayBudget: function(obj) {

        var type;
        obj.budget > 0 ? type = 'inc' : type = 'exp';

        document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget,type);
        document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
        document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');
        

        if (obj.percentage > 0) {
          document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
        } else {
          document.querySelector(DOMstrings.percentageLabel).textContent = '---';
        }
         
      },


// Create a function to Display Percentages
      displayPercentages: function(percentages) {

        var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

        nodeListForEach(fields, function(current,index) {
          if (percentages[index] > 0){
            current.textContent = percentages[index] + '%';
          } else {
            current.textContent = '---';
          }
        });
      
      },


// Display Current Month
       
       displayMonth: function() {
        var now, months, month, year;
        now = new Date();
        year = now.getFullYear();
        months = ['January', 'February', 'March', 'April', 'May', 'June', ' July', 'August', 'September', 'October', 'November', 'December'];
        month = now.getMonth();
        document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;


       },

// Add Colors to Boxes Type, Description, Value      
      changedType: function() {

        var fields = document.querySelectorAll(
          DOMstrings.inputType + ',' +
          DOMstrings.inputDescription + ',' +
          DOMstrings.inputValue);
        
      nodeListForEach(fields, function(cur){
          cur.classList.toggle('red-focus');
      });

      document.querySelector(DOMstrings.inputBtn).classList.toggle('red');

      },


// Here is to expose to DOMstring object to public in order to be used by Global App Controller Module 
      getDOMstrings: function(obj, type) {
      	return DOMstrings;
      }       

    };

})();



//GLOBAL APP CONTROLLER
var controller = (function (budgetCtrl, UICtrl) {
  
// Create the function for all events in the APP to be placed
  var setupEventListeners = function() {

      var DOM = UICtrl.getDOMstrings();

      document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem); 

      document.addEventListener('keypress', function(event) {
  
         if (event.keyCode === 13 || event.which === 13) {
         ctrlAddItem();
  
        } 

      });

      document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

      document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
   
  };




  // Create the function to update the Budget
  var updateBudget = function() {

    // 1. Calculate the budget
    budgetCtrl.calculateBudget();
    // 2. Return the budget
    var budget = budgetCtrl.getBudget();
    // 3. Display the budget on the UI
    UICtrl.displayBudget(budget);

  } ;

  // Create the function to update the Percentages
  var updatePercentages = function () {

    // 1. Calculate the Percentage
    budgetCtrl.calculatePercentages();

    // 2. Return the Percentage
    var percentages = budgetCtrl.getPercentages();

    // 3. Display the Percentage on the UI
    UICtrl.displayPercentages(percentages);
  };


// Create the function to set what happens when a new Item is added
  var ctrlAddItem = function () {
    var input, newItem;
 
    // 1. get the field input data
    input = UICtrl.getInput();

    if (input.description !== '' && !isNaN(input.value) && input.value > 0) {

    // 2. add the Item to the budget controller
    newItem = budgetCtrl.addItem(input.type, input.description, input.value);

    // 3. add the item to the UI
    UICtrl.addListItem(newItem, input.type);

    // 4. Clear the fields
    UICtrl.clearFields();
    
    // 5. Calculate and update the Budget
    updateBudget();

    // 6. Calculate and Update the Percentage
    updatePercentages();

    }

  };

//Create the function to set what happens when a new Item is deleted
  var ctrlDeleteItem = function(event) {
      var itemID, splitID;
    
      itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

      if (itemID) {
      
      //inc-1
      splitID = itemID.split('-');
      type = splitID[0];
      ID = parseInt(splitID[1]);

      // 1- Delete the Item from data Structure
      budgetCtrl.deleteItem(type, ID);

      // 2. Delete Item from UI
      UIController.deleteListItem(itemID);

      // 3. Updates the new budget
      updateBudget();

      // 4. Update the Percentage
      updatePercentages();

      }


                  
  };
  
// Here is what happens when we run/refresh the application. Here is to expose setupEvent Listeners to public
  return {
    init: function() {
      console.log('APP Started');
      UICtrl.displayMonth();
      UICtrl.displayBudget({
       budget: 0,
       totalInc: 0,
       totalExp: 0,
       percentage: -1
      }
        );
      setupEventListeners();

    }
  }

})(budgetController,UIController);

controller.init();