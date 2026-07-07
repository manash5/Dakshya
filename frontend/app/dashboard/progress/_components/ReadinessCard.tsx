import RingGauge from "../../_components/RingGauge";

const DIAMETER = 176;
const VIEWBOX_SIZE = 100;
const RADIUS = 42;
const STROKE_WIDTH = 8;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const READINESS_SCORE = 85;

export default function FlutterReadinessCard() {
  const progressFraction = READINESS_SCORE / 100;
  const progressDashoffset = CIRCUMFERENCE * (1 - progressFraction);

  return (
    <div className="flex flex-col items-center rounded-2xl border border-zinc-100 bg-white p-8 text-center shadow-sm">
      <RingGauge
        value={READINESS_SCORE}
        label="READY"
        diameter={DIAMETER}
        viewBoxSize={VIEWBOX_SIZE}
        radius={RADIUS}
        strokeWidth={STROKE_WIDTH}
        trackStroke="#EFF1EA"
        progressStroke="#A3E635"
        progressDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
        progressDashoffset={progressDashoffset}
      />

      <h3 className="mt-5 text-lg font-bold text-zinc-900">Flutter Readiness</h3>
      <p className="mt-2 max-w-[220px] text-sm text-zinc-500">
        Based on current skills, you are <span className="font-semibold text-zinc-700">Above Normal</span> for junior
        roles.
      </p>
    </div>
  );
}