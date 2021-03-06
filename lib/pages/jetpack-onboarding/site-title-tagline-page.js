/** @format */

import { By } from 'selenium-webdriver';

import AsyncBaseContainer from '../../async-base-container';

import * as driverHelper from '../../driver-helper';

export default class SiteTitleTaglinePage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.jetpack-onboarding .site-title' ) );
	}

	async enterTitle( siteTitle ) {
		return await driverHelper.setWhenSettable( this.driver, By.css( 'input#blogname' ), siteTitle );
	}

	async enterTagline( siteTagline ) {
		return await driverHelper.setWhenSettable(
			this.driver,
			By.css( 'input#blogdescription' ),
			siteTagline
		);
	}

	async selectContinue() {
		return await driverHelper.clickWhenClickable( this.driver, By.css( 'button.is-primary' ) );
	}
}
