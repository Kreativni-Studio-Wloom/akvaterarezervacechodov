# Rezervace stolů na burze

Moderní webová aplikace pro rezervaci stolů na burze s administrátorským rozhraním.

## Funkce

### Pro klienty:
- Zobrazení plánu stolů v gridu 8x8
- Výběr více stolů pro rezervaci
- Formulář pro zadání kontaktních údajů
- Automatické odesílání potvrzovacích e-mailů
- Blokování vybraných stolů během rezervace

### Pro administrátory:
- Zabezpečené přihlášení
- Přehled všech rezervací
- Schvalování/zamítání rezervací
- Mazání jednotlivých rezervací
- Automatické e-mailové notifikace

## Technologie

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Firebase (Authentication, Firestore)
- **E-maily**: SendGrid
- **UI**: Lucide React icons, React Hot Toast

## Instalace

1. **Klonujte repozitář**
```bash
git clone <repository-url>
cd akvarezervace
```

2. **Nainstalujte závislosti**
```bash
npm install
```

3. **Nastavte environment proměnné**
Vytvořte soubor `.env.local` s následujícím obsahem:

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

## Nastavení Firebase

1. **Vytvořte Firebase projekt** na [console.firebase.google.com](https://console.firebase.google.com)

2. **Povolte Authentication** a vytvořte uživatele pro admina:
   - Přejděte na Authentication > Users
   - Klikněte "Add User"
   - Zadejte e-mail a heslo pro admina

3. **Povolte Firestore Database**:
   - Přejděte na Firestore Database
   - Vytvořte databázi v testovacím režimu
   - Nastavte pravidla pro čtení/zápis

4. **Zkopírujte konfiguraci** z Project Settings > General

## Nastavení SendGrid

1. **Vytvořte účet** na [sendgrid.com](https://sendgrid.com)

2. **Vytvořte API klíč**:
   - Přejděte na Settings > API Keys
   - Vytvořte nový API klíč s právy "Mail Send"

3. **Ověřte odesílatele**:
   - Přejděte na Settings > Sender Authentication
   - Ověřte doménu nebo jednotlivý e-mail

## Spuštění aplikace

1. **Spusťte vývojový server**
```bash
npm run dev
```

2. **Inicializujte stoly** (pouze při prvním spuštění)
```bash
curl -X POST http://localhost:3000/api/init
```

3. **Otevřete aplikaci** na [http://localhost:3000](http://localhost:3000)

## Použití

### Pro klienty:
1. Otevřete hlavní stránku
2. Klikněte na volné stoly (tmavě modré)
3. Vyplňte formulář s kontaktními údaji
4. Potvrďte rezervaci
5. Počkejte na e-mail s potvrzením

### Pro administrátory:
1. Klikněte na "Admin" v hlavním menu
2. Přihlaste se pomocí Firebase účtu
3. Zobrazí se dashboard s rezervacemi
4. Schvalujte/zamítejte rezervace pomocí tlačítek
5. Mazat rezervace pomocí koše

## Struktura projektu

```
src/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin stránky
│   ├── api/               # API endpoints
│   └── page.tsx           # Hlavní stránka
├── components/            # React komponenty
│   ├── AdminDashboard.tsx
│   ├── AdminLogin.tsx
│   ├── ReservationForm.tsx
│   └── TableGrid.tsx
├── lib/                   # Služby a konfigurace
│   ├── firebase.ts
│   ├── services.ts
│   └── email.ts
└── types/                 # TypeScript typy
    └── index.ts
```

## Plán stolů

Aplikace používá grid 8x8 stolů s následujícími typy:

- **Tmavě modré**: Volné stoly (rezervovatelné)
- **Světle modré**: Permanentně rezervované stoly
- **Zelené**: Vchod (orientační)
- **Žluté okraje**: Vybrané stoly

## Deployment

Aplikaci můžete nasadit na Vercel:

1. **Připojte GitHub repozitář** k Vercel
2. **Nastavte environment proměnné** v Vercel dashboardu
3. **Deployujte aplikaci**

## Bezpečnost

- Admin přihlášení je zabezpečeno Firebase Authentication
- Firestore pravidla omezují přístup k datům
- E-mailové adresy jsou ověřeny přes SendGrid
- Rezervace jsou chráněny před duplikací

## Podpora

Pro technickou podporu kontaktujte vývojový tým.
