/** @format */

import test from 'selenium-webdriver/testing';
import config from 'config';

const fs = require( 'fs' );

import JetpackConnectFlow from '../../lib/flows/jetpack-connect-flow.js';

import * as driverManager from '../../lib/driver-manager';
import * as dataHelper from '../../lib/data-helper';
import WPAdminDashboardPage from '../../lib/pages/wp-admin/wp-admin-dashboard-page';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

let driver;

// Write url and site credentials into file for further use
function writeJNCredentials( url, username, password ) {
	const fileContents = `${ url } ${ username } ${ password }`;
	return fs.mkdir( './temp', err => {
		if ( err && err.code !== 'EEXIST' ) {
			return console.log( err );
		}

		fs.writeFile( './temp/jn-credentials.txt', fileContents, fileErr => {
			if ( fileErr ) {
				return console.log( fileErr );
			}
			console.log( 'The jn-credentials file was saved!' );
		} );
	} );
}

test.before( function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();
	return driverManager.clearCookiesAndDeleteLocalStorage( driver );
} );

test.describe( `[${ host }] Jurassic Ninja Connection: (${ screenSize }) @jetpack`, function() {
	this.timeout( mochaTimeOut );
	this.bailSuite( true );

	test.it( 'Can connect from WP Admin', async function() {
		this.jnFlow = new JetpackConnectFlow( driver, 'jetpackUserJN', 'jetpackMaster' );
		return await this.jnFlow.connectFromWPAdmin();
	} );

	test.it( 'Can logout from WP admin', async function() {
		const wpDashboard = await WPAdminDashboardPage.Visit(
			driver,
			WPAdminDashboardPage.getUrl( this.jnFlow.url )
		);
		return wpDashboard.logout();
	} );

	test.it( 'Can save JN credentials to file', async function() {
		writeJNCredentials( this.jnFlow.url, 'demo', this.jnFlow.password );
	} );

	test.it( 'Can remove diconnected sites', async function() {
		await this.jnFlow.removeSites();
	} );
} );
