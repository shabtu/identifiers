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
// { valid: true, entity_type: "Aktiebolag (AB)", normalized: "556614-3185" }

const iban = validateIBAN("SE45 5000 0000 0583 9825 7466");
// { valid: true, country: "SE", bban: "...", ... }
```

## Personnummer

Accepts 10-digit (`YYMMDD-XXXX`, `YYMMDD+XXXX`) and 12-digit (`YYYYMMDDXXXX`) formats.  
`+` separator indicates born more than 100 years ago.  
Samordningsnummer is detected automatically (day digit 61–91).

## Development

```bash
npm test        # run tests
npm run build   # compile to dist/
```
