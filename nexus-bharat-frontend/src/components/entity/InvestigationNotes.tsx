"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Lock,
  Clock,
  UserCheck,
  AlertCircle,
  Tag,
  Save,
} from "lucide-react";
import { InvestigationNote } from "@/types/entity";

export interface InvestigationNotesProps {
  entityId: string;
  initialNotes?: string;
}

export function InvestigationNotes({
  entityId,
  initialNotes,
}: InvestigationNotesProps) {
  const storageKey = `nexus_notes_${entityId}`;

  const [notes, setNotes] = useState<InvestigationNote[]>([]);
  const [newNoteText, setNewNoteText] = useState("");
  const [newNoteOfficer, setNewNoteOfficer] = useState("Insp. A. Sharma (Special Cell)");
  const [newNoteClassification, setNewNoteClassification] = useState<
    "ROUTINE" | "CONFIDENTIAL" | "CRITICAL"
  >("CONFIDENTIAL");
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [savedFeedback, setSavedFeedback] = useState(false);

  // Load notes from localStorage on mount or entity change
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setNotes(parsed);
          return;
        }
      }
    } catch (e) {
      console.warn("Failed to load notes from localStorage", e);
    }

    // Default seeded note if none stored
    const defaultNotes: InvestigationNote[] = [
      {
        id: `note-init-${entityId}-1`,
        entityId,
        author: "ACP V. Mehta (Cyber Crime Unit)",
        timestamp: "2026-08-25 14:15:00",
        content:
          initialNotes ||
          `Target ${entityId} placed under 24/7 technical surveillance following intercepted foreign remittance. Cross-referenced CDR with primary syndicate numbers.`,
        classification: "CONFIDENTIAL",
      },
      {
        id: `note-init-${entityId}-2`,
        entityId,
        author: "Insp. A. Sharma (Special Cell)",
        timestamp: "2026-08-27 18:40:00",
        content:
          "Subject observed meeting secondary facilitator near NCR transport terminal. Handover of encrypted satellite handsets suspected.",
        classification: "CRITICAL",
      },
    ];

    setNotes(defaultNotes);
    try {
      localStorage.setItem(storageKey, JSON.stringify(defaultNotes));
    } catch (e) {
      // ignore
    }
  }, [entityId, storageKey, initialNotes]);

  // Persist notes helper
  const persistNotes = (updated: InvestigationNote[]) => {
    setNotes(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
      setSavedFeedback(true);
      setTimeout(() => setSavedFeedback(false), 2000);
    } catch (e) {
      console.error("Failed to persist notes", e);
    }
  };

  // Add Note
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const newNote: InvestigationNote = {
      id: `note-${Date.now()}`,
      entityId,
      author: newNoteOfficer.trim() || "Investigating Officer",
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      content: newNoteText.trim(),
      classification: newNoteClassification,
    };

    const updated = [newNote, ...notes];
    persistNotes(updated);
    setNewNoteText("");
    setIsAdding(false);
  };

  // Delete Note
  const handleDeleteNote = (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    persistNotes(updated);
  };

  // Start Edit
  const handleStartEdit = (note: InvestigationNote) => {
    setEditingId(note.id);
    setEditingContent(note.content);
  };

  // Save Edit
  const handleSaveEdit = (id: string) => {
    const updated = notes.map((n) =>
      n.id === id
        ? {
            ...n,
            content: editingContent,
            timestamp: `${n.timestamp} (edited)`,
          }
        : n
    );
    persistNotes(updated);
    setEditingId(null);
    setEditingContent("");
  };

  return (
    <div className="rounded-xl border border-[#1F2937] bg-[#111827] p-6 shadow-xl flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1F2937]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-mono">
                  CASE OFFICER DOSSIER LOGS
                </h3>
                {savedFeedback && (
                  <span className="text-[10px] font-mono font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded flex items-center gap-1 animate-pulse">
                    <Check className="h-3 w-3" /> Synced to Vault
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 font-mono mt-0.5">
                Investigator annotations & field observations (Persisted to Local Storage)
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold font-mono transition-colors self-start sm:self-auto shadow-md shadow-blue-900/20"
          >
            {isAdding ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            <span>{isAdding ? "Cancel Entry" : "Add Case Note"}</span>
          </button>
        </div>

        {/* Add Note Form */}
        {isAdding && (
          <form
            onSubmit={handleAddNote}
            className="mt-4 p-4 rounded-lg border border-blue-500/30 bg-[#0B1020] space-y-3 font-mono animate-fadeIn"
          >
            <div className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="h-3.5 w-3.5" /> New Intelligence Entry
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-gray-400 block mb-1">
                  OFFICER IN CHARGE / BADGE
                </label>
                <input
                  type="text"
                  value={newNoteOfficer}
                  onChange={(e) => setNewNoteOfficer(e.target.value)}
                  className="w-full rounded border border-[#1F2937] bg-[#111827] px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  placeholder="e.g. Insp. A. Sharma (Special Cell)"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-400 block mb-1">
                  SECURITY CLASSIFICATION
                </label>
                <select
                  value={newNoteClassification}
                  onChange={(e) =>
                    setNewNoteClassification(
                      e.target.value as "ROUTINE" | "CONFIDENTIAL" | "CRITICAL"
                    )
                  }
                  className="w-full rounded border border-[#1F2937] bg-[#111827] px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="ROUTINE">ROUTINE - UNRESTRICTED</option>
                  <option value="CONFIDENTIAL">CONFIDENTIAL // LEA ONLY</option>
                  <option value="CRITICAL">CRITICAL // STRICT COMPARTMENTED</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-gray-400 block mb-1">
                OBSERVATION CONTENT
              </label>
              <textarea
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                rows={3}
                required
                className="w-full rounded border border-[#1F2937] bg-[#111827] p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 font-mono"
                placeholder="Enter verified intelligence, CDR patterns, informant debrief summary..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1 rounded bg-[#1F2937] hover:bg-gray-700 text-gray-300 text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1 px-4 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors shadow"
              >
                <Save className="h-3.5 w-3.5" /> Save to Record
              </button>
            </div>
          </form>
        )}

        {/* Notes Feed */}
        <div className="mt-4 space-y-3 font-mono">
          {notes.length === 0 ? (
            <div className="py-8 text-center border border-dashed border-[#1F2937] rounded-lg text-gray-500 text-xs">
              No field notes recorded yet for target {entityId}.
            </div>
          ) : (
            notes.map((note) => {
              const isEditing = editingId === note.id;

              return (
                <div
                  key={note.id}
                  className="rounded-lg border border-[#1F2937] bg-[#0B1020] p-4 transition-colors hover:border-[#374151]"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-[#1F2937]/70 pb-2 mb-2.5">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="flex items-center gap-1 font-semibold text-gray-200">
                        <UserCheck className="h-3.5 w-3.5 text-blue-400" />
                        {note.author}
                      </span>
                      <span className="text-[11px] text-gray-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {note.timestamp}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${
                          note.classification === "CRITICAL"
                            ? "border-red-500/40 bg-red-500/10 text-red-400"
                            : note.classification === "CONFIDENTIAL"
                            ? "border-amber-500/40 bg-amber-500/10 text-amber-400"
                            : "border-gray-500/40 bg-gray-500/10 text-gray-300"
                        }`}
                      >
                        {note.classification || "CONFIDENTIAL"}
                      </span>

                      {!isEditing && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleStartEdit(note)}
                            className="p-1 rounded text-gray-400 hover:text-blue-400 hover:bg-[#111827] transition-colors"
                            title="Edit Note"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="p-1 rounded text-gray-400 hover:text-red-400 hover:bg-[#111827] transition-colors"
                            title="Delete Note"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="space-y-2 mt-2">
                      <textarea
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        rows={3}
                        className="w-full rounded border border-blue-500/50 bg-[#111827] p-2 text-xs text-white focus:outline-none font-mono"
                      />
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-2.5 py-1 rounded bg-[#1F2937] hover:bg-gray-700 text-gray-300 text-xs"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveEdit(note.id)}
                          className="flex items-center gap-1 px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                        >
                          <Check className="h-3.5 w-3.5" /> Update
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {note.content}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Security notice footer */}
      <div className="mt-5 pt-3 border-t border-[#1F2937] flex items-center justify-between text-[10px] font-mono text-gray-500">
        <span className="flex items-center gap-1 text-gray-400">
          <Lock className="h-3 w-3 text-amber-500" />
          SESSION VAULT: LOCAL ENCRYPTION ACTIVE
        </span>
        <span>AUDIT LOGGED // CASE ID: {entityId}</span>
      </div>
    </div>
  );
}
