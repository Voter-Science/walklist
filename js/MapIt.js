var nmbrLATITUDE;
var nmbLONGITUDE;
var map;
var blnASSIGN = false;
var blnIsSelecting = false;
var objSHEETLOGIN;
var aryDATA = [];
var aryFIELDS = ["RecId","Address","Lat","Long","Comments","ResultOfContact"];
var aryCOLORS = ["MapPin_Blue.png","MapPin_Green.png","MapPin_Brown.png","MapPin_Cyan.png","MapPin_LtGreen.png","MapPin_Orange.png","MapPin_Purple.png","MapPin_Yellow.png","MapPin_Gray.png","MapPin_Red.png"];
var aryWALKLISTS = [];

function funcGetMapData(){
	var aryTemp = funcReturnGETData();
	blnASSIGN = (aryTemp['Mode']=='Cut');
	if(blnASSIGN){
		$('#divAssignCanvasser').removeClass('hidden');
		funcPullWalkListData();
	}
	else{
		$('#divAssignCanvasser').addClass('hidden');	
		navigator.geolocation.getCurrentPosition(funcPullWalkListData, noLocation);
	}
}
function funcPullWalkListData(position){
	if(blnASSIGN){
		nmbrLATITUDE = 47.00;
		nmbrLONGITUDE = -121.00;		
	}
	else{
		nmbrLATITUDE = position.coords.latitude;
		nmbrLONGITUDE = position.coords.longitude;
	}

	strListName = getCookie('WalkList');
	trcPostLogin('https://trc-login.voter-science.com', strListName, function (login) {
        objSHEETLOGIN = login; // Save for when we do Post
        trcGetSheetContents(login, function (sheet) { return funcProcessList(sheet); });
    });
}
function funcProcessList(jsnReturn){
	var aryTemp = [];
	var x,y;
	var strVisitedDoors = '';
	for(x=0;x<aryFIELDS.length;x++){
		aryTemp[aryFIELDS[x]] =  String(jsnReturn[aryFIELDS[x]]).split(",");
	}
	//Flip the row/column of the TRC data to interface with original array formation
	for(x=0;x<aryTemp[aryFIELDS[0]].length;x++){
		aryDATA.push(funcSplitAddress(aryTemp['Address'][x]));
		for(y=0;y<aryFIELDS.length;y++){
			aryDATA[x][aryFIELDS[y]] = aryTemp[aryFIELDS[y]][x];
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
	
	//Sort the data so those that those with comments display on top
	/*
    -1: Put b before a
     0: Don't sort
     1: Put a before b
	*/
	aryDATA.sort(function(a,b){
		var Comments1=a.Comments,Comments2=b.Comments;
		return Comments1.length>Comments2.length;
	});
	funcPopulateMap();
}
 function noLocation()
 {
   alert('Could not find your current location');
 }
function funcSplitAddress(strAddress){
	var aryTemp = strAddress.split(" ");
	var objData = [];
	objData['StreetNum'] = aryTemp[0];
	objData['Street'] = aryTemp[1] + " " + aryTemp[2] + " " + aryTemp[3];
	return objData;
}
 function funcPopulateMap(){ 
	var TopLeftLat = -500;
	var BottomRightLat = 500;
	var TopLeftLon = 500;
	var BottomRightLon = -500;
	var pushpinOptions = [];
	var blnCurrentPosWithinPins = false;
	//Add in your current location
	aryDATA.push({'Lat':nmbrLATITUDE,'Long':nmbrLONGITUDE,'WalkList':'currentLocation'});
	
	//Add in your car position
	aryDATA.push({'Lat':Number(getCookie('CarPinLat')),'Long':Number(getCookie('CarPinLon')),'WalkList':'car'});
	
	var aryPinCollection = new Microsoft.Maps.EntityCollection();
	var objLocation;
	for(var x=0;x<aryDATA.length;x++){
		if(!aryDATA[x]['Lat']){
			//No lat or long information
		}
		else{
			pushpinOptions = {
				icon: "MapIcons/MapPin_Unknown.png",
			};
			if(x == (aryDATA.length-1)){//Car location
				pushpinOptions = {
					icon: "MapIcons/car.jpg"
				};
			}
			if(!aryDATA[x]['Comments'] || blnASSIGN){
			//leave as is
			}
			else{
				pushpinOptions = {
					icon: "MapIcons/MapPin_Red.png"
				};						
			
			}
			if(x == (aryDATA.length-2)){//This is the current location
				pushpinOptions = {
					icon: "MapIcons/CurrentPosition.png"	 
				};

				//If you are canvassing and your current location is within the walk list, zoom on your location
				if(!blnASSIGN && Number(aryDATA[x]['Lat']) < Number(TopLeftLat) && 
					Number(aryDATA[x]['Lat']) > Number(BottomRightLat) && 
					Number(aryDATA[x]['Long']) > Number(TopLeftLon) && 
					Number(aryDATA[x]['Long']) < Number(BottomRightLon)){
						TopLeftLat = Number(aryDATA[x]['Lat']) + .0025;
						BottomRightLat = Number(aryDATA[x]['Lat']) - .0025;
						TopLeftLon = Number(aryDATA[x]['Long']) +.0025;
						BottomRightLon = Number(aryDATA[x]['Long']) - .0025;
						blnCurrentPosWithinPins = true;
				}
			}
			//If you are in Assign mode, only include the pins in the zoom of the map 
			if((!blnASSIGN && x < aryDATA.length-1 && !blnCurrentPosWithinPins) || (blnASSIGN && x<aryDATA.length-2)){
				if(Number(aryDATA[x]['Lat']) > Number(TopLeftLat)){
					TopLeftLat = aryDATA[x]['Lat'];
				}
				if(Number(aryDATA[x]['Lat']) < Number(BottomRightLat)){
					BottomRightLat = aryDATA[x]['Lat'];
				}
				if(Number(aryDATA[x]['Long']) < Number(TopLeftLon)){
					TopLeftLon = aryDATA[x]['Long'];
				}
				if(Number(aryDATA[x]['Long']) > Number(BottomRightLon)){
					BottomRightLon = aryDATA[x]['Long'];
				}
			}
			objLocation = new Microsoft.Maps.Location(aryDATA[x]['Lat'],aryDATA[x]['Long']);

			var pushpin = new Microsoft.Maps.Pushpin(objLocation,pushpinOptions);
			pushpin.Street = aryDATA[x]['Street'];
			pushpin.StreetNum = aryDATA[x]['StreetNum'];
			pushpin.WalkList = aryDATA[x]['WalkList'];
			pushpin.Lat = aryDATA[x]['Lat'];
			pushpin.Long = aryDATA[x]['Long'];
			pushpin.Comments = aryDATA[x]['Comments'];
			pushpin.RecId = aryDATA[x]['RecId'];
			pushpinClick = Microsoft.Maps.Events.addHandler(pushpin, 'click', funcPinClick);  
			aryPinCollection.push(pushpin);
		}
	}
	map = new Microsoft.Maps.Map(document.getElementById("mapDiv"), 
			   {credentials: "Agltfm2is0gqOaLlv8Gjr3iSfFjtLFSjLYxT8L0TxdIfphFArcF7mVH1I7vwTtk2",
				mapTypeId:Microsoft.Maps.MapTypeId.road,
				zoom: 5});

	var viewBoundaries = Microsoft.Maps.LocationRect.fromLocations(new Microsoft.Maps.Location(TopLeftLat, TopLeftLon), new Microsoft.Maps.Location(BottomRightLat, BottomRightLon));

	map.setView({ bounds: viewBoundaries});

	// Add the pins to the map
	map.entities.push(aryPinCollection);
	var attachmousedown = Microsoft.Maps.Events.addHandler(map, 'mousedown',funcMouseDownHandler);
	var attachmousemove = Microsoft.Maps.Events.addHandler(map, 'mousemove',funcMouseMoveHandler); 
	var attachmouseUp = Microsoft.Maps.Events.addHandler(map, 'mouseup',funcMouseUpHandler); 
    
	//Find if there are any child walk lists
	trcGetChildSheetInfo(objSHEETLOGIN, function(summary) {
        funcProcessChildSheets(summary.Children);
	  });
}
function funcProcessChildSheets(children) {
	//funcFindAllKeys(children[0].ShareInfo[0]);
	var sheetRefs = [];
	for(var i=0; i < children.length; i++) {
		var child = children[i];
		funcRecordWalkLists(child.ShareInfo[0].Email,child.ChildInfo.Name,child.SheetId);
		funcColorCodePinsByWalkList(child.SheetId,child.ChildInfo.CountRecords, i);
	}
	funcCreateWalkListTable();
}
function funcColorCodePinsByWalkList(sheetId, numRec,intIndex) {
	var childSheetRef = trcGetSheetRef(sheetId, objSHEETLOGIN);
	trcGetSheetContents(childSheetRef, function(data) {
		// get coordiates (latitude, longitude) from child records
		for(var x=0; x < numRec; x++) {
			var objCurrentPin;
			var aryPinSet = map.entities.get(0);
			for(var i=0;i<aryPinSet.getLength();i++){
				objCurrentPin = aryPinSet.get(i);
				if(objCurrentPin.Lat == data["Lat"][x] && objCurrentPin.Long == data["Long"][x]){
					objCurrentPin.WalkList = aryWALKLISTS[intIndex]['WalkList'];
					objCurrentPin.setOptions({icon: "MapIcons/" + aryCOLORS[intIndex]});
				}
			}
		}
  });
}
function funcGenerateListName(){
	var strEmail = $('#inpCanvasser').val();
	var strListName;
	var intPos;
	if(IsValidateEmail(strEmail)){
		intPos = strEmail.indexOf(".");
		if(intPos>0){
			strListName = strEmail.substring(0,intPos);			
		}
		intPos = strListName.indexOf("@");
		if(intPos>0){
			strListName = strListName.substring(0,intPos);
		}
		$('#inpWalkListName').val(strListName.toUpperCase());
	}
}
function funcPinClick(e){
	var obj = e.target;
	if(e.targetType == 'pushpin' && obj.WalkList != 'car' && obj.WalkList != 'currentLocation'){
		if(blnASSIGN){
			if(IsValidateEmail($('#inpCanvasser').val()) && $('#inpWalkListName').val() != '' && $('#inpWalkListName').val() !== null){
				funcLockNames();
				switch($('input[name=rdbgSelectionType]:checked').val()) {
					case 'ByPin'://A single pin on this map is a voter, not all the residents at that door.  Toggle all the voters in the household
						var objCurrentPin;
						var aryPinSet = map.entities.get(0);
						for(var i=0;i<aryPinSet.getLength();i++){
							objCurrentPin = aryPinSet.get(i);
							if(objCurrentPin.Street == obj.Street && objCurrentPin.StreetNum == obj.StreetNum){
								funcTogglePin(objCurrentPin);
							}
						}
						break;
						
					case 'ByStreet':
						var blnIsEven = funcIsEven(obj.StreetNum);
						var objCurrentPin;
						var aryPinSet = map.entities.get(0);
						for(var i=0;i<aryPinSet.getLength();i++){
							objCurrentPin = aryPinSet.get(i);
							if(objCurrentPin.Street == obj.Street && funcIsEven(objCurrentPin.StreetNum) == blnIsEven){
								funcTogglePin(objCurrentPin);
							}
						}
						break;
					case 'LassoSet':
					
						break;
					default:
						alert("Switch Block Escape: " + $('input[name=rdbgSelectionType]:checked').val());
				}
			}
			else{
				funcInvalidEmail();
			}
		}
		else{
			setCookie('StreetName',obj.Street,1);
			setCookie('CurrentView',2,1);
			setCookie('MapDoor',obj.StreetNum,1);
			window.open("EWalk.html","_self");
		}
	}
	else{
		switch(obj.WalkList){
			case 'car':
				alert("This is your car position");
				break;
			case 'currentLocation':
				alert("This is your current location");
				break;
		}
	}
}
function funcTogglePin(obj){
	if(obj.WalkList == $('#inpWalkListName').val()){
		obj.WalkList = "Parent";
		obj.setOptions({icon: "MapIcons/MapPin_Unknown.png"});				
	}
	else{
		if(!obj.Comments){
			obj.WalkList = $('#inpWalkListName').val();
			obj.setOptions({icon: "MapIcons/" + aryCOLORS[aryWALKLISTS.length]});
		}
	}
	funcCountSelected();
}
function funcClearMap(){
	var blnConfirm = confirm("Do you wish to clear all the walk lists currently created?");
	if(blnConfirm){
		funcUnLockNames();
		var objCurrentPin;
		var aryPinSet = map.entities.get(0);
		for(var i=0;i<aryPinSet.getLength();i++){
			objCurrentPin = aryPinSet.get(i);
			if(objCurrentPin.WalkList != 'car' && objCurrentPin.WalkList != 'currentLocation' && !objCurrentPin.Comments){
				objCurrentPin.WalkList = "Parent";
				objCurrentPin.setOptions({icon: "MapIcons/MapPin_Unknown.png"});
			}
		}
		$('#divWalkLists').html('');
		//Remove all the walk lists
		funcDeleteWalklist(0, true);	
		funcCountSelected();
	}
}
var nmbrSTARTLAT;
var nmbrSTARTLON;
var nmbrENDLAT;
var nmbrENDLON;
var polygon;
var PolyGonOptions = {fillColor: new Microsoft.Maps.Color(50,29,78,144), strokeColor: new Microsoft.Maps.Color(255,175,39,47), strokeThickness: 1}; 
function funcMouseDownHandler(e){ 
    // On mouse down, check to see if the control key is pressed.  If not, do nothing.  If, so start the selection process.
    if(!e.originalEvent.ctrlKey || e.targetType != 'map'){
		return false;
    } else {
		blnIsSelecting = true;
		var point = new Microsoft.Maps.Point(e.getX(), e.getY());
		var loc = e.target.tryPixelToLocation(point);
		nmbrSTARTLAT = loc.latitude;
		nmbrSTARTLON = loc.longitude;
		nmbrENDLAT = loc.latitude;
		nmbrENDLON = loc.longitude;
		polygon = new Microsoft.Maps.Polygon([new Microsoft.Maps.Location(nmbrSTARTLAT,nmbrSTARTLON),
										new Microsoft.Maps.Location(nmbrSTARTLAT,nmbrENDLON),
										new Microsoft.Maps.Location(nmbrENDLAT,nmbrENDLON),
										new Microsoft.Maps.Location(nmbrENDLAT,nmbrSTARTLON),
										new Microsoft.Maps.Location(nmbrSTARTLAT,nmbrSTARTLON)],PolyGonOptions); 
        map.entities.push(polygon);

        // disable the VE mouse events 
		e.handled = true;
        return true; 
    }
}    
function funcMouseMoveHandler(e){ 
    //When moving the mouse, if in "selecting" mode, draw, otherwise do nothing.
    if(!blnIsSelecting) {
        return false;
    } else {
        // set the latest endpoints (opposite side of the selection box) 
		var point = new Microsoft.Maps.Point(e.getX(), e.getY());
		var loc = e.target.tryPixelToLocation(point);
		nmbrENDLAT = loc.latitude;
		nmbrENDLON = loc.longitude;

		// Change Polygon
		polygon.setLocations([new Microsoft.Maps.Location(nmbrSTARTLAT,nmbrSTARTLON),
										new Microsoft.Maps.Location(nmbrSTARTLAT,nmbrENDLON),
										new Microsoft.Maps.Location(nmbrENDLAT,nmbrENDLON),
										new Microsoft.Maps.Location(nmbrENDLAT,nmbrSTARTLON),
										new Microsoft.Maps.Location(nmbrSTARTLAT,nmbrSTARTLON)]);
		e.handled = true;
		return true;
    } 
}    
function funcMouseUpHandler(e){
    // On mouse up, if not in selecting mode, do nothing, otherwise cancel selecting mode
    if(blnIsSelecting){
		if(IsValidateEmail($('#inpCanvasser').val()) && $('#inpWalkListName').val() != '' && $('#inpWalkListName').val() !== null){
			var intListCount = aryWALKLISTS.length;
			funcLockNames();
			var blnClear = $("#rdbgSelectionTypeLassoClear").prop("checked");
			// cancel selecting mode
			blnIsSelecting = false;
			
			//Clear the polygon
			for(var i=map.entities.getLength()-1;i>=0;i--) {
				var polygon= map.entities.get(i); 
				if (polygon instanceof Microsoft.Maps.Polygon) { 
					map.entities.removeAt(i);  
				}
			}
			
			//Determine if any of the push pins are within the selection box bounds
			if (nmbrSTARTLAT > nmbrENDLAT) {
				var eBound = nmbrSTARTLAT;
				var wBound = nmbrENDLAT;
			} else {
				var eBound = nmbrENDLAT;
				var wBound = nmbrSTARTLAT;
			}
			
			 if (nmbrSTARTLON > nmbrENDLON) {
				var nBound = nmbrSTARTLON;
				var sBound = nmbrENDLON;
			} else {
				var nBound = nmbrENDLON;
				var sBound = nmbrSTARTLON;
			}
			
			var objCurrentPin;
			var aryPinSet = map.entities.get(0);
			for(var i=0;i<aryPinSet.getLength();i++){
				objCurrentPin = aryPinSet.get(i);
				if(objCurrentPin.Lat < eBound && objCurrentPin.Lat > wBound
					&& objCurrentPin.Long < nBound && objCurrentPin.Long > sBound && !objCurrentPin.Comments){
						if(blnClear){
							objCurrentPin.WalkList = "Parent";
							objCurrentPin.setOptions({icon: "MapIcons/MapPin_Unknown.png"});
						}
						else{
							objCurrentPin.WalkList = $('#inpWalkListName').val();
							objCurrentPin.setOptions({icon: "MapIcons/" + aryCOLORS[intListCount]});							
						}
					}
			}
			funcCountSelected();
		}
		else{
			blnIsSelecting = false;
			//Clear the polygon
			for(var i=map.entities.getLength()-1;i>=0;i--) {
				var polygon= map.entities.get(i); 
				if (polygon instanceof Microsoft.Maps.Polygon) { 
					map.entities.removeAt(i);  
				}
			}
			funcInvalidEmail();
		}
    } 
}
function funcInvalidEmail(){
	alert("You need to enter a valid email address and walk list name before assigning doors.");
	$('#inpCanvasser').focus();
}
function funcLockNames(){
	$('#inpCanvasser').prop('disabled',true);
	$('#inpWalkListName').prop('disabled',true);
}
function funcUnLockNames(){
	$('#inpCanvasser').prop('disabled',false);
	$('#inpCanvasser').val('');
	$('#inpWalkListName').prop('disabled',false);
	$('#inpWalkListName').val('');
}
function funcCountSelected(){
	var objCurrentPin;
	var aryPinSet = map.entities.get(0);
	var intCount = 0;
	var strLats = '';
	var strLongs = '';
	for(var i=0;i<aryPinSet.getLength();i++){
		objCurrentPin = aryPinSet.get(i);
		if(objCurrentPin.WalkList == $('#inpWalkListName').val() && (strLats.indexOf(String(objCurrentPin.Lat)) == -1 || strLongs.indexOf(String(objCurrentPin.Long)) == -1)){
			intCount ++;
			strLats += ";" + objCurrentPin.Lat;
			strLongs += ";" + objCurrentPin.Long;
		}
	}
	$('#divCount').html("<h4>Doors:&nbsp;" + intCount + "</h4>");
}
function funcAssignWalkList(){
	var strCanvasser = $('#inpCanvasser').val();
	var strWalkList = $('#inpWalkListName').val();
	if(IsValidateEmail(strCanvasser) && strWalkList != '' && strWalkList !== null){
		var objCurrentPin;
		var aryPinSet = map.entities.get(0);
		var aryRecIds = [];
		for(var i=0;i<aryPinSet.getLength();i++){
			objCurrentPin = aryPinSet.get(i);
			if(objCurrentPin.WalkList == $('#inpWalkListName').val()){
				aryRecIds.push(objCurrentPin.RecId);
			}
		}
		createWalklist(strWalkList, strCanvasser, aryRecIds);
	}
	else{funcInvalidEmail();}
}
// *************************** GEO FENCING CODE **********************
// Converted from https://github.com/hansy/trc-geofencing-plugin 
// *******************************************************************
function createWalklist(strWalkList, strCanvasser,ids) {
	trcCreateChildSheet(objSHEETLOGIN, strWalkList, ids, function(childSheetRef) {
		var sheetId = childSheetRef.SheetId;
		funcUnLockNames();
		funcRecordWalkLists(strCanvasser,strWalkList,sheetId);
		funcCreateWalkListTable();
	});
}
function funcRecordWalkLists(strCanvasser,strWalkList,sheetId){
		aryWALKLISTS.push({MapPin:"<img src='MapIcons/" + aryCOLORS[aryWALKLISTS.length] + "'/>",Canvasser:strCanvasser,WalkList:strWalkList,SheetId:sheetId});	
}
function funcCreateWalkListTable(){
	if(aryWALKLISTS.length>0){
		var aryTempFields = ["MapPin","Canvasser","WalkList"];
		$('#divWalkLists').html('<h5>Double Click to delete</h5>' + funcTableFromArray(aryWALKLISTS, aryTempFields, 'table table-condensed table-stripped', 'tblWalkLists'));
		$('#tblWalkLists tr').dblclick(function() {
		  funcDeleteWalklist($(this).index(),false);
		});
	}
}

function funcDeleteWalklist(intIndex,blnDeleteAll) {
	var blnRemove = true;
	if(!blnDeleteAll){
		blnRemove = confirm("Do you wish to clear walk list: " + aryWALKLISTS[intIndex]['WalkList']);		
	}
    if (blnRemove) {
		trcDeleteChildSheet(objSHEETLOGIN, aryWALKLISTS[intIndex]['SheetId'], function() {
			aryWALKLISTS.splice(intIndex,1);
			if(blnDeleteAll && aryWALKLISTS.length > 0){
				funcDeleteWalklist(0,true);
			}
			else{
				funcCreateWalkListTable();
			}
		});			
	}
}

