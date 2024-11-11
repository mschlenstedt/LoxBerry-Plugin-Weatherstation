#!/usr/bin/perl
use warnings;
use strict;
use LoxBerry::System;
use CGI;
use JSON;
#use LoxBerry::Log;
#use Data::Dumper;

my $error;
my $response;
my $cgi = CGI->new;
my $q = $cgi->Vars;

#print STDERR Dumper $q;

#my $log = LoxBerry::Log->new (
#    name => 'AJAX',
#	stderr => 1,
#	loglevel => 7
#);

#LOGSTART "Request $q->{action}";

if( $q->{action} eq "servicerestart" ) {
	# We have to start in background mode because watchdog uses fork
	system ("$lbpbindir/watchdog.pl --action=restart --verbose=0 > /dev/null 2>&1 &");
	my $resp = $?;
	sleep(1);
	my $status = LoxBerry::System::lock(lockfile => 'lbweatherstation-watchdog', wait => 600); # Wait until watchdog is ready...
	$response = $resp;
}

if( $q->{action} eq "servicestop" ) {
	system ("$lbpbindir/watchdog.pl --action=stop --verbose=1 > /dev/null 2>&1");
	$response = $?;
}

if( $q->{action} eq "servicestatus" ) {
	my $status;
	my $count = `pgrep -c -f "python3 $lbpbindir/lbws-gateway.py"`;
	if ($count >= "2") {
		$status = `pgrep -o -f "python3 $lbpbindir/lbws-gateway.py"`;
	}
	my %response = (
		pid => $status,
	);
	chomp (%response);
	$response = encode_json( \%response );
}

if( $q->{action} eq "getconfig" ) {
	# From https://gist.github.com/theimpostor/79d4d37876aa990edd2ebc0e1d9391b5
	require Hash::Merge;
	Hash::Merge->import("merge");
	my $merged = {};
	my $json = JSON->new->utf8;
	if ( -e "$lbpconfigdir/plugin.json" ) {
		$merged = merge( $merged, $json->decode( LoxBerry::System::read_file("$lbpconfigdir/plugin.json") ) );
	}
	if ( -e "$lbpdatadir/calibration.json" ) {
		$merged = merge( $merged, $json->decode( LoxBerry::System::read_file("$lbpdatadir/calibration.json") ) );
	}
	if( !$merged ) {
		$response = "{ }";
	} else {
		$response = $json->encode( $merged );
	}
}

if( $q->{action} eq "savesettings" ) {

	# Check if all required parameters are defined
	if (!defined $q->{'topic'} || $q->{'topic'} eq "") {
		$q->{'topic'} = "poolmanager";
	}
	if (!defined $q->{'valuecycle'} || $q->{'valuecycle'} eq "") {
		$q->{'valuecycle'} = "5";
	}
	if (!defined $q->{'statuscycle'} || $q->{'statuscycle'} eq "") {
		$q->{'statuscycle'} = "300";
	}

	# Load config
	require LoxBerry::JSON;
	my $cfgfile = "$lbpconfigdir/plugin.json";
	my $jsonobj = LoxBerry::JSON->new();
	my $cfg = $jsonobj->open(filename => $cfgfile);
	
	# Save
	$cfg->{'topic'} = $q->{'topic'};
	$cfg->{'valuecycle'} = $q->{'valuecycle'};
	$cfg->{'statuscycle'} = $q->{'statuscycle'};
	$jsonobj->write();

	$response = encode_json( $cfg );
	
}

#####################################
# Manage Response and error
#####################################

if( defined $response and !defined $error ) {
	print "Status: 200 OK\r\n";
	print "Content-type: application/json; charset=utf-8\r\n\r\n";
	print $response;
	#LOGOK "Parameters ok - responding with HTTP 200";
}
elsif ( defined $error and $error ne "" ) {
	print "Status: 500 Internal Server Error\r\n";
	print "Content-type: application/json; charset=utf-8\r\n\r\n";
	print to_json( { error => $error } );
	#LOGCRIT "$error - responding with HTTP 500";
}
else {
	print "Status: 501 Not implemented\r\n";
	print "Content-type: application/json; charset=utf-8\r\n\r\n";
	$error = "Action ".$q->{action}." unknown";
	#LOGCRIT "Method not implemented - responding with HTTP 501";
	print to_json( { error => $error } );
}

END {
	#LOGEND if($log);
}
