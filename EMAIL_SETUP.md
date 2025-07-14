# Nastavení emailů pro rezervační systém

## Konfigurace SendGrid

### 1. Vytvoření SendGrid účtu
1. Jděte na https://sendgrid.com a vytvořte účet
2. Ověřte doménu `rajmazlicku.eu` v SendGrid
3. Vytvořte API key s oprávněními pro odesílání emailů

### 2. Nastavení environment proměnných
Vytvořte soubor `.env.local` v kořenovém adresáři projektu:

```env
# SendGrid API Key pro odesílání emailů
SENDGRID_API_KEY=your_sendgrid_api_key_here

# Email adresa pro odesílání (musí být ověřená v SendGrid)
SENDER_EMAIL=info@rajmazlicku.eu
```

### 3. Ověření domény
1. V SendGrid Dashboard jděte na Settings > Sender Authentication
2. Ověřte doménu `rajmazlicku.eu`
3. Přidejte DNS záznamy podle instrukcí SendGrid

### 4. Testování
Po nastavení můžete testovat odesílání emailů:
- Vytvoření rezervace - pošle se potvrzovací email
- Schválení rezervace - pošle se email o schválení
- Zamítnutí rezervace - pošle se email o zamítnutí

## Funkce emailů

### Potvrzovací email
- Odesílá se při vytvoření rezervace
- Obsahuje informace o čekající rezervaci
- Kopie se posílá na `info@rajmazlicku.eu`

### Email o schválení
- Odesílá se při schválení rezervace
- Obsahuje potvrzení schválení
- Kopie se posílá na `info@rajmazlicku.eu`

### Email o zamítnutí
- Odesílá se při zamítnutí rezervace
- Obsahuje informaci o zamítnutí
- Kopie se posílá na `info@rajmazlicku.eu`

## Bezpečnost
- Všechny emaily se posílají z ověřené domény `info@rajmazlicku.eu`
- API key je uložen v environment proměnných
- Kopie všech emailů se posílají na admin email

## Troubleshooting
- Pokud se emaily neposílají, zkontrolujte SendGrid API key
- Zkontrolujte, zda je doména ověřená v SendGrid
- Prohlédněte si logy v konzoli pro debugging 