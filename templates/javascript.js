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

// Save SENSORS (save to config)

function save_settings() {

	$("#savinghint_settings").attr("style", "color:blue").html("<TMPL_VAR "COMMON.HINT_SAVING">");
	$.ajax( { 
			url:  'ajax.cgi',
			type: 'POST',
			data: { 
				action: 'savesensors',
				temp_topic: $("#temp_topic").val(),
				humidity_topic: $("#humidity_topic").val(),
				pressure_topic: $("#pressure_topic").val(),
				illuminance_topic: $("#illuminance_topic").val(),
				twilight_topic: $("#twilight_topic").val(),
				solarradiation_topic: $("#solarradiation_topic").val(),
				uv_topic: $("#uv_topic").val(),
				lightning_distance_topic: $("#lightning_distance_topic").val(),
				lightning_last_topic: $("#lightning_last_topic").val(),
				lightning_number_topic: $("#lightning_number_topic").val(),
				windspeed_topic: $("#windspeed_topic").val(),
				winddir_topic: $("#winddir_topic").val(),
				rainstate_topic: $("#rainstate_topic").val(),
				rainrate_topic: $("#rainrate_topic").val(),
				winddir_0_1: $("#winddir_0_1").val(),
				winddir_0_1: $("#winddir_0_2").val(),
				winddir_0_1: $("#winddir_45_1").val(),
				winddir_0_1: $("#winddir45__2").val(),
				winddir_0_1: $("#winddir_90_1").val(),
				winddir_0_1: $("#winddir_90_2").val(),
				winddir_0_1: $("#winddir_135_1").val(),
				winddir_0_1: $("#winddir_135_2").val(),
				winddir_0_1: $("#winddir_180_1").val(),
				winddir_0_1: $("#winddir_180_2").val(),
				winddir_0_1: $("#winddir_225_1").val(),
				winddir_0_1: $("#winddir_225_2").val(),
				winddir_0_1: $("#winddir_270_1").val(),
				winddir_0_1: $("#winddir_270_2").val(),
				winddir_0_1: $("#winddir_315_1").val(),
				winddir_0_1: $("#winddir_315_2").val(),
				pressure_height: $("#pressure_height").val(),
				twilight_max: $("#twilight_max").val(),
				solarradiation_max: $("#solarradiation_max").val(),
				solarradiation_offset: $("#solarradiation_offset").val(),
			}
		} )
	.fail(function( data ) {
		console.log( "save_settings Fail", data );
		var jsonresp = JSON.parse(data.responseText);
		$("#savinghint_sensors").attr("style", "color:red").html("<TMPL_VAR "COMMON.HINT_SAVING_FAILED">" + " Error: " + jsonresp.error + " (Statuscode: " + data.status + ").");
	})
	.done(function( data ) {
		console.log( "save_sensors Done", data );
		if (data.error) {
			$("#savinghint_sensors").attr("style", "color:red").html("<TMPL_VAR "COMMON.HINT_SAVING_FAILED">" + " Error: " + data.error + ").");
		} else {
			$("#savinghint_sensors").attr("style", "color:green").html("<TMPL_VAR "COMMON.HINT_SAVING_SUCCESS">" + ".");
			getconfig();
		}
	})
	.always(function( data ) {
		console.log( "save_sensors Finished", data );
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

		// Sensors
		sensors = data.sensors;
		if ( data.error || jQuery.isEmptyObject(sensors)) {
			sensors = undefined;
		} else {
			$.each( sensors, function( name, item){
				$("#"+name+"_topic").val(item.topic);
			})
			$("#pressure_height").val(sensors.pressure.height);
			if ( sensors.illuminance.calc_sr == "1" ) {
				$("#illuminance_calc_sr").prop('checked', true).checkboxradio('refresh');
			}
			$("#twilight_max").val(sensors.twilight.max);
			$("#solarradiation_max").val(sensors.solarradiation.max);
			$("#solarradiation_offset").val(sensors.solarradiation.offset);
			const wdir = [];
			const orderedct = Object.keys(sensors.winddir.converttable).sort().reduce(
				(obj, key) => {
					obj[key] = sensors.winddir.converttable[key];
					return obj;
				},
				{}
			);
			$.each(orderedct, function( volt, direction){
				if (wdir.includes(direction) == true) {
					$("#winddir_"+direction+"_2").val(volt);
				} else {
					$("#winddir_"+direction+"_1").val(volt);
				}
				wdir.push(direction);
			})
			if ( sensors.rainstate.calc_rr == "1" ) {
				$("#rainstate_calc_rr").prop('checked', true).checkboxradio('refresh');
			}
		}
		// Settings
		$("#statuscycle_settings").val(data.statuscycle);
		$("#valuescycle_settings").val(data.valuecycle);
		$("#topic_settings").val(data.topic);
		$("#active_lcd").prop('checked', true).checkboxradio('refresh');
	})
	.always(function( data ) {
		console.log( "getconfig Finished" );
		if (document.getElementById("calibration_overview")) {
			measurements();
		}
	})

}

</script>
