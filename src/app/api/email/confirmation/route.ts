import { NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function POST(request: Request) {
  try {
    const { email, firstName, lastName } = await request.json();

    const msg = {
      to: email,
      from: process.env.FROM_EMAIL!,
      subject: 'Rezervace stolů - Požadavek přijat',
      html: `
        <h2>Dobrý den ${firstName} ${lastName},</h2>
        <p>Vaše rezervace stolů byla úspěšně přijata a čeká na schválení.</p>
        <p>Budeme vás informovat o stavu vaší rezervace.</p>
        <p>Děkujeme za vaši rezervaci!</p>
      `
    };
    
    await sgMail.send(msg);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send email' },
      { status: 500 }
    );
  }
} 