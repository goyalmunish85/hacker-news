var ITEM_DB = (function () {
  var items = {}
  var counter = 0;

  function getCounterValue() {
    return counter;
  }

  function reinitializeCounter() {
    counter = 0;
  }

  function __getDetailsFromServer(id, trigger) {
    fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
      .then(function (response) {
        return response.json();
      }).then(function (details) {
        items[id] = {
          loading: false,
          data: details
        }
        trigger(null, items[id]);
      })
  }

  function incrementCounter() {
    counter++;
  }

  function getDetailsFromDB(id) {
    return items[id];
  }

  function checkItemExists(id) {
    if (!items[id]) {
      items.id = {
        loading: true
      }
      return false;
    } else {
      return true;
    }
  }

  function getDetails(id, trigger) {
    if (!items[id]) {
      __getDetailsFromServer(id, trigger);
    }
  }
  return {
    getDetails: getDetails,
    checkItemExists: checkItemExists,
    getDetailsFromDB: getDetailsFromDB,
    getCounterValue: getCounterValue,
    incrementCounter: incrementCounter,
    reinitializeCounter: reinitializeCounter
  }
})();



//function to load the items by 20
function loadItems(fetchedIds, calltype) {
  createTableBody();
  ITEM_DB.incrementCounter();
  console.log(ITEM_DB.getCounterValue())
  for (let i = 1; i <= ITEM_DB.getCounterValue() * 20 && i < fetchedIds.length; i++) {
    if (!ITEM_DB.checkItemExists(fetchedIds[i])) {
      createLoadingHTML(fetchedIds[i]);
      ITEM_DB.getDetails(fetchedIds[i], updateRow);
    } else {
      createItemHTML(fetchedIds[i], i);
    }
  }
  createLoadMoreButton(calltype);
}


//function to convert the loading word to story by row wise
function updateRow(err, item) {
  var tdRef = document.getElementById(item.data.id);
  tdRef.innerHTML = `<p>${item.data.score} votes | ${item.data.title}</p>
                      <p> by ${item.data.by} | ${item.data.descendants} comments`;
}



//function for create the button at the end of the loaded stories list
function createLoadMoreButton(calltype) {
  var btn = document.createElement("BUTTON");
  if (calltype == 'bstories') {
    btn.addEventListener("click", bestStories);
  } else if (calltype == 'tstories') {
    btn.addEventListener("click", topStories);
  } else if (calltype == 'nstories') {
    btn.addEventListener("click", newStories);
  }
  btn.innerHTML = 'Load More';
  btnRef = document.getElementById('btn');
  btn.id = 'ldBtn';
  btnRef.append(btn);
}


//function to empty the tbody and also reinitialize to use
function createTableBody() {
  if (document.getElementsByTagName("tbody").length) {
    let el = document.getElementsByTagName("tbody");
    el[0].parentElement.removeChild(el[0]);
    let btnRef = document.getElementById('ldBtn');
    btnRef.parentElement.removeChild(btnRef);
  }
  var tableRef = document.getElementById("table");
  var tbodyTag = document.createElement("tbody");
  tableRef.append(tbodyTag);
}

//create the HTML for which was the in a loading state
function createLoadingHTML(id) {
  var tbodyRef = document.getElementsByTagName("tbody");
  var trTag = document.createElement("tr");
  let tdTag = document.createElement("td");
  tdTag.id = id;
  tdTag.innerHTML = "Loading.....";
  trTag.append(tdTag);
  tbodyRef[0].append(trTag);
}

//create the HTML for founded items in DB
function createItemHTML(id, count) {
  var tbodyRef = document.getElementsByTagName("tbody");
  var trTag = document.createElement("tr");
  let tdTag = document.createElement("td");
  tdTag.id = id;
  var data = ITEM_DB.getDetailsFromDB(id).data;
  tdTag.innerHTML = `<p>${data.score} votes | ${data.title}</p>
                     <p> by ${data.by} | ${data.descendants} comments`;
  trTag.append(tdTag);
  tbodyRef[0].append(trTag);
}

function bestStories() {
  //fetch the best stories by hacker news api
  fetch('https://hacker-news.firebaseio.com/v0/beststories.json?print=pretty')
    .then(function (response) {
      return response.json();
    })
    .then(function (fetchedIds) {
      //call the function to display the stories
      loadItems(fetchedIds, "bstories");
    });
}


function newStories() {
  //fetch the new stories by hacker news api
  fetch('https://hacker-news.firebaseio.com/v0/newstories.json?print=pretty')
    .then(function (response) {
      return response.json();
    })
    .then(function (fetchedIds) {
      //call the function to display the stories
      loadItems(fetchedIds, "nstories");
    });
}


//function for top stories
function topStories() {
  //fetch the top stories by hacker news api
  fetch('https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty')
    .then(function (response) {
      return response.json();
    })
    .then(function (fetchedIds) {
      //call the function to display the stories
      loadItems(fetchedIds, "tstories");
    });
}


//function to call topStories and also reinitialize the counter
function calltopStories() {
  ITEM_DB.reinitializeCounter();
  topStories();
}

//function to call newStories and also reinitialize the counter
function callnewStories() {
  ITEM_DB.reinitializeCounter();
  newStories();
}

//function to call bestStories and also reinitialize the counter  
function callbestStories() {
  ITEM_DB.reinitializeCounter();
  bestStories();
}