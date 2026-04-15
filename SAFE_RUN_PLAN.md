# TrainerOS Safe Run Plan

Acest plan este pentru inspectare si rulare locala cu risc minim, fara sa atingi productia, chei reale sau servicii externe inutile.

## 1. Principii

- Nu rula scripturi custom `.sh` din `mobile/` la primul contact cu proiectul.
- Nu folosi directoarele `dist/` existente; rebuild doar din sursa.
- Nu pune chei reale in `.env` pana nu confirmi comportamentul aplicatiei.
- Nu lasa `admin` sau `mobile` sa foloseasca fallback-urile hardcodate spre `https://api.traineros.org/api`.
- Ruleaza doar web frontend + backend local in prima faza.

## 2. Ce este sensibil in proiect

- `backend` scrie in baza de date prin Prisma.
- `backend` poate trimite request-uri catre:
  - OpenAI / Gemini / Anthropic / OpenRouter
  - Stripe
  - SendGrid
- `backend` ruleaza `ffmpeg` prin shell pentru analiza video.
- `admin` are fallback direct catre API-ul de productie daca `VITE_API_BASE_URL` lipseste.
- `mobile` are `API_URL` hardcodat catre `https://api.traineros.org/api`, deci nu trebuie pornit inainte de patch sau override.

## 3. Mod de lucru recomandat

Faza 1:
- audit static
- instalare dependinte fara lifecycle scripts
- build local fara start

Faza 2:
- backend local cu DB locala goala
- frontend web local legat strict la backend local

Faza 3:
- admin local doar dupa setarea explicita a `VITE_API_BASE_URL`

Faza 4:
- mobile doar dupa schimbarea bazei API pe local/staging

## 4. Izolare recomandata

Minim acceptabil:
- user local separat sau folder de lucru separat
- fara chei reale
- Postgres local dedicat acestui proiect

Mai bine:
- Docker/OrbStack/Colima pentru Postgres
- shell nou cu env curat

Ideal:
- masina virtuala sau container dev complet separat

## 5. Instalare sigura a dependintelor

Ruleaza fiecare proiect separat cu lifecycle scripts oprite:

```bash
cd /Users/florin/Desktop/traineros-org-main/backend && npm ci --ignore-scripts
cd /Users/florin/Desktop/traineros-org-main/frontend && npm ci --ignore-scripts
cd /Users/florin/Desktop/traineros-org-main/admin && npm ci --ignore-scripts
cd /Users/florin/Desktop/traineros-org-main/mobile && npm ci --ignore-scripts
```

Observatii:
- `package.json` nu contine `preinstall` sau `postinstall`, ceea ce e bine.
- In lockfile apar doar install scripts normale pentru tool-uri cunoscute precum `prisma`, `esbuild`, `fsevents`.
- Dupa `npm ci --ignore-scripts`, nu porni direct tot proiectul. Fa build-uri locale controlat.

## 6. Build fara rulare

```bash
cd /Users/florin/Desktop/traineros-org-main/backend && npm run build
cd /Users/florin/Desktop/traineros-org-main/frontend && npm run build
cd /Users/florin/Desktop/traineros-org-main/admin && npm run build
cd /Users/florin/Desktop/traineros-org-main/mobile && npm run typecheck
```

Scop:
- verifici ca sursa se compileaza
- nu executi functionalitati de business
- nu atingi API-uri externe

## 7. Baza de date locala

Proiectul foloseste PostgreSQL prin Prisma. Nu folosi baza clientului sau productie.

Exemplu sigur:

```bash
createdb traineros_safe
```

`backend/.env` minim pentru prima rulare:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://localhost:5432/traineros_safe
JWT_SECRET=dev-only-not-secret
FRONTEND_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173,http://localhost:5174
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
TRUST_PROXY=0

SENDGRID_API_KEY=
OPENAI_API_KEY=
GEMINI_API_KEY=
GOOGLE_API_KEY=
ANTHROPIC_API_KEY=
OPENROUTER_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_MONTHLY_PRICE_ID=
STRIPE_YEARLY_PRICE_ID=
STRIPE_MAX_MONTHLY_PRICE_ID=
STRIPE_MAX_YEARLY_PRICE_ID=
STRIPE_MONTHLY_PRODUCT_ID=
STRIPE_YEARLY_PRODUCT_ID=
STRIPE_MAX_MONTHLY_PRODUCT_ID=
STRIPE_MAX_YEARLY_PRODUCT_ID=
```

Note:
- fara chei reale, endpoint-urile AI/Stripe/email trebuie considerate blocate intentionat
- emailul in `NODE_ENV=development` este deja gandit sa sara peste trimitere daca `SENDGRID_API_KEY` lipseste

## 8. Initializare DB locala

Dupa ce `backend/.env` exista:

```bash
cd /Users/florin/Desktop/traineros-org-main/backend
npx prisma generate
npx prisma db push
```

Optional, pentru un admin local:

```bash
npm run admin:bootstrap
```

Atentie:
- comanda de bootstrap scrie in DB locala
- nu o rula pana nu ai confirmat ca `DATABASE_URL` este locala

## 9. Prima rulare sigura

Porneste numai backend + frontend web.

Backend:

```bash
cd /Users/florin/Desktop/traineros-org-main/backend
npm run dev
```

Frontend:

```bash
cd /Users/florin/Desktop/traineros-org-main/frontend
npm run dev
```

De ce frontend-ul e ok primul:
- in `DEV`, frontend-ul foloseste `/api`, nu productia
- poate fi proxiat local fara sa atinga `api.traineros.org`

## 10. Admin: reguli stricte

`admin` NU trebuie pornit fara variabila explicita:

```bash
cd /Users/florin/Desktop/traineros-org-main/admin
VITE_API_BASE_URL=http://localhost:3000/api npm run dev
```

Daca pornesti `admin` fara asta, codul cade pe fallback la:

```text
https://api.traineros.org/api
```

## 11. Mobile: nu in prima etapa

`mobile/src/services/api.ts` foloseste hardcodat:

```text
https://api.traineros.org/api
```

Asta inseamna:
- daca pornesti mobile acum, exista risc mare sa loveasca backend-ul real
- nu il porni pana nu este schimbat sa foloseasca env local sau staging controlat

## 12. Ce endpoint-uri sa eviti la primul run

Evita:
- orice flux Stripe
- analiza video/text care loveste provideri AI
- email reset / activation daca nu ai nevoie de ele
- upload-uri mari sau testare ffmpeg

Testeaza doar:
- `GET /health`
- paginile publice din frontend
- eventual `register/login/me` pe DB locala, cu email extern dezactivat

## 13. Smoke test minim

Ordinea corecta:

1. `backend`: verifica `http://localhost:3000/health`
2. `frontend`: incarca pagina principala
3. verifica in DevTools ca request-urile merg la `localhost`, nu la `traineros.org`
4. abia dupa asta testezi auth local

## 14. Indicatori de oprire imediata

Opreste tot daca vezi:
- request-uri catre `api.traineros.org` cand credeai ca esti local
- request-uri catre Stripe/OpenAI/Anthropic/Gemini/OpenRouter fara intentie
- erori Prisma care indica o baza neasteptata
- scripturi care incearca sa modifice fisiere in afara proiectului

## 15. Ce NU folosi din repo la prima rulare

Evita:
- `mobile/RUN_WEB.sh`
- `mobile/RUN_APP.sh`
- `mobile/TEST_SIMPLE.sh`

Motiv:
- sunt scripturi ad-hoc
- unul are path hardcodat spre alt folder din Desktop
- pentru primul contact cu repo-ul e mai sigur sa rulezi comenzi manuale

## 16. Verdict practic

Pentru lucru sigur, ruta recomandata este:

1. `npm ci --ignore-scripts` peste tot
2. build local
3. DB locala goala
4. backend local cu `.env` fara chei reale
5. frontend local
6. admin local doar cu `VITE_API_BASE_URL=http://localhost:3000/api`
7. mobile abia dupa patch

## 17. Pasul urmator recomandat

Daca vrei o sesiune de lucru cu risc minim, urmatorul pas util este:
- sa patch-uim repo-ul ca `admin` si `mobile` sa foloseasca env local explicit, fara fallback spre productie
- apoi sa facem un smoke test local controlat
