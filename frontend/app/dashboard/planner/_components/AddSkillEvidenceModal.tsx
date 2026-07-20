"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "react-toastify";
import { X } from "lucide-react";
import type { SkillPlannerSkill } from "@/lib/api/skillPlanner";
import { handleSubmitSelfReportedSkill } from "@/lib/actions/userProgress-action";

interface AddSkillEvidenceModalProps {
  skill: SkillPlannerSkill | null;
  jobRoleId: string;
  onClose: () => void;
}

export default function AddSkillEvidenceModal({
  skill,
  jobRoleId,
  onClose,
}: AddSkillEvidenceModalProps) {
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setDescription("");
  }, [skill]);

  useEffect(() => {
    if (!skill) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [skill, onClose]);

  if (!skill) return null;

  const handleSubmit = async () => {
    if (!description.trim()) return;
    setIsSubmitting(true);
    const result = await handleSubmitSelfReportedSkill(jobRoleId, skill.skill, description.trim());
    setIsSubmitting(false);
    if (result.success) {
      toast.success(`${skill.displayName} added to your skills`);
      onClose();
    } else {
      toast.error(result.message);
    }
  };

  // Portalled to <body> so "fixed" is relative to the real viewport, not a
  // transformed ancestor (e.g. the page's stagger-entrance wrapper).
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-[24px] bg-white p-7 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[20px] font-semibold leading-tight text-zinc-900">Add Skill</h2>
            <p className="mt-1 text-sm text-neutral-500">{skill.displayName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded-full p-1.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-900"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-5">
          <label className="mb-2 block text-sm font-medium text-neutral-700">
            How have you used {skill.displayName}?
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            placeholder="e.g. Used it to build the backend for a personal project, wrote REST endpoints and connected them to a database..."
            className="w-full resize-none rounded-xl border border-neutral-200 p-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none"
          />
          <p className="mt-2 text-xs text-neutral-400">
            This is a self-reported note, not an AI evaluation — it marks the skill as something
            you&apos;ve genuinely worked with.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!description.trim() || isSubmitting}
          className="mt-5 w-full rounded-xl bg-neutral-900 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Saving…" : "Save"}
        </button>
      </div>
    </div>,
    document.body,
  );
}
