import nodemailer from 'nodemailer';

// async..await is not allowed in global scope, must use a wrapper
export async function sendEmail(to: string, html: string) {
	// Generate test SMTP service account from ethereal.email
	// Only needed if you don't have a real mail account for testing
	// let testAccount = await nodemailer.createTestAccount();
	// console.log(testAccount);

	// create reusable transporter object using the default SMTP transport
	let transporter = nodemailer.createTransport({
		host: 'smtp.ethereal.email',
		port: 587,
		secure: false, // true for 465, false for other ports
		auth: {
			user: 'wbtuprio4txg4ziy@ethereal.email', // generated ethereal user HARDCODED FOR NOW
			pass: 'Mzt3VgSXXSyVqA9ath', // generated ethereal password HARDCODED FOR NOW
		},
	});

	// send mail with defined transport object
	let info = await transporter.sendMail({
		from: '"Fred Foo 👻" <foo@example.com>', // sender address
		to, // to: 'bar@example.com, baz@example.com', // list of receivers
		subject: 'Change Password', // Subject line
		// text, // text: 'Hello world?', // plain text body
		html, // html: '<b>Hello world?</b>', // html body
	});

	console.log('Message sent: %s', info.messageId);

	console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
}

// user: 'wbtuprio4txg4ziy@ethereal.email',
// pass: 'Mzt3VgSXXSyVqA9ath',
