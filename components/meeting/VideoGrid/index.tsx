const participants = [
  { initial: "D", name: "Dogukan" },
  { initial: "A", name: "Ayşe" },
  { initial: "M", name: "Mehmet" },
  { initial: "E", name: "Ece" },
  { initial: "B", name: "Burak" },
  { initial: "S", name: "Selin" },
];

export default function VideoGrid() {
  return (
    <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-2 p-4 auto-rows-fr">
      {participants.map(({ initial, name }) => (
        <div
          key={name}
          className="relative bg-[#201E1B] border border-[#332F2A] rounded-[8px] flex items-center justify-center min-h-[140px]"
        >
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-[#E07A45]/15 border border-[#E07A45]/20 flex items-center justify-center">
              <span className="text-lg font-semibold text-[#E07A45]">
                {initial}
              </span>
            </div>
          </div>
          {/* Name tag */}
          <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-[#171512]/80 rounded-[4px]">
            <span className="text-xs text-[#F2EFEA]">{name}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
