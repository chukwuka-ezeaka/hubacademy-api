
const SES = require('aws-sdk/clients/ses');
const Sender = new SES({
    accessKeyId: process.env.AWS_ACCESS_KEY_PROD,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_PROD,
    region: process.env.AWS_REGION
});

const sendEmail = (params)=>{

    const sendEmail = Sender.sendEmail(params).promise();

    sendEmail
        .then(data => {
            //console.log("email submitted to SES", data);
            return;
        })
        .catch(error => {
            //console.log(error);
            throw Error(error.message)
        });
}

module.exports = sendEmail;

