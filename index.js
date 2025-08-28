var BASE = "https://fsa-crud-2aa9294fe819.herokuapp.com/api";
var COHORT = "/2506-FTB-CT-WEB-PT";
var API = BASE + COHORT;

var parties = [];
var selectedParty = null;
var rsvps = [];
var guests = [];

function getParties() {
  return fetch(API + "/events")
    .then(function (res) { return res.json(); })
    .then(function (json) {
      parties = json && json.data ? json.data : [];
      render();
    })
    .catch(function (err) {
      console.log("getParties error", err);
    });
}

function getParty(id) {
  return fetch(API + "/events/" + id)
    .then(function (res) { return res.json(); })
    .then(function (json) {
      if (json && json.data) {
        if (json.data.event) {
          selectedParty = json.data.event;
        } else {
          selectedParty = json.data;
        }
      } else {
        selectedParty = null;
      }
      render();
    })
    .catch(function (err) {
      console.log("getParty error", err);
    });
}

function getRsvps() {
  return fetch(API + "/rsvps")
    .then(function (res) { return res.json(); })
    .then(function (json) {
      rsvps = (json && json.data) ? json.data : [];
      render();
    })
    .catch(function (err) {
      console.log("getRsvps error", err);
    });
}

function getGuests() {
  return fetch(API + "/guests")
    .then(function (res) { return res.json(); })
    .then(function (json) {
      guests = (json && json.data) ? json.data : [];
      render();
    })
    .catch(function (err) {
      console.log("getGuests error", err);
    });
}

function createParty(data) {
  return fetch(API + "/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: data.name,
      description: data.description,
      date: data.date,
      location: data.location
    })
  })
    .then(function (res) { return res.json(); })
    .then(function () {
      return getParties().then(function () {
        if (parties.length > 0) {
          var last = parties[parties.length - 1];
          return getParty(last.id);
        }
      });
    })
    .catch(function (err) {
      console.log("createParty error", err);
      alert("Could not create party.");
    });
}

function deleteSelectedParty() {
  if (!selectedParty || !selectedParty.id) return;
  var ok = confirm('Delete "' + selectedParty.name + '"?');
  if (!ok) return;

  fetch(API + "/events/" + selectedParty.id, { method: "DELETE" })
    .then(function () {
      selectedParty = null;
      return getParties();
    })
    .catch(function (err) {
      console.log("deleteSelectedParty error", err);
      alert("Could not delete party.");
    });
}

function PartyListItem(party) {
  var li = document.createElement("li");
  if (selectedParty && party.id === selectedParty.id) {
    li.className = "selected";
  }
  var a = document.createElement("a");
  a.href = "#selected";
  a.textContent = party.name;
  a.addEventListener("click", function () {
    getParty(party.id);
  });
  li.appendChild(a);
  return li;
}

function PartyList() {
  var ul = document.createElement("ul");
  ul.className = "parties";
  for (var i = 0; i < parties.length; i++) {
    var item = PartyListItem(parties[i]);
    ul.appendChild(item);
  }
  return ul;
}

function PartyForm() {
  var form = document.createElement("form");
  form.setAttribute("aria-label", "Create a new party");
  form.innerHTML =
    '<h2>Create Party</h2>' +
    '<label>Name <input name="name" required placeholder="e.g., JS Meetup" /></label>' +
    '<label>Description <textarea name="description" rows="3" required></textarea></label>' +
    '<label>Date & Time <input name="date" type="datetime-local" required /></label>' +
    '<label>Location <input name="location" required placeholder="e.g., Ballroom A" /></label>' +
    '<button type="submit">Add Party</button>';

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var fd = new FormData(form);
    var name = (fd.get("name") || "").trim();
    var desc = (fd.get("description") || "").trim();
    var local = fd.get("date");
    var loc = (fd.get("location") || "").trim();
    if (!name || !desc || !local || !loc) return;
    var iso = new Date(local).toISOString();
    createParty({
      name: name,
      description: desc,
      date: iso,
      location: loc
    }).then(function () {
      form.reset();
    });
  });
  return form;
}

function GuestList() {
  var ul = document.createElement("ul");
  if (!selectedParty) return ul;
  for (var i = 0; i < guests.length; i++) {
    var g = guests[i];
    var isGoing = false;
    for (var j = 0; j < rsvps.length; j++) {
      var r = rsvps[j];
      if (r.guestId === g.id && r.eventId === selectedParty.id) {
        isGoing = true;
        break;
      }
    }
    if (isGoing) {
      var li = document.createElement("li");
      li.textContent = g.name;
      ul.appendChild(li);
    }
  }
  return ul;
}

function SelectedParty() {
  if (!selectedParty) {
    var p = document.createElement("p");
    p.textContent = "Please select a party to learn more.";
    return p;
  }
  var sec = document.createElement("section");
  var h3 = document.createElement("h3");
  h3.textContent = selectedParty.name + " #" + selectedParty.id;
  var time = document.createElement("time");
  time.setAttribute("datetime", selectedParty.date);
  var dateText = String(selectedParty.date);
  time.textContent = dateText.slice(0, 10);
  var addr = document.createElement("address");
  addr.textContent = selectedParty.location;
  var p2 = document.createElement("p");
  p2.textContent = selectedParty.description;
  var h4 = document.createElement("h4");
  h4.textContent = "Guests";
  var delBtn = document.createElement("button");
  delBtn.id = "delete-btn";
  delBtn.textContent = "Delete Party";
  delBtn.style.background = "#c62828";
  delBtn.style.color = "#fff";
  delBtn.style.border = "none";
  delBtn.style.borderRadius = ".25rem";
  delBtn.style.padding = ".5rem 1rem";
  delBtn.style.cursor = "pointer";
  delBtn.addEventListener("click", function () {
    deleteSelectedParty();
  });
  sec.appendChild(h3);
  sec.appendChild(time);
  sec.appendChild(addr);
  sec.appendChild(p2);
  sec.appendChild(h4);
  sec.appendChild(GuestList());
  sec.appendChild(document.createElement("p")).appendChild(delBtn);
  return sec;
}

function render() {
  var app = document.querySelector("#app");
  app.innerHTML =
    '<h1>Party Planner Admin</h1>' +
    '<main>' +
    '  <section>' +
    '    <h2>Upcoming Parties</h2>' +
    '    <div id="party-list"></div>' +
    '  </section>' +
    '  <section id="selected">' +
    '    <div id="selected-holder"></div>' +
    '  </section>' +
    '  <section id="create">' +
    '    <div id="form-holder"></div>' +
    '  </section>' +
    '</main>';
  var listHolder = document.getElementById("party-list");
  var selHolder = document.getElementById("selected-holder");
  var formHolder = document.getElementById("form-holder");
  listHolder.innerHTML = "";
  listHolder.appendChild(PartyList());
  selHolder.innerHTML = "";
  selHolder.appendChild(SelectedParty());
  formHolder.innerHTML = "";
  formHolder.appendChild(PartyForm());
}

function init() {
  getParties()
    .then(getRsvps)
    .then(getGuests)
    .then(function () {
      render();
    });
}

init();
