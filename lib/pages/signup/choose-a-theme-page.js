/** @format */

import { By } from 'selenium-webdriver';
import * as driverHelper from '../../driver-helper.js';

import AsyncBaseContainer from '../../async-base-container';

export default class ChooseAThemePage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.themes-list' ) );
	}

	async selectFirstTheme() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.theme__active-focus' ),
			this.explicitWaitMS
		);
	}
}
