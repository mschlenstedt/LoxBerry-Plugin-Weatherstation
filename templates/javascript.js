<script>

$(function() {
	
	if (document.getElementById("servicestatus")) {
		interval = window.setInterval(function(){ servicestatus(); }, 5000);
	}
	if (document.getElementById("calibration_overview") || document.getElementById("calibration")) {
		intervalm = window.setInterval(function(){ measurements(); }, 1000);
	}
	servicestatus();
	getconfig();

});

// SERVICE STATE

function servicestatus(update) {

	if (update) {
		$("#servicestatus").attr("style", "background:#dfdfdf").html("<TMPL_VAR "COMMON.HINT_UPDATING">");
		$("#servicestatusicon").html("<img src='./images/unknown_20.png'>");
	}

	$.ajax( { 
			url:  'ajax.cgi',
			type: 'POST',
			data: { 
				action: 'servicestatus'
			}
		} )
	.fail(function( data ) {
		console.log( "Servicestatus Fail", data );
		$("#servicestatus").attr("style", "background:#dfdfdf; color:red").html("<TMPL_VAR "COMMON.HINT_FAILED">");
		$("#servicestatusicon").html("<img src='./images/unknown_20.png'>");
	})
	.done(function( data ) {
		console.log( "Servicestatus Success", data );
		if (data.pid) {
			$("#servicestatus").attr("style", "background:#6dac20; color:black").html("<TMPL_VAR "COMMON.HINT_RUNNING"> <span class='small'>PID: " + data.pid + "</span>");
			$("#servicestatusicon").html("<img src='./images/check_20.png'>");
		} else {
			$("#servicestatus").attr("style", "background:#FF6339; color:black").html("<TMPL_VAR "COMMON.HINT_STOPPED">");
			$("#servicestatusicon").html("<img src='./images/error_20.png'>");
		}
	})
	.always(function( data ) {
		console.log( "Servicestatus Finished", data );
	});
}

// SERVICE RESTART

function servicerestart() {

	clearInterval(interval);
	$("#servicestatus").attr("style", "color:blue").html("<TMPL_VAR "COMMON.HINT_EXECUTING">");
	$("#servicestatusicon").html("<img src='./images/unknown_20.png'>");
	$.ajax( { 
			url:  'ajax.cgi',
			type: 'POST',
			data: { 
				action: 'servicerestart'
			}
		} )
	.fail(function( data ) {
		console.log( "Servicerestart Fail", data );
	})
	.done(function( data ) {
		console.log( "Servicerestart Success", data );
		if (data == "0") {
			servicestatus(1);
		} else {
			$("#servicestatus").attr("style", "background:#dfdfdf; color:red").html("<TMPL_VAR "COMMON.HINT_FAILED">");
		}
		interval = window.setInterval(function(){ servicestatus(); }, 5000);
	})
	.always(function( data ) {
		console.log( "Servicerestart Finished", data );
	});
}

// SERVICE STOP

function servicestop() {

	clearInterval(interval);
	$("#servicestatus").attr("style", "color:blue").html("<TMPL_VAR "COMMON.HINT_EXECUTING">");
	$("#servicestatusicon").html("<img src='./images/unknown_20.png'>");
	$.ajax( { 
			url:  'ajax.cgi',
			type: 'POST',
			data: { 
				action: 'servicestop'
			}
		} )
	.fail(function( data ) {
		console.log( "Servicestop Fail", data );
	})
	.done(function( data ) {
		console.log( "Servicestop Success", data );
		if (data == "0") {
			servicestatus(1);
		} else {
			$("#servicestatus").attr("style", "background:#dfdfdf; color:red").html("<TMPL_VAR "COMMON.HINT_FAILED">");
		}
		interval = window.setInterval(function(){ servicestatus(); }, 5000);
	})
	.always(function( data ) {
		console.log( "Servicestop Finished", data );
	});
}

// EXPAND ALL

function expandall() {

	$('[data-role="collapsible"]').collapsible( "expand" );

}

// COLLAPSE ALL

function collapseall() {

	$('[data-role="collapsible"]').collapsible( "collapse" );

}

// Save SETTINGS (save to config)

function save_settings() {

	$("#savinghint_settings").attr("style", "color:blue").html("<TMPL_VAR "COMMON.HINT_SAVING">");
	$.ajax( { 
			url:  'ajax.cgi',
			type: 'POST',
			data: { 
				action: 'savesettings',
				topic: $("#topic_settings").val(),
				valuecycle: $("#valuescycle_settings").val(),
				statuscycle: $("#statuscycle_settings").val(),
			}
		} )
	.fail(function( data ) {
		console.log( "save_settings Fail", data );
		var jsonresp = JSON.parse(data.responseText);
		$("#savinghint_settings").attr("style", "color:red").html("<TMPL_VAR "COMMON.HINT_SAVING_FAILED">" + " Error: " + jsonresp.error + " (Statuscode: " + data.status + ").");
	})
	.done(function( data ) {
		console.log( "save_settings Done", data );
		if (data.error) {
			$("#savinghint_settings").attr("style", "color:red").html("<TMPL_VAR "COMMON.HINT_SAVING_FAILED">" + " Error: " + data.error + ").");
		} else {
			$("#savinghint_settings").attr("style", "color:green").html("<TMPL_VAR "COMMON.HINT_SAVING_SUCCESS">" + ".");
			getconfig();
		}
	})
	.always(function( data ) {
		console.log( "save_settings Finished", data );
	});

}

// GET CONFIG

function getconfig() {

	// Ajax request
	$.ajax({ 
		url:  'ajax.cgi',
		type: 'POST',
		data: {
			action: 'getconfig'
		}
	})
	.fail(function( data ) {
		console.log( "getconfig Fail", data );
	})
	.done(function( data ) {
		console.log( "getconfig Success", data );
		$("#main").css( 'visibility', 'visible' );

		// Calibration

		calibrate = "<TMPL_VAR CALIBRATE>";
		address = "<TMPL_VAR ADDRESS>";

		// Settings

		$("#statuscycle_settings").val(data.statuscycle);
		$("#valuescycle_settings").val(data.valuecycle);
		$("#topic_settings").val(data.topic);

		// LCD Display

		$("#cycletime_lcd").val(data.lcd.cycletime);
		$("#displaytimeout_lcd").val(data.lcd.displaytimeout);
		if ( data.lcd.active == "1" ) {
			$("#active_lcd").prop('checked', true).checkboxradio('refresh');
		}
		ev = data.lcd.external_values;
		$.each( ev, function( intDevId, item){
			$("#" + item.address + "name_lcd").val(item.name);
			$("#" + item.address + "unit_lcd").val(item.lcd_unit);
		})

		// Sensors

		console.log( "Parse Item for Sensors" );
		sensors = data.sensors;
		$('#sensors-list').empty();
		if ( data.error || jQuery.isEmptyObject(sensors)) {
			$('#sensors-list').html("<TMPL_VAR SENSORS.HINT_NO_SENSORS>");
			sensors = undefined;
		} else {
			// Create table
			var table = $('<table style="min-width:200px; width:100%" width="100%" data-role="table" id="sensorstable" data-mode="reflow"\
				class="ui-responsive table-stripe ui-body-b">').appendTo('#sensors-list');
			// Add the header row
			var theader = $('<thead />').appendTo(table);
			var theaderrow = $('<tr class="ui-bar-b"/>').appendTo(theader);
			$('<th style="text-align:left; width:40%; padding:5px;"><TMPL_VAR COMMON.LABEL_NAME><\/th>').appendTo(theaderrow);
			$('<th style="text-align:left; width:10%; padding:5px;"><TMPL_VAR COMMON.LABEL_TYPE><\/th>').appendTo(theaderrow);
			$('<th style="text-align:left; width:30%; padding:5px;"><TMPL_VAR COMMON.LABEL_ADDRESS><\/th>').appendTo(theaderrow);
			$('<th style="text-align:left; width:20%; padding:5px;"><TMPL_VAR COMMON.LABEL_ACTIONS><\/th>').appendTo(theaderrow);
			// Create table body.
			var tbody = $('<tbody />').appendTo(table);
			// Add the data rows to the table body.
			$.each( sensors, function( intDevId, item){
				// Table for Atlas Form
				var row = $('<tr />').appendTo(tbody);
				$('<td style="text-align:left;">'+item.name+'<\/td>').appendTo(row);
				$('<td style="text-align:left;">'+item.type+'<\/td>').appendTo(row);
				$('<td style="text-align:left;">'+item.address+'<\/td>').appendTo(row);
				$('<td />', { html: '\
				<a href="javascript:popup_edit_sensor(\'' + item.name + '\')" id="btneditsensor_'+item.name+'" name="btneditsensor_'+item.name+'" \
				title="<TMPL_VAR COMMON.BUTTON_EDIT> ' + item.name + '"> \
				<img src="./images/settings_20.png" height="20"></img></a> \
				<a href="javascript:popup_delete_sensor(\'' + item.name + '\')" id="btnaskdeletesensor_'+item.name+'"\
				name="btnaskdeletesensor_'+item.name+'" \
				title="<TMPL_VAR COMMON.BUTTON_DELETE> ' + item.name + '"> \
				<img src="./images/cancel_20.png" height="20"></img></a> \
				' }).appendTo(row);
				$(row).trigger("create");
				// Box for Calibration Form
				if ( document.getElementById("calibration_overview") && calibrate != "1") {
				        calibration_overview.innerHTML += "<div><h2 class='boxtitle ui-title'><span style='vertical-align:middle'>\
						<img src='./images/input_title_32.png'></span>&nbsp;"+item.name+"</h2><div class='box'>\
						<div class='boxrow'><div class='boxitem'><span class='large bold' id='value"+item.address+"'></span>\
						&nbsp;<span class='small'>"+item.lcd_unit+"</span></div></div><div class='boxrow'><div class='boxitem'>\
						<a href='#' onclick=\"window.open('./calibrate.cgi?address="+item.address+"', 'NewWindow1','scrollbars=true,toolbar=no,location=no,\
						directories=no,status=no,menubar=no,copyhistory=no,width=800,height=800')\" id='btncalibrate"+item.address+"'\
						class='ui-btn ui-btn-inline ui-mini ui-btn-icon-left ui-icon-eye ui-corner-all'><TMPL_VAR 'ATLAS.BUTTON_CALIBRATE'></a>\
						</div></div>"
					if (item.calibrate != "1") {
						$("#btncalibrate"+item.address).addClass('ui-disabled');
					}
					calibration_overview.innerHTML += "</div></div>"
				}
				// Box for Calibration Process
				if ( document.getElementById("calibration") && calibrate == "1" && item.address == address ) {
					vars_address.innerHTML = "<input type='hidden' id='address' value='" + address + "'>";
					calibration_title.innerHTML = "<h2 class='boxtitle ui-title'><span style='vertical-align:middle'>\
						<img src='./images/input_title_32.png'></span>&nbsp;<TMPL_VAR 'ATLAS.BUTTON_CALIBRATION'>&nbsp;"+item.name+"</h2>"
				        calibration_value.innerHTML = "<div class='boxrow'><div class='boxitem'>\
						<span class='large bold' id='value"+item.address+"'></span>\
						&nbsp;<span class='small'>"+item.lcd_unit+"</span></div></div>"
					if ( data["calibration"][item.type]["1"] && item[data["calibration"][item.type]["1"]["step"]] ) {
						vars_step1.innerHTML = "<input type='hidden' id='step1_enabled' value='1'>\
							<input type='hidden' id='step1_command' value='" + data["calibration"][item.type]["1"]["command"] + "'>\
							<input type='hidden' id='step1_precommand' value='" + data["calibration"][item.type]["1"]["precommand"] + "'>\
							<input type='hidden' id='step1_enter_value' value='" + data["calibration"][item.type]["1"]["enter_value"] + "'>\
							<input type='hidden' id='step1_target' value='" + item[data["calibration"][item.type]["1"]["step"]] + "'>";
						step1_caltarget.innerHTML = "<h2>" + item[data["calibration"][item.type]["1"]["step"]] + " " + item.lcd_unit + "</h2>";
					} else {
						vars_step1.innerHTML = "<input type='hidden' id='step1_enabled' value='0'>\
							<input type='hidden' id='step1_command' value='0'>\
							<input type='hidden' id='step1_precommand' value='0'>\
							<input type='hidden' id='step1_enter_value' value='0'>\
							<input type='hidden' id='step1_target' value='0'>";
					}
					if ( data["calibration"][item.type]["2"] && item[data["calibration"][item.type]["2"]["step"]] ) {
						vars_step2.innerHTML = "<input type='hidden' id='step2_enabled' value='1'>\
							<input type='hidden' id='step2_command' value='" + data["calibration"][item.type]["2"]["command"] + "'>\
							<input type='hidden' id='step2_precommand' value='" + data["calibration"][item.type]["2"]["precommand"] + "'>\
							<input type='hidden' id='step2_enter_value' value='" + data["calibration"][item.type]["2"]["enter_value"] + "'>\
							<input type='hidden' id='step2_target' value='" + item[data["calibration"][item.type]["2"]["step"]] + "'>";
						step2_caltarget.innerHTML = "<h2>" + item[data["calibration"][item.type]["2"]["step"]] + " " + item.lcd_unit + "</h2>";
					} else {
						vars_step2.innerHTML = "<input type='hidden' id='step2_enabled' value='0'>\
							<input type='hidden' id='step2_command' value='0'>\
							<input type='hidden' id='step2_precommand' value='0'>\
							<input type='hidden' id='step2_enter_value' value='0'>\
							<input type='hidden' id='step2_target' value='0'>";
					}
					if ( data["calibration"][item.type]["3"] && item[data["calibration"][item.type]["3"]["step"]] ) {
						vars_step3.innerHTML = "<input type='hidden' id='step3_enabled' value='1'>\
							<input type='hidden' id='step3_command' value='" + data["calibration"][item.type]["3"]["command"] + "'>\
							<input type='hidden' id='step3_precommand' value='" + data["calibration"][item.type]["3"]["precommand"] + "'>\
							<input type='hidden' id='step3_enter_value' value='" + data["calibration"][item.type]["3"]["enter_value"] + "'>\
							<input type='hidden' id='step3_target' value='" + item[data["calibration"][item.type]["3"]["step"]] + "'>";
						step3_caltarget.innerHTML = "<h2>" + item[data["calibration"][item.type]["3"]["step"]] + " " + item.lcd_unit + "</h2>";
					} else {
						vars_step3.innerHTML = "<input type='hidden' id='step3_enabled' value='0'>\
							<input type='hidden' id='step3_command' value='0'>\
							<input type='hidden' id='step3_precommand' value='0'>\
							<input type='hidden' id='step3_enter_value' value='0'>\
							<input type='hidden' id='step3_target' value='0'>";
					}
					if ( $("#step1_enabled").val() == "1" ) {
						$("#calibration_step0").css( 'display', 'block' );
					} else {
						$("#calibration_nodata").css( 'display', 'block' );
					}
				}
			});
		};

		// Actors

		console.log( "Parse Item for Actors" );
		actors = data.actors;
		$('#actors-list').empty();
		if ( data.error || jQuery.isEmptyObject(actors)) {
			$('#actors-list').html("<TMPL_VAR ACTORS.HINT_NO_ACTORS>");
			actors = undefined;
		} else {
			// Create table
			var table = $('<table style="min-width:200px; width:100%" width="100%" data-role="table" id="actorstable" data-mode="reflow"\
				class="ui-responsive table-stripe ui-body-b">').appendTo('#actors-list');
			// Add the header row
			var theader = $('<thead />').appendTo(table);
			var theaderrow = $('<tr class="ui-bar-b"/>').appendTo(theader);
			$('<th style="text-align:left; width:40%; padding:5px;"><TMPL_VAR COMMON.LABEL_NAME><\/th>').appendTo(theaderrow);
			$('<th style="text-align:left; width:10%; padding:5px;"><TMPL_VAR COMMON.LABEL_TYPE><\/th>').appendTo(theaderrow);
			$('<th style="text-align:left; width:30%; padding:5px;"><TMPL_VAR COMMON.LABEL_ADDRESS><\/th>').appendTo(theaderrow);
			$('<th style="text-align:left; width:20%; padding:5px;"><TMPL_VAR COMMON.LABEL_ACTIONS><\/th>').appendTo(theaderrow);
			// Create table body.
			var tbody = $('<tbody />').appendTo(table);
			// Add the data rows to the table body.
			$.each( actors, function( intDevId, item){
				// Table for Atlas Form
				var row = $('<tr />').appendTo(tbody);
				$('<td style="text-align:left;">'+item.name+'<\/td>').appendTo(row);
				$('<td style="text-align:left;">'+item.type+'<\/td>').appendTo(row);
				$('<td style="text-align:left;">'+item.address+'<\/td>').appendTo(row);
				$('<td />', { html: '\
				<a href="javascript:popup_edit_actor(\'' + item.name + '\')" id="btneditactor_'+item.name+'" name="btneditactor_'+item.name+'" \
				title="<TMPL_VAR COMMON.BUTTON_EDIT> ' + item.name + '"> \
				<img src="./images/settings_20.png" height="20"></img></a> \
				<a href="javascript:popup_delete_actor(\'' + item.name + '\')" id="btnaskdeleteactor_'+item.name+'" \
				name="btnaskdeleteactor_'+item.name+'" \
				title="<TMPL_VAR COMMON.BUTTON_DELETE> ' + item.name + '"> \
				<img src="./images/cancel_20.png" height="20"></img></a> \
				' }).appendTo(row);
				$(row).trigger("create");
				// Box for Calibration Form
				if ( document.getElementById("calibration_overview") && calibrate != "1") {
				        calibration_overview.innerHTML += "<div><h2 class='boxtitle ui-title'><span style='vertical-align:middle'>\
						<img src='./images/input_title_32.png'></span>&nbsp;"+item.name+"</h2><div class='box'>\
						<div class='boxrow'><div class='boxitem'><span class='large bold' id='value"+item.address+"'></span>\
						&nbsp;<span class='small'>"+item.lcd_unit+"</span></div></div><div class='boxrow'><div class='boxitem'>\
						<a href='#' onclick=\"window.open('./calibrate.cgi?address="+item.address+"', 'NewWindow1','scrollbars=true,toolbar=no,location=no,\
						directories=no,status=no,menubar=no,copyhistory=no,width=800,height=800')\" id='btncalibrate"+item.address+"'\
						class='ui-btn ui-btn-inline ui-mini ui-btn-icon-left ui-icon-eye ui-corner-all'><TMPL_VAR 'ATLAS.BUTTON_CALIBRATE'></a>\
						</div></div>"
					if (item.calibrate != "1") {
						$("#btncalibrate"+item.address).addClass('ui-disabled');
					}
					calibration_overview.innerHTML += "</div></div>"
				}
				// Box for Calibration Process
				if ( document.getElementById("calibration") && calibrate == "1" && item.address == address ) {
					vars_address.innerHTML = "<input type='hidden' id='address' value='" + address + "'>";
					calibration_title.innerHTML = "<h2 class='boxtitle ui-title'><span style='vertical-align:middle'>\
						<img src='./images/input_title_32.png'></span>&nbsp;<TMPL_VAR 'ATLAS.BUTTON_CALIBRATION'>&nbsp;"+item.name+"</h2>"
				        calibration_value.innerHTML = "<div class='boxrow'><div class='boxitem'>\
						<span class='large bold' id='value"+item.address+"'></span>\
						&nbsp;<span class='small'>"+item.lcd_unit+"</span></div></div>"
					if ( data["calibration"][item.type]["1"] && item[data["calibration"][item.type]["1"]["step"]] ) {
						vars_step1.innerHTML = "<input type='hidden' id='step1_enabled' value='1'>\
							<input type='hidden' id='step1_command' value='" + data["calibration"][item.type]["1"]["command"] + "'>\
							<input type='hidden' id='step1_precommand' value='" + data["calibration"][item.type]["1"]["precommand"] + "'>\
							<input type='hidden' id='step1_enter_value' value='" + data["calibration"][item.type]["1"]["enter_value"] + "'>\
							<input type='hidden' id='step1_target' value='" + item[data["calibration"][item.type]["1"]["step"]] + "'>";
						step1_caltarget.innerHTML = "<h2>" + item[data["calibration"][item.type]["1"]["step"]] + " " + item.lcd_unit + "</h2>";
					} else {
						vars_step1.innerHTML = "<input type='hidden' id='step1_enabled' value='0'>\
							<input type='hidden' id='step1_command' value='0'>\
							<input type='hidden' id='step1_precommand' value='0'>\
							<input type='hidden' id='step1_enter_value' value='0'>\
							<input type='hidden' id='step1_target' value='0'>";
					}
					if ( data["calibration"][item.type]["2"] && item[data["calibration"][item.type]["2"]["step"]] ) {
						vars_step2.innerHTML = "<input type='hidden' id='step2_enabled' value='1'>\
							<input type='hidden' id='step2_command' value='" + data["calibration"][item.type]["2"]["command"] + "'>\
							<input type='hidden' id='step2_precommand' value='" + data["calibration"][item.type]["2"]["precommand"] + "'>\
							<input type='hidden' id='step2_enter_value' value='" + data["calibration"][item.type]["2"]["enter_value"] + "'>\
							<input type='hidden' id='step2_target' value='" + item[data["calibration"][item.type]["2"]["step"]] + "'>";
						step2_caltarget.innerHTML = "<h2>" + item[data["calibration"][item.type]["2"]["step"]] + " " + item.lcd_unit + "</h2>";
					} else {
						vars_step2.innerHTML = "<input type='hidden' id='step2_enabled' value='0'>\
							<input type='hidden' id='step2_command' value='0'>\
							<input type='hidden' id='step2_precommand' value='0'>\
							<input type='hidden' id='step2_enter_value' value='0'>\
							<input type='hidden' id='step2_target' value='0'>";
					}
					if ( data["calibration"][item.type]["3"] && item[data["calibration"][item.type]["3"]["step"]] ) {
						vars_step3.innerHTML = "<input type='hidden' id='step3_enabled' value='1'>\
							<input type='hidden' id='step3_command' value='" + data["calibration"][item.type]["3"]["command"] + "'>\
							<input type='hidden' id='step3_precommand' value='" + data["calibration"][item.type]["3"]["precommand"] + "'>\
							<input type='hidden' id='step3_enter_value' value='" + data["calibration"][item.type]["3"]["enter_value"] + "'>\
							<input type='hidden' id='step3_target' value='" + item[data["calibration"][item.type]["3"]["step"]] + "'>";
						step3_caltarget.innerHTML = "<h2>" + item[data["calibration"][item.type]["3"]["step"]] + " " + item.lcd_unit + "</h2>";
					} else {
						vars_step3.innerHTML = "<input type='hidden' id='step3_enabled' value='0'>\
							<input type='hidden' id='step3_command' value='0'>\
							<input type='hidden' id='step3_precommand' value='0'>\
							<input type='hidden' id='step3_enter_value' value='0'>\
							<input type='hidden' id='step3_target' value='0'>";
					}
					if ( $("#step1_enabled").val() == "1" ) {
						$("#calibration_step0").css( 'display', 'block' );
					} else {
					}
				}
			});
		};
		if (document.getElementById('calibration_overview') && typeof sensors === 'undefined' && typeof actors === 'undefined')  {
		       	calibration_overview.innerHTML = "<center><b><TMPL_VAR ATLAS.HINT_NO_DEVICES></b></center>"
		}

	})
	.always(function( data ) {
		console.log( "getconfig Finished" );
		if (document.getElementById("calibration_overview")) {
			measurements();
		}
	})

}

</script>
