import axios from 'axios'
const baseUrl = '/api/notes'

let token = null

const noteService = {
  getAll() {
    const request = axios.get(baseUrl)
    return request.then(response => response.data)
  },

  setToken(newToken) {
    token = `Bearer ${newToken}`
  },

  create(newObject) {
    const config = { headers: { Authorization: token } }

    const request = axios.post(baseUrl, newObject, config)
    return request.then(response => response.data)
  },

  update(id, newObject) {
    const config = { headers: { Authorization: token } }

    const request = axios.put(`${baseUrl}/${id}`, newObject, config)
    return request.then(response => response.data)
  },

  remove(id) {
    const config = { headers: { Authorization: token } }

    const request = axios.delete(`${baseUrl}/${id}`, config)
    return request.then(response => response.data)
  }
}

export default noteService