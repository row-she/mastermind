var board = document.getElementById('board')
var stageBoard = document.getElementById('stage-board')
var comment = document.getElementById('comment')
var solution = document.getElementById('solution')
var commitButton = document.getElementById('commit')
var stageSeletor = document.getElementById('stage-selector')
var game
var multiMode = true
var limit = 12

function setLimit(node){
  limit = parseInt(node.value)
  retry()
}

function allowMultiple(node){
  if(node.checked){
    multiMode = true
  }
  else {
    multiMode = false
  }
  retry()
}

solution.style.display = "none"
stageSeletor.value = "12"


function init(){
  game = {}
  game.goal = []
  game.activeStage = 0

  for(i=0; i<5; i++){
    if(multiMode){
      let randomNumber = Math.floor(Math.random() * 8)
      game.goal.push(randomNumber)
    }
    else {
      let uniqueRandomNumbers = uniqueNumbers()
      game.goal = uniqueRandomNumbers
    }
  }

  function uniqueNumbers(){
    let array = [0,1,2,3,4,5,6,7]
    for(a=0; a<3; a++){
      let rnd = Math.floor(Math.random() * array.length)
      array.splice(rnd,1)
    }
    shuffleArray(array)
    return array
  }

  function shuffleArray(array){
    var currentIndex = array.length, temporaryValue, randomIndex;
    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
    return array;
  }

  console.log(`Goal: ${JSON.stringify(game.goal)}`);

  for(s=0; s<(limit); s++){
    drawStage(s)
  }

  showActiveStage(0)

}

function cleanup(){
  stageBoard.innerHTML = ""
  comment.innerHTML = ""
  if(comment.classList.contains("won")){
    comment.classList.remove("won")
  }
  solution.innerHTML = ""
  solution.style.display = "none"
  commitButton.style.display = "inline"
}

function retry(){
  cleanup()
  init()
}

init();

function showActiveStage(index){
  if(stageBoard.querySelector("td.stage.active") !== null){
    stageBoard.querySelector("td.stage.active").classList.remove("active")
  }
  stageBoard.querySelector(`td.stage[data-stageIndex="${index}"]`).classList.add("active")
}

function drawStage(index){
  let row = document.createElement("tr")
  row.setAttribute("data-stage", index)
  row.innerHTML = `<td class="stage" data-stageIndex="${index}">${(index+1)}</td>
  <td class="response">
  <div class="pin unset"></div><div class="pin unset"></div><div class="pin unset"></div><div class="pin unset"></div><div class="pin unset"></div>
  </td>`
  for(c=0; c<5; c++){
    row.innerHTML += `
    <td class="guess" data-color="null" onclick="incColor(this, ${index})" oncontextmenu="decColor(this, ${index});return false"></td>
    `
  }
  stageBoard.prepend(row)
}

function incColor(node, index){
  if(!stageActive(index)){
    return false
  }
  let getColor = node.getAttribute("data-color")
  let newColor
  if(getColor == "null"){
    newColor = 0
  }
  else {
    let lastColor = parseInt(getColor)
    if(lastColor < 7){
      newColor = lastColor+1
    }
    else {
      newColor = 0
    }
  }
  node.setAttribute("data-color", newColor)
}

function decColor(node, index){
  if(!stageActive(index)){
    return false
  }
  let getColor = node.getAttribute("data-color")
  let newColor
  if(getColor == "null"){
    newColor = 7
  }
  else {
    let lastColor = parseInt(getColor)
    if(lastColor > 0){
      newColor = lastColor-1
    }
    else {
      newColor = 7
    }
  }
  node.setAttribute("data-color", newColor)
}

function stageActive(index){
  if(game.activeStage == index){
    return true
  }
  return false
}

function submitStage(){
  let stages = stageBoard.querySelectorAll("tr")
  for(s=0; s<stages.length; s++){
    let stage = stages[s].getAttribute("data-stage")
    if(stage == game.activeStage)
    getStageData(stages[s])
  }
}

function getStageData(node){
  let cells = node.querySelectorAll("td.guess")
  let cellArray = []
  for(c=0; c<cells.length; c++){
    let color = cells[c].getAttribute("data-color")
    if(color=="null"){
      alert("Please select color for all five slots!")
      break
    }
    else {
      cellArray.push(parseInt(color))
    }
  }
  if(cellArray.length == 5){
    compareToGoal(cellArray)
  }
}

function compareToGoal(array){
  if(JSON.stringify(game.goal) == JSON.stringify(array)){
    gameOver(true)
  }
  else {
    getResponse(array, game.goal)
  }
}

function getResponse(guess, gameGoal){

  console.log(`Guess: ${JSON.stringify(guess)}`);

  let gameGoalStr = JSON.stringify(gameGoal)
  let goal = JSON.parse(gameGoalStr)
  var blacks = []
  var whites = []

  for(b=0; b<5; b++){
    if(guess[b] == goal[b]){
      blacks.push(b)
    }
  }

  for(h=0; h<blacks.length; h++){
    delete guess[blacks[h]]
    delete goal[blacks[h]]
  }

  let filteredGuess = guess.filter(function(value){
    return value != null
  })

  let filteredGoal = goal.filter(function(value){
    return value != null
  })

  for(f=0; f<filteredGuess.length; f++){
    let probe = filteredGuess[f]
    if(filteredGoal.indexOf(probe) > -1){
      let goalIndex = filteredGoal.indexOf(probe)
      delete filteredGoal[goalIndex]
      delete filteredGuess[f]
      whites.push(f)
    }
  }

  let blackCount = blacks.length
  let whiteCount = whites.length

  renderResponse(blackCount, whiteCount)
}

function renderResponse(black, white){
  let currentRow = stageBoard.querySelector(`tr[data-stage="${game.activeStage}"]`)
  let responseCell = currentRow.querySelector('td.response')
  responseCell.innerHTML = ""
  for(b=0; b<black; b++){
    let pin = document.createElement("DIV")
    pin.classList.add("pin", "black")
    responseCell.appendChild(pin)
  }
  for(w=0; w<white; w++){
    let pin = document.createElement("DIV")
    pin.classList.add("pin", "white")
    responseCell.appendChild(pin)
  }
  let remaining = 5-(black + white)
  for(r=0; r<remaining; r++){
    let pin = document.createElement("DIV")
    pin.classList.add("pin", "unset")
    responseCell.appendChild(pin)
  }
  nextStage()
}

function nextStage(){
  game.activeStage = game.activeStage + 1
  if(game.activeStage == limit){
    gameOver(false)
  }
  else {
    showActiveStage(game.activeStage)
  }
}

function gameOver(success){
  if(success){
    comment.innerHTML = "😈 FUCK YEAH!"
    comment.classList.add("won")
  }
  else {
    comment.innerHTML = "😵 GAME OVER!"
  }
  let row = document.createElement("tr")
  row.innerHTML = "<td class='solution-info'>Solution:</td>"
  for(g=0; g<game.goal.length; g++){
    let color = game.goal[g]
    row.innerHTML += `<td class="guess" data-color="${color}"></td>`
  }
  solution.appendChild(row)
  solution.style.display = "table"
  commitButton.style.display = "none"
}
