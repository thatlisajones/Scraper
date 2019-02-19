$("#scrapeBtn").on("click", function() {
  event.preventDefault()
console.log("clicked the scrape btn");
$.ajax({
    method: "GET",
    url: "/scrape",
}).then(function(data) {
    console.log("scrape complete");
    window.location.reload(true);
})
});

$(".save").on("click", function() {
  var thisId = $(this).attr("data-id");
  console.log(thisId);
  $.ajax({
      method: "POST",
      url: "/articles/save/" + thisId
  }).then(function(data) {
      window.location = "/"
  });
});

$(".remove").on("click", function() {
  var thisId = $(this).attr("data-id");
  console.log("remove this Id: ", thisId);
  $.ajax({
      method: "POST",
      url: "/articles/remove/" + thisId
  }).then(function(data) {
      console.log("in remove on click");
      location.reload(true);
  });
});

$(".addNote").on("click", function() {
  var thisId = $(this).attr("data-id");
  $.ajax({
      mehtod: "GET",
      url: "/articles/" + thisId
  }).then(function (data) {
      console.log(data.note.body);
  });
});

$(".saveNote").on("click", function() {
  var thisId = $(this).attr("data-id");
  var noteInfo = $("#noteArea" + thisId).val();
  console.log(noteInfo);
  $.ajax({
      method: "POST",
      url: "/articles/" + thisId,
      data: {
          body: noteInfo
      }
  }).then(function(data) {
      console.log(data)
      $("#noteArea").val('');
      window.location = "/saved"
  });
});