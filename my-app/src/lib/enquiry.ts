/**
 * Enquiry submission.
 *
 * Posts to the admin panel's public endpoint, which needs no sign-in.
 *
 * The panel is served from /admin on this same host, so this is a same-origin
 * request and CORS does not enter into it. The endpoint still sends its
 * allowlist headers, which cost nothing and keep it usable from elsewhere if
 * the site is ever split across hosts again.
 *
 * A chosen vehicle travels two ways: its id, so the panel can show the enquiry
 * against the real vehicle and count it there, and its name in `requirements`,
 * which is free text and still reads correctly years later when that vehicle
 * has been sold. The endpoint ignores an id it does not recognise -- the ids in
 * src/data/cars.ts are placeholders used only when the panel is unreachable --
 * so the name is what makes the enquiry answerable either way.
 */

import { apiUrl } from './api';
const ENDPOINT = apiUrl('enquiry-submit.php');

export interface EnquiryInput {
  name: string;
  phone: string;
  email?: string;
  pickupLocation?: string;
  startDate?: string;
  returnDate?: string;
  car?: string;
  /** The real vehicle id, when the fleet came from the panel. */
  vehicleId?: string;
  message?: string;
  /** Hidden field. Real people leave it empty; bots fill it in. */
  website?: string;
}

export type EnquiryResult =
  | { ok: true; enquiryNumber: string | null }
  | { ok: false; error: string; fields?: Record<string, string> };

export async function submitEnquiry(
  input: EnquiryInput,
): Promise<EnquiryResult> {
  const payload: Record<string, string> = {
    name: input.name,
    phone: input.phone,
    website: input.website ?? '',
  };

  if (input.email) payload.email = input.email;
  if (input.pickupLocation) payload.pickup_location = input.pickupLocation;
  if (input.startDate) payload.start_date = input.startDate;
  if (input.returnDate) payload.return_date = input.returnDate;
  if (input.car) payload.requirements = `Vehicle of interest: ${input.car}`;
  if (input.vehicleId) payload.vehicle_id = input.vehicleId;
  if (input.message) payload.message = input.message;

  let response: Response;
  try {
    response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    // Network failure, DNS, or a CORS rejection — the browser gives us no
    // detail, so say something a caller can act on rather than guessing.
    return {
      ok: false,
      error:
        'Could not reach the booking service. Please check your connection, or call us directly.',
    };
  }

  let body: {
    ok?: boolean;
    enquiry_number?: string | null;
    error?: string;
    fields?: Record<string, string>;
  };
  try {
    body = await response.json();
  } catch {
    return { ok: false, error: 'The booking service returned an unexpected reply.' };
  }

  if (response.ok && body.ok) {
    return { ok: true, enquiryNumber: body.enquiry_number ?? null };
  }

  return {
    ok: false,
    error: body.error ?? 'Something went wrong. Please try again.',
    fields: body.fields,
  };
}
