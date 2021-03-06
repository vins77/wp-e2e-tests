/** @format */

import test from 'selenium-webdriver/testing';
import config from 'config';
import assert from 'assert';

import LoginFlow from '../lib/flows/login-flow';
import SignUpFlow from '../lib/flows/sign-up-flow';

import AddNewSitePage from '../lib/pages/add-new-site-page';
import JetpackAuthorizePage from '../lib/pages/jetpack-authorize-page';
import PickAPlanPage from '../lib/pages/signup/pick-a-plan-page';
import WPAdminJetpackPage from '../lib/pages/wp-admin/wp-admin-jetpack-page.js';
import WPAdminDashboardPage from '../lib/pages/wp-admin/wp-admin-dashboard-page';
import WPAdminNewUserPage from '../lib/pages/wp-admin/wp-admin-new-user-page';
import WPAdminLogonPage from '../lib/pages/wp-admin/wp-admin-logon-page';
import WPAdminSidebar from '../lib/pages/wp-admin/wp-admin-sidebar.js';
import SidebarComponent from '../lib/components/sidebar-component';
import JetpackConnectFlow from '../lib/flows/jetpack-connect-flow';
import JetpackConnectPage from '../lib/pages/jetpack/jetpack-connect-page';
import JetpackConnectAddCredentialsPage from '../lib/pages/jetpack/jetpack-connect-add-credentials-page';
import PlansPage from '../lib/pages/plans-page';
import LoginPage from '../lib/pages/login-page';
import JetpackComPage from '../lib/pages/external/jetpackcom-page';
import JetpackComFeaturesDesignPage from '../lib/pages/external/jetpackcom-features-design-page';
import WooWizardSetupPage from '../lib/pages/woocommerce/woo-wizard-setup-page';
import WooWizardPaymentsPage from '../lib/pages/woocommerce/woo-wizard-payments-page';
import WooWizardShippingPage from '../lib/pages/woocommerce/woo-wizard-shipping-page';
import WooWizardExtrasPage from '../lib/pages/woocommerce/woo-wizard-extras-page';
import WooWizardJetpackPage from '../lib/pages/woocommerce/woo-wizard-jetpack-page';
import WooWizardReadyPage from '../lib/pages/woocommerce/woo-wizard-ready-page';

import * as driverManager from '../lib/driver-manager';
import * as driverHelper from '../lib/driver-helper';
import * as dataHelper from '../lib/data-helper';
import JetpackComPricingPage from '../lib/pages/external/jetpackcom-pricing-page';
import SecurePaymentComponent from '../lib/components/secure-payment-component';
import WPHomePage from '../lib/pages/wp-home-page';
import CheckOutThankyouPage from '../lib/pages/signup/checkout-thankyou-page';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const signupInboxId = config.get( 'signupInboxId' );
const testCreditCardDetails = dataHelper.getTestCreditCardDetails();
const sandboxCookieValue = config.get( 'storeSandboxCookieValue' );
const locale = driverManager.currentLocale();
const siteName = dataHelper.getJetpackSiteName();

let driver;

test.before( async function() {
	this.timeout( startBrowserTimeoutMS );
	driver = await driverManager.startBrowser();
} );

test.describe( `Jetpack Connect: (${ screenSize })`, function() {
	this.timeout( mochaTimeOut );

	test.describe( 'Disconnect expired sites: @parallel @jetpack @canary', function() {
		const timeout = mochaTimeOut * 10;
		this.bailSuite( true );
		this.timeout( timeout );

		test.before( async function() {
			return await driverManager.ensureNotLoggedIn( driver );
		} );

		test.it( 'Can disconnect any expired sites', async function() {
			return await new JetpackConnectFlow( driver, 'jetpackConnectUser' ).removeSites( timeout );
		} );
	} );

	test.describe( 'Connect From Calypso: @parallel @jetpack @canary', function() {
		this.bailSuite( true );

		test.before( async function() {
			return await driverManager.ensureNotLoggedIn( driver );
		} );

		test.it( 'Can create wporg site', async function() {
			this.timeout( mochaTimeOut * 12 );

			const template = dataHelper.isRunningOnJetpackBranch() ? 'branch' : 'default';
			this.jnFlow = new JetpackConnectFlow( driver, null, template );
			return await this.jnFlow.createJNSite();
		} );

		test.it( 'Can log in', async function() {
			const loginFlow = new LoginFlow( driver, 'jetpackConnectUser' );
			await loginFlow.loginAndSelectMySite();
		} );

		test.it( 'Can add new site', async function() {
			const sidebarComponent = await SidebarComponent.Expect( driver );
			await sidebarComponent.addNewSite( driver );
			const addNewSitePage = await AddNewSitePage.Expect( driver );
			return await addNewSitePage.addSiteUrl( this.jnFlow.url );
		} );

		test.it( 'Can click the free plan button', async function() {
			const pickAPlanPage = await PickAPlanPage.Expect( driver );
			return await pickAPlanPage.selectFreePlanJetpack();
		} );

		test.it( 'Has site URL in route', async function( done ) {
			const siteSlug = this.jnFlow.url.replace( /^https?:\/\//, '' );
			let url = await driver.getCurrentUrl();
			if ( url.includes( siteSlug ) ) {
				return done();
			}
			return done( `Route ${ url } does not include site slug ${ siteSlug }` );
		} );
	} );

	test.describe( 'Connect From wp-admin: @parallel @jetpack @canary', function() {
		this.bailSuite( true );

		test.before( async function() {
			return await driverManager.ensureNotLoggedIn( driver );
		} );

		test.it( 'Can create wporg site', async function() {
			this.timeout( mochaTimeOut * 12 );

			const template = dataHelper.isRunningOnJetpackBranch() ? 'branch' : 'default';
			this.jnFlow = new JetpackConnectFlow( driver, null, template );
			return await this.jnFlow.createJNSite();
		} );

		test.it( 'Can navigate to the Jetpack dashboard', async function() {
			await WPAdminSidebar.refreshIfJNError( driver );
			this.wpAdminSidebar = await WPAdminSidebar.Expect( driver );
			return await this.wpAdminSidebar.selectJetpack();
		} );

		test.it( 'Can click the Connect Jetpack button', async function() {
			await driverHelper.refreshIfJNError( driver );
			this.wpAdminJetpack = await WPAdminJetpackPage.Expect( driver );
			return await this.wpAdminJetpack.connectWordPressCom();
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

		test.it(
			'Is redirected back to the Jetpack dashboard with Jumpstart displayed',
			async function() {
				return await this.wpAdminJetpack.jumpstartDisplayed();
			}
		);
	} );

	test.describe( 'Pre-connect from Jetpack.com using free plan: @parallel @jetpack', function() {
		this.bailSuite( true );

		test.before( async function() {
			return await driverManager.ensureNotLoggedIn( driver );
		} );

		test.it( 'Can select Try it Free', async function() {
			const jetPackComPage = await JetpackComPage.Visit( driver );
			return await jetPackComPage.selectTryItFree();
		} );

		test.it( 'Can select free plan', async function() {
			const pickAPlanPage = await PickAPlanPage.Expect( driver );
			return await pickAPlanPage.selectFreePlanJetpack();
		} );

		test.it( 'Can see Jetpack connect page', async function() {
			return await JetpackConnectPage.Expect( driver );
		} );
	} );

	test.describe( 'Connect via SSO: @parallel @jetpack', function() {
		this.bailSuite( true );

		test.before( async function() {
			return await driverManager.ensureNotLoggedIn( driver );
		} );

		test.it( 'Can register new Subscriber user', async function() {
			this.accountName = dataHelper.getNewBlogName();
			this.emailAddress = dataHelper.getEmailAddress( this.accountName, signupInboxId );
			this.password = config.get( 'passwordForNewTestSignUps' );
			const signupFlow = new SignUpFlow( driver, {
				accountName: this.accountName,
				emailAddress: this.emailAddress,
				password: this.password,
			} );
			await signupFlow.signupFreeAccount();
			await signupFlow.activateAccount();
			return await driverManager.ensureNotLoggedIn( driver );
		} );

		test.it( 'Can log into WordPress.com', async function() {
			return await new LoginFlow( driver ).login();
		} );

		test.it( 'Can log into site via Jetpack SSO', async function() {
			return await new LoginFlow( driver ).login( { jetpackSSO: true } );
		} );

		test.it( 'Add new user as Subscriber in wp-admin', async function() {
			await WPAdminSidebar.refreshIfJNError( driver );
			const wpAdminSidebar = await WPAdminSidebar.Expect( driver );
			await wpAdminSidebar.selectAddNewUser();
			await WPAdminNewUserPage.refreshIfJNError( driver );
			const wpAdminNewUserPage = await WPAdminNewUserPage.Expect( driver );
			return await wpAdminNewUserPage.addUser( this.emailAddress );
		} );

		test.it( 'Log out from WP Admin', async function() {
			await driverManager.ensureNotLoggedIn( driver );
			const wPAdminDashboardPage = await WPAdminDashboardPage.Visit(
				driver,
				WPAdminDashboardPage.getUrl( siteName )
			);
			return await wPAdminDashboardPage.logout();
		} );

		test.it( 'Can log in as Subscriber', async function() {
			const loginPage = await LoginPage.Visit( driver );
			return await loginPage.login( this.accountName, this.password );
		} );

		test.it( 'Can login via SSO into WP Admin', async function() {
			const wpAdminLogonPage = await WPAdminLogonPage.Visit( driver, siteName );
			await wpAdminLogonPage.logonSSO();
			const jetpackAuthorizePage = await JetpackAuthorizePage.Expect( driver );
			return await jetpackAuthorizePage.approveSSOConnection();
			// return new WPAdminDashboardPage( driver );
		} );
	} );

	test.describe(
		'Pre-connect from Jetpack.com using "Install Jetpack" button: @parallel @jetpack',
		function() {
			this.bailSuite( true );

			test.before( async function() {
				return await driverManager.ensureNotLoggedIn( driver );
			} );

			test.it( 'Can select Install Jetpack on Design Page', async function() {
				const jetpackComFeaturesDesignPage = await JetpackComFeaturesDesignPage.Visit( driver );
				return await jetpackComFeaturesDesignPage.installJetpack();
			} );

			test.it( 'Can see Jetpack connect page', async function() {
				return await JetpackConnectPage.Expect( driver );
			} );
		}
	);

	test.describe(
		'Connect from Jetpack.com Pricing page and buy paid plan: @parallel @jetpack',
		function() {
			this.bailSuite( true );
			let jnFlow;

			test.before( async function() {
				return await driverManager.ensureNotLoggedIn( driver );
			} );

			test.it( 'We can set the sandbox cookie for payments', async function() {
				const wpHomePage = await WPHomePage.Visit( driver );
				await wpHomePage.checkURL( locale );
				return await wpHomePage.setSandboxModeForPayments( sandboxCookieValue );
			} );

			test.it( 'Can create wporg site', async function() {
				this.timeout( mochaTimeOut * 12 );

				jnFlow = new JetpackConnectFlow( driver, null, 'noJetpack' );
				return await jnFlow.createJNSite();
			} );

			test.it( 'Can select buy Premium on Pricing Page', async function() {
				const jetpackComPricingPage = await JetpackComPricingPage.Visit( driver );
				return await jetpackComPricingPage.buyPremium();
			} );

			test.it( 'Can start connection flow using JN site', async function() {
				const jetPackConnectPage = await JetpackConnectPage.Expect( driver );
				return await jetPackConnectPage.addSiteUrl( jnFlow.url );
			} );

			test.it( 'Can enter the Jetpack credentials and install Jetpack', async function() {
				const jetpackConnectAddCredentialsPage = await JetpackConnectAddCredentialsPage.Expect(
					driver
				);
				return await jetpackConnectAddCredentialsPage.enterDetailsAndConnect(
					jnFlow.username,
					jnFlow.password
				);
			} );

			test.it( 'Can wait for Jetpack get connected', async function() {
				const jetpackAuthorizePage = await JetpackAuthorizePage.Expect( driver );
				return await jetpackAuthorizePage.waitToDisappear();
			} );

			test.it( 'Can log into WP.com', async function() {
				const user = dataHelper.getAccountConfig( 'jetpackConnectUser' );
				const loginPage = await LoginPage.Expect( driver );
				return await loginPage.login( user[ 0 ], user[ 1 ] );
			} );

			test.it(
				'Can see the secure payment page and enter/submit test payment details',
				async function() {
					const securePaymentComponent = await SecurePaymentComponent.Expect( driver );
					await securePaymentComponent.payWithStoredCardIfPossible( testCreditCardDetails );
					await securePaymentComponent.waitForCreditCardPaymentProcessing();
					return await securePaymentComponent.waitForPageToDisappear();
				}
			);

			test.it( 'Can see Premium Thank You page', async function() {
				const checkOutThankyouPage = await CheckOutThankyouPage.Expect( driver );
				const isPremium = await checkOutThankyouPage.isPremiumPlan();
				return assert( isPremium, 'The Thank You Notice is not for the Premium Plan' );
			} );
		}
	);

	test.describe(
		'Connect From WooCommerce plugin when Jetpack is not installed: @parallel @jetpack',
		function() {
			this.bailSuite( true );
			const countryCode = 'US';
			const stateCode = 'CO';
			const address = '2101 Blake St';
			const address2 = '';
			const city = 'Denver';
			const postalCode = '80205';
			const currency = 'USD';
			const productType = 'physical';

			test.before( async function() {
				return await driverManager.ensureNotLoggedIn( driver );
			} );

			test.it( 'Can create wporg site', async function() {
				this.timeout( mochaTimeOut * 12 );

				this.jnFlow = new JetpackConnectFlow( driver, null, 'wooCommerceNoJetpack' );
				return await this.jnFlow.createJNSite();
			} );

			test.it( 'Can enter WooCommerce Wizard', async function() {
				const wPAdminDashboardPage = await WPAdminDashboardPage.Expect( driver );
				return await wPAdminDashboardPage.enterWooCommerceWizard();
			} );

			test.it( 'Can fill out and submit store information form', async function() {
				const wooWizardSetupPage = await WooWizardSetupPage.Expect( driver );
				return await wooWizardSetupPage.enterStoreDetailsAndSubmit( {
					countryCode,
					stateCode,
					address,
					address2,
					city,
					postalCode,
					currency,
					productType,
				} );
			} );

			test.it( 'Can continue through payments information', async function() {
				const wooWizardPaymentsPage = await WooWizardPaymentsPage.Expect( driver );
				return await wooWizardPaymentsPage.selectContinue();
			} );

			test.it( 'Can continue through shipping information', async function() {
				const wooWizardShippingPage = await WooWizardShippingPage.Expect( driver );
				return await wooWizardShippingPage.selectContinue();
			} );

			test.it( 'Can continue through extras information', async function() {
				const wooWizardExtrasPage = await WooWizardExtrasPage.Expect( driver );
				return await wooWizardExtrasPage.selectContinue();
			} );

			test.it( 'Can activate Jetpack', async function() {
				const wooWizardJetpackPage = await WooWizardJetpackPage.Expect( driver );
				return await wooWizardJetpackPage.selectContinueWithJetpack();
			} );

			test.it( 'Can log into WP.com', async function() {
				const user = dataHelper.getAccountConfig( 'jetpackConnectUser' );
				const loginPage = await LoginPage.Expect( driver );
				return await loginPage.login( user[ 0 ], user[ 1 ] );
			} );

			test.it( 'Can wait for Jetpack get connected', async function() {
				const jetpackAuthorizePage = await JetpackAuthorizePage.Expect( driver );
				return await jetpackAuthorizePage.waitToDisappear();
			} );

			test.it( 'Can see the Woo wizard ready page', async function() {
				return await WooWizardReadyPage.Expect( driver );
			} );
		}
	);

	test.describe(
		'Remote Installation Connect From Calypso, when Jetpack not installed: @parallel @jetpack',
		function() {
			this.bailSuite( true );
			let jnFlow;

			test.before( async function() {
				return await driverManager.ensureNotLoggedIn( driver );
			} );

			test.it( 'Can create wporg site', async function() {
				this.timeout( mochaTimeOut * 12 );

				jnFlow = new JetpackConnectFlow( driver, null, 'noJetpack' );
				return await jnFlow.createJNSite();
			} );

			test.it( 'Can log in', async function() {
				return await new LoginFlow( driver, 'jetpackConnectUser' ).loginAndSelectMySite();
			} );

			test.it( 'Can add new site', async function() {
				const sideBarComponent = await SidebarComponent.Expect( driver );
				await sideBarComponent.addNewSite();
				const addNewSitePage = await AddNewSitePage.Expect( driver );
				return await addNewSitePage.addSiteUrl( jnFlow.url );
			} );

			test.it( 'Can enter the Jetpack credentials and install Jetpack', async function() {
				const jetpackConnectAddCredentialsPage = await JetpackConnectAddCredentialsPage.Expect(
					driver
				);
				return await jetpackConnectAddCredentialsPage.enterDetailsAndConnect(
					jnFlow.username,
					jnFlow.password
				);
			} );

			test.it( 'Can wait for Jetpack get connected', async function() {
				const jetpackAuthorizePage = await JetpackAuthorizePage.Expect( driver );
				return await jetpackAuthorizePage.waitToDisappear();
			} );

			test.it( 'Can click the free plan button', async function() {
				const pickAPlanPage = await PickAPlanPage.Expect( driver );
				return await pickAPlanPage.selectFreePlanJetpack();
			} );

			test.it( 'Can then see the Jetpack plan page in Calypso', async function() {
				return await PlansPage.Expect( driver );
			} );
		}
	);
} );
