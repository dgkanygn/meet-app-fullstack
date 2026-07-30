import RoomLayout from "@/components/meeting/RoomLayout";

export default async function MeetingRoomPage(
  props: PageProps<"/meeting/[meetingId]">
) {
  const { meetingId } = await props.params;
  return <RoomLayout meetingId={meetingId} />;
}
