const SibApiV3Sdk = require('sib-api-v3-sdk');
const client = SibApiV3Sdk.ApiClient.instance;
const apiKey = client.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

const sendEmail = async ({ email, params,driverEmail}) => {
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  sendSmtpEmail.sender = { name: "DriveElite — Gautam & Himanshu", email: "support@driveelite.com" };

  sendSmtpEmail.to = [{ email }
  ];
  sendSmtpEmail.replyTo = { email: "chandgautam64@gmail.com", name: "Gautam & Himanshu" };
  sendSmtpEmail.cc = [{ email: process.env.OWNER_EMAIL },
     {email:driverEmail}
  ];
console.log("abhishrre",driverEmail);



  sendSmtpEmail.templateId = parseInt(process.env.BREVO_TEMPLATE_ID, 10);

  // Provide params for template 
  sendSmtpEmail.params = {
    projectName: params.projectName || "DriveElite",
    name: params.name,
    rideOption: params.rideOption || "",
    pickUpDate: params.pickUpDate || "",
    pickUpTime: params.pickUpTime || "",
    origins: params.origins || "",
    destinations: params.destinations || "",
    numberPassengers: params.numberPassengers || "",
    carChoice: params.carChoice || "",
    hourlyService: params.hourlyService || "",
    airline: params.airline || "",
    flightNumber: params.flightNumber || "",
    email: params.email || "",
    phone: params.phone || "",
    paymentStatus: params.paymentStatus || "",
    paymentIntentId: params.paymentIntentId || "",
    amount: params.amount || "",
    addOns: params.addOns || "",
    bookingId: params.bookingId || "",
    seatOption: params.seatOption || "",
    driverName:params.driverName||"",
     driverPhone:params.driverPhone||""
     
    


  };

  try {
    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("Email sent successfully:", response.messageId || response);
    return response;
  } catch (error) {
    console.error("Error sending email:", error.response ? error.response.text : error.message);
    throw error;
  }
};

module.exports = { sendEmail };