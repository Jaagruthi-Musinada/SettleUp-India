export function saveGroup(group) {
  if (!group || !group.code) return;
  localStorage.setItem(`settleup_${group.code}`, JSON.stringify(group));
}

export function loadGroup(code) {
  if (!code) return null;
  const data = localStorage.getItem(`settleup_${code}`);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      return null;
    }
  }
  return null;
}

export function generateGroupCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function generateId() {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}
