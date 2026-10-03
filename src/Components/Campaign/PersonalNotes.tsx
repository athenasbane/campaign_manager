import { FormEvent, useState } from "react";
import { useSaveReaderStateMutation } from "../../Store/slices/campaignApi";

export default function PersonalNotes({
  entryId,
  initialNotes,
}: {
  entryId: string;
  initialNotes: string;
}) {
  const [notes, setNotes] = useState(initialNotes);
  const [lastSaved, setLastSaved] = useState(initialNotes);
  const [message, setMessage] = useState("");
  const [save, { isLoading }] = useSaveReaderStateMutation();
  const dirty = notes !== lastSaved;
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isLoading || !dirty) return;
    setMessage("");
    try {
      await save({ id: entryId, personalNotes: notes }).unwrap();
      setLastSaved(notes);
      setMessage("Your notes are saved.");
    } catch {
      setMessage(
        "Your notes couldn’t be saved. Your text is still here; please try again.",
      );
    }
  }
  return (
    <section className="personal-notes">
      <span className="eyebrow">Your interpretation</span>
      <h2>My notes</h2>
      <p>
        Only you can see these notes. They don’t change what the GM has shared.
      </p>
      <form onSubmit={submit}>
        <label className="sr-only" htmlFor="personal-notes">
          Your private notes
        </label>
        <textarea
          id="personal-notes"
          value={notes}
          maxLength={10000}
          rows={5}
          disabled={isLoading}
          placeholder="What do you suspect? Which thread will you follow?"
          onChange={(event) => {
            setNotes(event.target.value);
            setMessage("");
          }}
        />
        <div className="personal-notes-actions">
          <button
            className="button secondary"
            type="submit"
            disabled={isLoading || !dirty}
          >
            {isLoading ? "Saving…" : "Save my notes"}
          </button>
          <span role="status">
            {message ||
              (dirty ? "Unsaved — save before leaving this page." : "")}
          </span>
        </div>
      </form>
    </section>
  );
}
