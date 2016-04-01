function funcFindAllKeys(obj){
	for (var key in obj) {
	  if (obj.hasOwnProperty(key)) {
		alert(key + " -> " + obj[key]);
	  }
	}
}
function funcIsEmpty(a){
	return (a.length == 0 || a == null || a == '' );
}
function funcReturnGETData()
{
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}
function ConvertFractions(strIncoming) {
	if (isNaN(strIncoming)) {
		var numReturn = 0;
		var intPosSlash = strIncoming.indexOf("/")
		var intPosSpace = strIncoming.indexOf(" ")
		if (intPosSlash > 0 && intPosSpace == -1)// Somone probably forgot to
			// put the space in their 
			// dimensions e.g. 721/2
			// instead of 72 1/2 Assume
			// two digits up front
		{
			alert("Fractions need to be in the form 72 1/2 or 72.5 as opposed to 721/2");
			numReturn = Number(strIncoming.slice(0, intPosSlash))
			/ Number(strIncoming.slice(intPosSlash + 1,
					strIncoming.length))
		}
		if (intPosSlash > 0 && intPosSpace > 0)// Someone has entered a
			// fraction
		{
			numReturn = Number(strIncoming.slice(0, intPosSpace));// Get the
			// whole
			// number
			numReturn = numReturn
			+ Number(strIncoming.slice(intPosSpace, intPosSlash))
			/ Number(strIncoming.slice(intPosSlash + 1,
					strIncoming.length));// Get the fraction
		}
	} else {
		numReturn = Number(strIncoming);
	}
	return numReturn;
}
function IsValidateEmail(field) {
	if (field == "") {
		return false;
	} else {
		if (!((field.indexOf(".") > 0) && (field.indexOf("@") > 0))
				|| /[^a-zA-Z0-9.@_-]/.test(field)) {
			return false;
		}
	}
	return true;
}
function ValidateState(field) {
	if (field == "") {
		return "No state was entered.\n"
	} else {
		if (field.length < 2) {
			return "The state name must be at least two letters.\n"
		} else {
			if (/[^a-zA-Z]/.test(field)) {
				return "Only letters are allowed in the state.\n"
			}
		}
	}
	return ""
}
///////////////////////////////////////////////////////////////////////////////////////
//This code prevents a user from hitting 'Enter' on the estimation page
///////////////////////////////////////////////////////////////////////////////////////
function stopRKey(evt) {
	var evt = (evt) ? evt : ((event) ? event : null);
	var node = (evt.target) ? evt.target : ((evt.srcElement) ? evt.srcElement
			: null);
	if ((evt.keyCode == 13) && (node.type == 'text')) {
		return false;
	}
}
document.onkeypress = stopRKey;

function RoundFunction(vNum, vDigits) {
	return Math.round(vNum * Math.pow(10, vDigits)) / Math.pow(10, vDigits)
}
function TwoDigits(x) {
	return RoundFunction(x,2);
}
function sortMultiDimensional(a, b) {
	// this sorts the array using the second element
	return ((a[1] > b[1]) ? -1 : ((a[1] < b[1]) ? 1 : 0));
}
function sortSingleDimensional(a, b) {
	return b - a;
}
///////////////////////////////////////////////////////////////////////////////////////   
//Here are all the cookie manipulation codes
///////////////////////////////////////////////////////////////////////////////////////
function setCookie(c_name,value,exdays)
{
	$.cookie(c_name,value,{expires: exdays,path: '/'});
}
function getCookie(c_name)
{
	return $.cookie(c_name);
}

function delCookie(name) 
{
	$.removeCookie(name,{path: '/'});
}
function ConfirmAction(strText)
{
	var blnConfirm = confirm(strText);
	return blnConfirm;	
}
function getLastName(strIncoming)
{
	if(strIncoming.indexOf(', ')==-1)//Charles Kenneth Sheffer
	{
		var aryTemp = strIncoming.split(" ");
		return aryTemp[aryTemp.length-1];
	}
	else //Sheffer, Charles K
	{
		var aryTemp = strIncoming.split(", ");
		return aryTemp[0];		
	}
}
function getFirstName(strIncoming)
{
	if(strIncoming.indexOf(', ')==-1 && strIncoming.indexOf(' ')!=-1)//Charles Kenneth Sheffer
	{
		var aryTemp = strIncoming.split(" ");
		return aryTemp[0];
	}
	if(strIncoming.indexOf(' ')==-1)//No spaces at all, return first name as null
	{
		return ' ';
	}
	if(strIncoming.indexOf(', ')!=-1) //Sheffer, Charles K or Sheffer, Charles
	{
		var aryTemp = strIncoming.split(", ");
		if(aryTemp[1].indexOf(" ")==-1)//Sheffer, Charles
		{
			return aryTemp[1];			
		}
		else //Charles K.
		{
			return aryTemp[1].slice(0,aryTemp[1].indexOf(" "));
		}

	}
}
function DropDownFromConcant(strOptions,strTextOptions,strSplitter,strSelection,strClass,strId,strFunction)
{
	var aryOptions= strOptions.split(strSplitter);
	var aryText=strTextOptions.split(strSplitter);
	return DropDownFromArray(aryOptions,aryText,strSelection,strClass,strId,strFunction);
}

function DropDownFromArray(aryOptions,aryText,strSelection,strClass,strId,strFunction)
{
	strHtmlSelect="<Select id='" + strId + "' " + strFunction;
	if(strClass!='')
	{
		strHtmlSelect += "class='" + strClass + "'>"
	}
	else
	{
		strHtmlSelect +=">";
	}

	for(var i=0;i<aryOptions.length;++i)
	{
		if(aryOptions[i]==strSelection)
		{
			strHtmlSelect+="<option value='" + aryOptions[i]+"' selected>" + aryText[i];
		}
		else
		{
			strHtmlSelect+="<option value='" + aryOptions[i]+"'>" + aryText[i];
		}
	}
	return strHtmlSelect + "</select>";
}
function funcListFromSelect(){
	$('select').each(function(){
		if($(this).find('option').length < 25){
			$(this).focus(function(event) {
				$(this).blur();
				var lblLabel = 	$("label[for='" + $(this).attr('id') + "']").text();
				var htmlList = "<div class='list-group'>";
				var objSelect = $(this);
		
				$(this).find('option').each(function (){
					htmlList += "<button type='button' class='list-group-item'>" + $(this).val() + "</button>";
				});
				htmlList += "</div>";
				$('#divHtmlSpace').html(htmlList);
				$('#lblModalTitle').text(lblLabel);
				$('#divHtmlSpace button').each(function(){
					$(this).click(function(){
						$('#mdlUserInput').modal('toggle');
						$(objSelect).val($(this).text());
						$(objSelect).trigger("change");
					});
				});
				$('#mdlUserInput').modal('toggle');	
			});
		}
	});
}
function funcCreateDriveDown(strItemId,strParent){
	var lblLabel = 	strItemId;
	var htmlList = "<div class='list-group'>";
	if(strParent == 'Top'){
		strParent = strItemId;
	}
	$('#'+ strItemId).siblings('.Drive-Down').find('.Drive-Down-Parent').each(function (){
		var str = $(this).clone().children().remove().end().text();
		if(str == strParent){
			htmlList += "<button type='button' class='list-group-item'>" + $(this).find('div').text() + "<span class='hidden'>" + strParent + ";" + $(this).find('div').text() + "</span></button>";
		}
	});
	htmlList += "<button type='button' class='list-group-item list-group-item-info'>DONE<span class='hidden'>" + strParent + "</span></button>";
	htmlList += "</div>";
	$('#divHtmlSpace').html(htmlList);
	$('#lblModalTitle').text(lblLabel);
	$('#divHtmlSpace button').each(function(){
		$(this).click(function(){
			var strNextDown = $(this).find('span').text();
			if($(this).text().indexOf('Add') != -1){
				strNextDown += ";" + updateSelectOptions(strParent);
				$(this).text($(this).text()+";DONE");
			}
			if($(this).text().indexOf('DONE') != -1){
				$('#'+strItemId).val(strNextDown.replace(strItemId + ";",''));//The format at this point would be eg. Tags;[answer you want to keep]
				$('#'+strItemId).trigger("change");
				$('#mdlUserInput').modal('toggle');
			}
			else{
				funcCreateDriveDown(strItemId,strNextDown);
			}
		});
	});
	if(strParent == strItemId){//First pass, open the modal
		$('#mdlUserInput').modal('toggle');
	}
}	
function updateSelectOptions(strIncomingID)
{
	var strNewOption = prompt("Enter new option . . .");
	//Send the updated data to the database
	var ajxData="AjaxName=AddNewSelectOption";	
	ajxData = ajxData + "&Field=" + strIncomingID;
	ajxData = ajxData + "&Option=" + strNewOption;
	$.ajax({
		type : "POST",
		url: "http://charlie4washington.com/_Ledger/SubPages/TheLedgerAjaxCalls.php",
		data : ajxData
	});
	//$('#'+strIncomingID).html($('#'+strIncomingID).html()+"<option value='"+strNewOption+"' selected>"+strNewOption+"</option>");	
	return strNewOption;
}
//SEARCH: asdf43896t8cf jquery for date and time instead of your basic function
function getCurrentDate()
{
	var currentDate = new Date();
	var day = currentDate.getDate();
	var month = currentDate.getMonth() + 1;
	var year = currentDate.getFullYear();
	var h=currentDate.getHours();
	var m=currentDate.getMinutes();
	var s=currentDate.getSeconds();
	return year + '-' + month +'-'+ day+"-"+h+":"+m+":"+s;;	
}
function openSearch()
{
	window.location.href = 'SearchPage.php';	
}
function addSpaceAndCapitolize(strIncoming,blnCap)
{
	var strReturn = '';
	var intIndex = 0;
	for(var i=2;i<strIncoming.length;i++)
	{
		if(strIncoming.substr(i-1,1)==strIncoming.substr(i-1,1).toUpperCase())//This position is a capitol letter
		{
			strReturn += strIncoming.substring(intIndex,i-1)+" ";
			intIndex=i-1;
		}
	}
	if(intIndex == 0)//It never found a capitalized letter
	{
		strReturn = strIncoming;
	}
	else
	{
		strReturn += strIncoming.substring(intIndex,i)
	}
	if(blnCap=='true')
	{
		strReturn = strReturn.toUpperCase();
	}
	return strReturn;
}
function funcMakeTableSortable(strTableId) {
    var sortdir;
    $('#' + strTableId + ' th').each(function(column) {
        $(this).click(function() {
            if ($(this).is('.asc')) {
                $(this).removeClass('asc');
                $(this).addClass('desc');
                sortdir = -1;
            } else {
                $(this).addClass('asc');
                $(this).removeClass('desc');
                sortdir = 1;
            }
            $(this).siblings().removeClass('asc');
            $(this).siblings().removeClass('desc');

            var rec = $('#' + strTableId).find('tbody>tr').get();
            rec.sort(function(a, b) {
				var val1 = $(a).children('td').eq(column).text();
				var val2 = $(b).children('td').eq(column).text();
				if ( $.isNumeric(val1) &&  $.isNumeric(val2)){
					val1 = Number(val1);
					val2 = Number(val2);
				}
				else {
					val1 = $(a).children('td').eq(column).text().toUpperCase();
					val2 = $(b).children('td').eq(column).text().toUpperCase();
				}
                return (val1 < val2) ? -sortdir : (val1 > val2) ? sortdir : 0;
            });
			$.each(rec, function(index, row) {
                if (index < rec.length || sortdir == 1) {
                    $('#' + strTableId + ' tbody').append(row);
                }
            });
            $('#' + strTableId + ' tr:odd').addClass('alt');
            $('#' + strTableId + ' tr:even').removeClass('alt');
        });
    });
}
function funcTableFromArray(aryData, aryFields, strClass, strId) {
    var htmlTable = "<table id='" + strId + "' class='" + strClass + "'><thead><tr>";
    for (var i = 0; i < aryFields.length; i++) {
        htmlTable += "<th>" + addSpaceAndCapitolize(aryFields[i], false) + "</th>";
    }
    htmlTable += "</tr></thead><tbody>";
    for (var x = 0; x < aryData.length; x++) {
        htmlTable += "<tr>";
        for (var y = 0; y < aryFields.length; y++) {
            htmlTable += "<td>" + aryData[x][aryFields[y]] + "</td>";
        }
        htmlTable += "</tr>";
    }
    return htmlTable + "</tbody></table>";
}
function funcIsEven(int) {
    return int / 2 == RoundFunction(int / 2, 0);
}
function funcHighLightDate(objTable){
	var dteToday = new Date();
	var x = 2; // go back 5 days!
	dteToday.setDate(dteToday.getDate() + x);
	$(objTable).find('td').each(function(){
		var dteDueDate = new Date($(this).text());
		if(dteDueDate <= dteToday){
			$(this).addClass('bg-danger');
			$(this).siblings().addClass('bg-danger');
		}
	});
}
function addCommas(nStr)
{
				nStr += '';
				x = nStr.split('.');
				x1 = x[0];
				x2 = x.length > 1 ? '.' + x[1] : '';
				var rgx = /(\d+)(\d{3})/;
				while (rgx.test(x1)) {
					x1 = x1.replace(rgx, '$1' + ',' + '$2');
				}
				return x1 + x2;
}

