import axios from 'axios'

export function getVehicleStatistics() {
  return axios.get('/api/vehicle/statistics')
}

export function getRecentRecords() {
  return axios.get('/api/vehicle/records')
}

export function getVehicleInfo(plateNumber) {
  return axios.get(`/api/vehicle/info/${plateNumber}`)
} 