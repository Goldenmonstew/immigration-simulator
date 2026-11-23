function enhancePage() {
	if (!document.getElementsByTagName) return;

	//Open external links in a new window
	var anchors = document.getElementsByTagName("a");
	for (var i = 0; i < anchors.length; i++) {
		var anchor = anchors[i];
		if (anchor.getAttribute("href") && anchor.getAttribute("rel") == "external") anchor.target = "_blank";
	}

	//Clear search term field of default text
	if (document.getElementById("searchterm")) {
		var searchfield = document.getElementById("searchterm");
		var defaulttext = searchfield.value;
		searchfield.onfocus = function () {
			if (this.value == defaulttext) this.value = "";
		}
		searchfield.onblur = function () {
			if (this.value == "") this.value = defaulttext;
		}
	}

	/***************************************************************
	 Start progressive enhancement for browsers without CSS3 support
	 ***************************************************************/
	if (document.getElementById("header")) { //Style header list
		var header = document.getElementById("header");
		var navlinks = header.getElementsByTagName("li");
		for (var i = 0; i < navlinks.length; i++) {
			if (i == 0) {
				navlinks[i].className = "first";
			}
			if (i == navlinks.length - 1) {
				navlinks[i].className = "last";
			}
		}
	}

	if (document.getElementById("page_title")) { //Style page title
		var header = document.getElementById("page_title");
		var navlinks = header.getElementsByTagName("li");
		for (var i = 0; i < navlinks.length; i++) {
			if (i == 0) {
				navlinks[i].className = "first";
			}
		}
	}

	if (document.getElementById("content_footer")) { //Style content footer
		var header = document.getElementById("content_footer");
		var navlinks = header.getElementsByTagName("li");
		for (var i = 0; i < navlinks.length; i++) {
			if (i == 0) {
				navlinks[i].className = "first";
			}
			if (i == navlinks.length - 1) {
				navlinks[i].className = "last";
			}
		}
	}
	/***************************************************************
	 End progressive enhancement for browsers without CSS3 support
	 ***************************************************************/
}

//Increase hit area of element

function increaseHitArea(element) {
	/*	var box=document.getElementById(element);
	var links=box.getElementsByTagName("a");
	if (links.length!=0){
	box.onmouseup=function() {
		window.location=links[0].getAttribute("href");
	}
	/Need to take out this section as they do not want text links underlined
	//box.onmouseover=function() {
	//	links[0].style.textDecoration="underline";
	//}
	box.onmouseout=function() {
		links[0].style.textDecoration="none";
	}
	}*/
}


//Get elements by class name
document.getElementsByClassName = function ($class) {
	var $results = Array();
	var $elements = document.getElementsByTagName("*");
	for (var $i = 0; $i < $elements.length; $i++) {
		var $classes = $elements[$i].className.split(" ");
		for (var $j = 0; $j < $classes.length; $j++) {
			if ($classes[$j] == $class) {
				$results[$results.length] = $elements[$i];
			}
		}
	}
	return $results;
}

function validateNewsSignUpForm() {
	var user = document.newssignup.UserName.value
	var email = document.newssignup.Email.value
	if ((user == "") || (email == "")) {
		alert("Both User Name and Email Address fields must be entered");
		return false
	}
	if (validateEmailAddress(email) == false) {
		alert("Invalid Email Address")
		return false
	}
	document.newssignup.submit()
}


function validateEmailAddress(str) {
	var at = "@"
	var dot = "."
	var lat = str.indexOf(at)
	var lstr = str.length
	var ldot = str.indexOf(dot)
	if (str.indexOf(at) == -1) {
		return false
	}
	if (str.indexOf(at) == -1 || str.indexOf(at) == 0 || str.indexOf(at) == lstr) {
		return false
	}
	if (str.indexOf(dot) == -1 || str.indexOf(dot) == 0 || str.indexOf(dot) == lstr) {
		return false
	}
	if (str.indexOf(at, (lat + 1)) != -1) {
		return false
	}
	if (str.substring(lat - 1, lat) == dot || str.substring(lat + 1, lat + 2) == dot) {
		return false
	}
	if (str.indexOf(dot, (lat + 2)) == -1) {
		return false
	}

	if (str.indexOf(" ") != -1) {
		return false
	}
	return true
}



//clear num days field when form is reset

function clearNumDays() {
	$('.date-pick').dpSetStartDate('01/01/1970');
	$('.date-pick').dpSetEndDate('01/01/2050');
	$('.date-pick').dpSetSelected('', true);
	$('.date-pick').dpSetSelected('', true);
	var ndArray = new Array("numDays1", "numDays2", "numDays3", "numDays4", "numDays5", "numDays6", "numDays7", "numDays8", "numDays9", "numDays10", "numDays11", "numDays12", "numDays13", "numDays14", "numDays15", "numDays16", "numDays17", "numDays18", "numDays19", "numDays20", "TotalDaysLabel", "TotalDaysResult");
	var resultArray = new Array("ResultPart1", "ResultPart2", "ResultText");
	for (i = 0; i < ndArray.length; i++) {
		var target = document.getElementById(ndArray[i]);
		target.innerHTML = "&#160;";
	}
	for (i = 0; i < resultArray .length; i++) {
		var target = document.getElementById(resultArray [i]);
		target.innerHTML = "";
	}
	

}


/* DHTML date validation for dd/mm/yyyy.*/

function isInteger(s) {
	var i;
	for (i = 0; i < s.length; i++) {
		// Check that current character is number.
		var c = s.charAt(i);
		if (((c < "0") || (c > "9"))) return false;
	}
	// All characters are numbers.
	return true;
}

function stripCharsInBag(s, bag) {
	var i;
	var returnString = "";
	// Search through string's characters one by one.
	// If character is not in bag, append to returnString.
	for (i = 0; i < s.length; i++) {
		var c = s.charAt(i);
		if (bag.indexOf(c) == -1) returnString += c;
	}
	return returnString;
}

function daysInFebruary(year) {
	// February has 29 days in any year evenly divisible by four,
	// EXCEPT for centurial years which are not also divisible by 400.
	return (((year % 4 == 0) && ((!(year % 100 == 0)) || (year % 400 == 0))) ? 29 : 28);
}

function DaysArray(n) {
	for (var i = 1; i <= n; i++) {
		this[i] = 31
		if (i == 4 || i == 6 || i == 9 || i == 11) {
			this[i] = 30
		}
		if (i == 2) {
			this[i] = 29
		}
	}
	return this
}

function isDate(dtStr) {
	if (dtStr == "") {
		return true;
	}
	var dtCh = "/";
	var minYear = 1900;
	var maxYear = 2100;
	var daysInMonth = DaysArray(12);
	var pos1 = dtStr.indexOf(dtCh);
	var pos2 = dtStr.indexOf(dtCh, pos1 + 1);
	var strDay = dtStr.substring(0, pos1);
	var strMonth = dtStr.substring(pos1 + 1, pos2);
	var strYear = dtStr.substring(pos2 + 1);
	strYr = strYear;
	if (strDay.charAt(0) == "0" && strDay.length > 1) strDay = strDay.substring(1)
	if (strMonth.charAt(0) == "0" && strMonth.length > 1) strMonth = strMonth.substring(1)
	for (var i = 1; i <= 3; i++) {
		if (strYr.charAt(0) == "0" && strYr.length > 1) strYr = strYr.substring(1)
	}
	month = parseInt(strMonth)
	day = parseInt(strDay)
	year = parseInt(strYr)
	if (pos1 == -1 || pos2 == -1) {
		alert("The date format should be : dd/mm/yyyy")
		return false
	}
	if (strMonth.length < 1 || month < 1 || month > 12) {
		alert("Please enter a valid month")
		return false
	}
	if (strDay.length < 1 || day < 1 || day > 31 || (month == 2 && day > daysInFebruary(year)) || day > daysInMonth[month]) {
		alert("Please enter a valid day")
		return false
	}
	if (strYear.length != 4 || year == 0 || year < minYear || year > maxYear) {
		alert("Please enter a valid 4 digit year between " + minYear + " and " + maxYear)
		return false
	}
	if (dtStr.indexOf(dtCh, pos2 + 1) != -1 || isInteger(stripCharsInBag(dtStr, dtCh)) == false) {
		alert("Please enter a valid date")
		return false
	}
	return true
}



function getCalculationResults() {

	var applicationDate = convertToDays("ApplicationDate");
	var BoolContinuousYear = false;
	var totalDays = 0;
	var latestDateFrom;
	var latestDateTo;




	var leapyears = 0;
	var calcYearsDays;


	if (document.residencycheck3yr.group1[0].checked){
	calcYearsDays = 1825;
	}
	else {
	calcYearsDays = 1095;
	}
	var nd1 = (document.getElementById('numDays1').innerHTML).replace(/&nbsp;/g, '');
	var nd2 = (document.getElementById('numDays2').innerHTML).replace(/&nbsp;/g, '');
	var nd3 = (document.getElementById('numDays3').innerHTML).replace(/&nbsp;/g, '');
	var nd4 = (document.getElementById('numDays4').innerHTML).replace(/&nbsp;/g, '');
	var nd5 = (document.getElementById('numDays5').innerHTML).replace(/&nbsp;/g, '');
	var nd6 = (document.getElementById('numDays6').innerHTML).replace(/&nbsp;/g, '');
	var nd7 = (document.getElementById('numDays7').innerHTML).replace(/&nbsp;/g, '');
	var nd8 = (document.getElementById('numDays8').innerHTML).replace(/&nbsp;/g, '');
	var nd9 = (document.getElementById('numDays9').innerHTML).replace(/&nbsp;/g, '');
	var nd10 = (document.getElementById('numDays10').innerHTML).replace(/&nbsp;/g, '');
	var nd11 = (document.getElementById('numDays11').innerHTML).replace(/&nbsp;/g, '');
	var nd12 = (document.getElementById('numDays12').innerHTML).replace(/&nbsp;/g, '');
	var nd13 = (document.getElementById('numDays13').innerHTML).replace(/&nbsp;/g, '');
	var nd14 = (document.getElementById('numDays14').innerHTML).replace(/&nbsp;/g, '');
	var nd15 = (document.getElementById('numDays15').innerHTML).replace(/&nbsp;/g, '');
	var nd16 = (document.getElementById('numDays16').innerHTML).replace(/&nbsp;/g, '');
	var nd17 = (document.getElementById('numDays17').innerHTML).replace(/&nbsp;/g, '');
	var nd18 = (document.getElementById('numDays18').innerHTML).replace(/&nbsp;/g, '');
	var nd19 = (document.getElementById('numDays19').innerHTML).replace(/&nbsp;/g, '');
	var nd20 = (document.getElementById('numDays20').innerHTML).replace(/&nbsp;/g, '');
	var ndArray = new Array(nd1, nd2, nd3, nd4, nd5, nd6, nd7, nd8, nd9, nd10, nd11, nd12, nd13, nd14, nd15, nd16, nd17, nd18, nd19, nd20);
	for (i = 0; i <= 19; i++) {
		if (ndArray[i].replace(/&nbsp;/g, '') != "") {
			totalDays = totalDays + Number(ndArray[i]);
		}
	}


	var df1 = document.residencycheck3yr.Stamp1_DateFrom.value;
	var df2 = document.residencycheck3yr.Stamp2_DateFrom.value;
	var df3 = document.residencycheck3yr.Stamp3_DateFrom.value;
	var df4 = document.residencycheck3yr.Stamp4_DateFrom.value;
	var df5 = document.residencycheck3yr.Stamp5_DateFrom.value;
	var df6 = document.residencycheck3yr.Stamp6_DateFrom.value;
	var df7 = document.residencycheck3yr.Stamp7_DateFrom.value;
	var df8 = document.residencycheck3yr.Stamp8_DateFrom.value;
	var df9 = document.residencycheck3yr.Stamp9_DateFrom.value;
	var df10 = document.residencycheck3yr.Stamp10_DateFrom.value;
	var df11 = document.residencycheck3yr.Stamp11_DateFrom.value;
	var df12 = document.residencycheck3yr.Stamp12_DateFrom.value;
	var df13 = document.residencycheck3yr.Stamp13_DateFrom.value;
	var df14 = document.residencycheck3yr.Stamp14_DateFrom.value;
	var df15 = document.residencycheck3yr.Stamp15_DateFrom.value;
	var df16 = document.residencycheck3yr.Stamp16_DateFrom.value;
	var df17 = document.residencycheck3yr.Stamp17_DateFrom.value;
	var df18 = document.residencycheck3yr.Stamp18_DateFrom.value;
	var df19 = document.residencycheck3yr.Stamp19_DateFrom.value;
	var df20 = document.residencycheck3yr.Stamp20_DateFrom.value;
	var dfArray = new Array(df1, df2, df3, df4, df5, df6, df7, df8, df9, df10, df11, df12, df13, df14, df15, df16, df17, df18, df19, df20);
	
	var dt1 = document.residencycheck3yr.Stamp1_DateTo.value;
	var dt2 = document.residencycheck3yr.Stamp2_DateTo.value;
	var dt3 = document.residencycheck3yr.Stamp3_DateTo.value;
	var dt4 = document.residencycheck3yr.Stamp4_DateTo.value;
	var dt5 = document.residencycheck3yr.Stamp5_DateTo.value;
	var dt6 = document.residencycheck3yr.Stamp6_DateTo.value;
	var dt7 = document.residencycheck3yr.Stamp7_DateTo.value;
	var dt8 = document.residencycheck3yr.Stamp8_DateTo.value;
	var dt9 = document.residencycheck3yr.Stamp9_DateTo.value;
	var dt10 = document.residencycheck3yr.Stamp10_DateTo.value;
	var dt11 = document.residencycheck3yr.Stamp11_DateTo.value;
	var dt12 = document.residencycheck3yr.Stamp12_DateTo.value;
	var dt13 = document.residencycheck3yr.Stamp13_DateTo.value;
	var dt14 = document.residencycheck3yr.Stamp14_DateTo.value;
	var dt15 = document.residencycheck3yr.Stamp15_DateTo.value;
	var dt16 = document.residencycheck3yr.Stamp16_DateTo.value;
	var dt17 = document.residencycheck3yr.Stamp17_DateTo.value;
	var dt18 = document.residencycheck3yr.Stamp18_DateTo.value;
	var dt19 = document.residencycheck3yr.Stamp19_DateTo.value;
	var dt20 = document.residencycheck3yr.Stamp20_DateTo.value;
	var dtArray = new Array(dt1, dt2, dt3, dt4, dt5, dt6, dt7, dt8, dt9, dt10, dt11, dt12, dt13, dt14, dt15, dt16, dt17, dt18, dt19, dt20);


	// Loop backwards (from bottom up)
	var dteFrom;
	var dteTo;
	var dteTest;
	var numContinuousDays = 0;
	var boolLastValidStampFound = false;
	var LastDteTo;
	var stampType;

	dteTest = applicationDate;
	for (i = 19; i >= 0; i--)
	{
		stampType = document.getElementById("StampType" + (i + 1)).value;
		// Check for value
		if (ndArray[i] != "" && (stampType != "Select" && stampType != "2" && stampType != "2A"))
		{

			dteTo = splitandConvertDate(dtArray[i]);
			//get last valid stamp end date
			if(boolLastValidStampFound == false) {
				LastDteTo = dteTo;
				boolLastValidStampFound = true;
				if(LastDteTo < applicationDate) {break;} //not ok
				else if(LastDteTo >= applicationDate) {numContinuousDays ++;} //include application date in numContinuous days calculation

			}
			

			
			
			// Test the To Date
			if(dteTo >= dteTest - 1)
			{

				// OK
				// Check if To Date is greater than Test Date (if so, change To Date to Test Date)....  Stop extra days...
				dteTo = dteTest - 1;

				// Calc No of Days
				dteFrom = splitandConvertDate(dfArray[i]);
				if(dteFrom < dteTest)  // ignore stamps after application date
				{numContinuousDays += (dteTo - dteFrom + 1); // + 1 so as to include from date

				// Update Test Date
				dteTest = dteFrom;}
				
			}
			else
			{

				// NOT OK
				break;
			}
		}
		

	}


	//if(LastDteTo >= applicationDate - 1) {
	//numContinuousDays += 1;	// Include start day.
	//}				
	if (numContinuousDays > 364) {
		BoolContinuousYear = true;
	} else {
		BoolContinuousYear = false;
	}


	//calculate number of leap days covered by stamps
	for (i = 0; i <= 19; i++) {
		if (ndArray[i] != "") {
			leapyears = leapyears + getLeapYears(dfArray[i], dtArray[i]);
		}
	}

	document.getElementById('TotalDaysLabel').innerHTML = "No. of days:";
	document.getElementById('TotalDaysResult').innerHTML = totalDays;

	if (BoolContinuousYear == true) {
		document.getElementById('ResultPart1').innerHTML = "<p><img src='wp-content/calculator/tick.gif?OpenImageResource' alt='green tick'/><b>Residency in year prior to application ok</b></p>";
	} else {
		document.getElementById('ResultPart1').innerHTML = "<p><img src='wp-content/calculator/redx.gif?OpenImageResource' alt='red x'/><b>Year prior to application not continuous</b><br/>Based on the information entered there has been a break in your permissions in the year prior to the date of application and you have " + numContinuousDays + " days continuous reckonable residence immediately prior to the date of application you entered.</p>";
	}
	
	
	if (totalDays >= (calcYearsDays + leapyears)) {
		if (calcYearsDays == 1095){
		document.getElementById('ResultPart2').innerHTML = "<p><img src='wp-content/calculator/tick.gif?OpenImageResource' alt='green tick'/><b>Has 3 Years Residency</b></p>";
		}
		else {
		document.getElementById('ResultPart2').innerHTML = "<p><img src='wp-content/calculator/tick.gif?OpenImageResource' alt='green tick'/><b>Has 5 Years Residency</b></p>";
		}
		if(BoolContinuousYear != true) {
		document.getElementById('ResultText').innerHTML = "<p><strong>You should ensure that your registration with the Garda National Immigration Bureau is kept up to date during your residency in the State and that your permission stamp(s) cover the year prior to application without any break.</p>";
		}
	} else {
		var daysShort = (calcYearsDays + leapyears) - totalDays;
		if (calcYearsDays == 1095){
		document.getElementById('ResultPart2').innerHTML = "<p><img src='wp-content/calculator/redx.gif?OpenImageResource' alt='red x'/><b>Less than 3 Years Residency</b><br/>Based on the information entered you are " + daysShort + " days short of meeting the 3 year Statutory residency requirement. Subject to the provisions contained in Section 15A of the Irish Nationality and Citizenship Act , 1956, as amended, you should not sign the statutory declaration and lodge your application until this period has elapsed.</p>";
		}
		else {
		document.getElementById('ResultPart2').innerHTML = "<p><img src='wp-content/calculator/redx.gif?OpenImageResource' alt='red x'/><b>Less than 5 Years Residency</b><br/>Based on the information entered you are " + daysShort + " days short of meeting the 5 year Statutory residency requirement. Subject to the provisions contained in Section 16 of the Irish Nationality and Citizenship Act , 1956, as amended, you should not sign the statutory declaration and lodge your application until this period has elapsed.</p>";
		}
		document.getElementById('ResultText').innerHTML = "<p><strong>You should ensure that your registration with the Garda National Immigration Bureau is kept up to date during your residency in the State and that your permission stamp(s) cover the year prior to application without any break.</p>";
	}
	
}

function splitandConvertDate(date) {

	var elem = date.split('/');
	day = elem[0];
	month = elem[1] - 1;
	year = elem[2];
	return Date.UTC(year, month, day) / 1000 / 86400;
}

function getLeapYears(dateFrom, dateTo) {
	var lYears = 0;
	var leapYrArray = new Array("29/02/1996", "29/02/2000", "29/02/2004", "29/02/2008", "29/02/2012", "29/02/2016", "29/02/2020");
	for (j = 0; j < leapYrArray.length; j++) {

		if ((splitandConvertDate(dateFrom) <= splitandConvertDate(leapYrArray[j])) && (splitandConvertDate(leapYrArray[j]) <= splitandConvertDate(dateTo))) {
			lYears = lYears + 1;
		}
	}
	return lYears;
}


function appTypeChanged() {
$("#ApplicationDate").trigger('dpClosed', [$("#ApplicationDate").dpGetSelected()]);
setStampsInvalidBefore();
}

function setNumDays() {

	var appDate = document.residencycheck3yr.ApplicationDate.value;
	if (appDate == "") {
		alert("You must enter the date of application");
	} else {
		for (i = 1; i <= 20; i++) {
			if ((document.getElementById("Stamp" + i + "_DateFrom").value != '') && (document.getElementById("Stamp" + i + "_DateTo").value != '')) {
			
				var target = document.getElementById("numDays" + i);
				var listbox = document.getElementById("StampType" + i);
				var selected = listbox.value;
				if (selected != "Select") {
					if ((selected != "2") && (selected != "2A")) {
						var numDays = 0;
						var dFrom = convertToDays("Stamp" + i + "_DateFrom");
						var dTo = convertToDays("Stamp" + i + "_DateTo");
						var dApp = convertToDays("ApplicationDate");
						if ((dFrom <= dApp) && (dTo > dApp)) { //case 2
							if (i == 1) {
				
								numDays = dApp - dFrom + 1; //include both from and application dates
					
							} else {
								var prevdf;
								var prevdt;
								for(j=i; j>=1; j--) {
								if(j==1) {
								numDays = dApp - dFrom + 1;
								}
								else {
								//get only last dates from and to for valid stamps not for 2 or 2A
								var prevNum = j - 1;
								var prevStampType = document.getElementById("StampType" + prevNum).value;
								if(prevStampType != "2" && prevStampType != "2A") {
									prevdf = convertToDays("Stamp" + prevNum + "_DateFrom");
									prevdt = convertToDays("Stamp" + prevNum + "_DateTo");
									break;
									}
								}
								}
								
								if ((dFrom <= prevdt) && (dTo > prevdt)) { //case 6
									if (dApp > prevdt) {
										numDays = dApp - prevdt;
									} else {
										numDays = 0;
										
									}
								} else if ((dFrom <= prevdt) && (dTo <= prevdt)) { //case 4
									numDays = 0;
								
								} else if ((dFrom > prevdt) && (dTo > prevdt)) { //case 5
									numDays = dApp - dFrom + 1;
								
								}
							}
						}

						else if (dFrom > appDate) { //case 1,4; 1,5; 1,6;
							numDays = 0;
							
						}


						else if ((dFrom < dApp) && (dTo <= dApp)) { // case 3
							if (i == 1) {
								numDays = dTo - dFrom + 1;
								
							} else {
								var prevdf;
								var prevdt;
								for(j=i; j>=1; j--) {
								//get only last dates from and to for valid stamps not for 2 or 2A
								if(j==1) {
									numDays = dTo - dFrom + 1;
								}
								else{
								var prevNum = j - 1;
								var prevStampType = document.getElementById("StampType" + prevNum).value;
								if(prevStampType != "2" && prevStampType != "2A") {
									prevdf = convertToDays("Stamp" + prevNum + "_DateFrom");
									prevdt = convertToDays("Stamp" + prevNum + "_DateTo");
									break;
									}
								}}
								
								if ((dFrom <= prevdt) && (dTo > prevdt)) { //case 6
									numDays = dTo - prevdt;
								
								} else if ((dFrom > prevdt) && (dTo > prevdt)) { //case 5
									numDays = dTo - dFrom + 1;
									
								} else if ((dFrom <= prevdt) && (dTo <= prevdt)) { //case 4
									numDays = 0;
								}
							}
						}
						target.innerHTML = numDays;
					} else {
						target.innerHTML = "0";
					}

				} else {
					target.innerHTML = "&nbsp;";
				}
			}
		}
	}
}

function convertToDays(str) {
	var date = document.getElementById(str).value;
	var d = splitandConvertDate(date);
	return d;
}

/*set the stamps invalid before date */
function setStampsInvalidBefore() {
if(document.residencycheck3yr.ApplicationDate.value != "") {
var appDate = $('.date-pick').datePicker().dpGetSelected()[0];   
var year;
if (document.residencycheck3yr.group1[0].checked){
	year = appDate.getUTCFullYear() - 9;
	//$('#Stamp1_DateFrom').dpSetStartDate(d.addYears(-9).asString());
	}
	else {
	year = appDate.getUTCFullYear() - 5;
	//$('#Stamp1_DateFrom').dpSetStartDate(d.addYears(-5).asString());
	}
var month = appDate.getUTCMonth();
var day = appDate.getUTCDate();
var minDate = new Date(year, month, day).asString();
document.residencycheck3yr.DateStampsInvalidBefore.value = minDate;
setNumDays();
}
}