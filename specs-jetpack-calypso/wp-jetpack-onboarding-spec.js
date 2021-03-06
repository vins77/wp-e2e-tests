/** @format */
import assert from 'assert';
import test from 'selenium-webdriver/testing';
import config from 'config';

import * as dataHelper from '../lib/data-helper';
import * as driverManager from '../lib/driver-manager';

import JetpackAuthorizePage from '../lib/pages/jetpack-authorize-page';
import JetpackConnectFlow from '../lib/flows/jetpack-connect-flow';
import LoginFlow from '../lib/flows/login-flow';
import SiteTitleTaglinePage from '../lib/pages/jetpack-onboarding/site-title-tagline-page';
import SiteTypePage from '../lib/pages/jetpack-onboarding/site-type-page';
import SetHomepagePage from '../lib/pages/jetpack-onboarding/set-homepage-page';
import ContactFormPage from '../lib/pages/jetpack-onboarding/contact-form-page';
import SummaryPage from '../lib/pages/jetpack-onboarding/summary-page';
import ViewPagePage from '../lib/pages/view-page-page';
import ViewSitePage from '../lib/pages/view-site-page';
import BusinessAddressPage from '../lib/pages/jetpack-onboarding/business-address-page';
import InstallWooCommercePage from '../lib/pages/jetpack-onboarding/install-woocommerce-page';
import WidgetContactInfoComponent from '../lib/components/widget-contact-info-component';
import WizardNavigationComponent from '../lib/components/wizard-navigation-component';
import ActivateStatsPage from '../lib/pages/jetpack-onboarding/activate-stats-page';
import WPAdminSidebar from '../lib/pages/wp-admin/wp-admin-sidebar.js';
import WPAdminJetpackPage from '../lib/pages/wp-admin/wp-admin-jetpack-page.js';
import PickAPlanPage from '../lib/pages/signup/pick-a-plan-page';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const onboardingUrlExt = '/wp-admin/admin.php?page=jetpack&action=onboard';

let driver;

test.before( async function() {
	this.timeout( startBrowserTimeoutMS );
	driver = await driverManager.startBrowser();
} );

test.describe( `Jetpack Onboarding: (${ screenSize })`, function() {
	this.timeout( mochaTimeOut );

	test.describe( 'Onboard personal site with static homepage: @parallel @jetpack', function() {
		this.bailSuite( true );
		const blogTitle = dataHelper.randomPhrase();
		const blogTagline = dataHelper.randomPhrase();

		test.before( async function() {
			return await driverManager.ensureNotLoggedIn( driver );
		} );

		test.it( 'Can create wporg site', async function() {
			this.timeout( mochaTimeOut * 12 );

			this.jnFlow = new JetpackConnectFlow( driver, null );
			return await this.jnFlow.createJNSite();
		} );

		test.it( 'Can navigate to onboarding flow', async function() {
			return await driver.get( this.jnFlow.url + onboardingUrlExt );
		} );

		test.it( 'Can skip all steps', async function() {
			const wizardNavigationComponent = await WizardNavigationComponent.Expect( driver );
			await wizardNavigationComponent.skipStep();
			await wizardNavigationComponent.skipStep();
			await wizardNavigationComponent.skipStep();
			await wizardNavigationComponent.skipStep();
			await wizardNavigationComponent.skipStep();
			const summaryPage = await SummaryPage.Expect( driver );
			let toDoCount = await summaryPage.countToDoSteps();
			assert.strictEqual( toDoCount, 4, 'Expected and actual steps are not equal.' );
		} );

		test.it( 'Can go back to first step in flow from summary page', async function() {
			const summaryPage = await SummaryPage.Expect( driver );
			return await summaryPage.visitStep( 1 );
		} );

		test.it( 'Can fill out site title and tagline', async function() {
			const siteTitleTaglinePage = await SiteTitleTaglinePage.Expect( driver );
			await siteTitleTaglinePage.enterTitle( blogTitle );
			await siteTitleTaglinePage.enterTagline( blogTagline );
			return await siteTitleTaglinePage.selectContinue();
		} );

		test.it( 'Can select Personal Site', async function() {
			const siteTypePage = await SiteTypePage.Expect( driver );
			return await siteTypePage.selectPersonalSite();
		} );

		test.it( 'Can select static page homepage', async function() {
			const setHomepagePage = await SetHomepagePage.Expect( driver );
			return await setHomepagePage.selectPage();
		} );

		test.it( 'Can select add a contact form', async function() {
			const contactFormPage = await ContactFormPage.Expect( driver );
			return await contactFormPage.selectAddContactForm();
		} );

		test.it( 'Can login into WordPress.com', async function() {
			const loginFlow = new LoginFlow( driver, 'jetpackConnectUser' );
			return await loginFlow.loginUsingExistingForm();
		} );

		test.it( 'Can approve connection on the authorization page', async function() {
			const jetpackAuthorizePage = await JetpackAuthorizePage.Expect( driver );
			return await jetpackAuthorizePage.approveConnection();
		} );

		test.it( 'Can select continue on add contact form', async function() {
			const contactFormPage = await ContactFormPage.Expect( driver );
			return await contactFormPage.selectContinue();
		} );

		test.it( 'Can select continue on activate stats page', async function() {
			const activateStatsPage = await ActivateStatsPage.Expect( driver );
			return await activateStatsPage.selectContinue();
		} );

		test.it( 'Can see onboarding summary page', async function() {
			const summaryPage = await SummaryPage.Expect( driver );
			let toDoCount = await summaryPage.countToDoSteps();
			assert.strictEqual( toDoCount, 0, 'Expected and actual steps are not equal.' );
			return await summaryPage.selectVisitSite();
		} );

		test.it( 'Can see site home page', async function() {
			const viewPagePage = await ViewPagePage.Expect( driver );
			let title = await viewPagePage.pageTitle();
			return assert.strictEqual(
				title.toUpperCase(),
				'HOME PAGE',
				'Homepage not set to a static page'
			);
		} );
	} );

	test.describe( 'Onboard business site with posts homepage: @parallel @jetpack', function() {
		this.bailSuite( true );
		const blogTitle = dataHelper.randomPhrase();
		const blogTagline = dataHelper.randomPhrase();
		const businessName = 'Testing Inc.';
		const countryCode = 'AU';
		const address = '888 Queen Street';
		const city = 'Brisbane';
		const stateCode = 'QLD';
		const postalCode = '4000';

		test.before( async function() {
			return await driverManager.ensureNotLoggedIn( driver );
		} );

		test.it( 'Can create wporg site', async function() {
			this.timeout( mochaTimeOut * 12 );

			this.jnFlow = new JetpackConnectFlow( driver, null );
			return await this.jnFlow.createJNSite();
		} );

		test.it( 'Can navigate to onboarding flow', async function() {
			return await driver.get( this.jnFlow.url + onboardingUrlExt );
		} );

		test.it( 'Can fill out site title and tagline', async function() {
			const siteTitleTaglinePage = await SiteTitleTaglinePage.Expect( driver );
			await siteTitleTaglinePage.enterTitle( blogTitle );
			await siteTitleTaglinePage.enterTagline( blogTagline );
			return await siteTitleTaglinePage.selectContinue();
		} );

		test.it( 'Can select Business Site', async function() {
			const siteTypePage = await SiteTypePage.Expect( driver );
			return await siteTypePage.selectBusinessSite();
		} );

		test.it( 'Can select posts homepage', async function() {
			const setHomepagePage = await SetHomepagePage.Expect( driver );
			return await setHomepagePage.selectPosts();
		} );

		test.it( 'Can skip add a contact form', async function() {
			const wizardNavigationComponent = await WizardNavigationComponent.Expect( driver );
			return await wizardNavigationComponent.skipStep();
		} );

		test.it( 'Can select add a business address', async function() {
			const businessAddressPage = await BusinessAddressPage.Expect( driver );
			return await businessAddressPage.selectAddBusinessAddress();
		} );

		test.it( 'Can login into WordPress.com', async function() {
			const loginFlow = new LoginFlow( driver, 'jetpackConnectUser' );
			return await loginFlow.loginUsingExistingForm();
		} );

		test.it( 'Can approve connection on the authorization page', async function() {
			const jetpackAuthorizePage = await JetpackAuthorizePage.Expect( driver );
			return await jetpackAuthorizePage.approveConnection();
		} );

		test.it( 'Can enter address on business address page', async function() {
			const businessAddressPage = await BusinessAddressPage.Expect( driver );
			await businessAddressPage.enterBusinessAddressAndSubmit(
				businessName,
				address,
				city,
				stateCode,
				postalCode,
				countryCode
			);
			await businessAddressPage.selectContinue();
		} );

		test.it( 'Can make business an online store', async function() {
			const installWooCommercePage = await InstallWooCommercePage.Expect( driver );
			return await installWooCommercePage.selectSellOnline();
		} );

		test.it( 'Can select continue on activate stats page', async function() {
			const activateStatsPage = await ActivateStatsPage.Expect( driver );
			return await activateStatsPage.selectContinue();
		} );

		test.it( 'Can see onboarding summary page', async function() {
			const summaryPage = await SummaryPage.Expect( driver );
			let toDoCount = await summaryPage.countToDoSteps();
			assert.strictEqual( toDoCount, 1, 'Expected and actual steps are not equal.' );
			return await summaryPage.selectVisitSite();
		} );

		test.it( 'Can see site home page', async function() {
			const viewSitePage = await ViewSitePage.Expect( driver );
			const widgetContactInfoComponent = await WidgetContactInfoComponent.Expect( driver );
			const businessAddress = [ address, city, stateCode, postalCode, countryCode ];

			let title = await viewSitePage.siteTitle();
			assert.strictEqual(
				title.toUpperCase(),
				blogTitle.toUpperCase(),
				'Site title not is not correct'
			);

			let tagline = await viewSitePage.siteTagline();
			assert.strictEqual( tagline, blogTagline, 'Site tagline not is not correct' );

			let siteBusinessName = await widgetContactInfoComponent.getName();
			assert.strictEqual(
				siteBusinessName.toUpperCase(),
				businessName.toUpperCase(),
				'Business name not found on page'
			);

			let siteBusinessAddress = await widgetContactInfoComponent.getAddress();
			return assert.strictEqual(
				siteBusinessAddress,
				businessAddress.join( ' ' ),
				'Business address not found on page'
			);
		} );
	} );

	test.describe(
		'Onboard business site with static homepage when already logged in to WordPress: @parallel @jetpack',
		function() {
			this.bailSuite( true );
			const blogTitle = dataHelper.randomPhrase();
			const blogTagline = dataHelper.randomPhrase();

			test.before( async function() {
				return await driverManager.ensureNotLoggedIn( driver );
			} );

			test.it( 'Can login into WordPress.com', async function() {
				const loginFlow = new LoginFlow( driver, 'jetpackConnectUser' );
				return await loginFlow.login();
			} );

			test.it( 'Can create wporg site', async function() {
				this.timeout( mochaTimeOut * 12 );

				this.jnFlow = new JetpackConnectFlow( driver, null );
				return await this.jnFlow.createJNSite();
			} );

			test.it( 'Can navigate to onboarding flow', async function() {
				return await driver.get( this.jnFlow.url + onboardingUrlExt );
			} );

			test.it( 'Can fill out site title and tagline', async function() {
				const siteTitleTaglinePage = await SiteTitleTaglinePage.Expect( driver );
				await siteTitleTaglinePage.enterTitle( blogTitle );
				await siteTitleTaglinePage.enterTagline( blogTagline );
				return await siteTitleTaglinePage.selectContinue();
			} );

			test.it( 'Can select Business Site', async function() {
				const siteTypePage = await SiteTypePage.Expect( driver );
				return await siteTypePage.selectBusinessSite();
			} );

			test.it( 'Can select static homepage', async function() {
				const setHomepagePage = await SetHomepagePage.Expect( driver );
				return await setHomepagePage.selectPage();
			} );

			test.it( 'Can skip add a contact form', async function() {
				const wizardNavigationComponent = await WizardNavigationComponent.Expect( driver );
				return await wizardNavigationComponent.skipStep();
			} );

			test.it( 'Can skip add a business address', async function() {
				const wizardNavigationComponent = await WizardNavigationComponent.Expect( driver );
				return await wizardNavigationComponent.skipStep();
			} );

			test.it( 'Can make business an online store', async function() {
				const installWooCommercePage = await InstallWooCommercePage.Expect( driver );
				return await installWooCommercePage.selectSellOnline();
			} );

			test.it( 'Can select activate on activate stats page', async function() {
				const activateStatsPage = await ActivateStatsPage.Expect( driver );
				return await activateStatsPage.selectActivateStats();
			} );

			test.it( 'Can approve connection on the authorization page', async function() {
				const jetpackAuthorizePage = await JetpackAuthorizePage.Expect( driver );
				return await jetpackAuthorizePage.approveConnection();
			} );

			test.it( 'Can select activate on activate stats page', async function() {
				const activateStatsPage = await ActivateStatsPage.Expect( driver );
				return await activateStatsPage.selectContinue();
			} );

			test.it( 'Can see onboarding summary page', async function() {
				const summaryPage = await SummaryPage.Expect( driver );
				let toDoCount = await summaryPage.countToDoSteps();
				assert.strictEqual( toDoCount, 2, 'Expected and actual steps are not equal.' );
				return await summaryPage.selectVisitSite();
			} );

			test.it( 'Can see site home page', async function() {
				const viewSitePage = await ViewSitePage.Expect( driver );
				let title = await viewSitePage.siteTitle();
				assert.strictEqual(
					title.toUpperCase(),
					blogTitle.toUpperCase(),
					'Site title not is not correct'
				);
				let tagline = await viewSitePage.siteTagline();
				return assert.strictEqual( tagline, blogTagline, 'Site tagline not is not correct' );
			} );
		}
	);

	test.describe(
		'Onboard personal site that has already been connected: @parallel @jetpack',
		function() {
			this.bailSuite( true );
			const blogTitle = dataHelper.randomPhrase();
			const blogTagline = dataHelper.randomPhrase();

			test.before( async function() {
				return await driverManager.ensureNotLoggedIn( driver );
			} );

			test.it( 'Can create wporg site', async function() {
				this.timeout( mochaTimeOut * 12 );

				this.jnFlow = new JetpackConnectFlow( driver, null );
				return await this.jnFlow.createJNSite();
			} );

			test.it( 'Can navigate to the Jetpack dashboard', async function() {
				await WPAdminSidebar.refreshIfJNError( driver );
				const wpAdminSidebar = await WPAdminSidebar.Expect( driver );
				return await wpAdminSidebar.selectJetpack();
			} );

			test.it( 'Can click the Connect Jetpack button', async function() {
				const wPAdminJetpackPage = await WPAdminJetpackPage.Expect( driver );
				return await wPAdminJetpackPage.connectWordPressCom();
			} );

			test.it( 'Can login into WordPress.com', async function() {
				const loginFlow = new LoginFlow( driver, 'jetpackConnectUser' );
				return await loginFlow.loginUsingExistingForm();
			} );

			test.it( 'Can approve connection on the authorization page', async function() {
				const jetpackAuthorizePage = await JetpackAuthorizePage.Expect( driver );
				return await jetpackAuthorizePage.approveConnection();
			} );

			test.it( 'Can click the free plan button', async function() {
				const pickAPlanPage = await PickAPlanPage.Expect( driver );
				return await pickAPlanPage.selectFreePlanJetpack();
			} );

			test.it( 'Can navigate to onboarding flow', async function() {
				return await driver.get( this.jnFlow.url + onboardingUrlExt );
			} );

			test.it( 'Can fill out site title and tagline', async function() {
				const siteTitleTaglinePage = await SiteTitleTaglinePage.Expect( driver );
				await siteTitleTaglinePage.enterTitle( blogTitle );
				await siteTitleTaglinePage.enterTagline( blogTagline );
				return await siteTitleTaglinePage.selectContinue();
			} );

			test.it( 'Can select personal Site', async function() {
				const siteTypePage = await SiteTypePage.Expect( driver );
				return await siteTypePage.selectPersonalSite();
			} );

			test.it( 'Can select posts homepage', async function() {
				const setHomepagePage = await SetHomepagePage.Expect( driver );
				return await setHomepagePage.selectPosts();
			} );

			test.it( 'Can select add a contact form', async function() {
				const contactFormPage = await ContactFormPage.Expect( driver );
				return await contactFormPage.selectAddContactForm();
			} );

			test.it( 'Can continue on add a contact form', async function() {
				const contactFormPage = await ContactFormPage.Expect( driver );
				return await contactFormPage.selectContinue();
			} );

			test.it( 'Can select continue on activate stats page', async function() {
				const activateStatsPage = await ActivateStatsPage.Expect( driver );
				return await activateStatsPage.selectContinue();
			} );

			test.it( 'Can see onboarding summary page', async function() {
				const summaryPage = await SummaryPage.Expect( driver );
				let toDoCount = await summaryPage.countToDoSteps();
				assert.strictEqual( toDoCount, 0, 'Expected and actual steps are not equal.' );
				return await summaryPage.selectVisitSite();
			} );

			test.it( 'Can see site home page', async function() {
				const viewSitePage = await ViewSitePage.Expect( driver );
				let title = await viewSitePage.siteTitle();
				assert.strictEqual(
					title.toUpperCase(),
					blogTitle.toUpperCase(),
					'Site title not is not correct'
				);
				let tagline = await viewSitePage.siteTagline();
				return assert.strictEqual( tagline, blogTagline, 'Site tagline not is not correct' );
			} );
		}
	);
} );
