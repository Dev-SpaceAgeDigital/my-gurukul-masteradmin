export interface EmailAttachment {
  filename: string;
  content: string | Buffer;
  contentType?: string;
}

export interface SendEmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  schoolName?: string;
  schoolEmail?: string;
  trustName?: string;
  trustEmail?: string;
  brevoApiKey?: string;
  customSenderEmail?: string;
  schoolId?: string;
  trustId?: string;
  emailType?: string;
  recipientRole?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
  attachments?: EmailAttachment[];
}

export interface SendEmailResult {
  ok: boolean;
  provider: 'BREVO' | 'RESEND' | 'NONE';
  messageId?: string;
  error?: string;
}

async function logEmailResult(
  payload: SendEmailPayload,
  result: SendEmailResult,
  recipients: string[]
) {
  try {
    const { db } = await import('@/lib/db');
    const { emailLogs } = await import('@/lib/db/schema');
    
    await db.insert(emailLogs).values({
      trustId: payload.trustId || null,
      schoolId: payload.schoolId || null,
      recipientEmail: recipients[0] || 'unknown',
      recipientRole: payload.recipientRole || null,
      emailType: payload.emailType || 'GENERAL',
      subject: payload.subject,
      provider: result.provider,
      status: result.ok ? 'SENT' : 'FAILED',
      errorMessage: result.error || null,
    });
  } catch (err) {
    console.error('[EmailSender] Failed to write to emailLogs table:', err);
  }
}

function parseSender(fromInput?: string, schoolName?: string, trustName?: string, customSenderEmail?: string) {
  const defaultFrom =
    customSenderEmail ||
    process.env.BREVO_FROM_EMAIL ||
    process.env.RESEND_FROM_EMAIL ||
    'zynteqtechnologies@gmail.com';
  
  const fromStr = (fromInput || defaultFrom).trim();
  
  let baseEmail = fromStr;
  let parsedName = '';

  const angleMatch = fromStr.match(/^(.*)<([^>]+)>$/);
  if (angleMatch) {
    parsedName = angleMatch[1].replace(/"/g, '').trim();
    baseEmail = angleMatch[2].trim();
  }

  let displayName = 'EduTrust OS Platform';
  if (schoolName && trustName) {
    displayName = `${schoolName} | ${trustName}`;
  } else if (schoolName) {
    displayName = schoolName;
  } else if (trustName) {
    displayName = trustName;
  } else if (parsedName) {
    displayName = parsedName;
  }

  const cleanEmail = baseEmail.replace(/[<>"]/g, '').trim() || 'zynteqtechnologies@gmail.com';

  return {
    name: displayName,
    email: cleanEmail,
    raw: `${displayName} <${cleanEmail}>`,
  };
}

export async function sendEmail(payload: SendEmailPayload): Promise<SendEmailResult> {
  const brevoApiKey = payload.brevoApiKey || process.env.BREVO_API_KEY;
  const resendApiKey = process.env.RESEND_API_KEY;

  const recipients = Array.isArray(payload.to)
    ? payload.to.map((e) => e.trim().toLowerCase()).filter(Boolean)
    : [payload.to.trim().toLowerCase()].filter(Boolean);

  if (recipients.length === 0) {
    const res: SendEmailResult = { ok: false, provider: 'NONE', error: 'No recipient email addresses provided' };
    await logEmailResult(payload, res, recipients);
    return res;
  }

  const sender = parseSender(payload.from, payload.schoolName, payload.trustName, payload.customSenderEmail);

  // Build CC list: Always include Master Admin (admin@madnieducation.org) + School Email if provided
  const ccEmailsSet = new Set<string>();
  ccEmailsSet.add('admin@madnieducation.org');

  if (payload.schoolEmail) {
    ccEmailsSet.add(payload.schoolEmail.trim().toLowerCase());
  }

  if (payload.cc) {
    const customCcList = Array.isArray(payload.cc) ? payload.cc : [payload.cc];
    customCcList.forEach((e) => {
      if (e && e.trim()) ccEmailsSet.add(e.trim().toLowerCase());
    });
  }

  // Remove recipient emails from CC set to prevent duplicate delivery loop
  recipients.forEach((r) => ccEmailsSet.delete(r));

  const ccList = Array.from(ccEmailsSet).filter(Boolean);
  const replyToEmail = payload.replyTo || payload.schoolEmail || 'admin@madnieducation.org';

  // 1. Primary Attempt: Brevo API v3
  if (brevoApiKey) {
    try {
      const brevoPayload: any = {
        sender: { name: sender.name, email: sender.email },
        to: recipients.map((email) => ({ email })),
        subject: payload.subject,
        htmlContent: payload.html,
        replyTo: { email: replyToEmail, name: sender.name },
        ...(ccList.length > 0 ? { cc: ccList.map((email) => ({ email })) } : {}),
        ...(payload.attachments && payload.attachments.length > 0
          ? {
              attachment: payload.attachments.map((att) => ({
                name: att.filename,
                content: typeof att.content === 'string' ? att.content : att.content.toString('base64'),
              })),
            }
          : {}),
      };

      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': brevoApiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(brevoPayload),
      });

      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        const successRes: SendEmailResult = {
          ok: true,
          provider: 'BREVO',
          messageId: data.messageId || undefined,
        };
        await logEmailResult(payload, successRes, recipients);
        return successRes;
      }

      const errorText = await res.text();
      console.error(`[EmailSender] Brevo API failed (${res.status}): ${errorText}`);
      const failRes: SendEmailResult = {
        ok: false,
        provider: 'BREVO',
        error: `Brevo returned ${res.status}: ${errorText}`,
      };
      await logEmailResult(payload, failRes, recipients);
      return failRes;
    } catch (brevoErr: any) {
      console.error('[EmailSender] Brevo API request exception:', brevoErr);
      const excRes: SendEmailResult = {
        ok: false,
        provider: 'BREVO',
        error: brevoErr instanceof Error ? brevoErr.message : 'Brevo request failed',
      };
      await logEmailResult(payload, excRes, recipients);
      return excRes;
    }
  }

  // 2. Secondary Attempt: Resend API (Fallback)
  if (resendApiKey) {
    try {
      const resendPayload: any = {
        from: sender.raw,
        to: recipients,
        reply_to: replyToEmail,
        subject: payload.subject,
        html: payload.html,
        ...(ccList.length > 0 ? { cc: ccList } : {}),
        ...(payload.attachments && payload.attachments.length > 0
          ? {
              attachments: payload.attachments.map((att) => ({
                filename: att.filename,
                content: typeof att.content === 'string' ? att.content : att.content.toString('base64'),
              })),
            }
          : {}),
      };

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resendPayload),
      });

      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        const successRes: SendEmailResult = {
          ok: true,
          provider: 'RESEND',
          messageId: data.id || undefined,
        };
        await logEmailResult(payload, successRes, recipients);
        return successRes;
      }

      const errorText = await res.text();
      console.error(`[EmailSender] Resend API failed (${res.status}): ${errorText}`);
      const failRes: SendEmailResult = {
        ok: false,
        provider: 'RESEND',
        error: `Resend returned ${res.status}: ${errorText}`,
      };
      await logEmailResult(payload, failRes, recipients);
      return failRes;
    } catch (resendErr) {
      console.error('[EmailSender] Resend API request exception:', resendErr);
      const excRes: SendEmailResult = {
        ok: false,
        provider: 'RESEND',
        error: resendErr instanceof Error ? resendErr.message : 'Resend request failed',
      };
      await logEmailResult(payload, excRes, recipients);
      return excRes;
    }
  }

  console.warn('[EmailSender] Neither BREVO_API_KEY nor RESEND_API_KEY is configured. Email skipped.');
  const noKeyRes: SendEmailResult = {
    ok: false,
    provider: 'NONE',
    error: 'No email service API key configured (neither BREVO_API_KEY nor RESEND_API_KEY)',
  };
  await logEmailResult(payload, noKeyRes, recipients);
  return noKeyRes;
}
