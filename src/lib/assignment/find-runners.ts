import { createAdminClient } from "@/lib/supabase/server";

/** Maximum concurrent active jobs a single runner can have */
const MAX_CONCURRENT_JOBS = 3;

/**
 * Zone definitions: regex patterns that match Dublin addresses.
 * Each entry maps a zone name to patterns for postcodes + neighbourhoods.
 *
 * Expansion strategy for new cities:
 * 1. Add a service_areas table (city, country, center_lat, center_lng, active)
 * 2. Move zone definitions to a zones table (name, service_area_id, patterns[])
 * 3. Load zone patterns from DB instead of this hardcoded map
 * 4. For now, this hardcoded approach works perfectly for Dublin-only.
 */
const ZONE_PATTERNS: { zone: string; pattern: RegExp }[] = [
  // Dublin postal districts
  { zone: "Dublin City Centre (D1)", pattern: /dublin\s*1\b|d01|\bd1\b|\bcity cent|o'connell|grafton|abbey\s*st|henry\s*st|parnell/i },
  { zone: "Dublin 2 (St Stephen's Green)", pattern: /dublin\s*2\b|d02|\bd2\b|merrion|baggot|pearse|st\s*stephen|dawson\s*st|nassau/i },
  { zone: "Dublin 3 (Clontarf)", pattern: /dublin\s*3\b|d03|\bd3\b|clontarf|fairview|east\s*wall|north\s*strand/i },
  { zone: "Dublin 4 (Ballsbridge)", pattern: /dublin\s*4\b|d04|\bd4\b|ballsbridge|donnybrook|sandymount|irishtown|ringsend/i },
  { zone: "Dublin 5 (Raheny)", pattern: /dublin\s*5\b|d05|\bd5\b|raheny|artane|harmonstown|kilbarrack/i },
  { zone: "Dublin 6 (Rathmines)", pattern: /dublin\s*6\b|d06|\bd6\b|ranelagh|rathmines|rathgar|milltown/i },
  { zone: "Dublin 6W (Terenure)", pattern: /dublin\s*6w|d6w|terenure|templeogue|harold'?s\s*cross|kimmage/i },
  { zone: "Dublin 7 (Phibsborough)", pattern: /dublin\s*7\b|d07|\bd7\b|phibs?borough|stoneybatter|smithfield|cabra|grangegorman/i },
  { zone: "Dublin 8 (Portobello)", pattern: /dublin\s*8\b|d08|\bd8\b|portobello|kilmainham|inchicore|liberties|the\s*coombe|dolphin/i },
  { zone: "Dublin 9 (Drumcondra)", pattern: /dublin\s*9\b|d09|\bd9\b|drumcondra|glasnevin|beaumont|whitehall|griffith/i },
  { zone: "Dublin 10 (Ballyfermot)", pattern: /dublin\s*10\b|d10|ballyfermot|cherry\s*orchard/i },
  { zone: "Dublin 11 (Finglas)", pattern: /dublin\s*11\b|d11|finglas|ballymun|glasnevin\s*north/i },
  { zone: "Dublin 12 (Drimnagh)", pattern: /dublin\s*12\b|d12|drimnagh|crumlin|walkinstown|perrystown/i },
  { zone: "Dublin 13 (Donaghmede)", pattern: /dublin\s*13\b|d13|donaghmede|baldoyle|howth\s*junction/i },
  { zone: "Dublin 14 (Dundrum)", pattern: /dublin\s*14\b|d14|dundrum|goatstown|clonskeagh|windy\s*arbour/i },
  { zone: "Dublin 15 (Blanchardstown)", pattern: /dublin\s*15\b|d15|blanchardstown|castleknock|clonsilla|mulhuddart/i },
  { zone: "Dublin 16 (Ballinteer)", pattern: /dublin\s*16\b|d16|ballinteer|knocklyon|rathfarnham/i },
  { zone: "Dublin 17 (Coolock)", pattern: /dublin\s*17\b|d17|coolock|darndale|priorswood/i },
  { zone: "Dublin 18 (Sandyford)", pattern: /dublin\s*18\b|d18|sandyford|leopardstown|cabinteely|foxrock/i },
  { zone: "Dublin 20 (Palmerstown)", pattern: /dublin\s*20\b|d20|palmerstown|chapelizod/i },
  { zone: "Dublin 22 (Clondalkin)", pattern: /dublin\s*22\b|d22|clondalkin|neilstown/i },
  { zone: "Dublin 24 (Tallaght)", pattern: /dublin\s*24\b|d24|tallaght|firhouse|oldbawn|jobstown/i },
  // Greater Dublin
  { zone: "Dún Laoghaire-Rathdown", pattern: /d[uú]n\s*laoghaire|blackrock|stillorgan|dalkey|killiney|monkstown|booterstown/i },
  { zone: "Swords & North County", pattern: /swords|malahide|portmarnock|donabate|rush|lusk/i },
  { zone: "Howth & Sutton", pattern: /howth|sutton|bayside/i },
  { zone: "Lucan & West Dublin", pattern: /lucan|adamstown|leixlip|celbridge/i },
  { zone: "Bray & North Wicklow", pattern: /bray|greystones|enniskerry|kilmacanogue/i },
];

/**
 * Map an address to known availability zones.
 * Returns all matching zone names. If no match, returns empty
 * (which means we skip zone filtering — any active runner is eligible).
 */
function addressToZones(address: string): string[] {
  return ZONE_PATTERNS
    .filter(({ pattern }) => pattern.test(address))
    .map(({ zone }) => zone);
}

/**
 * Find eligible runners for an errand.
 * - Filters by: available, active, verified
 * - Zone-based matching (if pickup address maps to known zones)
 * - Excludes runners who already declined/expired or have pending offers
 * - Excludes runners at max concurrent job limit (3)
 * - Sorted by rating (highest first)
 */
export async function findEligibleRunners(errandId: string) {
  const supabase = createAdminClient();

  // Get the errand to check pickup address for zone matching
  const { data: errand } = await supabase
    .from("errands")
    .select("pickup_address")
    .eq("id", errandId)
    .single();

  // Get runners who already declined or had expired offers for this errand
  const { data: existingOffers } = await supabase
    .from("job_offers")
    .select("runner_id")
    .eq("errand_id", errandId)
    .in("status", ["declined", "expired"]);

  const excludedRunnerIds = (existingOffers ?? []).map((o) => o.runner_id);

  // Also exclude runners with pending offers for this errand
  const { data: pendingOffers } = await supabase
    .from("job_offers")
    .select("runner_id")
    .eq("errand_id", errandId)
    .eq("status", "pending");

  const allExcluded = [
    ...excludedRunnerIds,
    ...(pendingOffers ?? []).map((o) => o.runner_id),
  ];

  // Find available, active, verified runners (fetch more to allow filtering)
  let query = supabase
    .from("runner_profiles")
    .select("id, rating, jobs_completed, transport_mode, availability_zones")
    .eq("is_available", true)
    .eq("status", "active")
    .eq("verified", true)
    .order("rating", { ascending: false, nullsFirst: false })
    .limit(15);

  if (allExcluded.length > 0) {
    query = query.not("id", "in", `(${allExcluded.join(",")})`);
  }

  const { data: runners, error } = await query;

  if (error) {
    console.error("[Assignment] Error finding runners:", error);
    return [];
  }

  if (!runners || runners.length === 0) return [];

  // Zone-based filtering
  const pickupZones = errand?.pickup_address
    ? addressToZones(errand.pickup_address)
    : [];

  let zoneFilteredRunners = runners;
  if (pickupZones.length > 0) {
    const zoneMatched = runners.filter((runner) => {
      const runnerZones = (runner.availability_zones ?? []) as string[];
      // Runners with no zones set are eligible for all areas
      if (runnerZones.length === 0) return true;
      return runnerZones.some((z) => pickupZones.includes(z));
    });
    // Fall back to all runners if no zone matches found
    zoneFilteredRunners = zoneMatched.length > 0 ? zoneMatched : runners;
  }

  // Filter out runners at max concurrent job limit
  const eligibleRunners = [];
  for (const runner of zoneFilteredRunners) {
    const { count } = await supabase
      .from("errands")
      .select("id", { count: "exact", head: true })
      .eq("runner_id", runner.id)
      .in("status", ["runner_assigned", "in_progress"]);

    if ((count ?? 0) < MAX_CONCURRENT_JOBS) {
      eligibleRunners.push(runner);
    }

    if (eligibleRunners.length >= 5) break;
  }

  return eligibleRunners;
}
