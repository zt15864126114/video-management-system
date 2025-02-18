import axios from 'axios'

export function getAlarmStatistics(dateRange) {
  return axios.get('/api/alarm/statistics', { params: { dateRange } })
}

export function getAlarmRecords(type = 'all') {
  return axios.get('/api/alarm/records', { params: { type } })
}

export function processAlarm(alarmId, data) {
  return axios.post(`/api/alarm/process/${alarmId}`, data)
}

export function triggerEmergency(data) {
  return axios.post('/api/alarm/emergency', data)
}

export function sendBroadcast(message) {
  return axios.post('/api/alarm/broadcast', { message })
} 