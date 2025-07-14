import { NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function POST(request: Request) {
  try {
    const { email, firstName, lastName, approved } = await request.json();

    const subject = approved ? 'Rezervace schválena' : 'Rezervace zamítnuta';
    const message = approved 
      ? 'Vaše rezervace stolů byla schválena. Těšíme se na vaši návštěvu!'
      : 'Vaše rezervace stolů byla zamítnuta. Omlouváme se za nepříjemnosti.';
    
    const msg = {
      to: email,
      from: process.env.FROM_EMAIL!,
      subject,
      html: `
        <h2>Dobrý den ${firstName} ${lastName},</h2>
        <p>${message}</p>
      `
    };
    
    await sgMail.send(msg);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending approval email:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send email' },
      { status: 500 }
    );
  }
} 