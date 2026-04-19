import StandModalClient from "./StandModalClient";
import MapView from "../MapView";

export const dynamic = "force-dynamic";

export default function StandPage({
  params,
}: {
  params: { standId: string };
}) {
  const id = Number.parseInt(params.standId, 10);
  return (
    <MapView>
      <StandModalClient standId={Number.isFinite(id) ? id : null} />
    </MapView>
  );
}
