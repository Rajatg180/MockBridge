import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { createSlot } from '../../features/interviews/interviewSlice';
import { useToast } from '../../components/ui/ToastProvider';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBanner } from '../../components/ui/StatusBanner';
import { TextField } from '../../components/ui/FormFields';
import { formatUtcLabel, formatUtcToLocal, toUtcLocalDateTimeString } from '../../lib/date';

export function CreateSlotPage() {
  const dispatch = useAppDispatch();
  const { pushToast } = useToast();
  const { mutationStatus, error, workspace } = useAppSelector((state) => state.interviews);

  const [form, setForm] = useState({
    startTimeLocal: '',
    endTimeLocal: '',
  });
  const [formError, setFormError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.startTimeLocal || !form.endTimeLocal) {
      setFormError('Both start and end time are required.');
      return;
    }

    const startUtc = toUtcLocalDateTimeString(form.startTimeLocal);
    const endUtc = toUtcLocalDateTimeString(form.endTimeLocal);

    if (!startUtc || !endUtc) {
      setFormError('Unable to convert date values.');
      return;
    }

    if (new Date(form.endTimeLocal) <= new Date(form.startTimeLocal)) {
      setFormError('End time must be after start time.');
      return;
    }

    setFormError('');

    try {
      await dispatch(createSlot({ startTimeUtc: startUtc, endTimeUtc: endUtc })).unwrap();
      pushToast({ title: 'Slot created', description: 'The slot is now OPEN.', variant: 'success' });
      setForm({ startTimeLocal: '', endTimeLocal: '' });
    } catch (message) {
      pushToast({ title: 'Could not create slot', description: String(message), variant: 'error' });
    }
  }

  const latestSlot = workspace.createdSlots[0];

  return (
    <div className="stack-lg narrow-page">
      <PageHeader
        title="Create availability slot"
        description="The form accepts your local time and converts it to the `startTimeUtc` / `endTimeUtc` payload expected by the interview service."
      />

      {error ? <StatusBanner variant="error">{error}</StatusBanner> : null}
      {formError ? <StatusBanner variant="warning">{formError}</StatusBanner> : null}

      <form className="card stack" onSubmit={handleSubmit}>
        <TextField
          label="Start time (local)"
          type="datetime-local"
          value={form.startTimeLocal}
          onChange={(event) => setForm((current) => ({ ...current, startTimeLocal: event.target.value }))}
        />
        <TextField
          label="End time (local)"
          type="datetime-local"
          value={form.endTimeLocal}
          onChange={(event) => setForm((current) => ({ ...current, endTimeLocal: event.target.value }))}
        />
        <button type="submit" className="button button-primary" disabled={mutationStatus === 'loading'}>
          {mutationStatus === 'loading' ? 'Creating...' : 'Create slot'}
        </button>
      </form>

      {latestSlot ? (
        <article className="card stack">
          <h3>Most recent created slot</h3>
          <div className="detail-list">
            <div><span>Slot ID</span><strong className="break-all">{latestSlot.id}</strong></div>
            <div><span>Local start</span><strong>{formatUtcToLocal(latestSlot.startTimeUtc)}</strong></div>
            <div><span>Local end</span><strong>{formatUtcToLocal(latestSlot.endTimeUtc)}</strong></div>
            <div><span>UTC values</span><strong>{formatUtcLabel(latestSlot.startTimeUtc)} to {formatUtcLabel(latestSlot.endTimeUtc)}</strong></div>
            <div><span>Status</span><strong>{latestSlot.status}</strong></div>
          </div>
        </article>
      ) : null}
    </div>
  );
}
