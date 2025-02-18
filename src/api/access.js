import axios from 'axios'

export function getDoorList() {
  return axios.get('/api/access/doors')
}

export function getAccessRecords() {
  return axios.get('/api/access/records')
}

export function controlDoor(doorId, action) {
  return axios.post('/api/access/control', {
    doorId,
    action
  })
} 