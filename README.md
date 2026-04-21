# Swedish Identifiers

TypeScript library for validating Swedish identifiers.

## Supported identifiers

| Identifier | Description |
|---|---|
| Personnummer | Swedish personal identity number |
| Samordningsnummer | Coordination number (day +60) |
| Organisationsnummer | Swedish organisation number |
| Bankgiro | BG payment number |
| Plusgiro | PG payment number |
| Kontonummer | Bank account (clearing + account) |
| IBAN | International bank account (SE and others) |

## Install

```bash
npm install swedish-identifiers
```

## Usage

```typescript
import {
  validatePersonnummer,
  validateOrgnummer,
  validateBankgiro,
  validatePlusgiro,
  validateKontonummer,
  validateIBAN,
} from "swedish-identifiers";

const pnr = validatePersonnummer("811228-9874");
// { valid: true, type: "personnummer", age: 44, is_male: true, ... }

const org = validateOrgnummer("556614-3185");
// { valid: true, entity_type: "Enkelt bolag / Enskild firma", normalized: "556614-3185" }

const iban = validateIBAN("SE45 5000 0000 0583 9825 7466");
// { valid: true, country: "SE", bban: "...", ... }
```

## Personnummer

Accepts 10-digit (`YYMMDD-XXXX`, `YYMMDD+XXXX`) and 12-digit (`YYYYMMDDXXXX`) formats.  
`+` separator indicates born more than 100 years ago.  
Samordningsnummer is detected automatically (day digit 61–91).

## Official references

Each validator is implemented against official Swedish specifications:

| Identifier | Authority | Reference |
|---|---|---|
| Personnummer | Skatteverket | [Personal identity number (English)](https://www.skatteverket.se/servicelankar/otherlanguages/inenglish/individualsandemployees/livinginsweden/personalidentitynumberandcoordinationnumber.4.2cf1b5cd163796a5c8b4295.html) |
| Personnummer (technical) | Sweden Connect | [SKV709-8 specification (PDF)](https://docs.swedenconnect.se/technical-framework/mirror/skv/skv709-8.pdf) |
| Samordningsnummer | Skatteverket | [Coordination numbers (English)](https://skatteverket.se/servicelankar/otherlanguages/englishengelska/individualsandemployees/coordinationnumbers.4.1657ce2817f5a993c3a7d2a.html) |
| Organisationsnummer | Bolagsverket | [Company registry search](https://foretagsinfo.bolagsverket.se/sok-foretagsinformation-web/) |
| Bankgiro | Bankgirot | [Bankgiro number (English)](https://www.bankgirot.se/en/services/incoming-payments/bankgiro-number/) |
| Plusgiro | Nordea | No public spec — contact Nordea directly |
| IBAN | ISO 13616 | [IBAN structure](https://www.iban.com/structure) |

### Checksum algorithm

All identifiers except IBAN use the **Luhn algorithm (mod 10)**:

1. From left to right, multiply alternating digits by `2, 1, 2, 1, ...`
2. If any product exceeds 9, subtract 9
3. Sum all results — a valid number sums to a multiple of 10

IBAN uses **ISO 7064 mod-97**: rearrange as `BBAN + country code + check digits`, convert letters to numbers (A=10…Z=35), compute mod 97 — result must equal 1.

## Development

```bash
npm test        # run tests
npm run build   # compile to dist/
```

## Agent / LLM access

See [`llms.txt`](https://shabtu.github.io/identifiers/llms.txt) for a machine-readable summary of this library's API and validation rules.
