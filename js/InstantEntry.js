"use strict"

function funcFindRecord() {
	if($('#inpSearchField').val().length > 3){
		var ajxData="AjaxName=InstantEntrySearch";
		ajxData += "&SearchData=" + $('#inpSearchField').val();
		$.ajax({
			type : "POST",
			url: "http://charlie4washington.com/_Canvass/SubPages/AjaxCalls.php",
			data : ajxData,
			success: function(jsn){
				var aryList = JSON.parse(jsn);
				var htmlResults = funcListGroupFromArray(aryList);
				$('.Results-Container').html(htmlResults);
			}
		});
	}
}
function funcListGroupFromArray(ary){
	var html = "<div class='list-group'>";
	for(var i=0;i<ary.length;i++){
		html += "<button type='button' class='list-group-item' onclick='funcOpenInstantDoor($(this))'>";
		html += ary[i]['Street'];
		html +="</button>"
	}
	html += "</div>";
	return html;
}

function funcOpenInstantDoor(obj){
	var aryTemp = $(obj).text().split(', ');
	var ajxData="AjaxName=CreateInstantEntry";
	ajxData += "&Street=" + aryTemp[0];
	ajxData += "&City=" + aryTemp[1];
	$.ajax({
		type : "POST",
		url: "http://charlie4washington.com/_Canvass/SubPages/AjaxCalls.php",
		data : ajxData,
		success: function(jsn){
			var strName = aryTemp[0].substr(aryTemp[0].indexOf(" ")+1)
			setCookie('WalkList','InstantEntry',1);
			setCookie('StreetName',strName,1);
			setCookie('CurrentView',2,1);
			window.location.href = "http://charlie4washington.com/_Canvass/SubPages/EWalk.php";
		}
	});	
}
