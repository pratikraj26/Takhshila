'use strict';

// Development specific configuration
// ==================================
module.exports = {
	siteBase: 'http://localhost:9000',
	// MongoDB connection options
	mongo: {
		uri: 'mongodb://localhost/takhshila-dev'
	},
	
	payu: {
		merchantID: 4934580,
		key: 'rjQUPktU',
		salt: 'e5iIg1jwi8',
		authorizationHeader: 'y8tNAC1Ar0Sd8xAHGjZ817UGto5jt37zLJSX/NHK3ok=',
		host: 'https://test.payumoney.com',
		path: {
			paymentResponse: '/payment/op/getPaymentResponse'
		}
	},
	// sslServer: true,

	msg91: {
		apiBase: "http://api.msg91.com/api/sendhttp.php",
		authkey: "181964ASuehXXhrB59fb3097",
		sender: "TKHSLA",
		route: 4
	},
	
	seedDB: true
};
