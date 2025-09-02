// Check what zone the current city belongs to
export function getZone(city, userInfo) {
  if (!city || !userInfo) return "Unknown";

  const hq = userInfo.hq?.toLowerCase();
  const exCities = userInfo.ex ?? [];
  const osCities = userInfo.os ?? [];
  const cityLower = city.toLowerCase();

  if (hq && cityLower === hq) return "HQ";
  if (exCities.map(c => c.toLowerCase()).includes(cityLower)) return "EX";
  if (osCities.map(c => c.toLowerCase()).includes(cityLower)) return "OS";

  return "Unknown";
}

// Calculate total expense for a row
export function getTotal(fare = 0, da = 0, other = 0) {
  return Number(fare) + Number(da) + Number(other);
}
