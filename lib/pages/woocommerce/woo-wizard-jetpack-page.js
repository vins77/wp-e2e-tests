/** @format */

import { By } from 'selenium-webdriver';

import * as driverHelper from '../../driver-helper';
import AsyncBaseContainer from '../../async-base-container';

export default class WooWizardJetpackPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( 'div.wc-setup-content form.activate-jetpack' ) );
	}

	async selectContinueWithJetpack() {
		const buttonSelector = By.css( 'button.button-primary' );
		await driverHelper.clickWhenClickable( this.driver, buttonSelector );
		return await driverHelper.waitTillNotPresent(
			this.driver,
			buttonSelector,
			this.explicitWaitMS * 2
		);
	}
}
