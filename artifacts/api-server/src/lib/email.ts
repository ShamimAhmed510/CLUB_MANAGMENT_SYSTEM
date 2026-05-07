import nodemailer from "nodemailer";

const emailUser = process.env["EMAIL_USER"];
const emailPass = process.env["EMAIL_PASS"];

export const emailEnabled = Boolean(emailUser) && Boolean(emailPass);

function createTransport() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });
}

export async function sendPasswordResetEmail(
  to: string,
  resetLink: string,
): Promise<void> {
  if (!emailEnabled) {
    throw new Error("Email service is not configured (EMAIL_USER / EMAIL_PASS missing)");
  }
  const transporter = createTransport();
  await transporter.sendMail({
    from: `"MU Club Portal" <${emailUser}>`,
    to,
    subject: "Password Reset Request – MU Club Portal",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #e5e7eb;border-radius:12px;">
        <h2 style="margin-top:0;color:#1e0b4b;">Reset Your Password</h2>
        <p>We received a request to reset the password for your MU Club Portal account.</p>
        <p>Click the button below to choose a new password. This link expires in <strong>1 hour</strong>.</p>
        <a href="${resetLink}"
          style="display:inline-block;margin:16px 0;padding:12px 28px;background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">
          Reset Password
        </a>
        <p style="color:#6b7280;font-size:13px;">If you didn't request this, you can safely ignore this email.</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
        <p style="color:#9ca3af;font-size:12px;">Metropolitan University Club Management Portal</p>
      </div>
    `,
  });
}

export async function sendJoinRequestNotification(opts: {
  adminEmail: string;
  adminName: string;
  studentName: string;
  studentEmail: string;
  studentId: string | null;
  department: string | null;
  clubName: string;
  message: string | null;
  portalUrl: string;
}): Promise<void> {
  if (!emailEnabled) return;
  const transporter = createTransport();
  const { adminEmail, adminName, studentName, studentEmail, studentId, department, clubName, message, portalUrl } = opts;

  await transporter.sendMail({
    from: `"MU Club Portal" <${emailUser}>`,
    to: adminEmail,
    subject: `New Join Request for ${clubName} – MU Club Portal`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px;border:1px solid #e5e7eb;border-radius:12px;">
        <h2 style="margin-top:0;color:#1e0b4b;">New Membership Request</h2>
        <p>Hi <strong>${adminName}</strong>,</p>
        <p>A student has submitted a join request for <strong>${clubName}</strong>.</p>

        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <tr style="border-bottom:1px solid #f3f4f6;">
            <td style="padding:8px 0;color:#6b7280;font-size:13px;width:120px;">Name</td>
            <td style="padding:8px 0;font-weight:600;font-size:13px;">${studentName}</td>
          </tr>
          <tr style="border-bottom:1px solid #f3f4f6;">
            <td style="padding:8px 0;color:#6b7280;font-size:13px;">Email</td>
            <td style="padding:8px 0;font-size:13px;">${studentEmail}</td>
          </tr>
          ${studentId ? `<tr style="border-bottom:1px solid #f3f4f6;"><td style="padding:8px 0;color:#6b7280;font-size:13px;">Student ID</td><td style="padding:8px 0;font-size:13px;">${studentId}</td></tr>` : ""}
          ${department ? `<tr style="border-bottom:1px solid #f3f4f6;"><td style="padding:8px 0;color:#6b7280;font-size:13px;">Department</td><td style="padding:8px 0;font-size:13px;">${department}</td></tr>` : ""}
          ${message ? `<tr><td style="padding:8px 0;color:#6b7280;font-size:13px;vertical-align:top;">Message</td><td style="padding:8px 0;font-size:13px;font-style:italic;">"${message}"</td></tr>` : ""}
        </table>

        <a href="${portalUrl}"
          style="display:inline-block;margin:16px 0;padding:12px 28px;background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">
          Review Request in Dashboard
        </a>

        <p style="color:#6b7280;font-size:13px;">Log in to your Club Admin dashboard to approve or reject this request.</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
        <p style="color:#9ca3af;font-size:12px;">Metropolitan University Club Management Portal</p>
      </div>
    `,
  });
}
