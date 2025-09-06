import emailjs from '@emailjs/browser';

// EmailJS configuration - UPDATE THESE WITH YOUR ACTUAL VALUES
const SERVICE_ID = 'service_homebud'; // From EmailJS dashboard
const TEMPLATE_ID = 'template_5np07gl'; // From EmailJS dashboard  
const PUBLIC_KEY = 'cUkDz-l_z1gFsMxVe'; // From EmailJS account settings

// Initialize EmailJS
emailjs.init(PUBLIC_KEY);

export const sendVerificationEmail = async (email, verificationCode, fullName) => {
  console.log('Attempting to send email to:', email);
  console.log('Service ID:', SERVICE_ID);
  console.log('Template ID:', TEMPLATE_ID);
  console.log('Public Key:', PUBLIC_KEY);
  
  try {
    const templateParams = {
      user_email: email,
      user_name: fullName,
      verification_code: verificationCode,
      from_name: 'HomeBudget Team'
    };
    
    console.log('Template params:', templateParams);

    const response = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams);
    console.log('Email sent successfully:', response);
    return { success: true };
  } catch (error) {
    console.error('Email sending failed:', error);
    console.error('Error details:', error.text || error.message);
    return { success: false, error: error.message || error.text };
  }
};