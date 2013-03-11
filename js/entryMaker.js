window.addEventListener("DOMContentLoaded", function () {
  "use strict";
  //set up validation checks on the form
  var entryForm = document.querySelector("#entryForm");

  //entryForm
  entryForm.addEventListener("submit", onFormSubmit);

  //pupulate datalists
  createSpecTitleOptions(entryForm.spectitle.list, berjon.biblio);
  createHREFOptions(entryForm.href.list, berjon.biblio);
  createEntryOptions(entryForm.entryid.list, berjon.biblio);

  //href event handlers
  entryForm.href.addEventListener("invalid", matchValidity);
  entryForm.href.addEventListener("input", matchValidity);
  entryForm.addEventListener("input", showResult);
  entryForm.etAl.addEventListener("change", showResult);

  //Validators
  entryForm.entryid.addEventListener("input", validateEntryID);
  entryForm.spectitle.addEventListener("input", validateSpecTitle);
  entryForm.fetchButton.addEventListener("click", validateFetch);
  entryForm.href.addEventListener("input", validateSpecLink);
  entryForm.validateButton.addEventListener("click", showResult)

  function showResult() {
    var output = document.querySelector("#output"); 
    var key = entryForm.entryid.value;
    var resultSet = {};
    var beautyOpts = {
        indent_size: 2,
        indent_char: ' ',
        preserve_newlines: true,
        jslint_happy: false,
        keep_array_indentation: false,
        brace_style: 'collapse',
        space_before_conditional: true,
        break_chained_methods: false
    }
    var result;

    function formatDate(date){
      var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      var dateObj = new Date(date);
      var formattedDate; 
      if(isNaN(dateObj.getTime())){
        return "";
      }
      formattedDate = dateObj.getDate() + " ";
      formattedDate += months[dateObj.getMonth()] + " " 
      formattedDate += dateObj.getFullYear();
      return formattedDate
    }

    resultSet[key] = {
      authors: entryForm.authors.value.split(", "),
      date: formatDate(entryForm.date.value.trim()),
      href: entryForm.href.value.trim(),
      publisher: entryForm.publisher.value.trim(),
      status: entryForm.status.value.trim(),
      title: entryForm.spectitle.value.trim(),
    };

    if(entryForm.etAl.checked){
      resultSet[key].etAl = true;
    }
    result = JSON.stringify(resultSet);
    result = js_beautify(result, beautyOpts);
    output.innerHTML = result;
  }


  function matchValidity(e) {
    entryForm.fetchButton.disabled = !e.target.validity.valid;
    if (e.target.validity.valid) {
      entryForm.href.setCustomValidity('');
    }
  }

  function fetch(url, button) {
    var xhr = new XMLHttpRequest();

    //normalize URLs
    xhr.open('GET', url);

    xhr.onload = function (e) {
      var spec = $.parseHTML(e.target.responseText);
      entryForm.spectitle.value = findTitle(spec);
      entryForm.authors.value = findEditors(spec);
      entryForm.status.value = findStatus(spec);
      entryForm.publisher.value = findPublisher(url),
      entryForm.date.value = findPubDate(spec),
      entryForm.entryid.value = findShortName(url);
    };
    xhr.onerror = function (e) {
      var msg = "There was an error fetching the URL.";
      alert(msg);
    }
    xhr.send();
    return xhr;
  }

  function validateFetch(e) {
    var self = this;
    var url = entryForm.href.value.trim();
    var progress = document.querySelector("progress");
    var xhr;

    e.preventDefault();

    if (!url) {
      return;
    }

    function enableButton() {
      progress.class = "idle";
      self.disabled = false;
    }

    function disableButton() {
      self.disabled = true;
    }

    clearForm();
    disableButton();
    xhr = fetch(url, this);

    xhr.onprogress = function (e) {
      progress.class = "loading";
      progress.max = e.total;
      progress.value = e.loaded;
    }
    xhr.addEventListener("load", enableButton);
    xhr.addEventListener("load", showResult);
    xhr.addEventListener("error", enableButton);
    showSpec(url);
  }

  function showSpec(url){
     var specDisplay = document.querySelector("#specDisplay");
     specDisplay.src = url;
  }

  function clearForm() {
    entryForm.spectitle.value = "";
    entryForm.authors.value = "";
    entryForm.status.value = "";
    entryForm.publisher.value = "";
    entryForm.date.value = "";
    entryForm.entryid.value = "";
  }

  function validateSpecTitle(e) {
    var selector = 'option[value="' + e.target.value + '"]';
    var option = this.list.querySelector(selector);
    var msg = ""
    if (option && option.dataset.key) {
      if (berjon.biblio.hasOwnProperty(String(option.dataset.key))) {
        msg = 'This spec already exists in the DB!';
      }
    }
    this.setCustomValidity(msg);
  }

  function validateEntryID(e) {
    var msg = "";
    if (berjon.biblio.hasOwnProperty(e.target.value)) {
      msg = 'This ID is already taken!'
    }
    this.setCustomValidity(msg);
  }

  function onFormSubmit(e) {
    e.preventDefault();
    if (!this.checkValidity()) {
      console.log("form is invalid");
      return;
    }
    alert("Looks good to me!");
  }


  function createHREFOptions(elem, biblio) {
    function mapToHTMLOption(id) {
      var record = biblio[id],
          href,
          value;
      if (typeof record === "string") {
        href = $("<div>" + record + "</div>").find("a:first").attr("href") || "";
      } else {
        href = record.href || "";
      }
      value = "<option value=\"" + href + "\" data-key=\"" + id + "\">";
      return value;
    }
    var ids = Object.getOwnPropertyNames(biblio),
      options = ids.map(mapToHTMLOption);
    elem.innerHTML = options.join("");
  }

  function createSpecTitleOptions(elem, biblio) {
    function mapToHTMLOption(id) {
      var record = biblio[id], 
          value, 
          title;
      if (typeof record === "string") {
        title = $("<div>" + record + "</div>").find("a:first").text() || "";
      } else {
        title = record.title || "";
      }
      value = "<option value=\"" + title + "\" data-key=\"" + id + "\">";
      return value
    }
    var ids = Object.getOwnPropertyNames(biblio),
      options = ids.map(mapToHTMLOption);
    elem.innerHTML = options.join("");
  }

  function createEntryOptions(elem, biblio) {
    function mapToHTMLOption(id) {
      var value = "<option value=\"" + id + "\">";
      return value
    }
    var ids = Object.getOwnPropertyNames(biblio),
      options = ids.map(mapToHTMLOption);
    elem.innerHTML = options.join("");
  }

  function validateSpecLink(e) {
    var selector = 'option[value="' + e.target.value + '"]';
    var option = this.list.querySelector(selector);
    var msg = "";
    if (option && option.dataset.key) {
      if (berjon.biblio.hasOwnProperty(String(option.dataset.key))) {
        msg = 'This spec already exists in the DB!';
      }
    }
    this.setCustomValidity(msg);
  }

  function findPublisher(url) {
    var uri = URI(url),
      publisher = uri.domain().split(".")[0].toUpperCase();
    publisher += (publisher === "W3") ? "C" : "";
    return publisher;
  }

  function findShortName(url) {
    //Split on W3C's TR
    var id = (url.match(/TR\/\w+/) || [""])[0].split("TR/");
    if (id) {
      return id.join("").toUpperCase();
    }
    //try IETF
    id = (url.match(/rfc\/\w+/) || [""])[0].split("rfc/");
    if (id) {
      id.join("").toUpperCase();
    }
    return "";
  }

  function findPubDate(spec) {
    var selector = "dl dt:contains(This Version:), dl dt:contains(This version:)",
        dateDD = $(spec).find(selector).next(),
        thisVersionURL = (dateDD.length > 0) ? URI(dateDD.find("a").attr("href")).path() : "",
        date = (thisVersionURL.match(/\d{8}/) || [""])[0],
        formattedDate = "",
        dateObj;

    if (date) {
      //convert to a parsable format
      date = date.substring(0, 4) + "-" + date.substring(4, 6) + "-" + date.substring(6, 8)
    }
    return date;
  }

  function findStatus(spec) {
    //'link[href*="http://www.w3.org/StyleSheets/TR/W3C-"]'
    var status = "",
      style = "http://www.w3.org/StyleSheets/TR/W3C-";
    for (var i = 0, elem; i < spec.length; i++) {
      elem = spec[i];
      if (elem && elem.nodeName === "LINK" && elem.hasAttribute("href") && elem.href.search(style) > -1) {
        //old specs have [status].css in the 
        status = elem.href.split(style)[1].split(".")[0];
      }
    }
    return status;
  }

  function findEditors(spec) {
    //Finds "Editors:", "Editor:" and "Previous Editor:"
    var editors = "dl dt:contains(Editors:),dl dt:contains(Editor:),",
      authors = "dl dt:contains(Author:),dl dt:contains(Authors:),",
      coeds = "dl dt:contains(Co-editors:)",
      allEditors = $(spec).find(editors + authors + coeds).nextUntil("dt", "dd"),
      editors = [];

    allEditors.each(function (index, editor) {
      //assuming names are "xxx yyy, affiliation" or just "xxx yyy" or "x y()"
      var editorName = editor.textContent.split(",")[0].split("(")[0].split("<")[0];
      editorName = editorName.trim();
      editors.push(editorName);
    })
    return editors.join(", ")
  }

  function findTitle(spec) {
    var title = "";
    for (var i = 0, elem; i < spec.length; i++) {
      elem = spec[i];
      if (elem && elem.nodeName === "TITLE") {
        title = elem.textContent
      }
    }
    return title;
  }
});