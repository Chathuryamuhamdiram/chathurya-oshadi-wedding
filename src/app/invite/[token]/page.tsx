import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { InvitationClient } from "@/components/invitation/InvitationClient";

export const dynamic = "force-dynamic";

// Hardcoded fallback venues — used when DB is not yet populated
const FALLBACK_PORUWA_VENUE = {
  name: "Hotel River Park",
  address: "Hikkaduwa, Sri Lanka",
  googleMapsUrl: "https://maps.google.com/?q=Hotel+River+Park+Hikkaduwa+Sri+Lanka",
};

const FALLBACK_MAIN_VENUE = {
  name: "Hotel Grand Palace",
  address: "Hikkaduwa, Sri Lanka",
  googleMapsUrl: "https://maps.google.com/?q=Hotel+Grand+Palace+Hikkaduwa+Sri+Lanka",
};

export default async function InvitePage(props: { params: Promise<{ token: string }> }) {
  const params = await props.params;

  // Fetch guest record
  const guest = await prisma.guest.findUnique({
    where: { invitationCode: params.token },
  });

  if (!guest) {
    notFound();
  }

  // Fetch venues from WeddingEvents — match by title keywords
  const [events, weddingCardAsset] = await Promise.all([
    prisma.weddingEvent.findMany({
      include: { venue: true },
      where: { visibility: { in: ["PUBLIC", "BOTH"] } },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.siteAsset.findUnique({
      where: { key: "WEDDING_CARD" },
      select: { key: true }
    })
  ]);

  // Identify Poruwa and Main function events by name
  const poruwaEvent = events.find(
    (e) =>
      e.title.toLowerCase().includes("poruwa") ||
      e.title.toLowerCase().includes("ceremony")
  );
  const mainEvent = events.find(
    (e) =>
      e.title.toLowerCase().includes("main") ||
      e.title.toLowerCase().includes("reception") ||
      e.title.toLowerCase().includes("function")
  );

  const poruwVenue = poruwaEvent?.venue
    ? {
        name: poruwaEvent.venue.name,
        address: poruwaEvent.venue.address,
        googleMapsUrl: poruwaEvent.venue.googleMapsUrl,
      }
    : FALLBACK_PORUWA_VENUE;

  const mainVenue = mainEvent?.venue
    ? {
        name: mainEvent.venue.name,
        address: mainEvent.venue.address,
        googleMapsUrl: mainEvent.venue.googleMapsUrl,
      }
    : FALLBACK_MAIN_VENUE;

  return (
    <InvitationClient
      guest={{
        invitationCode: guest.invitationCode,
        displayName: guest.displayName,
        invitationType: guest.invitationType,
        allowedGuestCount: guest.allowedGuestCount,
        confirmedGuestCount: guest.confirmedGuestCount,
        rsvpStatus: guest.rsvpStatus,
      }}
      poruwVenue={poruwVenue}
      mainVenue={mainVenue}
      sealUrl={weddingCardAsset ? `/api/image/asset/${weddingCardAsset.key}` : undefined}
    />
  );
}
