// Real EmailJS OTP Service
import emailjs from '@emailjs/browser';

// Initialize EmailJS (you'll need to get these from EmailJS dashboard)
const EMAILJS_PUBLIC_KEY = 'jZG2WKhHLTrug4wGe';
const EMAILJS_SERVICE_ID = 'service_oy7u31c';
const EMAILJS_OTP_TEMPLATE_ID = 'template_pldd6ei';

// Initialize once
emailjs.init(EMAILJS_PUBLIC_KEY);

class EmailService {
  constructor() {
    this.sentOTPs = JSON.parse(localStorage.getItem('pendingOTPs') || '{}');
  }

  // Generate 6-digit OTP
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send OTP via EmailJS (real email)
  async sendOTPEmail(email, name) {
    try {
      const otp = this.generateOTP();
      console.log(`📧 Attempting to send OTP to: ${email}`);
      
      // Try to send real email via EmailJS
      const templateParams = {
        to_name: name,
        to_email: email,
        otp_code: otp,
        from_name: 'SmartCity Logistics',
        reply_to: 'no-reply@smartcitylogistics.com'
      };

      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_OTP_TEMPLATE_ID,
        templateParams
      );
      
      console.log('✅ Real email sent successfully:', response);
      
      // Store OTP for verification
      this.storeOTP(email, otp, name);
      
      return {
        success: true,
        message: 'OTP sent to your email',
        otp: otp // For testing/demo only
      };
      
    } catch (emailError) {
      console.error('❌ EmailJS failed, using mock service:', emailError);
      
      // Fallback to mock service
      return this.sendMockOTP(email, name);
    }
  }

  // Mock OTP service (fallback)
  async sendMockOTP(email, name) {
    const otp = this.generateOTP();
    
    console.log(`📧 [MOCK] OTP for ${email}: ${otp}`);
    console.log(`📧 [MOCK] Would send email to: ${name} <${email}>`);
    console.log(`📧 [MOCK] OTP Code: ${otp}`);
    
    // Store OTP for verification
    this.storeOTP(email, otp, name);
    
    // Show OTP in alert for demo/testing
    alert(`[DEMO] OTP for ${email}: ${otp}\n\n(In production, this would be sent via email)`);
    
    return {
      success: true,
      message: 'OTP generated (mock service)',
      otp: otp
    };
  }

  // Store OTP in localStorage
  storeOTP(email, otp, name) {
    const otpData = {
      otp,
      expires: Date.now() + 10 * 60 * 1000, // 10 minutes
      name,
      verified: false,
      createdAt: new Date().toISOString()
    };
    
    this.sentOTPs[email] = otpData;
    localStorage.setItem('pendingOTPs', JSON.stringify(this.sentOTPs));
    
    console.log(`📦 OTP stored for ${email}, expires in 10 minutes`);
  }

  // Verify OTP
  verifyOTP(email, userOTP) {
    const otpData = this.sentOTPs[email];
    
    if (!otpData) {
      return {
        success: false,
        message: 'No OTP found for this email. Please request a new OTP.'
      };
    }
    
    // Check expiration
    if (Date.now() > otpData.expires) {
      delete this.sentOTPs[email];
      localStorage.setItem('pendingOTPs', JSON.stringify(this.sentOTPs));
      
      return {
        success: false,
        message: 'OTP has expired. Please request a new OTP.'
      };
    }
    
    // Verify OTP
    if (otpData.otp !== userOTP) {
      return {
        success: false,
        message: 'Invalid OTP. Please try again.'
      };
    }
    
    // Mark as verified
    otpData.verified = true;
    otpData.verifiedAt = new Date().toISOString();
    localStorage.setItem('pendingOTPs', JSON.stringify(this.sentOTPs));
    
    return {
      success: true,
      message: 'Email verified successfully!',
      name: otpData.name
    };
  }

  // Resend OTP
  async resendOTP(email) {
    const otpData = this.sentOTPs[email];
    
    if (otpData) {
      return await this.sendOTPEmail(email, otpData.name);
    }
    
    return {
      success: false,
      message: 'Email not found. Please sign up again.'
    };
  }

  // Clear expired OTPs
  clearExpiredOTPs() {
    const now = Date.now();
    let cleared = false;
    
    Object.keys(this.sentOTPs).forEach(email => {
      if (this.sentOTPs[email].expires < now) {
        delete this.sentOTPs[email];
        cleared = true;
      }
    });
    
    if (cleared) {
      localStorage.setItem('pendingOTPs', JSON.stringify(this.sentOTPs));
    }
  }
}

// Create singleton instance
const emailService = new EmailService();
export default emailService;