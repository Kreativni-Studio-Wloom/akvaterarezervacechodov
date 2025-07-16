import { NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function POST(request: Request) {
  try {
    const { email, firstName, lastName, tableIds } = await request.json();

    const subject = 'Zrušení rezervace';
    const html = `
      <h2>Dobrý den ${firstName} ${lastName},</h2>
      <p>Vaše rezervace byla zrušena administrátorem.</p>
      <p>Počet zrušených stolů: ${tableIds.length}</p>
      <p>Stoly jsou nyní opět volné pro rezervaci.</p>
      <p>V případě dotazů nás kontaktujte na <a href="mailto:${process.env.FROM_EMAIL}">${process.env.FROM_EMAIL}</a></p>
    `;

    await sgMail.send({
      to: email,
      from: process.env.FROM_EMAIL!,
      subject,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending cancelled email:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send cancelled email' },
      { status: 500 }
    );
  }
} 