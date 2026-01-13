  <!DOCTYPE html>
<html>
<head>
    <title></title>
    <script src="boot/js/bootstrap.bundle.min.js"></script>
<script src="boot/js/bootstrap.bundle.js"></script>
<script src="boot/js/jquery.js"></script>
<script src="boot/js/bootstrap.min.js"></script>
<link rel="stylesheet" type="text/css" href="register2.css">
<link href="fontawesome-free-6.0.0-web/css/all.css" rel="stylesheet">
 
</head>
<body>
  <nav>
<a href="bingo2.php"><img src="bingo.png" class="imglogo" style="width: 10%;height: 40px;"></a>
       <div class="nav-right">
        <div class="players" onclick="toggleText(this)">
            <i class="fas fa-eye"></i> <!-- Eye Icon -->
        </div>
        <p><a href="register_card.php">Register New Card</a></p>
    </div>
</nav>

       <p style="display: none;" id="cardnum">7</p>
    <p style="display: none;" id="lastcardnum">7</p>
    <p style="display: none;" id="lastprice">10</p>
    <p style="display: none;" id="round">2</p>

<h1 style="text-align: center;color: white;margin-top:50px;">Round 2</h1>
<div class='content'>
 <div class="balls">
          <div  style="text-align: center;color: white;display:flex;justify-content: space-around;">
              <h2 style="color: white;">ካርድ ቁጥሮች</h2>
<button id="reloadButton" class="reload-button" >Reload</button>
 <button   id="myadd" onclick=" return Addbingo();" class="reload-button" style="color:#444;background-color:#ffde21;" >በነበረው ጨውታ ይቀጥሉ</button>

     </div>
            <div class="balls-line">
              <div class="container" id="circledNumbers">
        <!-- Circled numbers will be displayed here -->
    </div>
    <div class="next" id="pagination">
        <button onclick="previousPage()">Previous</button>
        <div id="pageButtons"></div>
        <button onclick="nextPage()">Next</button>
    </div>
        <p style="display: none;" id="totalcard">149</p>
        </div>
        </div>
        <div id="regcard" >
        <h1 style="letter-spacing: 4px;color: white;">ካርድ ቁጥሮት መመዝገቡን ይመልከቱ</h1>    
        <table id="tablereg" style="color: white;">
            
        </table>
          
     <form id="gameForm" action="insert_game.php" method="POST">
    <select required class="form-control" name="birr" id="birr" style="font-size:32px;font-weight: bold;">
        <option value="" >የብር መጠን</option>
        <option value="10" selected>በ 10ብር</option>
        <option value="20" >በ 20ብር</option>
        <option value="30" >በ 30ብር</option>
        <option value="40" >በ 40ብር</option>
        <option value="50" >በ 50ብር</option>
        <option value="100" >በ 100ብር</option>
        <option value="200" >በ 200ብር</option>
        <option value="300" >በ 300ብር</option>
        <option value="400" >በ 400ብር</option>
        <option value="500" >በ 500ብር</option>
    </select>

    
<select required class="form-control" name="pattern" id="pattern" style="font-size:32px;font-weight: bold;">
    <option value="1" selected>ኣንድ መስመር /Any Line</option>
    <option value="2" >ሁለት መስመር/Any Two Lines</option>
    <option value="3" >ኣራቱ ማኣዝን ነጠብጣብ/Four corner</option>
    <option value="4" >ኣንድ የቆመ መስመር/Any one Vertical</option>
    <option value="5" >ኣንድ ኣግዳሚ መስመር/Any one Horizontal</option>
    <option value="6" >ሁለት የቆመ መስመር/Any two Vertical</option>
    <option value="7" >ሁለት ኣግዳሚ መስመር/Any two Horizontal</option>
    <option value="8" >ጎን ለ ጎን ሁለት የቆመ መስመር /Two Vertical Lines Together</option>
    <option value="9" >ጎን ለ ጎን ሁለት ኣግዳሚ መስመር /Two Horizental Lines Together</option>
    <option value="10" >ሁለት ዲያጎናል/X pattern (both diagonals)</option>
    <option value="12" >ዙርይው 4 መስመር/Big Frame</option>
    <option value="13" >T ብቻ /T pattern only</option>
    <option value="14" >T በ 4 ኣቅጣጫ/T in all direction</option>
    <option value="15" >L ብቻ /L pattern only</option>
    <option value="16" >L በ 4 ኣቅጣጫ/L in all direction</option>
    <option value="17" >E Pattern</option>
    <option value="18" > G an O</option>
    <option value="19" >B and O</option>
    <option value="20" >ራይት/Mark </option>
    <option value="21" >ከግማሽ ወደላይ ተገዳሚ ሶስት መስመር /half above </option>
    <option value="22" >ከግማሽ ወደታች ተገዳሚ ሶስት መስመር /half below </option>
    <option value="23" >Full House/ሙሉ ዝግ</option>

</select>

    <!-- Hidden input to store selected numbers -->
    <input type="hidden" name="selectedcard" id="selectedcard">

    <button type="submit" style="width: 160px;height: 50px;border-radius: 10px;color: white;background-color: blue;margin-left: 20%;font-size: 32px;cursor: pointer;">
        PLAY
    </button>
</form>


        </div>
    
    </div>

<div id="resultContainer" ></div>
</div>

<script type="text/javascript">
 
   
   // alert(income);
const circledNumbers = document.getElementById("circledNumbers");
const totalNumbers = parseInt(document.getElementById("totalcard").innerText);
const numbersPerPage = 154;
const totalPages = Math.ceil(totalNumbers / numbersPerPage);
const paginationDiv = document.getElementById("pagination");

if (totalPages <= 1) {
    paginationDiv.style.display = 'none'; // Hide pagination if no pages
} else {
    paginationDiv.style.display = 'flex'; // Show pagination if pages exist
}

let currentPage = 1;
let selectedNum = [];

function generateNumbers(startIndex) {
    circledNumbers.innerHTML = "";
    for (let i = startIndex; i < startIndex + numbersPerPage && i <= totalNumbers; i++) {
        const number = document.createElement("div");
        number.classList.add("box");
        number.textContent = i;
        number.setAttribute("numb", i);
        
        // Highlight selected numbers
        if (selectedNum.includes(i)) {
            number.classList.add("snum");
        }

        number.onclick = () => selecting(i); // Set the click event
        circledNumbers.appendChild(number);
    }

    // Update the display of selected numbers after generating new numbers
    updateSelectedNumbers();
}


// Function to show a specific page
function showPage(page) {
    currentPage = page;
    const startIndex = (page - 1) * numbersPerPage + 1;
    generateNumbers(startIndex);
    updatePagination();
}

// Function to update pagination buttons
function updatePagination() {
    const pageButtonsContainer = document.getElementById("pageButtons");
    pageButtonsContainer.innerHTML = ""; // Clear existing buttons

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement("button");
        button.textContent = i;
        button.onclick = () => showPage(i);
        if (i === currentPage) {
            button.disabled = true; // Disable button for the current page
        }
        pageButtonsContainer.appendChild(button);
    }
}

// Function for previous page
function previousPage() {
    if (currentPage > 1) {
        showPage(currentPage - 1);
    }
}

// Function for next page
function nextPage() {
    if (currentPage < totalPages) {
        showPage(currentPage + 1);
    }
}

// Initialize the first page
showPage(1);

// Function to update the display of selected numbers
function updateSelectedNumbers() {
    const table = document.getElementById("tablereg");
    // Clear existing rows
    while (table.rows.length > 0) {
        table.deleteRow(0);
    }

    let countrow = 0;
    for (let i = 0; i < selectedNum.length; i++) {
        if (i % 6 === 0) {
            const row = table.insertRow(countrow);
            countrow++;
        }
        const cell = table.rows[countrow - 1].insertCell(i % 6);
        cell.innerHTML = selectedNum[i];
        cell.className = "custom-cell"; // Add a class to the cell
    }

    // Show or hide the registration card based on selected numbers
    document.getElementById('regcard').style.display = selectedNum.length > 0 ? 'block' : 'none';
}
   
  var cardnum=document.getElementById('cardnum').innerText;
  var lastcardnum=document.getElementById('lastcardnum').innerText;
  var lastprice=document.getElementById('lastprice').innerText;
  function getRandomCard() {
    var cards = lastcardnum.split(',').map(Number); 
    var randomIndex = Math.floor(Math.random() * cards.length);
    return cards[randomIndex];
}

    function Addbingo(){
    if (cardnum.trim() === "") {
  var cards=lastcardnum.split(',').map(Number);
  for (var i = cards.length - 1; i >= 0; i--) {
    if(cards[i]!==0){
        selecting(cards[i]);
    }
   
  }
} else{
    var cards=cardnum.split(',').map(Number);
  for (var i = cards.length - 1; i >= 0; i--) {
    if(cards[i]!==0){
        selecting(cards[i]);
    }
  }  
}
  }
  if (cardnum.trim() !== "") {
  var cards=cardnum.split(',').map(Number);
  for (var i = cards.length - 1; i >= 0; i--) {
    selecting(cards[i]);
  }
} 
    function selecting(a) {
    var flag = 0;
    var index;

    if (selectedNum.length === 0) {
        selectedNum.push(a);
    } else if (selectedNum.length === 1 && selectedNum[0] === a) {
        selectedNum.splice(0, 1);
    } else {
        for (var i = selectedNum.length - 1; i >= 0; i--) {
            if (selectedNum[i] === a) {
                //selectedNum.splice(a,1);
                flag = 1;
                index = i;
            }
        }

        if (flag === 1) {
            selectedNum.splice(index, 1);
        } else {
            selectedNum.push(a);
            flag = 0;
        }
    }

    console.log(selectedNum);

  // Toggle the class before updating the display
    const element = document.querySelector(`[numb="${a}"]`);
    if (element) {
        element.classList.toggle('snum', selectedNum.includes(a)); // Use toggle with condition
    }

    // Update the display of selected numbers
    updateSelectedNumbers();
}


document.getElementById("gameForm").onsubmit = function() {
    document.getElementById("selectedcard").value = selectedNum.join(', ');
    localStorage.setItem("pattern", document.getElementById("pattern").value);
    localStorage.setItem("selectedcard", document.getElementById("selectedcard").value);
};


$("#reloadButton").on('click', function() {
    location.reload(); // Reload the current page
});
 function myFunction() {
  var x = document.getElementById("topnav");
  if (x.className === "menu") {
    x.className += " responsive";
  } else {
    x.className = "menu";
  }
}

function toggleText(element) {
            if (element.innerHTML.includes("fa-eye")) {
                element.innerHTML = selectedNum.length; // Replace with your bingo text
            } else {
                element.innerHTML = '<i class="fas fa-eye"></i>'; // Show the eye icon again
            }
        }

</script>
</body>
</html>