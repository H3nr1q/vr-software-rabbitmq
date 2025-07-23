const statusMap = new Map();

export function updateStatus(id, status) {
  statusMap.set(id, status);
}

export function getStatus(id) {
  return statusMap.get(id);
}

export default statusMap;
