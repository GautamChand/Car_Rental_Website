const SibApiV3Sdk = require("sib-api-v3-sdk");
 
// Configure API client once
const client = SibApiV3Sdk.ApiClient.instance;
client.authentications["api-key"].apiKey = process.env.BREVO_API_KEY || "";
 
/**
 * Sends an email using Brevo template.
 */
const queryEmail = async ({
  toEmail,
  toName,
  params,
}) => {
  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  // Add recipient and owner
   sendSmtpEmail.to = [
    { email: toEmail, name: toName },
    { email: "chandgautam64@gmail.com", name: "Gautam" },
    { email: "himanshu2006f@gmail.com", name: "Himanshu" },
  ];
 
  // Sender details
  sendSmtpEmail.sender = {
    name: "DriveElite — Gautam & Himanshu",
    email: "support@driveelite.com",
  };
 sendSmtpEmail.replyTo = { email: "chandgautam64@gmail.com", name: "Gautam & Himanshu" };
  // Use template ID from env
  const templateId = Number(process.env.BREVO_QUERY_TEMPLATE_ID);
  if (!templateId) {
    throw new Error("BREVO_TEMPLATE_ID is not set in environment variables");
  }
 
  sendSmtpEmail.templateId = templateId;
  sendSmtpEmail.params = params;
 
  // Send the email
  return apiInstance.sendTransacEmail(sendSmtpEmail);
};

module.exports = { queryEmail };