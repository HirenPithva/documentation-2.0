try {
    var gl_SaveData = 0;
    var gl_FeeInProgress = "0";
    var gl_RelWeekendHoliday = "";
    var TransportRelatedDetails = {};
    setTimeout(function () {
        //IStart JGP 03/19/19 SP4-1026, Call function to set width of new line and section divider control
        SetNewLineandSectionDividerControlsWidthForChargeInfo();
        //IEnd JGP 03/19/19 SP4-1026
    }, 0);
   
    if (gl_OpenedFromSummary != undefined) {
        if (gl_OpenedFromSummary == true) {

            RemoveClickHandler("10050_Cancel");
            $("#10050_Cancel").click(function () {
                GoBackToSummaryAndReset();
            });
        }
    }
    //IStart RAP/JGP 01/22/19 SP4-1026/SP4-1038, Apply numeric only filter. Moving the Number of Counts change to SP4-1038. 
    $('#NPCI_NumberOfCounts').numericOnly();
    //IEnd RAP/JGP 01/22/19 SP4-1026/SP4-1038
    EnableDisableControl("NPCI_BailType", false, "MCF");
    EnableDisableControl("NPCI_BailAmt", false,"TextMoney");
    EnableDisableControl("NPCI_NumberOfCounts", false);

    $('#NPCI_ChargeDate_Time').val('0000'); //Istart IEnd BRK 08/11/21 PI-703, Default the date of offense time to 0000

    //IStart BRK 08/11/21 PI-703, Added code to fill charges/statute/VCC code dropdowns
    var chargeTitle = $('#NPCI_Statute');
    var chargeDesc = $('#NPCI_ChargeDesc');
    //var chargeVcc = $('#NPCI_VCC');   //MStart MEnd SHV 09/02/21 PI-703, Commented the code as VCC code is coverted to the user defined dropdown field

    var local = 1;
    var state = 1;
    var repeal = 1;

    LoadChargesDropDowns('NPCI_ChargeDesc', local, state, repeal, 2);
    LoadChargesDropDowns('NPCI_Statute', local, state, repeal, 1);
    //LoadChargesDropDowns('NPCI_VCC', local, state, repeal, 3); //MStart MEnd SHV 09/02/21 PI-703, Commented the code as VCC code is coverted to the user defined dropdown field

    if (chargeTitle.length > 0) {
        chargeTitle.on("select2:select", function (e) {
            var chargeVal = GetS2DropdownSelectedVal('NPCI_Statute');

            var chargeText = GetCitationAndVCCCodeNP(chargeVal, 2);
            FillChargesDropDowns('NPCI_ChargeDesc', local, state, repeal, 2, [{ 'id': chargeVal, 'text': chargeText }])
            SetS2DropdownVal('NPCI_ChargeDesc', chargeVal, false);

            //MStart SHV 09/02/21 PI-703, Commented the code as VCC code is coverted to the user defined dropdown field
            //chargeText = GetCitationAndVCCCodeNP(chargeVal, 3)        
            //if (chargeText != '') {
            //    FillChargesDropDowns('NPCI_VCC', local, state, repeal, 3, [{ 'id': chargeVal, 'text': chargeText }])
            //    SetS2DropdownVal('NPCI_VCC', chargeVal, false);
            //}
            //else {
            //    SetS2DropdownVal('NPCI_VCC', -1, false);
            //}
            //MEnd SHV 09/02/21 PI-703
            GetChargesOtherdetails(chargeVal);
            CalculateSentenceEndDate();
        });
    }

    if (chargeDesc.length > 0) {
        chargeDesc.on("select2:select", function (e) {
            var chargeVal = GetS2DropdownSelectedVal('NPCI_ChargeDesc');

            var chargeText = GetCitationAndVCCCodeNP(chargeVal, 1);        
            FillChargesDropDowns('NPCI_Statute', local, state, repeal, 1, [{ 'id': chargeVal, 'text': chargeText }])
            SetS2DropdownVal('NPCI_Statute', chargeVal, false);

            //MStart SHV 09/02/21 PI-703, Commented the code as VCC code is coverted to the user defined dropdown field
            //chargeText = GetCitationAndVCCCodeNP(chargeVal, 3);  
            //if (chargeText != '') {
            //    FillChargesDropDowns('NPCI_VCC', local, state, repeal, 3, [{ 'id': chargeVal, 'text': chargeText }])
            //    SetS2DropdownVal('NPCI_VCC', chargeVal, false);
            //}
            //else {
            //    SetS2DropdownVal('NPCI_VCC', -1, false);
            //}
            //MEnd SHV 09/02/21 PI-703
            GetChargesOtherdetails(chargeVal);
            CalculateSentenceEndDate();
        });
    }

    //MStart SHV 09/02/21 PI-703, Commented the code as VCC code is coverted to the user defined dropdown field
    //if (chargeVcc.length > 0) {
    //    chargeVcc.on("select2:select", function (e) {
    //        var chargeVal = GetS2DropdownSelectedVal('NPCI_VCC');

    //        var chargeText = GetCitationAndVCCCodeNP(chargeVal, 1);
    //        FillChargesDropDowns('NPCI_Statute', local, state, repeal, 1, [{ 'id': chargeVal, 'text': chargeText }])
    //        SetS2DropdownVal('NPCI_Statute', chargeVal, false);

    //        chargeText = GetCitationAndVCCCodeNP(chargeVal, 2);
    //        FillChargesDropDowns('NPCI_ChargeDesc', local, state, repeal, 2, [{ 'id': chargeVal, 'text': chargeText }])
    //        SetS2DropdownVal('NPCI_ChargeDesc', chargeVal, false);

    //        GetChargesOtherdetails(chargeVal);
    //        CalculateSentenceEndDate();
    //    });
    //}
    //MEnd SHV 09/02/21 PI-703
     //IEnd BRK 08/11/21 PI-703
}
catch (e) {
    handleError(e);
}

/******************************************************************************
Description: 
    Back to summary screen if charge record selected from summary screen.

Revision History:
    SHV     08/11/21    PI-720, Open new summary screen for NewportNews
    JGP     11/27/17    SP4-7, Applied changes realted to Error handling. 
******************************************************************************/
function GoBackToSummaryAndReset() {
    try {
        gl_OpenedFromSummary = false;
        //MStart SHV 08/11/21 PI-720, Open new summary screen for NewportNews
        //MainMenuOpen(53); // Go back to Summary screen 
        MainMenuOpen(2120);
        //MEnd SHV 08/11/21 PI-720
    }
    catch (e) {
        handleError(e);
    }
}

RemoveClickHandler("10050_Save");
/******************************************************************************
Description: 
    Save charge click. Check mandatory field before save charge data.

Revision History:
    JGP     11/27/17    SP4-7, Applied changes realted to Error handling. 
******************************************************************************/
$("#10050_Save").click(function () {
    try {
        PreSaveChecks();
    }
    catch (e) {
        handleError(e);
    }
});

/******************************************************************************
Description: 
    Check data is valid appropriate business rules. If not then show alert message.

Revision History:
	BRH		09/03/20	SVC_4312, Make is so CA doesn't need a state notified date
    JGP     11/27/17    SP4-7, Applied changes realted to Error handling. 
******************************************************************************/
function CheckSentenceServe() {
    try {
        var type = GetS2DropdownSelectedVal('SI_Serves');
        var charge = GetS2DropdownSelectedVal('SI_ServesWith');
        var strMsg = "If a charge is serving consecutively/concurrently with another charge, both fields must have data before saving.";
        var promptUser = false;
        if (type == -1) {
            if (charge != -1) {
                promptUser = true;
            }
        }
        else {
            if (charge == -1) {
                promptUser = true;
            }
        }
        if (promptUser == true) {
            ShowChargeSaveError(strMsg);
            return false;
        }

        var sentType = '';
        if (GetS2DropdownSelectedVal('SI_SentType') != -1)
            sentType = GetS2Text('SI_SentType').toLowerCase();

        var convictionType = '';
        if (GetS2DropdownSelectedVal('SI_InmStatus') != -1)
            convictionType = GetS2Text('SI_InmStatus').toLowerCase();
        var stateNotified = $('#SI_StateNotify').val();
        var sentDays = $('#SI_SLengthDays').val();

        if (sentDays == '')
            sentDays = '0';
        var sentMonths = $('#SI_SLengthMonths').val();
        if (sentMonths == '')
            sentMonths = '0';
        var sentLength = true;
        if ((sentDays == '0') && (sentMonths == '0'))
            sentLength = false;
        var sentStartDate = $('#SI_SentStart_Date').val();

        if ((convictionType != 'no status change') && (convictionType != '')) {
            if ((sentStartDate == '') || (sentType == '') || (sentLength == false)) {
                strMsg = 'A convicted status cannot be saved without sentence type, sentence length, and sentence start date.';
                ShowChargeSaveError(strMsg);
                return false;
            }
        }

        var validSentType = false;
        if ((sentType != '') && (sentType != 'state ready') && (sentType.indexOf('parole') == -1)) {
            validSentType = true;
        }

        if (((validSentType == true) && ((sentLength == false) || (sentStartDate == ''))) ||
           ((sentLength == true) && ((validSentType == false) || (sentStartDate == ''))) ||
           ((sentStartDate != '') && ((validSentType == false) || (sentLength == false)))) {
            strMsg = 'If this inmate is being sentenced, please fill in Sentence Type, Sentence Start Date, and Sentence Length.';
            ShowChargeSaveError(strMsg);
            return false;
        }

        if (sentType == 'state ready') {
			//SVC-4312 MStart BRH
            if (stateNotified == '' && gl_AppVersion != 'CA') { 
                strMsg = "If the inmate's sentence type is State Ready, please enter the State Notified Date.";
                ShowChargeSaveError(strMsg);
                return false;
            }
			//SVC-4312 MEnd
        }

        return true;
    }
    catch (e) {
        handleError(e);
    }
}

/******************************************************************************
Description: 
    Show alert message for which information is remaining or which business rules not applied.

Revision History:
    JGP     11/27/17    SP4-7, Applied changes realted to Error handling. 
******************************************************************************/
function ShowChargeSaveError(pMessage) {
    try {
        var buttonError = {
            button1: {
                btntext: "OK",
                clickFunction: "StandardValidationPopupClose",
            }
        };

        ShowInformationalPopup(gl_AppConnection, pMessage, "graphics/Alert.png", buttonError, "divInformationMainContentBottom", true);
        $("#divInformationalPopup").show();
    }
    catch (e) {
        handleError(e);
    }
}

/******************************************************************************
Description: 
    Check mandatory field before save charge data.

Revision History:
	JDL		01/07/20	SVC-2867, Added functionality for checking state ready sentence type against the inmate's custody type. Moved some functionality to a different function.
	AGB     05/15/18    SP4-765 Moved bail / bond auto fill to before mandatory checks.
    JGP     11/27/17    SP4-7, Applied changes realted to Error handling. 
******************************************************************************/
function PreSaveChecks() {
    try {
		//SP4-765 AB 05/15/18 Moved to before mandatory checking.
        //IStart TSA 04/20/18 SP4-693, Added condition to check if bail amount or bond amount is null than add 0
        if ($('#NPCI_BailAmt').val() == '' || $('#NPCI_BailAmt').val().trim() == '') {
            $('#NPCI_BailAmt').val('$0');
        }
        if ($('#NPCI_BondAmt').val() == '' || $('#NPCI_BondAmt').val().trim() == '') {
            $('#NPCI_BondAmt').val('$0');
        }
        //IEnd TSA 04/20/18 SP4-693
        var mandatoryVals = CheckMandatory(10050);
        mandatoryVals += CheckMandatory(10051);
        mandatoryVals += CheckMandatory(10052);
        mandatoryVals += CheckMandatory(10053);
        mandatoryVals += CheckMandatory(10054);
        mandatoryVals += CheckMandatory(10055);

        if (mandatoryVals != "") {
            var buttonMandatory = {
                button1: {
                    btntext: "OK",
                    clickFunction: "StandardValidationPopupClose",
                },
            };
            var strMessage = "The following fields are mandatory:<br>" + mandatoryVals;
            ShowInformationalPopup(gl_AppConnection, strMessage, "graphics/Alert.png", buttonMandatory, "divInformationMainContentBottom", true);
            $("#divInformationalPopup").show();
            return;
        }

        if (gl_SelectedChargeID == 0) {
            var buttonCharge = {
                button1: {
                    btntext: "OK",
                    clickFunction: "StandardValidationPopupClose",
                }
            };

            ShowInformationalPopup(gl_AppConnection, "A charge must be selected before saving.", "graphics/Alert.png", buttonCharge, "divInformationMainContentBottom", true);
            $("#divInformationalPopup").show();
            return;
        }
		//SVC-2867 BEGIN
		var chargeSentType = CheckStateReadySentenceType();
		if (chargeSentType.length > 0 && chargeSentType.toLowerCase() != "state ready") {
			var buttonSentence = {
				button1: {
					btntext: "Yes",
					clickFunction: "UpdateCustodyTypeToStateReady",
				},
				button2: {
					btntext: "No",
					clickFunction: "ContinuePreSaveChecks",
				},
			};

			var strMessage = "Inmates current custody status is '" + chargeSentType + "'. Would you like to update the custody status to 'State Ready'?";
			ShowInformationalPopup(gl_AppConnection, strMessage, "graphics/Question.png", buttonSentence, "divInformationMainContentBottom", true);
			$("#divInformationalPopup").show();
		} else {
			ContinuePreSaveChecks();
		}
		//SVC-2867 END
    }
    catch (e) {
        handleError(e);
    }
}

/******************************************************************************
Description: 
    Show alert message, if release date has value which day is holiday or weekend.

Revision History:
    RVV     01/03/19    SP4-1022, Do not notify user if release date is on a weekend or holiday if gl_AppVersion is CA.
    JGP     11/27/17    SP4-7, Applied changes realted to Error handling. 
******************************************************************************/
function CheckWeekendHoliday() {
    if (gl_RelWeekendHoliday != "") {
        var nextFunction = ""
        if (gl_Record == 0)
            nextFunction = "PreSaveCharge";
        else
            nextFunction = "CheckLinkedWeekendHoliday";
        //MStart RVV 01/03/19 SP4-1022, If gl_AppVersion is CA then do not notify user if release date is on a weekend or holiday.
        if (gl_AppVersion != "CA") {
            var buttonHolidayWeekend = {
                button1: {
                    btntext: "Yes",
                    clickFunction: nextFunction,
                },
                button2: {
                    btntext: "No",
                    clickFunction: "StandardValidationPopupClose",
                }
            };

            ShowInformationalPopup(gl_AppConnection, "Release date is on a " + gl_RelWeekendHoliday + ", do you wish to continue?", "graphics/Alert.png", buttonHolidayWeekend, "divInformationMainContentBottom", true);
            $("#divInformationalPopup").show();
        }
        else {
            eval(nextFunction)();
        }
        //MEnd RVV 01/03/19 SP4-1022
    }
    else {
        PreSaveCharge();
    }

}

/******************************************************************************
Description: 
    Check linked weekend holiday before save charge.

Revision History:
    JGP     11/27/17    SP4-7, Applied changes realted to Error handling. 
******************************************************************************/
function CheckLinkedWeekendHoliday() {
    //CheckLinkedChargeDates(ByVal pID As String, ByVal pAdmission As String) As String
    // Public Function VerifyLinkIntegrity(ByVal pID As String, ByVal pChargeLinkID As String) As String
    //, ByVal pSentStart As String, ByVal pCondRel As String
    var iAdmission = "";
    if (gl_SelectedInmate != undefined) {
        if (gl_SelectedInmate['id_admissions'] != undefined) {
            iAdmission = gl_SelectedInmate['id_admissions'];
        }
    }
    var sentStart = $('#SI_SentStart_Date').val();
    var condRel = $('#OC_ODCondDate_Date').val();
    var PassData = { 'pID': gl_Record, 'pAdmission': iAdmission, 'pSentStart': sentStart, 'pCondRel': condRel };
    try {
        ajaxWebCall({
            method: "CheckLinkedChargeDates",
            data: PassData,
            success: function (result) {
                if (result['Table'][0]['Charges'] != undefined) {
                    var charges = result['Table'][0]['Charges'];
                    if (charges != '') {
                        var buttonHolidayWeekend = {
                            button1: {
                                btntext: "Yes",
                                clickFunction: "PreSaveCharge",
                            },
                            button2: {
                                btntext: "No",
                                clickFunction: "StandardValidationPopupClose",
                            }
                        };
                        var strMessage = "The following charges will release on a weekend/holiday if you continue, do you wish to proceed?<br>" + charges;
                        ShowInformationalPopup(gl_AppConnection, strMessage, "graphics/Alert.png", buttonHolidayWeekend, "divInformationMainContentBottom", true);
                        $("#divInformationalPopup").show();
                    }
                    else
                        PreSaveCharge();
                }
            }
        });
    }
    catch (e) {
        handleError(e);
    }
}

/******************************************************************************
Description: 
    Check charge integrity.

Revision History:
    JGP     11/27/17    SP4-7, Applied changes realted to Error handling. 
******************************************************************************/
function CheckChargeIntegrity() {
    //CheckLinkedChargeDates(ByVal pID As String, ByVal pAdmission As String) As String
    // Public Function VerifyLinkIntegrity(ByVal pID As String, ByVal pChargeLinkID As String) As String
    //, ByVal pSentStart As String, ByVal pCondRel As String
    var iAdmission = "";
    if (gl_SelectedInmate != undefined) {
        if (gl_SelectedInmate['id_admissions'] != undefined) {
            iAdmission = gl_SelectedInmate['id_admissions'];
        }
    }
    var linkCharge = GetS2DropdownSelectedVal('SI_ServesWith');
    var PassData = { 'pID': gl_Record, 'pChargeLinkID': linkCharge };
    try {
        ajaxWebCall({
            method: "VerifyLinkIntegrity",
            data: PassData,
            success: function (result) {
                if (result['Table'][0]['Integrity'] != undefined) {
                    var chargeIntegrity = result['Table'][0]['Integrity'];
                    if (chargeIntegrity != 'VALID') {
                        var buttonHolidayWeekend = {
                            button1: {
                                btntext: "OK",
                                clickFunction: "StandardValidationPopupClose",
                            },
                        };
                        var strMessage = "Saving the currently selected charge will cause an illegal operation. Please change details of how this charge serves consecutively/concurrently with another charge.";
                        ShowInformationalPopup(gl_AppConnection, strMessage, "graphics/Alert.png", buttonHolidayWeekend, "divInformationMainContentBottom", true);
                        $("#divInformationalPopup").show();
                    }
                    else
                        CheckWeekendHoliday();
                }
            }
        });
    }
    catch (e) {
        handleError(e);
    }
}

/******************************************************************************
Description: 
    Update other reason.

Revision History:
    JGP     11/27/17    SP4-7, Applied changes realted to Error handling. 
******************************************************************************/
function UpdateOtherReason(iAdmission) {
    var PassData = { 'admissionID': iAdmission };
    try {
        ajaxWebCall({
            method: "UpdateOtherReason",
            data: PassData,
            success: function (result) {
                if (result.Table != undefined) {
                }
            }
        });
    }
    catch (e) {
        handleError(e);
    }
}

/******************************************************************************
Description: 
    Pre Save Charge.

Revision History:
	SVC-5483 04/20/21 LMG Added logic to check if charge is released as well when checking if inmate is released.
    SVC-4737 AMH allows charges to be released if inmates are released at the same time the charge is saved
    JGP     11/27/17    SP4-7, Applied changes realted to Error handling. 
******************************************************************************/
function PreSaveCharge() {
    var iAdmission = "";
    if (gl_SelectedInmate != undefined) {
        if (gl_SelectedInmate.id_admissions != undefined) {
            iAdmission = gl_SelectedInmate.id_admissions;
        }
    }
    var PassData = { 'pAdmission': iAdmission, 'pChargeID': gl_SelectedChargeID };
    try {
        ajaxWebCall({
            method: "PreChargeSaveCheck",
            data: PassData,
            success: function (result) {
                if (result.Table != undefined) {
                    if (result.Table.length > 0) {
                        if (result.Table[0]['Success'] != undefined) {
                            SaveChargeInfo();
                        }
                        else if (result.Table[0]['DNAReq'] != undefined) {
                            var strMessage = "";
                            var bSentenced = false;
                            var bCountyType = false;
                            var bNotStateReady = false;

                            var strChargeDNAReq = result.Table[0]['ChargeDNAReq'];
                            var strChargeSOReq = result.Table[0]['ChargeSOReq'];

                            var strDNAReq = result.Table[0]['DNAReq'];
                            var strDNATaken = result.Table[0]['DNATaken'];
                            var strSOReq = result.Table[0]['SOReq'];
                            var strSOReg = result.Table[0]['SOReg'];
                            var strCustodyType = result.Table[0]['CustType'];
                            var strCustodyFlag = result.Table[0]['CustFlag'];

                            var strSentHours = $('#SI_SLengthHrs').val();
                            var strSentDays = $('#SI_SLengthDays').val();
                            var strSentMonths = $('#SI_SLengthMonths').val();
                            var strSentYears = $('#SI_SLengthYears').val();

                            var strSentType = GetS2Text('SI_SentType');
                            var strSentStartDate = $('#SI_SentStart_Date').val();
                            if ((strSentStartDate == "") || (strSentStartDate == "__/__/____"))
                                strSentStartDate = "";

                            if ((strCustodyType.toUpperCase() != 'STATE READY') && (strCustodyFlag == "1")) { //SVC-2550 JDL  10/24/19
                                bCountyType = true;
							}
                            if ((strSentType.toUpperCase() != 'STATE READY') && (strCustodyType.toUpperCase() != 'STATE READY')) { //SVC-2550 JDL  10/24/19
                                bNotStateReady = true;
							}
                            var hours = 0;
                            var days = 0;
                            var months = 0;
                            var years = 0;

                            if ((strSentHours != "") && ($.isNumeric(strSentHours)))
                                hours = parseInt(strSentHours, 0);
                            if ((strSentDays != "") && ($.isNumeric(strSentDays)))
                                days = parseInt(strSentDays, 0);
                            if ((strSentMonths != "") && ($.isNumeric(strSentMonths)))
                                months = parseInt(strSentMonths, 0);
                            if ((strSentYears != "") && ($.isNumeric(strSentYears)))
                                years = parseInt(strSentYears, 0);

                            if (((hours > 0) || (days > 0) || (months > 0) || (years > 0)) && (strSentType != '') && (strSentStartDate != ""))
                                bSentenced = true;

                            if ((bCountyType == true) && (bNotStateReady == true) && (bSentenced == true)) {
                                if ((strChargeDNAReq == "True") && (strChargeSOReq == "True")) {
                                    if ((strDNATaken == "False") && (strSOReg == "False")) {
                                        strMessage = "This charge requires both a DNA Sample to be taken and Sex Offender registration.";
                                    }
                                    else if (strDNATaken == "False") {
                                        strMessage = "This charge requires DNA Sample to be taken.";
                                    }
                                    else if (strSOReg == "False") {
                                        strMessage = "This charge requires Sex Offender registration.";
                                    }
                                }
                                else if (strChargeDNAReq == "True") {
                                    if (strDNATaken == "False") {
                                        strMessage = "This charge requires DNA Sample to be taken.";
                                    }
                                }
                                else if (strChargeSOReq == "True") {
                                    if (strSOReg == "False") {
                                        strMessage = "This charge requires Sex Offender registration.";
                                    }
                                }
                                if (strMessage != "") {
                                    var buttonAlert = {
                                        button1: {
                                            btntext: "OK",
                                            clickFunction: "SaveChargeInfo",
                                        }
                                    };

                                    ShowInformationalPopup(gl_AppConnection, strMessage, "graphics/Alert.png", buttonAlert, "divInformationMainContentBottom", true);
                                    $("#divInformationalPopup").show();
                                }
                                else {
                                    SaveChargeInfo();
                                }
                            }
                            else {
                                var released = 0;
								
								released = CheckIsReleasedWhileAddingCharge(gl_SelectedInmate['id_admissions']);
														
								if (released==1 && $('#CR_RelOff').val() == ""){ //SVC-5483 MStart MEnd LMG 4/20/2021 Added logic to if statement to check if the charge is not released
								    saveReleaseInfoAfterReleased();
								}
								else{
								    SaveChargeInfo();
								}
								//SaveChargeInfo();
								//IEnd SVC-4737 12/11/2020 AMH
                            }
                        }
                    }
                }
            }
        });
    }
    catch (e) {
        handleError(e);
    }
}

/******************************************************************************
Description: 
    Save charge details.

Revision History:
    RKS     03/20/19    SP4-1065, Added a conditional check of the sentence_type and pre_check of intermittent_in value exists or not.
    RKS     03/15/19    SP4-1065, Added conditional button check to save intermittent_in when save a charge as per requirement.
    RKS     03/11/19    SP4-1048, Added a function call to update the ReleaseDate_Time, Released Reason dropdown and Released comments if the user has rights to update released bookings 
    RKS     03/01/19    SP4-1065, Added a function call to add intermittent in when a charge is added of sentence type = 'intermittent' or 'weekends'
	ADS     05/17/18    SP4-763,  Disable all the save button on the charges tab, will be enable only if any error occurred. 
    TSA     04/20/18    SP4-693, Check if bail or bond amount is empty than add 0
    ADS	    03/14/18    SP4-459, Used generic function GetDesignModeCurrentVersion() to determine currenly loaded design mode version.
    ADK     03/09/18    SP4-459, Added design mode version parameter after CommitTempDocuments 
    PHK     12/06/17    SP4-362   Applied ording of signature prompts to capture signatures
    JGP     11/27/17    SP4-7,    Applied changes realted to Error handling. 
******************************************************************************/
function SaveChargeInfo() {
    try {
        StandardValidationPopupClose();
        //HANDLE SAVING FOR SPECIFIC GROUP
		
		//IStart ADS 05/17/18 SP4-763 : Disables all the save button on the charges tab, will be enable only if save of charge is successful or any error occurred 
        DisableAllChargesSaveButton();
        //IEnd ADS 05/17/18 SP4-763

        var SignatureCap = GetNextSignatureControl(); // SP4-362   Applied ording of signature prompts to capture signatures
        var is_exists = false;
        if (SignatureCap != null) {
            if ((SignatureCap != undefined) && SignatureCap.shouldShowPopup()) {
                SignatureCap.showPopup(function () {
                    SaveChargeInfo();
                });
                return;
            }
        }

        var arrayMain = [];
        var arraySub = [];

        //AB SP4-765 Moved to PreSaveChargeChecks
        //IStart TSA 04/20/18 SP4-693, Added condition to check if bail amount or bond amount is null than add 0
        /*if ($('#NPCI_BailAmt').val() == '' || $('#NPCI_BailAmt').val().trim() == '') {
            $('#NPCI_BailAmt').val('$0');
        }
        if ($('#NPCI_BondAmt').val() == '' || $('#NPCI_BondAmt').val().trim() == '') {
            $('#NPCI_BondAmt').val('$0');
        }*/
        //IEnd TSA 04/20/18 SP4-693

        for (var curControl in gl_htControls) {
            var curControlCheck = gl_htControls[curControl];

            if ((curControlCheck.CReference == "CR_RelReason") || (curControlCheck.CReference == "CR_RelComments"))
                continue;
            if (curControlCheck.SUpdate == true) {
                var data = RetrieveControlData(curControlCheck.CReference, curControlCheck.CType, curControlCheck.SColumn, curControlCheck.STable);
                arrayMain.push(data);
            }
        }
        var iAdmission = "";
        if (gl_SelectedInmate != undefined) {
            if (gl_SelectedInmate.id_admissions != undefined) {
                iAdmission = gl_SelectedInmate.id_admissions;
            }
        }
        //MStart TatavaSoft 09-March-2018 ADK Sp4-459, Added design mode version parameter
        //var PassData = { "pValues": arrayMain, "pChargeID": gl_SelectedChargeID, "pGroupRecord": gl_Record, 'pAdmission': iAdmission, 'pTempID': gl_ChargeTempID, 'pRelease': '0', 'pUserID': gl_CurrentUser["id_security"], "pDocumentsTempID": gl_htControls["ChargeDocuments"].tree.UniqueID };
        var PassData = { "pValues": arrayMain, "pChargeID": gl_SelectedChargeID, "pGroupRecord": gl_Record, 'pAdmission': iAdmission, 'pTempID': gl_ChargeTempID, 'pRelease': '0', 'pUserID': gl_CurrentUser["id_security"], "pDocumentsTempID": gl_htControls["ChargeDocuments"].tree.UniqueID, pCurrentVersion: (GetDesignModeCurrentVersion()) };
        //MEnd TatvaSoft 09-March-2018
        ajaxWebCall({
            method: "ChargeSave",
            data: PassData,
            success: function (result) {
                if (result.RetVal != undefined)
                    gl_SaveData = result.RetVal;
                //SetControlGroupSaved();//Tatvasoft: for status saving
                if ($('#NPCI_CaseNum').val().replace(/ /g, '') != "") {
                    //MStart YA  SP4-1022 02/06/19, turned off this functionality for CA as they did not have it in 3.5 
                    if (gl_AppVersion != "CA") {
                        CheckForOtherCaseNumbers();
                        //IStart RKS 03/20/19 SP4-1065, Added a conditional check of the sentence_type and pre_check of intermittent_in value exists or not.
                        //MStart RKS 03/15/19 SP4-1065, Added conditional button check to save intermittent_in when save a charge as per requirement.
                        //IStart RKS 03/01/19 SP4-1065, Added a function call to add intermittent in when a charge is added of sentence type = 'intermittent' or 'weekends'
                        // AddIntermittentInOut(gl_CurrentUser['id_security'], gl_SelectedInmate['id_admissions'], gl_SaveData, '1');
                        //IEnd RKS 03/01/19 SP4-1065
                        is_exists = PreCheckIfIntermittentInExists(gl_SelectedInmate['id_admissions']);
                        if ((GetS2DropdownSelectedText('SI_SentType') == 'Weekends' || GetS2DropdownSelectedText('SI_SentType') == 'intermittent') && is_exists == false) {
                            var buttonSave = {
                                button1: {
                                    btntext: "Yes",
                                    clickFunction: "AddIntermittentInOut(\"" + gl_CurrentUser['id_security'] + "\",\"" + gl_SelectedInmate['id_admissions'] + "\",\"" + gl_SaveData + "\",\"1\");CloseChargeForm",
                                },
                                button2: {
                                    btntext: "No",
                                    clickFunction: "CloseChargeForm",
                                },
                            };
                            ShowInformationalPopup(gl_AppConnection, 'Do you wish to create an Intermittent In record for this inmate?', "graphics/Question.png", buttonSave, "divInformationMainContentBottom", true);
                            $("#divInformationalPopup").show();
                        }
                        //IEnd RKS 03/20/19 SP4-1065
                    }
                    //MEnd YA  SP4-1022 02/06/19
                }
                else {
                    //IStart RKS 03/20/19 SP4-1065, Added a conditional check of the sentence_type and pre_check of intermittent_in value exists or not.
                    //IStart RKS 03/01/19 SP4-1065, Added a function call to add intermittent in when a charge is added of sentence type = 'intermittent' or 'weekends'
                    //AddIntermittentInOut(gl_CurrentUser['id_security'], gl_SelectedInmate['id_admissions'], gl_SaveData, '1');
                    //IEnd RKS 03/01/19 SP4-1065
                    is_exists = PreCheckIfIntermittentInExists(gl_SelectedInmate['id_admissions']);
                    if ((GetS2DropdownSelectedText('SI_SentType') == 'Weekends' || GetS2DropdownSelectedText('SI_SentType') == 'intermittent') && is_exists == false) {
                        var buttonSave = {
                            button1: {
                                btntext: "Yes",
                                clickFunction: "AddIntermittentInOut(\"" + gl_CurrentUser['id_security'] + "\",\"" + gl_SelectedInmate['id_admissions'] + "\",\"" + gl_SaveData + "\",\"1\");CloseChargeForm",
                            },
                            button2: {
                                btntext: "No",
                                clickFunction: "CloseChargeForm",
                            },
                        };
                        ShowInformationalPopup(gl_AppConnection, 'Do you wish to create an Intermittent In record for this inmate?', "graphics/Question.png", buttonSave, "divInformationMainContentBottom", true);
                        $("#divInformationalPopup").show();
                    }
                    else {
                        CloseChargeForm();
                    }
                    //IEnd RKS 03/20/19 SP4-1065
                }
                //MEnd RKS 03/15/19 SP4-1065
                //IStart RKS 03/11/19 SP4-1048, Added a function call to update the ReleaseDate_Time, Released Reason dropdown and Released comments if the user has rights to update released bookings 
                if ($('#CR_RelDateTime_Date').val() != "" && CheckUserPermission(3, 12) == "3" && $('#CR_RelOff').val() != "") {
                    UpdateReleaseInfoPostRelease(gl_SaveData);
                }
                //IEnd RKS 03/11/19 SP4-1048
                if (gl_SaveData != undefined && gl_SaveData != "") {
                    SaveNewPortSpecificControls(gl_SaveData);
                }
            },
			failure: function () {
                //IStart ADS 05/17/18 SP4-763 : Enables all the save button on the charges tab, only if save of charge is successful or any error occurred 
                EnableAllChargesSaveButton();
                //IEnd ADS 05/17/18 SP4-763
            }
        });
    }
    catch (e) {
        handleError(e);
		//IStart ADS 05/17/18 SP4-763 : Enables all the save button on the charges tab, only if save of charge is successful or any error occurred 
        EnableAllChargesSaveButton();
        //IEnd ADS 05/17/18 SP4-763
    }
}

/******************************************************************************
Description: 
    Close charge form after saving charge details.

Revision History:
    ADK     01/04/17    SP4-429, I have put this function in order to avoid dirty save check after save as it is happening due to SubMenuOpen function
    JGP     11/27/17    SP4-7, Applied changes realted to Error handling. 
******************************************************************************/
function CloseChargeForm() {
    try {
        //GetValueBeforeChange();//IStart TatvaSoft 04-Jan-2018, SP4-429, I have put this function in order to avoid dirty save check after save as it is happening due to SubMenuOpen function.
        SetControlGroupSaved(10056); //EJH: for status saving
        StandardValidationPopupClose();
        gl_NewRecord = gl_SaveData;
        var buttonSave = {
            button1: {
                btntext: "OK",
                clickFunction: "CheckForTransport",
                //clickFunction: "StandardCancel",
            },
        };
        ShowInformationalPopup(gl_AppConnection, 'The charge has been saved successfully.', "graphics/Success.png", buttonSave, "divInformationMainContentBottom", true);
        $("#divInformationalPopup").show();
    }
    catch (e) {
        handleError(e);
    }
}

/******************************************************************************
Description: 
    Check for other case number.

Revision History:
    JGP     11/27/17    SP4-7, Applied changes realted to Error handling. 
******************************************************************************/
function CheckForOtherCaseNumbers() {
    try {
        var iAdmission = "";
        if (gl_SelectedInmate != undefined) {
            if (gl_SelectedInmate.id_admissions != undefined) {
                iAdmission = gl_SelectedInmate.id_admissions;
            }
        }
        var PassData = { "pNewCharge": gl_SaveData, "pAdmission": iAdmission };

        ajaxWebCall({
            method: "CheckCaseNumbers",
            data: PassData,
            success: function (result) {
                var exitForm = true;
                if (result.Table != undefined) {
                    if (result.Table.length > 0) {
                        if (result.Table[0]['Count'] != undefined) {
                            var caseNumCount = result.Table[0]['Count'];
                            if (caseNumCount > 0) {
                                exitForm = false;
                                var buttonSave = {
                                    button1: {
                                        btntext: "Yes",
                                        clickFunction: "UpdateCaseNumbers",
                                    },
                                    button2: {
                                        btntext: "No",
                                        clickFunction: "CloseChargeForm",
                                    },
                                };
                                ShowInformationalPopup(gl_AppConnection, 'Would you like to update the court information of all charges associated with the case number ' + $('#NPCI_CaseNum').val() + '?', "graphics/Question.png", buttonSave, "divInformationMainContentBottom", true);
                                $("#divInformationalPopup").show();
                            }
                        }
                    }
                }
                if (exitForm == true)
                    CloseChargeForm();
            }
        });
    }
    catch (e) {
        handleError(e);
    }
}

/******************************************************************************
Description: 
    Update case number.

Revision History:
    JGP     11/27/17    SP4-7, Applied changes realted to Error handling. 
******************************************************************************/
function UpdateCaseNumbers() {
    try {
        var iAdmission = "";
        if (gl_SelectedInmate != undefined) {
            if (gl_SelectedInmate['id_admissions'] != undefined) {
                iAdmission = gl_SelectedInmate['id_admissions'];
            }
        }
        var PassData = { "pNewCharge": gl_SaveData, "pAdmission": iAdmission };

        ajaxWebCall({
            method: "UpdateCaseNumbers",
            data: PassData,
            success: function (result) {
                //MStart EJH 04-02-18 SP4-623: Display SO and/or DNA notification if required / Refactor of success
                if ((result.Table != undefined) && (result.Table.length > 0)) {
                    var record = result.Table[0];

                    if (!record.Success) return;
                    //debugger;
                    var SORequired = (record.SONotify == "1");
                    var DNARequired = (record.DNANotify == "1");
                    var PopupMessage = "";

                    if (SORequired && DNARequired) {
                        PopupMessage = "The updated charges require both a DNA Sample to be taken and Sex Offender registration.";
                    }
                    else if (DNARequired) {
                        PopupMessage = "An updated charge requires a DNA Sample to be taken.";
                    }
                    else if (SORequired) {
                        PopupMessage = "An updated charge requires Sex Offender registration.";
                    }

                    if (PopupMessage != "") {
                        var OKButton = {
                            button1: {
                                btntext: "OK",
                                clickFunction: "CloseChargeForm",
                            }
                        };

                        ShowInformationalPopup(gl_AppConnection, PopupMessage, "graphics/Alert.png", OKButton, "divInformationMainContentBottom", true);
                        $("#divInformationalPopup").show();

                        return;
                    }

                    CloseChargeForm();
                }
                //MEnd EJH 04-02-18 SP4-623
            }
        });
    }
    catch (e) {
        handleError(e);
    }
}

RemoveClickHandler("NPCI_SelCharge");
/******************************************************************************
Description: 
    Select charge click event.

Revision History:
    JGP     11/27/17    SP4-7, Applied changes realted to Error handling. 
******************************************************************************/
$("#NPCI_SelCharge").click(function () {
    try {
        var buttonVar = gl_htControls['NPCI_SelCharge'];
        var selRec = 0;
        if (buttonVar.ToScreen != undefined) {
            StoreData(gl_CurrentScreen, undefined, buttonVar.ToScreen, undefined, gl_Record);
            if (gl_htStoredInfo[buttonVar.ToScreen] != undefined)
                delete gl_htStoredInfo[buttonVar.ToScreen];
            gl_CurrentScreen = buttonVar.ToScreen;
            LoadControls();
        }
    }
    catch (e) {
        handleError(e);
    }
});

RemoveClickHandler("NPCI_ViewCHistory");
/******************************************************************************
Description: 
    View charge history click event.

Revision History:
    JGP     11/27/17    SP4-7, Applied changes realted to Error handling. 
******************************************************************************/
$("#NPCI_ViewCHistory").click(function () {
    try {
        OpenChargeHistoryPopup();
    }
    catch (e) {
        handleError(e);
    }
});

if (gl_Record == 0)
    EnableDisableButton("NPCI_ViewCHistory", false);
else
    EnableDisableButton("NPCI_ViewCHistory", true);

/******************************************************************************
Description: 
    Open charge history pop up.

Revision History:
    JGP      04/04/18    SP4-530, Pass new parameter "pScreenNavigation" for save screen navigation details in screen log while get controls details.
    ADS	    03/14/18    SP4-459, Used generic function GetDesignModeCurrentVersion() to determine currenly loaded design mode version.
    BRK      02/02/18    SP4-459, Added pDesignModeVersion version paramater to get controls version vise
    JGP     11/27/17    SP4-7, Applied changes realted to Error handling. 
******************************************************************************/
function OpenChargeHistoryPopup() {
    try {
        //IStart JGP 04/04/18 SP4-530 : Stored screen navigation details in variable.
        var screen_navigation = GetScreenNavigationPath(2866);
        //IEnd JGP 04/04/18 SP4-530
        // MStart TatvaSoft 02/02/18 SP4-459, Added pDesignModeVersion version paramater to get controls version vise
        //var PassData = { "pWorkflow": "1", "pMenuItem": gl_MenuItem, "pScreen": 2866, "pTopMenuItem": 0, "pUser": gl_CurrentUser['id_security'] };
        //MStart JGP 04/04/18 SP4-530 : Pass new parameter "pScreenNavigation" for save screen navigation details in screen log while get controls details.
        //var PassData = { "pDesignModeVersion": GetDesignModeCurrentVersion(), "pWorkflow": "1", "pMenuItem": gl_MenuItem, "pScreen": 2866, "pTopMenuItem": 0, "pUser": gl_CurrentUser['id_security'] };
        var PassData = { "pDesignModeVersion": GetDesignModeCurrentVersion(), "pWorkflow": "1", "pMenuItem": gl_MenuItem, "pScreen": 2866, "pTopMenuItem": 0, "pUser": gl_CurrentUser['id_security'], "pScreenNavigation": screen_navigation };
        //MEnd JGP 04/04/18 SP4-530
        //MEnd TatvaSoft 02/02/18 SP4-459
        ajaxWebCall({
            method: "GetControls",
            data: PassData,
            success: function (result) {
                var popupHTML = "<div id='controls_popup'></div>";
                var popupTitle = 'Charge History';
                gl_blnAddControl = false;
                ShowCustomPopup(popupTitle, popupHTML, false, 580, 390);

                LoadControlsOK(result, true);
                //PositionPopUpCustom();
                $("#divCustomPopup").show();
                SetPopUPPositionFordivCustomPopup();
                for (var group in gl_htGroupInfo) {
                    var curGroup = gl_htGroupInfo[group];
                    if (curGroup.GroupRef != gl_htControls['ChargeHistoryGrid'].GroupRef)
                        continue;
                    if ((curGroup.PostLoad != undefined) && (curGroup.PostLoad != "")) {
                        AddDynamicEvents(curGroup.PostLoad);
                    }
                }
            }
        });
    }
    catch (e) {
        handleError(e);
    }
}

try {
    if (gl_ChargeHistory == true)
        SetupChargeHistory(true);

    if (gl_Record != 0) {
        CalculateDaysServed(gl_ChargeHistory);
    }
}
catch (e) {
    handleError(e);
}

/******************************************************************************
Description: 
    Calculate Day Served.

Revision History:
    BSK      09/11/18    SP4-56, Added county name for foreign county's data.
    JGP     11/27/17    SP4-7, Applied changes realted to Error handling. 
******************************************************************************/
function CalculateDaysServed(pHistory) {
    try {
        var historyRecord = "0";
        //IStart BSK 09/11/18 SP4-56, Added county name for foreign county's data.
        var countyName = "";
        if (gl_SelectedInmate.county_name != gl_MyCounty) {
            countyName = gl_SelectedInmate.county_name;
        }
        //IEnd BSK 09/11/18 SP4-56
        if (pHistory == true)
            historyRecord = "1";
        var PassData = { "pChargeRecord": gl_Record, "pHistory": historyRecord, "pCountyName": countyName }; //IStart IEnd BSK 09/11/18 SP4-56, Added county name for foreign county's data.

        ajaxWebCall({
            method: "CalculateDaysServed",
            data: PassData,
            success: function (result) {
                if (result.Table != undefined) {
                    if (result.Table.length > 0) {
                        if (result.Table[0]['DaysServed'] != undefined)
                            $("#NPCI_DaysServed").val(result.Table[0]['DaysServed']);
                    }
                }
            }
        });
    }
    catch (e) {
        handleError(e);
    }
}

try {
    if (($('#NPCI_BailType').length > 0) && ($('#BBF_BailType').length > 0)) {
        $('#NPCI_BailType').on("select2:select", function (e) {
            if (GetS2DropdownSelectedVal('NPCI_BailType') != -1)
                $('#BBF_BailType').val(GetS2Text('NPCI_BailType'));
            else
                $('#BBF_BailType').val('');
        });
    }

    if (($('#NPCI_BondType').length > 0) && ($('#BBF_BondType').length > 0)) {
        $('#NPCI_BondType').on("select2:select", function (e) {
            if (GetS2DropdownSelectedVal('NPCI_BondType') != -1)
                $('#BBF_BondType').val(GetS2Text('NPCI_BondType'));
            else
                $('#BBF_BondType').val('');
        });
    }

    if (($('#NPCI_BailAmt').length > 0) && ($('#BBF_BailAmount').length > 0)) {
        $('#NPCI_BailAmt').blur(function () {
            $('#BBF_BailAmount').val($('#NPCI_BailAmt').val());
        });
    }

    if (($('#NPCI_BondAmt').length > 0) && ($('#BBF_BondAmount').length > 0)) {
        $('#NPCI_BondAmt').blur(function () {
            $('#BBF_BondAmount').val($('#NPCI_BondAmt').val());
        });
    }
}
catch (e) {
    handleError(e);
}


RemoveClickHandler("NPFee_Add");
/******************************************************************************
Description: 
    Add Fee click event.

Revision History:
    JGP     11/27/17    SP4-7, Applied changes realted to Error handling. 
******************************************************************************/
$("#NPFee_Add").click(function () {
    try {
        //IStart 22-Sep-2017, Whenever you change any record in "Charge Information" and you move to "Add Fee", flag is set to prompt of data lost from any top and left menu.
        if (CheckBeforeAndAfterValueOnSave()) {
            gl_IsInnerSubGridNotLoaded = true;
            gl_BeforeChargeHTMLArr = gl_BeforeHTMLArr;
        }
        //IEnd 22-Sep-2017
        var buttonVar = gl_htGridButtons[this.id];
        if (buttonVar.SendToScreen == undefined) return;
        var grid = gl_htControls[buttonVar.Grid].grid;
        var recordCol = grid.getColIndexById("id");
        var idSelected = grid.getSelectedRowId();
        var selRec = 0;
        if (idSelected != null)
            selRec = grid.cells(idSelected, recordCol).getValue();
        gl_LoadData = false;
        StoreData(gl_CurrentScreen, buttonVar.SendToMenu, buttonVar.SendToScreen, buttonVar.Grid, selRec);
        gl_CurrentScreen = buttonVar.SendToScreen;
        gl_Record = 0;
        LoadControls();
    }
    catch (e) {
        handleError(e);
    }
});

RemoveClickHandler("NPFee_View");
/******************************************************************************
Description: 
    Select Fee click event.

Revision History:
    JGP     11/27/17    SP4-7, Applied changes realted to Error handling. 
******************************************************************************/
$("#NPFee_View").click(function () {
    try {
        var buttonVar = gl_htGridButtons[this.id];
        if (buttonVar.SendToScreen == undefined) return;
        var grid = gl_htControls[buttonVar.Grid].grid;
        var recordCol = grid.getColIndexById("id");
        var idSelected = grid.getSelectedRowId();
        var selRec = 0;
        if (idSelected != null)
            selRec = grid.cells(idSelected, recordCol).getValue();
        var setRecord = false;
        if (buttonVar.SendRecord == true) {
            if (selRec != 0) {
                //gl_Record = selRec;
                setRecord = true;
            }
            else //NO RECORD SELECTED MESSAGE
                return;
        }
        else
            gl_LoadData = false;
        StoreData(gl_CurrentScreen, buttonVar.SendToMenu, buttonVar.SendToScreen, buttonVar.Grid, selRec);
        if (buttonVar.SendRecord == true)
            gl_Record = selRec;
        gl_CurrentScreen = buttonVar.SendToScreen;
        var inProgCol = grid.getColIndexById("NPBBF_FeeInProg");
        gl_FeeInProgress = grid.cells(idSelected, inProgCol).getValue();


        LoadControls();
    }
    catch (e) {
        handleError(e);
    }
});

try {
    LoadFees();
}
catch (e) {
    handleError(e);
}

/******************************************************************************
Description: 
    Load fees data.

Revision History:
	ADS     05/24/18    SP4-776, TextMoney controls needs to show with appropriate formatting(i.e comma) "FormatDecimalTS" is a function called on focusout so have trigger focus out event.
    JGP     11/27/17    SP4-7, Applied changes realted to Error handling. 
******************************************************************************/
function LoadFees() {
    try {
        var iAdmission = "";
        if (gl_SelectedInmate != undefined) {
            if (gl_SelectedInmate.id_admissions != undefined) {
                iAdmission = gl_SelectedInmate.id_admissions;
            }
        }
        var PassData = { "pAdmissionID": iAdmission, "pRecord": gl_Record, "pTempID": gl_ChargeTempID };
        ajaxWebCall({
            method: "LoadFees",
            data: PassData,
            success: function (result) {
                ProcessGrid(result['Table'], 'NPBBF_FeeList');
                var feeAmount = "0";
                var gridFees = gl_htControls['NPBBF_FeeList']['grid'];
                var feeCol = gridFees.getColIndexById("NPBBF_FeeAmt");
                for (var i = 0; i < gridFees.getRowsNum() ; i++) {
                    var rowID = gridFees.getRowId(i);
                    var rowFee = gridFees.cells(rowID, feeCol).getValue();
                    feeAmount = (parseFloat(feeAmount.replace(/,/g, '')) + parseFloat(rowFee.replace(/,/g, '').replace('$', ''))).toString();
                }
                feeAmount = "$" + parseFloat(feeAmount).toFixed(2);
                $('#BBF_FeeAmount').val(feeAmount);
				
				//IStart ADS 05/24/18 SP4-776: TextMoney controls needs to show with appropriate formatting(i.e comma) "FormatDecimalTS" is a function called on focusout so have trigger focus out event.
                $('#BBF_FeeAmount').trigger("focusout");
                //IEnd ADS 05/24/18 SP4-776
				
                if (gridFees.getRowsNum() > 0) {
                    if ((gl_ChargeHistory == false) && (gl_EditRecord == true) && (CheckUserPermission(2, 90) == "3"))
                        EnableDisableButton('Fee_View', true);
                    else
                        EnableDisableButton('Fee_View', false);
                }
            }
        });
    }
    catch (e) {
        handleError(e);
    }
}

/******************************************************************************
Description: 
    Retrive inmate data.

Revision History:
    JGP     11/27/17    SP4-7, Applied changes realted to Error handling. 
******************************************************************************/
function LoadSARStatus() {
    try {
        var iAdmission = 0;
        if (gl_SelectedInmate != undefined) {
            if (gl_SelectedInmate.id_admissions != undefined) {
                iAdmission = gl_SelectedInmate.id_admissions;
            }
        }
        var PassData = { "pInmate": '0', "pAdmission": iAdmission, 'pSource': 'SARStatus' };

        ajaxWebCall({
            method: "RetrieveInmateData",
            data: PassData,
            success: function (result) {
                if (result.Table.length > 0) {
                    if (result.Table[0]['InitialDesc'] != undefined)
                        gl_SARIStatus = result.Table[0]['InitialDesc'];
                    if (result.Table[0]['InitialType'] != undefined)
                        gl_SARIType = result.Table[0]['InitialType'];
                    if (result.Table[0]['ChangeDesc'] != undefined)
                        gl_SARCStatus = result.Table[0]['ChangeDesc'];
                    if (result.Table[0]['ChangeType'] != undefined)
                        gl_SARCType = result.Table[0]['ChangeType'];
                    if (result.Table[0]['ChangeDate'] != undefined)
                        gl_SARCDate = result.Table[0]['ChangeDate'];
                }
            }
        });
    }
    catch (e) {
        handleError(e);
    }

}
/******************************************************************************
Description: 
    Check for transportlog entry.

Revision History:
	JGP     04/24/18    SP4-705, Comment-out call "LoadProfileBlock" function code because "LoadProfileBlock" function already call from "InnerLoadControls" function while load controls.
    ADK     04/20/18    SP4-696, Check whether inmate exists or not
    JGP     11/27/17    SP4-7, Applied changes realted to Error handling. 
******************************************************************************/
function CheckForTransportLogEntry() {
    try {
        var isValid = false;
        var hasRightsForTransport = CheckUserPermission(1, 7) == "3" ? true : false;
        if (hasRightsForTransport) {
            if ($('#NPCI_CourtDate_Date').val() != "" && $('#NPCI_CourtDate_Time').val() != "" && GetS2DropdownSelectedVal('NPCI_CLoc') != "-1" && GetS2DropdownSelectedVal('NPCI_Judge') != "-1") {
                //MStart TatvaSoft 04/20/18 SP4-696, Check whether inmate exists or not
                if (gl_SelectedInmate != undefined) {
                    if (gl_SelectedInmate.id_admissions != undefined && gl_SelectedInmate.id_inmates != undefined) {
                        gl_ChargeInfoTransport = {
                            id_inmate: gl_SelectedInmate.id_inmates, id_admissions: gl_SelectedInmate.id_admissions, courtDate_Date: $('#NPCI_CourtDate_Date').val(),
                            CourtDate_Time: $('#NPCI_CourtDate_Time').val(), Court_Loc: GetS2DropdownSelectedVal('NPCI_CLoc'), Judge: GetS2DropdownSelectedVal('NPCI_Judge')
                        };
                    }
                }
                //MEnd TatvaSoft 04/20/18 SP4-696
                if (gl_Record != '0') {
                    if (checkIfObjectContains(gl_ChargeInfoTransport, TransportRelatedDetails)) {
                        return false// if user doesn't change values
                    }
                }
                isValid = true;
            }
        }
        return isValid;
    }
    catch (e) {
        handleError(e);
    }
}

/******************************************************************************
Description: 
    Create transport entry.

Revision History:
    ADK     05/01/17    SP4-429, To open transport log without sub menu tabs
    JGP     11/27/17    SP4-7, Applied changes realted to Error handling. 
******************************************************************************/
function CreateTransportEntry() {
    try {
        StandardValidationPopupClose();
        // gl_ChargeInfoTransport = { id_inmate: gl_SelectedInmate.id_inmates, id_admissions: gl_SelectedInmate.id_admissions, courtDate_Date: $('#NPCI_CourtDate_Date').val(), CourtDate_Time: $('#NPCI_CourtDate_Time').val() };
        //MStart TatvaSoft 05-Jan-2018 SP4-429
        //SubMenuOpen(69);
        //var obj = setInterval(function () {
        //    if ($('#DG_119_IT').length > 0) {
        //        clearInterval(obj);
                //$('#profileDiv').hide();
                
                gl_CurrentScreen = 125
                //   gl_SelectedInmate = 0

                gl_TopMenuItem = 7
                gl_LoadData = false
                gl_Record = 0;
                //IStart TatvaSoft SP4-429, Commenting this block in order to open transport log without left menu sub menus and tabs above
                //LoadProfileBlock();
                //IEnd TatvaSoft SP4-429
                LoadControls();
        var obj = setInterval(function () {
            if ($('#DG_119_IT').length > 0 && gl_IsLoadDisplayLoaded) {
                clearInterval(obj);
                $('#divItemMenu').hide();
            }
        }, 500);

        gl_AddChargeTempSave = true;
    }
    catch (e) {
        handleError(e);
    }
}

/******************************************************************************
Description: 
    Back to grid.

Revision History:
    JGP     11/27/17    SP4-7, Applied changes realted to Error handling. 
******************************************************************************/
function BackToGrid() {
    try {
        StandardValidationPopupClose();
        SubMenuOpen(2118);
        gl_ChargeInfoTransport = {};
        gl_AddChargeTempSave = true;
    }
    catch (e) {
        handleError(e);
    }
}

/******************************************************************************
Description: 
    Check for transport.

Revision History:
	JGP     04/24/18    SP4-705, Comment-out call "LoadProfileBlock" function code because "LoadProfileBlock" function already call from "InnerLoadControls" function while load controls.
    JGP     11/27/17    SP4-7, Applied changes realted to Error handling. 
******************************************************************************/
function CheckForTransport() {
    try {
        // StandardCancel();
        $("#divInformationalPopup").hide(); // BWW SVC-2018 insure modal screen is gone when this function is called
        gl_AddChargeTempSave = false;
        gl_IsTempEditedRecordChanged = false;
        gl_IsProceedForDelete = false;

        if (CheckForTransportLogEntry()) {
            var buttonYesNo = {
                button1: {
                    btntext: "Yes",
                    clickFunction: "CreateTransportEntry"

                },
                button2: {
                    btntext: "No",
                    clickFunction: "BackToGrid"
                }
            };
            ShowInformationalPopup(gl_AppConnection, 'Would you like to add a transport entry for the court date of this charge?', "graphics/Question.png", buttonYesNo, "divInformationMainContentBottom", true);
            $("#divInformationalPopup").show();
        }
        else {
            if (!gl_OpenedFromSummary) {
                StandardCancel();
            }
            else {
                GoBackToSummaryAndReset();
            }
            gl_AddChargeTempSave = true;
        }
    }
    catch (e) {
        handleError(e);
    }
}

/******************************************************************************
Description: 
    Check if object contains.

Revision History:
    ADK     06/27/18    SP4-812, As lowercase is working only with string datatype. So modified object value to toString() for avoid toLowerCase() issue.
    JGP     11/27/17    SP4-7, Applied changes realted to Error handling. 
******************************************************************************/
function checkIfObjectContains(one, two) {
    try {
        for (var i in one) {
            //MStart ADK 06/27/18 SP4-812, As lowercase is working only with string datatype. So modified object value to toString() for avoid toLowerCase() issue
            //if (!two.hasOwnProperty(i) || one[i].toLowerCase() !== two[i].toLowerCase()) {
            if (!two.hasOwnProperty(i) || one[i].toString().toLowerCase() !== two[i].toString().toLowerCase()) {
                return false;
            }
            //MEnd ADK 06/27/18 SP4-812, As lowercase is working only with string datatype. So modified object value to toString() for avoid toLowerCase() issue
        }
        return true;
    }
    catch (e) {
        handleError(e);
    }
}

/******************************************************************************
Description: 
    Enables all the save button in the charges tab.

Revision History:
    ADS     05/17/18    SP4-763, Enables all the save button on the charges tab. 
******************************************************************************/
function EnableAllChargesSaveButton() {
    try {
        EnableDisableButton('10050_Save', true);
        EnableDisableButton('10051_Save', true);
        EnableDisableButton('10052_Save', true);
        EnableDisableButton('10053_Save', true);
    }
    catch (e) {
        handleError(e);
    }
}

/******************************************************************************
Description: 
    Disable all the save button in the charges tab.

Revision History:
    ADS     05/17/18    SP4-763, Disables all the save button on the charges tab. 
******************************************************************************/
function DisableAllChargesSaveButton() {
    try {
        EnableDisableButton('10050_Save', false);
        EnableDisableButton('10051_Save', false);
        EnableDisableButton('10052_Save', false);
        EnableDisableButton('10053_Save', false);
    }
    catch (e) {
        handleError(e);
    }
}


/******************************************************************************
Description: 
    Re-size all the comments/notes in charges tab 

Revision History:
    ADS    06/08/18    SP4-790, Re-size all the comments/notes in charges tab 
******************************************************************************/
function ResizeCommentsOrNotes() {
    try {
        if (gl_htGroupInfo['10050'] != undefined && gl_htGroupInfo['10050']["DynamicSize"] == true) {   //Comments in Charge Information screen
            ResizeTextAreaControlsInChargesScreen('DG_10050_ITP0ITIR23C0');
        }

        if (gl_htGroupInfo['10051'] != undefined && gl_htGroupInfo['10051']["DynamicSize"] == true) {   //Notes in Sentence Information screen
            ResizeTextAreaControlsInChargesScreen('DG_10051_ITP0ITIR10C0');
        }

        if (gl_htGroupInfo['10052'] != undefined && gl_htGroupInfo['10052']["DynamicSize"] == true) {   //Comments in OutDate Calculation screen
            ResizeTextAreaControlsInChargesScreen('DG_10052_ITP0ITIR10C0');
            ResizeTextAreaControlsInChargesScreen('DG_10052_ITP0ITIR11C0');
        }

        if (gl_htGroupInfo['10054'] != undefined && gl_htGroupInfo['10054']["DynamicSize"] == true) {   //Comments in Relaese in Charges screen
            ResizeTextAreaControlsInChargesScreen('DG_10054_ITP0ITIR3C0');
        }
    }
    catch (e) {
        handleError(e);
    }
}

/******************************************************************************
Description: 
    This function adds intermittent in or intermittent out when a charge is added/released of sentence type = 'intermittent' or 'weekends'

Revision History:
    RKS    03/01/19    SP4-1065, Added a function to add intermittent in or intermittent out when a charge is added/released of sentence type = 'intermittent' or 'weekends'
******************************************************************************/
function AddIntermittentInOut(securityId, admissionId, chargeId, isIntermittentIn) {
    try {
        if (admissionId != undefined) {
            iAdmission = gl_SelectedInmate['id_admissions'];
        }
        var PassData = { "pSecurityId": securityId, "pAdmission": iAdmission, 'pChargeId': chargeId, 'pIsIntermittentIn': isIntermittentIn };
        ajaxWebCall({
            method: "AddIntermittentInOutForSelectedInmate",
            assumeJSONResponse: false,
            data: PassData,
            success: function (result) {
            }
        });
    }
    catch (e) {
        handleError(e);
    }
}

/******************************************************************************
Description: 
    This function updates the ReleaseDate_Time, Released Reason dropdown and Released comments if the user has rights to update released bookings

Revision History:
    RKS    03/11/19    SP4-1048, Added a function to update the ReleaseDate_Time, Released Reason dropdown and Released comments if the user has rights to update released bookings 
******************************************************************************/
function UpdateReleaseInfoPostRelease(chargeRecord) {
    try {
        var releasedDateTime = '';
        var releasedReason = '';
        var releasedComments = '';

        releasedDateTime = $('#CR_RelDateTime_Date').val() + ' ' + convertTimeToStandard($('#CR_RelDateTime_Time').val());
        releasedReason = GetS2DropdownSelectedVal('CR_RelReason');
        releasedComments = GetCustomTextareaValue('CR_RelComments');
        var PassData = { "pSecurityId": gl_CurrentUser["id_security"], "pAdmission": gl_SelectedInmate['id_admissions'], 'pChargeId': chargeRecord, 'pReleaseDateTime': releasedDateTime, 'pReleaseReason': releasedReason, 'pReleaseComments': releasedComments };
        ajaxWebCall({
            method: "UpdateReleaseInfoPostRelease",
            assumeJSONResponse: false,
            data: PassData,
            success: function (result) {
            }
        });
    }
    catch (e) {
        handleError(e);
    }
}

/******************************************************************************
Description: 
    This function is used to set the width of the section divider and new line controls 
Revision History:
    JGP   03/19/19 SP4-1026, This function is used to set width of new line and section divider control
******************************************************************************/
function SetNewLineandSectionDividerControlsWidthForChargeInfo() {
    try {
        if (gl_htGroupInfo != undefined) {
            $.each(gl_htGroupInfo, function (i, entry) {
                var controlWidth = parseInt($('#DG_' + i + '_ITP0ITSH').width()) - 35;//DIff of Width of control group and padding
                if (controlWidth < 0) {
                    controlWidth = parseInt($('#DG_' + i + '_IT').width()) - 35;
                }
                $('#DG_' + i + '_ITP0ITSH').find('.newLine').css({
                    "width": controlWidth
                });
                $('#DG_' + i + '_ITP0ITSH').find('.SectionDivider').css({
                    "width": controlWidth
                });
            });
        }
    }
    catch (e) {
        handleError(e);
    }
}

/******************************************************************************
Description: 
    This function checks if an intermittent_in record exists for that inmate or not when the sentence_type = 'intermittent' or 'weekends'.

Revision History:
    RKS    03/20/19    SP4-1065, Added a function which checks if an intermittent_in record exists for that inmate or not when the sentence_type = 'intermittent' or 'weekends'
******************************************************************************/
function PreCheckIfIntermittentInExists(admissionId) {
    try {
        var retVal;
        var PassData = { "pAdmissionId": admissionId };
        ajaxWebCall({
            method: "PreCheckIfIntermittentInExists",
            data: PassData,
            success: function (result) {
                if (result.Table.length > 0) {
                    retVal = result.Table[0]['inout'];
                }
            }
        });
        return retVal;
    }
    catch (e) {
        handleError(e);
    }
}

/******************************************************************************
Description: 
    This function checks Mandatory validation for ReleaseDate/Time and Release Reason on Save button click

Revision History:
    RKS   03/22/19    SP4-1048, Check Mandatory validation for ReleaseDate/Time and Release Reason on Save button click
******************************************************************************/
function CheckReleaseValidationPostRelease() {
    try {
        var retVal = '';
        var date = [];
        //MStart RKS 03/25/19 SP4-1048, Added the condition to check if inmate is released or not and then check the values for ReleaseDate/Time and Release Reason on button click 
        if (CheckForReleasedBooking()) {
            date = GetReleasedDateFromCustodyForSelectedInmate(gl_SelectedInmate['id_admissions']);
            if ($('#CR_RelDateTime_Date').val() == "" || $("#CR_RelDateTime_Time").val() == "" || GetS2DropdownSelectedVal('CR_RelReason') == -1) {
                retVal = 'You must enter a Release Date, Release Time, and a Release Reason to save this record.';
            }
            else if ($('#CR_RelDateTime_Date').val() != undefined) {
                if (compareDate(new Date($('#CR_RelDateTime_Date').val()), new Date(date[0]), '>')) {
                    retVal = 'You cannot enter Release Date after the Inmate\'s Release Date.';                    
                }
                else if (compareDate(new Date($('#CR_RelDateTime_Date').val()), new Date(date[1]), '<')) {
                    retVal = 'You cannot enter Release Date before the Charge Date.';
                }
            }
        }
        //MEnd RKS 03/25/19 SP4-1048
        return retVal;
    }
    catch (e) {
        handleError(e)
    }
}


/******************************************************************************
Description: 
    This function is used to get the release date of selected inmate.

Revision History:
    RKS     03/25/19    SP4-1048, Created a function to get the release date of selected inmate. 
******************************************************************************/
function GetReleasedDateFromCustodyForSelectedInmate(admissionId) {
    try {
        var releasedDate = '';
        var chargeDate = '';
        var arrVal = [];
        var PassData = { 'pAdmissionID': admissionId, "pChargeId": gl_SelectedChargeID, "pRecodId": gl_Record };
        ajaxWebCall({
            method: "GetReleasedDateFromCustodyForSelectedInmate",
            data: PassData,
            success: function (result) {
                if (result.Table.length > 0) {
                    if (result.Table[0] != undefined) {
                        releasedDate = GetFormattedDateTime(result.Table[0]['rel_from_custody_date']).split(' ');
                        chargeDate = GetFormattedDateTime(result.Table[0]['charge_date']).split(' ');
                    }
                }
            }
        });
        arrVal = [releasedDate[0], chargeDate[0]]
        return arrVal;
    }
    catch (e) {
        handleError(e)
    }
}

/******************************************************************************
Description: 
    This function is used to check an inmate's sentence type against their
	custody type, if the sentence type is "State Ready". If the sentence type
	is State Ready and the custody type is not, then the user will be asked if
	they would like up update the custody type to "State Ready". Otherwise,
	nothing else will happen.

Revision History:
    JDL     01/07/2020    SVC-2867, Added.
******************************************************************************/
function CheckStateReadySentenceType() {
	var retVal = "";
	try {
        var sentText = GetS2Text('SI_SentType');
        if (sentText.toLowerCase() != 'state ready') {
            return "";
        }

        var pAdmission = gl_SelectedInmate['id_admissions'];
        var PassData = { "pAdmission": pAdmission };
        ajaxWebCall({
            method: "CheckStateReadySentenceType",
            data: PassData,
            success: function (result) {
				//debugger;
				retVal = result["Table"][0]["custody_type"];
            }
        });
    }
    catch (e) {
        handleError(e)
    }
	return retVal;
}

/******************************************************************************
Description: 
    This function updates the custody type to state ready when the sentence type
	is also "state ready" and the user clicks "yes" on the prompt.

Revision History:
    JDL     01/07/2020    SVC-2867, Added.
******************************************************************************/
function UpdateCustodyTypeToStateReady() {
    try {
        var pAdmission = gl_SelectedInmate['id_admissions'];
        var PassData = { "pAdmission": pAdmission };
        ajaxWebCall({
            method: "UpdateCustodyTypeToStateReady",
            data: PassData,
            success: function (result) {
                if (result != "True") {
                    var buttonOk = {
                        button1: {
                            btntext: "Ok",
                            clickFunction: "StandardValidationPopupClose",
                        },
                    };
                    var strMessage = "Could Not Update Custody Type to State Ready. Please Try to Change This Manually.";
                    ShowInformationalPopup(gl_AppConnection, strMessage, "graphics/Info.png", buttonOk, "divInformationMainContentBottom", true);
                    $("#divInformationalPopup").show();
                }
            }
        });
    }
    catch (e) {
        handleError(e);
    }
	ContinuePreSaveChecks();
}

/******************************************************************************
Description: 
    Moved this functionality from PreSaveChecks in order to get the
	State Ready check to work properly on sentence save.

Revision History:
    JDL     01/07/2020    SVC-2867, Added.
******************************************************************************/
function ContinuePreSaveChecks() {
	StandardValidationPopupClose();
	if (CheckSentenceServe() == false) { return; }

        //IStart RKS 03/22/19 SP4-1048, Added a check for mandatory validation for ReleaseDate/Time and Release_Reason on Save button click
        var result = CheckReleaseValidationPostRelease();
        if (result == '') {
            if (gl_Record != 0) {
                //AB SP4-743 05/08/18
                if (GetS2DropdownSelectedVal('SI_Serves') == 1) {
                    CheckChargeIntegrity();
                }
                else {
                    CheckWeekendHoliday();
                }
            }
            else {
                CheckWeekendHoliday();
            }
        }
        else {
            var buttonValidateSave = {
                button1: {
                    btntext: "OK",
                    clickFunction: "StandardValidationPopupClose",
                },
            };

            ShowInformationalPopup(gl_AppConnection, result, "graphics/Alert.png", buttonValidateSave, "divInformationMainContentBottom", true);
            $("#divInformationalPopup").show();
        }
        //IEnd RKS 03/22/19 SP4-1048
}

/******************************************************************************
Description: 
    Handled Bail/Bond Hearing Required checkbox change event and enable/disable bail/bond/fees control based on its value.

Revision History:
	VAP    06/17/19    PI-14, Added new field in the 'charge_lists' table and made changes in the 'Bail/Bonds/Fees' screen for the same.    
******************************************************************************/
$("#NPCI_BailBondHearing").change(function () {
    try {		
		if ($(this).prop("checked")) {			
			EnableDisableControl("BBF_Bondsman", false, "Textbox");			
        } else {
            EnableDisableControl("BBF_Bondsman", true, "Textbox");
        }		
    } catch (e) {
        handleError(e);
    }
});

/******************************************************************************
Description: 
   This function used to enable/disable bail/bond/fees control based on Bail/Bond Hearing Required checkbox value.

Revision History:
    JGP     12/19/18  SP4-976, Created function to enable/disable bail/bond/fees control based on Bail/Bond Hearing Required checkbox value.
******************************************************************************/
function EnableDisableBailBondFeeControls(value) {
    try {
        //EnableDisableControl("NPCI_BailType", value, "MCF");
        //EnableDisableControl("NPCI_BailAmt", value, "TextMoney");
        EnableDisableControl("NPCI_BondType", value, "MCF");
        EnableDisableControl("NPCI_BondAmt", value, "TextMoney");

        //EnableDisableControl("BBF_LocationPaid", value, "MCF");
        //EnableDisableControl("BBF_BailPay", value, "Textbox");
        EnableDisableControl("BBF_BondPost", value, "FFMCF");
        EnableDisableControl("BBF_FeePay", value, "Textbox");
        //EnableDisableControl("BBF_PayAdd", value, "Textbox");
        EnableDisableControl("BBF_BondAdd", value, "Textbox");
        EnableDisableControl("BBF_FeeAdd", value, "Textbox");
        //EnableDisableControl("BBF_PayCity", value, "CMCF");
        EnableDisableControl("BBF_BondCity", value, "CMCF");
        EnableDisableControl("BBF_FeeCity", value, "CMCF");
        //EnableDisableControl("BBF_PayState", value, "MCF");
        EnableDisableControl("BBF_BondState", value, "MCF");
        EnableDisableControl("BBF_FeeState", value, "MCF");
        //EnableDisableControl("BBF_PayZip", value, "Zip");
        EnableDisableControl("BBF_BondZip", value, "Zip");
        EnableDisableControl("BBF_FeeZip", value, "Zip");
        //EnableDisableControl("BBF_BailPhone", value, "Phone");
        EnableDisableControl("BBF_BondPhone", value, "Phone");
        EnableDisableControl("BBF_FeePhone", value, "Phone");
        //EnableDisableControl("BBF_BailEmail", value, "Textbox");
        EnableDisableControl("BBF_BondEmail", value, "Textbox");
        EnableDisableControl("BBF_FeeEmail", value, "Textbox");
        //EnableDisableControl("BBF_BailDate", value, "Date");
        EnableDisableControl("BBF_PostDate", value, "Date");
        EnableDisableControl("BBF_FeeDate", value, "Date");

        //IStart VAP 06/17/19 PI-14, Added new field in the 'charge_lists' table and made changes in the 'Bail/Bonds/Fees' screen for the same.    		
        EnableDisableControl("BBF_Bondsman", value, "Textbox");
        //IEnd VAP 06/17/19 PI-14
    }
    catch (e) {
        handleError(e);
    }
}

/******************************************************************************
Description: 
    Handled Bail/Bond Hearing Required checkbox change event and enable/disable bail/bond/fees control based on its value.

Revision History:
	SKB    08/14/19    PI-75, Added the Enable-Disable event of the "63_Print" button.
    JGP    12/19/18    SP4-976, Handled Bail/Bond Hearing Required checkbox change event and enable/disable bail/bond/fees control based on its value. 
******************************************************************************/
$("#NPCI_BailBondHearing").change(function () {
    try {
        if ($(this).prop("checked")) {
            EnableDisableBailBondFeeControls(false);
            EnableDisableButton("63_Print", false);
        } else {
            EnableDisableBailBondFeeControls(true);
            if (GetS2DropdownSelectedVal('NPCI_BailType') != '-1' || GetS2DropdownSelectedVal('NPCI_BondType') != '-1' || $('#BBF_FeeAmount').val().replace('$', '') != 0.00) {
                EnableDisableButton("63_Print", true);
            } else {
                EnableDisableButton("63_Print", false);
            }
        }
        //MEnd SKB 08/14/19 PI-75
    } catch (e) {
        handleError(e);
    }
})


/******************************************************************************
Description: 
    Checks Inmate has been Release status
	
	AMH    12/11/20    SVC-4737, Added this function to see if an inmate is released when adding charges    
******************************************************************************/
function CheckIsReleasedWhileAddingCharge(admissionId)
{
    try {
        var retVal;
        var PassData = { "pAdmissionId": admissionId };
        ajaxWebCall({
            method: "CheckIsReleasedWhileAddingCharge",
            data: PassData,
            success: function (result) {
                if (result.Table.length > 0) {
                    retVal = result.Table[0]['is_rel_from_custody'];
                }
            }
        });
        return retVal;
    }
    catch (e) {
        handleError(e);
    }
}

/******************************************************************************
Description: 
    Saves the Charge Information and the Release Information

	AMH    12/11/20    SVC-4737, Added this function to save the release information and the charge information     
******************************************************************************/
function saveReleaseInfoAfterReleased()
{
	var arrayMain = [];
	var arraySub = [];
	for (var curControl in gl_htControls) {
		var curControlCheck = gl_htControls[curControl];
		if (curControlCheck.SUpdate == true) {
			var data = RetrieveControlData(curControlCheck.CReference, curControlCheck.CType, curControlCheck.SColumn, curControlCheck.STable);
			arrayMain.push(data);
		}
	}
	var iAdmission = "";
	if (gl_SelectedInmate != undefined) {
		if (gl_SelectedInmate.id_admissions != undefined) {
			iAdmission = gl_SelectedInmate.id_admissions;
		}
	}
	var chargeRelease_Date = $('#CR_RelDateTime_Date').val();
	var chargeRelease_Time = convertTimeToStandard($('#CR_RelDateTime_Time').val());
	var chargeRelease_DateTime = chargeRelease_Date + ' ' + chargeRelease_Time;

	var PassData = { "pValues": arrayMain, "pChargeID": gl_SelectedChargeID, "pGroupRecord": gl_Record, 'pAdmission': iAdmission, 'pTempID': gl_ChargeTempID, "pRelease": "1", 'pUserID': gl_CurrentUser["id_security"], pReleaseDateTime: chargeRelease_DateTime };

	ajaxWebCall({
		method: 'ChargeSave',
		data: PassData,
		success: function (result) {
			//IStart RKS 03/01/19 SP4-1065, Added a function call to add intermittent out when a charge is released of sentence type = 'intermittent' or 'weekends'
			AddIntermittentInOut(gl_CurrentUser["id_security"], iAdmission, gl_Record, '0')
			//IEnd RKS 03/01/19 SP4-1065
			var buttonValidateSave = {
				button1: {
					btntext: "OK",
					clickFunction: "StandardCancel",
				},
			};

			ShowInformationalPopup(gl_AppConnection, 'The charge has been released.', "graphics/Success.png", buttonValidateSave, "divInformationMainContentBottom", true);
			$("#divInformationalPopup").show();
							
		},
				error: function (xhr, status, error) {
			gl_LoadingCharges = false;
			//IStart ADS 05/17/18 SP4-763 : Enables the release button on the release tab, only when any error occurred while releasing charge
			EnableDisableButton('CR_RelCharge', true);
			//IEnd ADS 05/17/18 SP4-763 
			}
	});	
}//IEnd SVC-4737 12/11/2020 AMH	

/******************************************************************************
Description: 
    This function is used to save the newport specific controls

Revision History:
    SHV    09/02/21    PI-703, Applied change to get the value from dropdown
    BRK    08/11/21    PI-703, Added pArrAgency to save Arresting agency AND Get Arresting officer value from textbox
	SHV    07/13/21    PI-703, Added this function to save the newport specific controls
******************************************************************************/
function SaveNewPortSpecificControls(pRecord) {
    try {
        var PassData = {
            "pChargeRecord": pRecord
            //MStart SHV 09/02/21 PI-703, Applied change to get the value from dropdown
            //, "pVccCode": $('#NPCI_VCC').val()
            , "pVccCode": GetS2DropdownSelectedVal('NPCI_VCC')
            //MEnd SHV 09/02/21 PI-703
            , "pArrestLocation": $('#NPCI_ArrestLocation').val()
            //MStart BRK 08/11/21 PI-703, Get Arresting officer value from textbox 
            //, "pArrestingOfficer": GetS2DropdownSelectedVal('NPCI_ArrestingOfficer')
            , "pArrestingOfficer": $('#NPCI_ArrestingOfficer').val()
            //MEnd BRK 08/11/21 PI-703
            , "pMagistrate": GetS2DropdownSelectedVal('NPCI_Magistrate')
            , "pArrAgency": GetS2DropdownSelectedVal('NPCI_ArrAgency')  //IStart IEnd BRK 08/11/21 PI-703, Added pArrAgency to save Arresting agency
        };
        ajaxWebCall({
            method: "SaveNewPortSpecificControls",
            data: PassData,
            success: function (result) {
                
            }
        });
    }
    catch (e) {
        handleError(e);
    }
}


/******************************************************************************
Description: 
    This function is used to load the newport specific controls

Revision History:
    SHV    09/02/21    PI-703, Applied change to set the value from dropdown
    BRK    08/11/21    PI-703, Set Arresting agency value AND Set Arresting officer value in textbox
	SHV    07/13/21    PI-703, Added this function to load the newport specific controls
******************************************************************************/
function LoadNewPortSpecificControls() {
    try {
        var PassData = {
            "pChargeRecord": gl_Record
        };
        ajaxWebCall({
            method: "GetNewPortSpecificControls",
            data: PassData,
            success: function (result) {
                if (result.Table.length > 0) {
                    //MStart SHV 09/02/21 PI-703, Applied change to set the value from dropdown
                    //$('#NPCI_VCC').val(result.Table[0]['VccCode']);
                    if (result.Table[0]['VccCode']) {
                        SetS2DropdownVal('NPCI_VCC', result.Table[0]['VccCode']);
                    }
                    //MEnd SHV 09/02/21 PI-703
                    $('#NPCI_ArrestLocation').val(result.Table[0]['ArrestLocation']);
                    //MStart BRK 08/11/21 PI-703, Set Arresting officer value in textbox 
                    //SetS2DropdownVal('NPCI_ArrestingOfficer', result.Table[0]['ArrestingOfficer'])
                    $('#NPCI_ArrestingOfficer').val(result.Table[0]['ArrestingOfficer']);
                    //MEnd BRK 08/11/21 PI-703
                    SetS2DropdownVal('NPCI_Magistrate', result.Table[0]['Magistrate'])
                    SetS2DropdownVal('NPCI_ArrAgency', result.Table[0]['ArrestingAgency'])  //IStart IEnd BRK 08/11/21 PI-703, Set Arresting agency value
                }
                else {
                    //MStart SHV 09/02/21 PI-703, Applied change to set the value from dropdown
                    //$('#NPCI_VCC').val('');
                    SetS2DropdownVal('NPCI_VCC', -1);
                    //MEnd SHV 09/02/21 PI-703
                    $('#NPCI_ArrestLocation').val('');
                    //MStart BRK 08/11/21 PI-703, Set Arresting officer textbox value to blank
                    //SetS2DropdownVal('NPCI_ArrestingOfficer', -1)
                    $('#NPCI_ArrestingOfficer').val('');
                    //MEnd BRK 08/11/21 PI-703
                    SetS2DropdownVal('NPCI_Magistrate', -1)
                    SetS2DropdownVal('NPCI_ArrAgency', -1)  //IStart IEnd BRK 08/11/21 PI-703, Set Arresting agency value
                }
            }
        });
    }
    catch (e) {
        handleError(e);
    }
}

/******************************************************************************
Description:
This function is used to Get title_sect,description and vcc_cd for NewPort county

Revision History:
    BRK     08/11/21    PI-703, Created function to Get title_sect,description and vcc_cd for NewPort county
******************************************************************************/
function GetCitationAndVCCCodeNP(chargeVal, searchType) {
    try {
        var result = "";
        var PassData = {
            pChargeID: chargeVal,
            pSearchType: searchType
        };

        if (chargeVal < 0) {
            return result;
        }

        ajaxWebCall({
            method: "GetCitationAndVCCCodeNP",
            data: PassData,
            assumeJSONResponse: false,
            success: function (data) {
                data = JSON.parse(data);
                result = data["Table"][0].text;
            }
        });
        return result;
    }
    catch (e) {
        handleError(e);
    }
}

/******************************************************************************
Description:
This function is used to Get charges other details for NewPort county

Revision History:
    BRK     08/11/21    PI-703, Created function to Get charges other details for NewPort county
******************************************************************************/
function GetChargesOtherdetails(chargeId) {
    try {
        var result = { "text": "", "degree": "" };
        var PassData = {
            pChargeID: chargeId
        };

        gl_SelectedChargeID = 0;
        $('#NPCI_ChargeClass').val('');
        $('#SI_ChargeDesc').val('');
        $('#OC_ChargeDesc').val('');
        $('#BBF_ChargeDesc').val('');
        $('#CR_ChargeDesc').val('');
        $('#NPCI_BondAmt').val('');
        gl_DNASOText = '';
        $('#SI_DNASOReq_Label').text('');
        //IStart SHV 09/08/20 PI-352, Return blank result if chargeVal < 0
        if (chargeId <= 0) {
            return;
        }
        //IEnd SHV 09/08/20 PI-352

        ajaxWebCall({
            method: "GetChargesOtherdetails",
            data: PassData,
            assumeJSONResponse: false,
            success: function (data) {
                if (chargeId > 0 && data != undefined) {
                    data = JSON.parse(data);
                    if (data["Table"] != undefined) {
                        result = data["Table"][0];
                        gl_SelectedChargeID = chargeId;
                        $('#NPCI_ChargeClass').val(result.degree);
                        $('#SI_ChargeDesc').val(result.description);
                        $('#OC_ChargeDesc').val(result.description);
                        $('#BBF_ChargeDesc').val(result.description);
                        $('#CR_ChargeDesc').val(result.description);
                        $('#NPCI_BondAmt').val(result.default_bond_amount);
                        $('#NPCI_BondAmt').trigger("blur");

                        if ((result.is_dna_req == true) && (result.is_sex_offender_req == true))
                            gl_DNASOText = 'DNA Sample and Sex Offender Registration are required'
                        else if (result.is_dna_req == true)
                            gl_DNASOText = 'DNA Sample is required'
                        else if (result.is_sex_offender_req == true)
                            gl_DNASOText = 'Sex Offender Registration is required'

                        if (gl_ChargeHistory == false) {
                            $('#SI_DNASOReq_Label').text(gl_DNASOText);
                            StyleLabel('SI_DNASOReq', gl_htControls['SI_DNASOReq'].LStyle);
                        }
                        else {
                            $('#SI_DNASOReq_Label').text(gl_DNASOTextHistory);
                            StyleLabel('SI_DNASOReq', gl_htControls['SI_DNASOReq'].LStyle);
                        }
                    }
                } 
            }
        });
    }
    catch (e) {
        handleError(e);
    }
}