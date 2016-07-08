var nmbrLATITUDE;
var nmbLONGITUDE;
var map;
var intMAPDOOR;

function funcOpenMap(){
    intCURRENTVIEW = 4; //
    funcChangeView();
	funcGetCurrentLocation();
}
function funcGetCurrentLocation(){
		navigator.geolocation.getCurrentPosition(funcSetCurrentLocation, funcNoLocation);
	}
function funcSetCurrentLocation(position){
	nmbrLATITUDE = position.coords.latitude;
	nmbrLONGITUDE = position.coords.longitude;
	funcPopulateMap();
}
function funcNoLocation(){
	alert('We cannot find your current location');
	nmbrLATITUDE = 0;
	nmbrLONGITUDE = 0;
	funcPopulateMap();
}

 function funcPopulateMap(){ 
	var TopLeftLat = -500;
	var BottomRightLat = 500;
	var TopLeftLon = 500;
	var BottomRightLon = -500;
	var pushpinOptions = [];
	var blnCurrentPosWithinPins = false;
	//Add in your current location
	if(nmbLONGITUDE != 0){
		aryDATA.push({'Lat':nmbrLATITUDE,'Long':nmbrLONGITUDE,'WalkList':'currentLocation'});
	}
	
	//Add in your car position
	aryDATA.push({'Lat':dblCARLAT,'Long':dblCARLON,'WalkList':'car'});
	
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
			//If there are commments against this address, mark it
			if(!aryDATA[x]['Comments']){
			//leave as is
			}
			else{
				pushpinOptions = {
					icon: "MapIcons/MapPin_Red.png"
				};						
			
			}
			if(x == aryDATA.length-2 && nmbLONGITUDE !=0){//array length -2 is the current position
				pushpinOptions = {
					icon: "MapIcons/CurrentPosition.png"	 
				};

				//If you are canvassing and your current location is within the walk list, zoom on your location
				if(Number(aryDATA[x]['Lat']) < Number(TopLeftLat) && 
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
			//Find the corners of the map
			if((x < aryDATA.length-1 && !blnCurrentPosWithinPins)){
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
}

function funcPinClick(e){
	var obj = e.target;
	if(e.targetType == 'pushpin' && obj.WalkList != 'car' && obj.WalkList != 'currentLocation'){
		intCURRENTVIEW = 2;
		intMAPDOOR = obj.StreetNum;
		$('#inpSearch').val(obj.Street);
		
		//Remove the car location and Current location from the voter data file
		aryDATA.pop();
		aryDATA.pop();
		funcChangeView();
		funcWalkStreet();
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

