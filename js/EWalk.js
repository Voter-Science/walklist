"use strict"
var aryDATA = [];
var aryFIELDS = ["RecId","FirstName","LastName","Birthday","Gender","City","Zip","Address","Lat","Long","Party","History","PrecinctName","Supporter","Cellphone","Email","Comments","ResultOfContact"];
var arySTREETLIST = [];
var intCURRENTDOOR = 0;
var intPREVDOOR = -1;
var intNEXTDOOR = 1;
var aryCURRENTSTREET = [];
var aryDOORCOUNT = [];
var aryVIEWING = ['list-select','street-select','door-select','person-select','map-view'];
var intCURRENTVIEW = 0;
var intPOSTCOMPLETE = 0;
var objSHEETLOGIN;
var intSINGLEVOTER = 0;
var dblCARLAT = 0;
var dblCARLON = 0;

// Startup function called by the plugin
function PluginMain(login) {
    objSHEETLOGIN = login; // Save for when we do Post
    trcGetSheetContents(login, function (contents) { return funcProcessList(contents); });
    trcGetSheetInfo(login, function (info) { return funcRecordSheetInfo(info); });
    intCURRENTVIEW = 1;
	funcListFromSelect();
    funcChangeView();
}
function funcChangeView(){
	$('.Results-Container').html('');
	//Show and Hide accordinginly
	for(var i=0;i<aryVIEWING.length;i++){
		$('.' + aryVIEWING[i]).addClass('hidden');
	}
	$('.' + aryVIEWING[intCURRENTVIEW]).removeClass('hidden');
	
	//Set the buttons properly
	switch(aryVIEWING[intCURRENTVIEW]) {
		case 'list-select':
			$('.control-buttons').addClass('hidden');
			break;
		case 'street-select':
			$('.control-buttons').removeClass('hidden');
			$('.control-buttons .btn:nth-child(1)').removeClass('btn-danger');
			$('.control-buttons .btn:nth-child(1)').addClass('btn-success');		
			$('.control-buttons .btn:nth-child(1)').text('New List');
			$('.control-buttons .btn:nth-child(2)').text('MAP');
			$('.control-buttons .btn:nth-child(3)').text('Walk');
			$('.control-buttons .btn:nth-child(3)').css('visibility','visible');
			$('.control-buttons .btn:nth-child(3)').css('visibility','visible');
			funcClearStreetField();
			break;
		case 'door-select':
			$('.control-buttons').removeClass('hidden');
			$('.control-buttons .btn:nth-child(1)').text('PREV');
			$('.control-buttons .btn:nth-child(1)').removeClass('btn-danger');
			$('.control-buttons .btn:nth-child(1)').addClass('btn-success');	
			$('.control-buttons .btn:nth-child(2)').css('visibility','visible');
			$('.control-buttons .btn:nth-child(2)').text('NEW STREET');
			$('.control-buttons .btn:nth-child(3)').text('NEXT');
			$('.control-buttons .btn:nth-child(3)').css('visibility','visible');
			$('.control-buttons .btn:nth-child(3)').removeAttr("disabled");			
			break;
		case 'person-select':
			$('.control-buttons').removeClass('hidden');
			$('.control-buttons .btn:nth-child(1)').text('Cancel');
			$('.control-buttons .btn:nth-child(1)').removeClass('btn-success');
			$('.control-buttons .btn:nth-child(1)').addClass('btn-danger');
			$('.control-buttons .btn:nth-child(2)').css('visibility','hidden');			
			$('.control-buttons .btn:nth-child(3)').text('Submit');
			$('.control-buttons .btn:nth-child(3)').removeAttr("disabled");	
			
			break;
		case 'map-view':
			$('.control-buttons').addClass('hidden');
			$('.control-buttons .btn:nth-child(1)').text('Cancel');
			$('.control-buttons .btn:nth-child(1)').removeClass('btn-success');
			$('.control-buttons .btn:nth-child(1)').addClass('btn-danger');
			$('.control-buttons .btn:nth-child(2)').css('visibility','hidden');			
			$('.control-buttons .btn:nth-child(3)').text('Submit');
			$('.control-buttons .btn:nth-child(3)').removeAttr("disabled");	
			
			break;
		default:
			alert("switch block escape:  qe53vdadde");
	}
}

// Process sheet information
function funcRecordSheetInfo(info) {
	$('.loading-logo').addClass('hidden');
}

function funcProcessList(jsnReturn){
	var aryTemp = [];
	var x,y;
	var strVisitedDoors = '@@@';
	for(x=0;x<aryFIELDS.length;x++){
		aryTemp[aryFIELDS[x]] =  String(jsnReturn[aryFIELDS[x]]).split(",");
	}
	//Flip the row/column of the TRC data to interface with original array formation
	for(x=0;x<aryTemp[aryFIELDS[0]].length;x++){
		aryDATA.push(funcSplitAddress(aryTemp['Address'][x]));
		for(y=0;y<aryFIELDS.length;y++){
			if(aryFIELDS[y]=='Birthday'){
				aryDATA[x][aryFIELDS[y]] = funcDateDiff(aryTemp[aryFIELDS[y]][x]);
			}
			else{
				aryDATA[x][aryFIELDS[y]] = aryTemp[aryFIELDS[y]][x];
			}
		}
	}
	//Collect the doors that have been visited already
	for(x=0;x<aryDATA.length;x++){
		if(aryDATA[x]['ResultOfContact'].length>0){
			strVisitedDoors += ';' + aryDATA[x]['Address'];
		}
	}
	//Remove those doors
	for(x=0;x<aryDATA.length;x++){
		if(strVisitedDoors.indexOf(aryDATA[x]['Address']) > -1){
			aryDATA.splice(x,1);
			x--;
		}
	}
	if(aryDATA.length > 0){
		funcCompileStreets();
		funcChooseOddEven();
		funcChangeView();
	}
	else{
		alert("There is no walking list with that name");
	}
	$('.loading-logo').addClass('hidden');
}
function funcSplitAddress(strAddress){
	var aryTemp = strAddress.split(" ");
	var objData = [];
	objData['StreetNum'] = aryTemp[0];
	objData['Street'] = '';
	for(var i=1;i<aryTemp.length;i++){
		if(aryTemp[i].indexOf('#') > -1)
		{
			break;
		}
		if(!funcIsEmpty(aryTemp[i])){
			objData['Street'] += aryTemp[i] + " ";
		}
	}
	return objData;
}
function funcDateDiff(strDate){
	var d = new Date(strDate);
	var td = new Date();
	return Math.floor((td-d)/31556952000) + " yrs";
}
function funcCompileStreets(){

	funcSortMasterArray(true);
	
	//Capture the amount of voters living on each street
	var strCurrentStreet;
	var intDoorCount = 1;
	var intCurrentDoor;
	for(var x=0;x<aryDATA.length;x++){
		if(aryDATA[x]['Street'] != strCurrentStreet){
			if(x>0){
				//This pushes in the LAST door count, before door count is resset to zero.
				aryDOORCOUNT.push(intDoorCount);
			}
			arySTREETLIST.push(aryDATA[x]['Street']);
			strCurrentStreet = aryDATA[x]['Street'];
			intDoorCount = 1;
			intCurrentDoor = aryDATA[x]['StreetNum'];
		}
		else{
			if(aryDATA[x]['StreetNum'] != intCurrentDoor){
				intCurrentDoor = aryDATA[x]['StreetNum'];
				intDoorCount ++;
			}
		}
	}
	aryDOORCOUNT.push(intDoorCount);//Add in the last door count
}

function funcFindStreet() {
	var htmlResults = '';
	var strSearchText = $('#inpSearch').val().toLowerCase();
	var strMatches = ";";
	var aryResults = [];
	//Find matches in the array
	for(var x=0;x<arySTREETLIST.length;x++){
		//If the street being analyzed has text that matches the search text or the search text says "all" AND in addition to those two reaquirements you have not already added this street to the result
		if((arySTREETLIST[x].toLowerCase().indexOf(strSearchText) != -1 || strSearchText == 'all') && strMatches.indexOf(arySTREETLIST[x].toLowerCase()) == -1){
				//Save the index of the street to the results
				aryResults.push(x);
				strMatches += aryDATA[x]['Street'].toLowerCase() + ";";
		}
		//Return a maximum of 20 results
		if(aryResults.length > 20){
			break;
		}
	}
	if(aryResults.length > 0)
	{
		htmlResults = funcTableOfSearchResults(aryResults);
	}
	else{
		htmlResults = '<div><h3>NONE</h3></div>';
	}
	$('.Results-Container').html(htmlResults);
}
function funcTableOfSearchResults(ary){
	var html = "<table class='table table-striped table-hover table-condensed'>";
	html += "<thead><tr><th>Street</th><th>Doors</th></tr></thead><tbody>"
	for(var x=0;x<ary.length;x++){
		html += "<tr onclick='funcStreetSelect($(this))'><td>" + arySTREETLIST[ary[x]] + "</td>";
		html += "<td><span class='badge'>" + aryDOORCOUNT[ary[x]] + "</span></td></tr>";
		/*
		Not sure if this is deserible any more.  You limit the results to 20 in the function funcFindStreet
		if(x > 4){
			html += "<tr><td><small><em>Narrow your search . . .</em></small></td><td></td></tr>";
			break;
		}
		*/
	}
	html += "</tbody></table>";
	return html;
}
function funcStreetSelect(obj){
	$('.control-buttons .btn:nth-child(3)').removeAttr("disabled");	
	$('#inpSearch').val($(obj).find('td:first-child').text());
	$('.Results-Container').html('');
}
function funcChooseOddEven(){
	if($('input[name=rdbOddEven]:checked', '#frmOddEven').val() == 'OddEven'){
		$('#frmOddEvenSequence').removeClass('hidden');
		$('.TR-Separator').removeClass('hidden');
	}
	else{
		$('#frmOddEvenSequence').addClass('hidden');
		$('#div2ndSeperator').addClass('hidden');		
	}
}
function funcBtnLeft(){
	switch(aryVIEWING[intCURRENTVIEW]) {
		case 'list-select':
			//Not applicable  buttons aren't showing in list-select view
			break;
		case 'street-select':
			intCURRENTVIEW = 0;
			funcChangeView();
			break;
		case 'door-select':
			funcMove(-1);
			break;
		case 'person-select':
			intCURRENTVIEW = 2;
			funcChangeView();
			
			break;
		default:
			alert("switch block escape:  qe53vdadde");
	}	
}
function funcBtnMiddle(){
	switch(aryVIEWING[intCURRENTVIEW]) {
		case 'list-select':
			//Not applicable  buttons aren't showing in list-select view
			break;
		case 'street-select':
			funcOpenMap();
			break;
		case 'door-select':
			intCURRENTVIEW = 1;
			intMAPDOOR = 0;
			funcChangeView();
			break;
		case 'person-select':
			//Not applicable, middle button isn't shown in person-select view
			break;
		default:
			alert("switch block escape:  qe&&34dne");
	}	
}
function funcBtnRight(){
	switch(aryVIEWING[intCURRENTVIEW]) {
		case 'list-select':
			//Not applicable  buttons aren't showing in list-select view
			break;
		case 'street-select':
			intMAPDOOR = 0;
			funcWalkStreet();
			intCURRENTVIEW = 2;
			funcChangeView();
			break;
		case 'door-select':
			funcMove(1);
			break;
		case 'person-select':
			funcRecordPersonContactTRC();
			break;
		default:
			alert("switch block escape:  qedeifdde");
	}
}
function funcWalkStreet(){
	var aryDoorCollector = [];
	aryCURRENTSTREET = [];
	$('.div-street-name').text($('#inpSearch').val());
	var intTempDoor = 0;
	var blnOnStreet = false;

	funcSortMasterArray(false);
			
	//Create an array for just the current street by slicing the main array at the start of this street name
	for(var x=0;x<aryDATA.length;x++){
		if(aryDATA[x]['Street'] == $('#inpSearch').val()){
			blnOnStreet = true;
			if(aryDATA[x]['StreetNum'] == intTempDoor){//Still at the same door?
				aryDoorCollector.push(aryDATA[x]);
			}
			else{//This is a new door
				intTempDoor = aryDATA[x]['StreetNum'];
				if(aryDoorCollector.length > 0){
					aryCURRENTSTREET.push(aryDoorCollector.slice());//Push the last door into the array
					aryDoorCollector = [];
				}
				aryDoorCollector.push(aryDATA[x]);
			}
		}
		else{
			if(aryDATA[x]['Street'] != $('#inpSearch').val() && blnOnStreet){
				aryCURRENTSTREET.push(aryDoorCollector.slice());//Push the last door into the array
				break;
			}
		}
	}
	if(aryCURRENTSTREET.length == 0 && blnOnStreet){
		aryCURRENTSTREET.push(aryDoorCollector.slice());
	}
	if(intMAPDOOR != 0){
		for(var x=0;x<aryCURRENTSTREET.length;x++){
			if(aryCURRENTSTREET[x][0]['StreetNum'] == intMAPDOOR){
				intCURRENTDOOR = x;
				break;
			}
		}
	}
	funcAddressContents();
}

function funcSortMasterArray(blnDefaultSort){

/*
    -1: Put b before a
     0: Don't sort
     1: Put a before b
*/
	var blnHighFirst = $('input[name=rdbDirection]:checked', '#frmDirection').val() == 'High2Low';
	var blnGroupByOddEven = $('input[name=rdbOddEven]:checked', '#frmOddEven').val() == 'OddEven';
	var blnEvensFirst = $('input[name=rdbOddEvenSequence]:checked', '#frmOddEvenSequence').val() == 'Even';
	if(blnDefaultSort){
			blnHighFirst = true;
			blnGroupByOddEven = false;
			blnEvensFirst = false;
	}
	if(blnGroupByOddEven){
		$('#frmOddEvenSequence').removeClass('hidden');
		$('.TR-Separator').removeClass('hidden');
	}
	else{
		$('#frmOddEvenSequence').addClass('hidden');
		$('#div2ndSeperator').addClass('hidden');		
	}

	//Group the streets together
	aryDATA.sort(function(a,b){
		var a1=a.Street.toLowerCase(),b1=b.Street.toLowerCase();
		if(a1== b1) return 0;
		return a1> b1? 1: -1;
	});

	//Sort by High to Low or low to high as appropriate
	aryDATA.sort(function(a,b){
		var a1=a.Street.toLowerCase(),b1=b.Street.toLowerCase();
		var a2=Number(a.StreetNum), b2=Number(b.StreetNum);
		
		//Now that streets have been grouped, do not do any sorting amongst the street names themselves
		if(a1!= b1 || (a1 == b1 && a2 == b2)){
			return 0;
		}
		else{//Sort by high to low or low to high as appropriate
			if(blnGroupByOddEven){
				if(funcIsEven(a2) == funcIsEven(b2)){//They are both odd or both even, so sort them amongst themselves
					if(funcIsEven(a2)){//Two even numbers
						if((blnHighFirst && blnEvensFirst) || (!blnHighFirst && !blnEvensFirst)){
							return a2<b2? 1: -1;
						}
						else{
							return a2<b2? -1: 1;
						}
					}
					else{//Two odd numbers
						if((blnHighFirst && blnEvensFirst) || (!blnHighFirst && !blnEvensFirst)){//Sort Odd Low to High
							return a2<b2? -1: 1;
						}
						else{//Sort Odd High to Low
							return a2>b2? -1: 1;
						}
					}
				}
				else{
					if((funcIsEven(a2) && blnEvensFirst) || (!funcIsEven(a2) && !blnEvensFirst)){//Put the even number first
						return -1;
					}
					else{
						return 1;
					}
				}
			}
			else{//Just sort high to low
				if(blnHighFirst){
					return a2>b2? -1: 1; 
				}
				else{
					return a2>b2? 1: -1;
				}
			}
		}
	});
}
function funcAddressContents(){
	intPREVDOOR = funcGetNext(-1);
	intNEXTDOOR = funcGetNext(1);
	$('#divStreetNos>.text-left').text(funcIsEnd(intPREVDOOR));
	$('#divStreetNos>.text-center').html("<strong>" + aryCURRENTSTREET[intCURRENTDOOR][0]['StreetNum'] + "</strong>");
	$('#divStreetNos>.text-right').text(funcIsEnd(intNEXTDOOR));
	
	//Add voter names
	var html = "<table class='table table-condensed'><tbody><tr onclick='funcNoAnswer()'><td colspan='6' class='text-center'><h4>Click HERE if no contact</h4></td></tr>";
	for(var x=0;x<aryCURRENTSTREET[intCURRENTDOOR].length;x++){

		if(aryCURRENTSTREET[intCURRENTDOOR][x]['Comments'] != null && aryCURRENTSTREET[intCURRENTDOOR][x]['Comments'] != '' ){//Has a note
			html += "<tr class='row-highlight-moreinfo' ";
		}
		else{
			html += "<tr ";
		}
		html += "onclick='funcPersonPicked($(this))'><td><div class='hidden'>" + aryCURRENTSTREET[intCURRENTDOOR][x]['RecId'] + "</div></td><td style='vertical-align:middle'><h4>" + aryCURRENTSTREET[intCURRENTDOOR][x]['LastName'] + ", " + aryCURRENTSTREET[intCURRENTDOOR][x]['FirstName'] + "</h4></td>";
		html += "<td style='vertical-align:middle'>";
		html += aryCURRENTSTREET[intCURRENTDOOR][x]['Party'].substring(0,1);
		html += "</td>";
		html += "<td style='vertical-align:middle'>" + aryCURRENTSTREET[intCURRENTDOOR][x]['Gender'] + "</td><td style='vertical-align:middle'>" + aryCURRENTSTREET[intCURRENTDOOR][x]['Birthday'] + "</td><td><div class='hidden' id='divVoterId'>" + aryCURRENTSTREET[intCURRENTDOOR][x]['RecId'] + "</div></td></tr>";
	}
	html += "</tbody></table>";
	$('.div-voter-holder').html(html);
	$('.div-voter-holder>table>tbody>tr:nth-of-type(odd)').addClass('altColorGreen');
	if(!aryCURRENTSTREET[intCURRENTDOOR][0]['Visited']){
		//This address has not been visited before
	}
	else{
		$('.div-voter-holder>table>tbody>tr').addClass('voter-visited');
	}
}


function funcMove(i){
	var x = funcGetNext(i);
	if (x > -1){
		intCURRENTDOOR = x;
	}
	funcAddressContents();
}

function funcGetNext(intTempDirection){
	var x = intCURRENTDOOR + intTempDirection;
	if(x < 0 || x > aryCURRENTSTREET.length-1){
			return -1;
		}
	return x;	
}
function funcIsEnd(i){
	if(i<0){
		return "-END-";
	}
	else{
		return aryCURRENTSTREET[i][0]['StreetNum'];
	}
}
function funcNoAnswer(){
	$('#slctNoContact').removeClass('hidden');
	$('#slctNoContact').focus();
	$('#slctNoContact').addClass('hidden');	
}
function funcNoContactResult(){
	$('#slctNoContact').addClass('hidden');
	var strResult = $('#slctNoContact').val();
	if( strResult == 'Other' || strResult == 'Add . . .'){
		strResult = prompt("Add notes to this address");
	}
	strResult = "No Answer: " + strResult;
	//Record the same no contact for the entire house
	intPOSTCOMPLETE = aryCURRENTSTREET[intCURRENTDOOR].length;
	for(var x=0;x<intPOSTCOMPLETE;x++){
		trcPostSheetUpdateCell(objSHEETLOGIN, aryCURRENTSTREET[intCURRENTDOOR][x]['RecId'], 'ResultOfContact', strResult, funcNoAnswerRecorded);
	}
}
function funcNoAnswerRecorded(){
	intPOSTCOMPLETE --;
	if(intPOSTCOMPLETE == 0){
		$('#slctNoContact').addClass('hidden');
		funcMarkAddressVisited();
		funcMove(1);
	}
}
function funcPersonPicked(obj){
	intSINGLEVOTER = $(obj).index()-1;
	$('#divContactName').text(aryCURRENTSTREET[intCURRENTDOOR][intSINGLEVOTER]['FirstName'] + " " + aryCURRENTSTREET[intCURRENTDOOR][intSINGLEVOTER]['LastName']);
	$('#divContactID').text($(obj).find('td:nth-child(1)').text());
	$('#divVoterID').text($(obj).find('td:nth-child(6)').text());
	$('#txtContactNotes').val(aryCURRENTSTREET[intCURRENTDOOR][intSINGLEVOTER]['Comments']);
	if(!aryCURRENTSTREET[intCURRENTDOOR][intSINGLEVOTER]['Party']){
		$('#slctParty').val('0 Unknown');
	}
	else{
		$('#slctParty').val(aryCURRENTSTREET[intCURRENTDOOR][intSINGLEVOTER]['Party']);		
	}
	$('#IssuesOfImport').val('');
	$('#slctResults').val('LitDrop - Friendly');

	intCURRENTVIEW = 3;
	funcChangeView();
}
function funcRecordPersonContactTRC(){
	//Disable the buttons
	$(".control-buttons").addClass("hidden");
	var strPartyTRC = $('#slctParty').val();
	var strResultTRC = $('#slctResults').val();
	var strNotesTRC = $('#txtContactNotes').val();
	var strIssuesTRC = $('#IssuesOfImport').val();
	if( strResultTRC == 'Other' || strResultTRC == 'Add . . .'){
		strResultTRC = prompt("Enter result");
	}
	if(!strIssuesTRC){
	}
	else{
		strNotesTRC += " [ISSUES: " + strIssuesTRC + "]";
	}
	if(funcIsEmpty(strPartyTRC)){
		strPartyTRC = "0";	
	}
	else{
		strPartyTRC = strPartyTRC.substring(0,1);
	}
	//Save the results to the array
	aryCURRENTSTREET[intCURRENTDOOR][intSINGLEVOTER]['Party'] = strPartyTRC;
	aryCURRENTSTREET[intCURRENTDOOR][intSINGLEVOTER]['Comments'] = strNotesTRC;
	
	//Update the TRC Database
	funcUpdateTRC($('#divVoterID').text(), strPartyTRC,strResultTRC,strNotesTRC,funcContactRecorded);
}

function funcContactRecorded(){
	$(".control-buttons btn").removeClass('hidden');
	intCURRENTVIEW = 2;
	funcMarkAddressVisited();
	funcChangeView();
	funcMove(1);
}
function funcMarkAddressVisited(){
	for(var x=0;x<aryCURRENTSTREET.length;x++){
		for(var y=0;y<aryCURRENTSTREET[x].length;y++){
			if(aryCURRENTSTREET[x][y]['StreetNum'] == aryCURRENTSTREET[intCURRENTDOOR][0]['StreetNum'] && aryCURRENTSTREET[x][y]['Street'] == aryCURRENTSTREET[intCURRENTDOOR][0]['Street']){
				aryCURRENTSTREET[x][y]['Visited'] = 1;
			}
		}
	}
}

function funcClearStreetField(){
	$('.control-buttons .btn:nth-child(3)').attr("disabled", "disabled");
	$('#inpSearch').val('');
}

function funcDropCarPin(){
	navigator.geolocation.getCurrentPosition(funcSaveCarLocation, noLocation);	
}
function noLocation()
{
	alert('Could not find your current location');
}
function funcSaveCarLocation(position){
	dblCARLAT = position.coords.latitude
	dblCARLON = position.coords.longitude
}
//Modified TRC Code

function funcUpdateTRC(recId, strParty,strResult,strNotes,funcPostSuccess){
    postSheetUpdate(objSHEETLOGIN, recId, "Comments", strNotes,"Party",strParty,"ResultOfContact",strResult, funcPostSuccess);
}
function postSheetUpdate(sheetRef, recId, colName1, newValue1, colName2, newValue2, colName3, newValue3, successFunc) {
    var url = sheetRef.Server + "/sheets/" + sheetRef.SheetId;
    // cheap way to Csv-Escape newval.
    var escaped1 = newValue1.replace('\"', '\'');
    var escaped2 = newValue2.replace('\"', '\'');
    var escaped3 = newValue3.replace('\"', '\'');
    var contents = "RecId, " + colName1 + ", " + colName2 + ", " + colName3 + "\r\n" + recId + ", \"" + escaped1 + "\"" + ", \"" + escaped2 + "\"" + ", \"" + escaped3 + "\"";
    $.ajax({
        url: url,
        type: 'POST',
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Bearer " + sheetRef.AuthToken);
        },
        contentType: "text/csv; charset=utf-8",
        data: contents,
        success: function () {
            successFunc();
        },
        error: function (data) {
            alert("Failed to Update cell (" + recId + ", " + colName + ") to value '" + newValue + "'.");
        }
    });
}
