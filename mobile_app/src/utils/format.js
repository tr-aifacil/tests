export function formatSessionDate(startIso) {
  if (!startIso) return '';
  const start = new Date(startIso);
  return start.toLocaleDateString('pt-PT', {
    weekday: 'short',
    day: '2-digit',
    month: 'short'
  });
}

export function formatSessionTime(startIso, endIso) {
  if (!startIso || !endIso) return '';
  const start = new Date(startIso);
  const end = new Date(endIso);
  return `${start.toLocaleTimeString('pt-PT', {
    hour: '2-digit',
    minute: '2-digit'
  })} - ${end.toLocaleTimeString('pt-PT', {
    hour: '2-digit',
    minute: '2-digit'
  })}`;
}

export function buildStudioLabel(session) {
  const parts = [session?.room_name, session?.location_name].filter(Boolean);
  return parts.join(' • ');
}

export function firstName(value) {
  if (!value) return '';
  const [first] = value.split(' ');
  return first;
}
