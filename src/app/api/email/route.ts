import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  const { to, subject, html, text } = await req.json();

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'grigar.adam@gmail.com',
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: 'Rezervace stolů <grigar.adam@gmail.com>',
    to: [to, 'grigar.adam@gmail.com'],
    subject,
    text,
    html,
  });

  return NextResponse.json({ ok: true });
} 