/** @format */

import { By } from 'selenium-webdriver';

import AsyncBaseContainer from '../../async-base-container';
import * as driverHelper from '../../driver-helper';

export default class BusinessAddressPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.jetpack-onboarding' ) );
	}

	async selectAddBusinessAddress() {
		await this.driver.sleep( 1000 );
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.card[data-e2e-type="business-address"] button' )
		);
	}

	async selectContinue() {
		const continueSelector = By.css( '.card[data-e2e-type="continue"] button' );
		return await driverHelper
			.waitTillPresentAndDisplayed( this.driver, continueSelector )
			.then( () => driverHelper.clickWhenClickable( this.driver, continueSelector ) );
	}

	async enterBusinessAddressAndSubmit( name, street, city, state, zip, country ) {
		await driverHelper.waitTillPresentAndDisplayed( this.driver, By.css( '#name' ) );
		await driverHelper.setWhenSettable( this.driver, By.css( '#name' ), name );
		await driverHelper.setWhenSettable( this.driver, By.css( '#street' ), street );
		await driverHelper.setWhenSettable( this.driver, By.css( '#city' ), city );
		await driverHelper.setWhenSettable( this.driver, By.css( '#state' ), state );
		await driverHelper.setWhenSettable( this.driver, By.css( '#zip' ), zip );
		await driverHelper.setWhenSettable( this.driver, By.css( '#country' ), country );
		return await driverHelper.clickWhenClickable( this.driver, By.css( 'button.is-primary' ) );
	}
}
