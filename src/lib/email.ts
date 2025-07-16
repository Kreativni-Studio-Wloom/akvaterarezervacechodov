import nodemailer from 'nodemailer';

const ADMIN_EMAIL = process.env.EMAIL_FROM || 'info@rajmazlicku.eu';

const getConfirmationEmailHTML = (firstName: string, lastName: string, tableIds: string[]) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Potvrzení rezervace</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9fafb; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        .highlight { background-color: #dbeafe; padding: 10px; border-radius: 5px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Potvrzení rezervace stolů</h1>
        </div>
        <div class="content">
            <p>Dobrý den ${firstName} ${lastName},</p>
            
            <p>děkujeme za Vaši rezervaci stolů na burze.</p>
            
            <div class="highlight">
                <strong>Rezervace čeká na schválení</strong><br>
                Počet rezervovaných stolů: ${tableIds.length}
            </div>
            
            <p>Vaše rezervace byla úspěšně přijata a čeká na schválení administrátorem. 
            O výsledku Vás budeme informovat e-mailem.</p>
            
            <p>V případě dotazů nás kontaktujte na <a href="mailto:${ADMIN_EMAIL}">${ADMIN_EMAIL}</a></p>
        </div>
        <div class="footer">
            <p>Rezervace stolů - ${ADMIN_EMAIL}</p>
        </div>
    </div>
</body>
</html>
`;

const getApprovalEmailHTML = (firstName: string, lastName: string, approved: boolean, tableIds: string[]) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${approved ? 'Schválení' : 'Zamítnutí'} rezervace</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: ${approved ? '#059669' : '#dc2626'}; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9fafb; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        .highlight { background-color: ${approved ? '#d1fae5' : '#fee2e2'}; padding: 10px; border-radius: 5px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${approved ? 'Schválení' : 'Zamítnutí'} rezervace stolů</h1>
        </div>
        <div class="content">
            <p>Dobrý den ${firstName} ${lastName},</p>
            
            ${approved ? 
                `<p>Vaše rezervace stolů byla <strong>schválena</strong>.</p>
                <div class="highlight">
                    <strong>Rezervace je potvrzena</strong><br>
                    Počet schválených stolů: ${tableIds.length}
                </div>
                <p>Vaše stoly jsou nyní rezervované a připravené k použití.</p>` :
                `<p>Vaše rezervace stolů byla <strong>zamítnuta</strong>.</p>
                <div class="highlight">
                    <strong>Rezervace nebyla schválena</strong><br>
                    Počet zamítnutých stolů: ${tableIds.length}
                </div>
                <p>Stoly jsou nyní opět volné pro rezervaci.</p>`
            }
            
            <p>V případě dotazů nás kontaktujte na <a href="mailto:${ADMIN_EMAIL}">${ADMIN_EMAIL}</a></p>
        </div>
        <div class="footer">
            <p>Rezervace stolů - ${ADMIN_EMAIL}</p>
        </div>
    </div>
</body>
</html>
`;

const getConfirmationEmailText = (firstName: string, lastName: string, tableIds: string[]) => `
Potvrzení rezervace stolů

Dobrý den ${firstName} ${lastName},

děkujeme za Vaši rezervaci stolů na burze.

Rezervace čeká na schválení
Počet rezervovaných stolů: ${tableIds.length}

Vaše rezervace byla úspěšně přijata a čeká na schválení administrátorem. 
O výsledku Vás budeme informovat e-mailem.

V případě dotazů nás kontaktujte na ${ADMIN_EMAIL}

--
Rezervace stolů - ${ADMIN_EMAIL}
`;

const getApprovalEmailText = (firstName: string, lastName: string, approved: boolean, tableIds: string[]) => `
${approved ? 'Schválení' : 'Zamítnutí'} rezervace stolů

Dobrý den ${firstName} ${lastName},

${approved ? 
    `Vaše rezervace stolů byla schválena.

Rezervace je potvrzena
Počet schválených stolů: ${tableIds.length}

Vaše stoly jsou nyní rezervované a připravené k použití.` :
    `Vaše rezervace stolů byla zamítnuta.

Rezervace nebyla schválena
Počet zamítnutých stolů: ${tableIds.length}

Stoly jsou nyní opět volné pro rezervaci.`
}

V případě dotazů nás kontaktujte na ${ADMIN_EMAIL}

--
Rezervace stolů - ${ADMIN_EMAIL}
`;

const getCancelledEmailHTML = (firstName: string, lastName: string, tableIds: string[]) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Zrušení rezervace</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9fafb; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        .highlight { background-color: #fee2e2; padding: 10px; border-radius: 5px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Zrušení rezervace</h1>
        </div>
        <div class="content">
            <p>Dobrý den ${firstName} ${lastName},</p>
            <div class="highlight">
                <strong>Vaše rezervace byla zrušena administrátorem.</strong><br>
                Počet zrušených stolů: ${tableIds.length}
            </div>
            <p>Stoly jsou nyní opět volné pro rezervaci.</p>
            <p>V případě dotazů nás kontaktujte na <a href="mailto:${ADMIN_EMAIL}">${ADMIN_EMAIL}</a></p>
        </div>
        <div class="footer">
            <p>Rezervace stolů - ${ADMIN_EMAIL}</p>
        </div>
    </div>
</body>
</html>
`;

const getCancelledEmailText = (firstName: string, lastName: string, tableIds: string[]) => `
Zrušení rezervace

Dobrý den ${firstName} ${lastName},

Vaše rezervace byla zrušena administrátorem.
Počet zrušených stolů: ${tableIds.length}

Stoly jsou nyní opět volné pro rezervaci.

V případě dotazů nás kontaktujte na ${ADMIN_EMAIL}

--
Rezervace stolů - ${ADMIN_EMAIL}
`;

export const sendConfirmationEmail = async (email: string, firstName: string, lastName: string, tableIds: string[]) => {
  const subject = 'Potvrzení rezervace stolů';
  const html = getConfirmationEmailHTML(firstName, lastName, tableIds);
  const text = getConfirmationEmailText(firstName, lastName, tableIds);
  await fetch('/api/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to: email, subject, html, text }),
  });
};

export const sendApprovalEmail = async (email: string, firstName: string, lastName: string, approved: boolean, tableIds: string[]) => {
  const subject = `${approved ? 'Schválení' : 'Zamítnutí'} rezervace stolů`;
  const html = getApprovalEmailHTML(firstName, lastName, approved, tableIds);
  const text = getApprovalEmailText(firstName, lastName, approved, tableIds);
  await fetch('/api/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to: email, subject, html, text }),
  });
}; 

export const sendCancelledEmail = async (email: string, firstName: string, lastName: string, tableIds: string[]) => {
  const subject = 'Zrušení rezervace';
  const html = getCancelledEmailHTML(firstName, lastName, tableIds);
  const text = getCancelledEmailText(firstName, lastName, tableIds);
  await fetch('/api/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to: email, subject, html, text }),
  });
}; 