"use client";

import { useRef, useState } from "react";
import { Loader2, Mic, Square } from "lucide-react";
import { handleTranscribeAudio } from "@/lib/actions/practiceAttempt-action";

export default function VoiceRecorder({
    onTranscribed,
}: {
    onTranscribed: (text: string) => void;
}) {
    const [recording, setRecording] = useState(false);
    const [transcribing, setTranscribing] = useState(false);
    const [error, setError] = useState("");

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);

    const startRecording = async () => {
        setError("");
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            chunksRef.current = [];

            const mimeType = MediaRecorder.isTypeSupported("audio/webm")
                ? "audio/webm"
                : "";
            const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            recorder.onstop = async () => {
                streamRef.current?.getTracks().forEach((track) => track.stop());

                const blob = new Blob(chunksRef.current, {
                    type: recorder.mimeType || "audio/webm",
                });

                setTranscribing(true);
                try {
                    const formData = new FormData();
                    formData.append("audio", blob, "answer.webm");
                    const result = await handleTranscribeAudio(formData);
                    if (result.success) {
                        onTranscribed(result.data.transcription);
                    } else {
                        setError(result.message);
                    }
                } catch (err: any) {
                    setError(err?.message || "Transcription failed");
                } finally {
                    setTranscribing(false);
                }
            };

            mediaRecorderRef.current = recorder;
            recorder.start();
            setRecording(true);
        } catch {
            setError("Microphone access denied or unavailable.");
        }
    };

    const stopRecording = () => {
        mediaRecorderRef.current?.stop();
        setRecording(false);
    };

    return (
        <div className="flex flex-wrap items-center gap-3">
            <button
                type="button"
                onClick={recording ? stopRecording : startRecording}
                disabled={transcribing}
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition ${
                    recording ? "animate-pulse bg-red-500 text-white" : "bg-zinc-900 text-white hover:brightness-110"
                } disabled:opacity-50`}
            >
                {transcribing ? (
                    <Loader2 size={16} className="animate-spin" />
                ) : recording ? (
                    <Square size={14} fill="currentColor" />
                ) : (
                    <Mic size={16} />
                )}
            </button>
            <span className="text-xs text-zinc-500">
                {transcribing ? "Transcribing…" : recording ? "Recording — click to stop" : "Record your answer"}
            </span>
            {error && <span className="text-xs text-red-500">{error}</span>}
        </div>
    );
}
