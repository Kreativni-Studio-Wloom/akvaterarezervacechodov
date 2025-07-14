# Nastavení aplikace - Rezervace stolů na burze

## 1. Firebase nastavení

### Vytvoření Firebase projektu

1. Jděte na [Firebase Console](https://console.firebase.google.com)
2. Klikněte "Create a project"
3. Zadejte název projektu (např. "akvarezervace")
4. Povolte Google Analytics (volitelné)
5. Klikněte "Create project"

### Povolení Authentication

1. V levém menu klikněte "Authentication"
2. Klikněte "Get started"
3. Přejděte na záložku "Users"
4. Klikněte "Add user"
5. Zadejte e-mail a heslo pro admina (např. admin@example.com)
6. Klikněte "Add user"

### Povolení Firestore Database

1. V levém menu klikněte "Firestore Database"
2. Klikněte "Create database"
3. Vyberte "Start in test mode"
4. Vyberte umístění databáze (např. europe-west3)
5. Klikněte "Done"

### Získání konfigurace

1. Klikněte na ikonu ozubeného kola (⚙️) vedle "Project Overview"
2. Vyberte "Project settings"
3. Scrollujte dolů na "Your apps"
4. Klikněte na ikonu webu (</>)
5. Zadejte název aplikace (např. "akvarezervace-web")
6. Klikněte "Register app"
7. Zkopírujte konfiguraci:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

## 2. SendGrid nastavení

### Vytvoření účtu

1. Jděte na [SendGrid](https://sendgrid.com)
2. Vytvořte účet (můžete použít free tier)
3. Ověřte e-mailovou adresu

### Vytvoření API klíče

1. V SendGrid dashboardu jděte na "Settings" > "API Keys"
2. Klikněte "Create API Key"
3. Zadejte název (např. "akvarezervace-api")
4. Vyberte "Restricted Access"
5. Povolte pouze "Mail Send"
6. Klikněte "Create API Key"
7. Zkopírujte API klíč

### Ověření odesílatele

1. Jděte na "Settings" > "Sender Authentication"
2. Klikněte "Verify a Single Sender"
3. Vyplňte formulář s vaší e-mailovou adresou
4. Klikněte "Create"
5. Ověřte e-mail, který vám přijde

## 3. Environment proměnné

Vytvořte soubor `.env.local` v kořenovém adresáři projektu:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# SendGrid Configuration
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=your_verified_sender@example.com
```

## 4. Spuštění aplikace

### Instalace závislostí

```bash
npm install
```

### Spuštění vývojového serveru

```bash
npm run dev
```

### Inicializace stolů

Po spuštění aplikace je potřeba inicializovat stoly v databázi:

```bash
curl -X POST http://localhost:3000/api/init
```

Nebo můžete použít Postman nebo jiný HTTP klient.

## 5. Testování

### Testování klienta

1. Otevřete [http://localhost:3000](http://localhost:3000)
2. Klikněte na volné stoly (tmavě modré)
3. Vyplňte formulář s testovacími údaji
4. Potvrďte rezervaci
5. Zkontrolujte, že vám přišel e-mail

### Testování admina

1. Klikněte na "Admin" v hlavním menu
2. Přihlaste se pomocí Firebase účtu
3. Zobrazí se dashboard s rezervacemi
4. Testujte schvalování/zamítání rezervací

## 6. Troubleshooting

### Problémy s Firebase

- Zkontrolujte, že máte správně nastavené environment proměnné
- Ujistěte se, že je povolená Authentication a Firestore
- Zkontrolujte Firestore pravidla (měly by být v testovacím režimu)

### Problémy s SendGrid

- Zkontrolujte, že je API klíč správně nastaven
- Ujistěte se, že je odesílatel ověřen
- Zkontrolujte SendGrid dashboard pro chyby

### Problémy s aplikací

- Zkontrolujte konzoli prohlížeče pro chyby
- Ujistěte se, že všechny závislosti jsou nainstalovány
- Restartujte vývojový server

## 7. Deployment

### Vercel

1. Pushněte kód na GitHub
2. Jděte na [Vercel](https://vercel.com)
3. Importujte GitHub repozitář
4. Nastavte environment proměnné v Vercel dashboardu
5. Deployujte aplikaci

### Jiné platformy

Aplikaci můžete nasadit na jakoukoliv platformu, která podporuje Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 8. Bezpečnost

### Produkční nasazení

- Změňte Firestore pravidla z testovacího režimu
- Nastavte správná oprávnění pro admina
- Použijte HTTPS
- Omezte přístup k admin rozhraní

### Monitoring

- Nastavte Firebase Analytics
- Monitorujte SendGrid delivery rates
- Logujte chyby aplikace 