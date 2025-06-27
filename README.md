# Teoria Plus

Teoria Plus to nowoczesna aplikacja React Native (Expo) do nauki i ćwiczenia
egzaminu teoretycznego na prawo jazdy.

## Rozpoczęcie pracy

Aby uruchomić projekt lokalnie:

### Wymagania wstępne

- Node.js
- npm
- Expo CLI

### Instalacja

1. Sklonuj repozytorium:
   ```sh
   git clone https://github.com/your_username/teoria_plus.git
   cd teoria_plus
   ```
2. Zainstaluj zależności:
   ```sh
   npm install
   ```
3. Uruchom aplikację:
   ```sh
   npm start
   ```

## Dostępne skrypty

W katalogu projektu możesz uruchomić:

- `npm start` — uruchamia aplikację w trybie deweloperskim.
- `npm run android` — uruchamia aplikację na podłączonym urządzeniu/emulatorze
  Android.
- `npm run ios` — uruchamia aplikację na symulatorze iOS.
- `npm run web` — uruchamia aplikację w przeglądarce.
- `npm test` — uruchamia testy.

## Kluczowe zależności

- **Expo** — platforma do budowy aplikacji React Native.
- **React Native** — framework do budowy natywnych aplikacji mobilnych.
- **Expo Router** — plikowy router dla React Native i web.
- **Supabase** — backend (autoryzacja, baza pytań).
- **Appwrite** — przechowywanie i pobieranie plików multimedialnych.
- **React Navigation** — nawigacja w aplikacji.

## Struktura projektu

```
.
├── app/                # Kod aplikacji
│   ├── (tabs)/           # Nawigacja tabowa i tryby
│   ├── category/         # Widoki kategorii
│   └── ...
├── assets/             # Media, czcionki
├── components/         # Komponenty wielokrotnego użytku
├── constants/          # Stałe
├── utils/              # Funkcje pomocnicze
├── app.json            # Konfiguracja Expo
├── package.json        # Zależności
└── tsconfig.json       # Konfiguracja TypeScript
```

## Konfiguracja środowiska

Utwórz plik `.env` na podstawie `.env.example` i uzupełnij:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_APPWRITE_ENDPOINT`
- `EXPO_PUBLIC_APPWRITE_PROJECT_ID`
- `EXPO_PUBLIC_APPWRITE_BUCKET_ID`

## Pliki multimedialne (obrazy i wideo)

Aby aplikacja działała poprawnie, musisz pobrać oficjalne pliki multimedialne
(zdjęcia i filmy) ze strony rządowej:

- https://www.gov.pl/web/infrastruktura/prawo-jazdy

Następnie:

- Część plików umieść w katalogu `assets/images` (np. obrazy wykorzystywane
  lokalnie w aplikacji).
- Pozostałe pliki (np. większe filmy) załaduj do Appwrite Storage w swoim
  projekcie.

Możesz też umieścić wszystkie pliki lokalnie w katalogu `assets/images`, ale
wtedy aplikacja nie zbuduje się na Expo Go/OTA, ponieważ przekroczy limit
rozmiaru 2GB.

Aby wygenerować mapę plików do obsługi multimediów w aplikacji, możesz użyć
skryptu:

```
node generateMapMedia.js
```

Skrypt ten utworzy mapowanie nazw plików na ich lokalizacje, co ułatwia obsługę
zarówno plików lokalnych, jak i tych w Appwrite.

## Wkład

Chętnie przyjmujemy pull requesty i zgłoszenia błędów! Jeśli masz pomysł na
ulepszenie, otwórz issue lub stwórz PR.

## Licencja

Projekt na licencji MIT.
