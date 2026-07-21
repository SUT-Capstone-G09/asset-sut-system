// Thailand province/district/subdistrict/zip-code lookup table, bundled
// locally instead of fetched at runtime from a third-party CDN.
//
// Data + decode format from earthchie/jquery.Thailand.js (MIT), vendored via
// the `use-thai-address` package's compressed encoding. Re-run the snippet
// below to refresh thai-address-db.json if the upstream dataset ever changes:
//
//   curl -o thai-address-db.json \
//     https://cdn.jsdelivr.net/gh/earthchie/jquery.Thailand.js/jquery.Thailand.js/database/db.json

import compressed from "./thai-address-db.json";

export interface ThaiAddressItem {
  subDistrict: string;
  district: string;
  province: string;
  zipCode: string;
}

interface CompressedDataSource {
  data: [string | number, [string | number, [string | number, number | number[]][]][]][];
  lookup: string;
  words: string;
}

function getWordByChar(words: string[]) {
  return (indicator: string) => {
    const char = indicator.charCodeAt(0);
    return words[char < 97 ? char - 65 : 26 + char - 97];
  };
}

function compileWord(wordList: string[], lookupList: string[], text: string | number): string {
  const result = typeof text === "number" ? lookupList[text] : text;
  return String(result).replace(/[A-Z]/gi, getWordByChar(wordList));
}

function expand(source: CompressedDataSource): ThaiAddressItem[] {
  const items: ThaiAddressItem[] = [];
  const wordList = source.words.split("|");
  const lookupList = source.lookup.split("|");

  for (const [provinceName, districtList] of source.data) {
    for (const [districtName, subdistrictList] of districtList) {
      for (const [subdistrictName, postcodeList] of subdistrictList) {
        const zipCodes = Array.isArray(postcodeList) ? postcodeList : [postcodeList];
        for (const zipCode of zipCodes) {
          items.push({
            province: compileWord(wordList, lookupList, provinceName),
            district: compileWord(wordList, lookupList, districtName),
            subDistrict: compileWord(wordList, lookupList, subdistrictName),
            zipCode: String(zipCode),
          });
        }
      }
    }
  }
  return items;
}

// Expanded once at module load — no network fetch, no loading state needed.
export const thaiAddressData: ThaiAddressItem[] = expand(compressed as CompressedDataSource);
