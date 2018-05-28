/** @format */

import { By, until } from 'selenium-webdriver';
import BaseContainer from '../base-container.js';

import * as DriverHelper from '../driver-helper.js';

export default class RevokePage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.people-invite-details__clear-revoke [type]' ) );
		this.revokeButtonSelector = By.css( '.people-invite-details__clear-revoke [type]' );
		this.noticeSelector = By.css( '.notice__text' );
	}

	revokeUser() {
		const self = this;
		return DriverHelper.clickWhenClickable( self.driver, self.revokeButtonSelector );
	}

	revokeSent() {
		const self = this;

		self.driver.wait(
			until.elementLocated( self.noticeSelector ),
			this.explicitWaitMS * 2,
			'The notice was not displayed'
		);

		return DriverHelper.isElementPresent( self.driver, self.noticeSelector );
	}
}