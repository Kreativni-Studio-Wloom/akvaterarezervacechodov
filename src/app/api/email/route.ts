import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  const { to, subject, html, text } = await req.json();

  const transporter = nodemailer.createTransport({
    host: 'smtp.seznam.cz',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `Rezervace stolů <${process.env.EMAIL_FROM}>`,
    to: [to, process.env.EMAIL_FROM],
    subject,
    text,
    html,
  });

  return NextResponse.json({ ok: true });
} 