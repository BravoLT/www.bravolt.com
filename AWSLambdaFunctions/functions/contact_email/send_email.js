const AWS = require('aws-sdk');
const nodemailer = require('nodemailer');

AWS.config.update({
    region: process.env.SES_REGION
});

const ses = new AWS.SES({ apiVersion: '2010-12-01' });

module.exports = function sendEmail(subject, body, resumeName, resume) {
    return new Promise((resolve, reject) => {
        const params = {
            from: '"' + process.env.FROM_NAME + '" '+ process.env.FROM_EMAIL,
            to: ["alysa.passage@bravolt.com", "edward.nausieda@bravolt.com", "joe.murray@bravolt.com"],
            subject: subject,
            html:  body
        }

        if (resumeName !== undefined && resume !== undefined) {
            params.attachments = [
                {
                    filename: resumeName,
                    content: resume,
                    encoding: 'base64'
                }
            ]
        }

        console.log('e-mail params: ', params);

        var transporter = nodemailer.createTransport({
            SES: ses
        });

        transporter.sendMail(params, (err, data) => {
            if (err) {
                console.error("Failed to send the email: ", err.stack || err);
                reject(err);
            } else {
                console.log("e-mail sent: ", data)
                resolve(data);
            }
        });
    });
}
