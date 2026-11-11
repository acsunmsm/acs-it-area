import { limitedBody } from '@/src/lib/requestLimits';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// API Route: Maneja POST para enviar correos desde el formulario
export async function POST(request) {
  try {
    // Extraer datos enviados desde el formulario
    const formData = await limitedBody(request, { scope: 'contact', bytes: 32768, perMinute: 5, form: true });
    if (formData instanceof Response) return formData;

    const name = formData.get('name');
    const email = formData.get('email');
    const subject = formData.get('subject');
    const message = formData.get('message');
    const captcha = formData.get('g-recaptcha-response');

    // Verifica que se haya resuelto el CAPTCHA
    if (![name,email,subject,message,captcha].every(value => typeof value === 'string' && value.trim()) ||
        name.length > 150 || subject.length > 200 || email.length > 254 || message.length > 5000 ||
        captcha.length > 8192 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Revisa los campos y completa el CAPTCHA' }, { status: 400 });
    }

    // ✅ Verificar CAPTCHA con Google
    const verifyRes = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ secret: process.env.RECAPTCHA_SECRET_KEY, response: captcha }),
      signal: AbortSignal.timeout(10000),
    });

    const verifyData = await verifyRes.json();

    // Si Google indica que el captcha no es válido
    if (!verifyData.success) {
      return NextResponse.json({ error: 'Captcha inválido' }, { status: 400 });
    }

    // Configura el transporte
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: parseInt(process.env.MAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    // Detalles del correo que se enviará
    const mailOptions = {
      from: process.env.MAIL_USER,
      to: process.env.MAIL_TO,
      subject: `Nuevo mensaje de contacto: ${subject}`,
      text: `Este mensaje fue enviado por: ${name}\nCorreo: ${email}\nAsunto: ${subject}\nMensaje:\n${message}`,
    };

    await transporter.sendMail(mailOptions);

    // Manejo de errores generales
    return NextResponse.json({ message: 'Mensaje recibido correctamente' });
  } catch (error) {
    console.error('Error al procesar el formulario:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
