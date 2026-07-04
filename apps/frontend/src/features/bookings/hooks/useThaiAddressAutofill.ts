import { useMemo, type Dispatch, type SetStateAction } from "react";
import { useThaiAddress } from "use-thai-address";

export interface AddressFormFields {
  subdistrict: string;
  district: string;
  province: string;
  postalCode: string;
}

/**
 * Postal code lookup: auto-fills subdistrict/district/province once a full
 * 5-digit code is entered. A zip code can span several subdistricts across
 * different districts (e.g. 30000 covers 20 subdistricts, one of which sits
 * in a different amphoe from the other 19) — rather than guess, whichever of
 * subdistrict/district is still ambiguous after narrowing gets turned into a
 * dropdown of the exact candidates instead of being auto-filled.
 */
export function useThaiAddressAutofill<T extends AddressFormFields>(
  form: T,
  setForm: Dispatch<SetStateAction<T>>
) {
  const { data: thaiAddressData } = useThaiAddress();

  const postalMatches = useMemo(
    () => (form.postalCode.length === 5 && thaiAddressData
      ? thaiAddressData.filter((m) => m.zipCode === form.postalCode)
      : []),
    [thaiAddressData, form.postalCode]
  );

  // District dropdown narrows the subdistrict dropdown to just its own
  // subdistricts (e.g. picking "เมืองนครราชสีมา" for zip 30000 filters the
  // 20 candidates down to its 19) — falls back to the full match list until
  // a district is chosen.
  const relevantMatches = form.district
    ? postalMatches.filter((m) => m.district === form.district)
    : postalMatches;
  const subdistrictOptions = relevantMatches.length > 1 ? relevantMatches.map((m) => m.subDistrict) : undefined;

  // Ambiguity is judged by *distinct* districts, not raw row count — a zip
  // with 20 subdistricts that all share one district is still unambiguous
  // at the district level and should fill in directly, no dropdown needed.
  const distinctDistricts = Array.from(new Set(postalMatches.map((m) => m.district)));
  const districtOptions = distinctDistricts.length > 1 ? distinctDistricts : undefined;

  const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.value;
    setForm((p) => {
      const matches = value.length === 5 && thaiAddressData ? thaiAddressData.filter((m) => m.zipCode === value) : [];
      if (matches.length === 0) return { ...p, postalCode: value };
      const [first, ...rest] = matches;
      const sameProvince = rest.every((m) => m.province === first.province);
      const sameDistrict = rest.every((m) => m.district === first.district);
      return {
        ...p,
        postalCode: value,
        subdistrict: matches.length === 1 ? first.subDistrict : "",
        district: sameDistrict ? first.district : "",
        province: sameProvince ? first.province : "",
      };
    });
  };

  // Fires for both the free-text input (unique/no zip yet) and the dropdown
  // (ambiguous zip) — only cascades district/province when the chosen value
  // is an exact match from the current (district-filtered) candidate list.
  const handleSubdistrictChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.value;
    const match = relevantMatches.find((m) => m.subDistrict === value);
    setForm((p) => ({
      ...p,
      subdistrict: value,
      district: match ? match.district : p.district,
      province: match ? match.province : p.province,
    }));
  };

  // Picking a district: if it narrows to exactly one subdistrict, fill it;
  // otherwise clear subdistrict so the user picks again from the
  // now-filtered dropdown rather than keeping a stale value from a
  // different district.
  const handleDistrictChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.value;
    const matchesForDistrict = postalMatches.filter((m) => m.district === value);
    setForm((p) => ({
      ...p,
      district: value,
      subdistrict: matchesForDistrict.length === 1
        ? matchesForDistrict[0].subDistrict
        : (matchesForDistrict.length > 1 ? "" : p.subdistrict),
    }));
  };

  return {
    subdistrictOptions,
    districtOptions,
    handlePostalCodeChange,
    handleSubdistrictChange,
    handleDistrictChange,
  };
}
