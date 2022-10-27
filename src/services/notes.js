import axios from 'axios'
const baseUrl = 'http://localhost:3001/notes'

const noteService = {
  getAll() {
    const request = axios.get(baseUrl);
    return request.then(response => response.data);
  },

  create(newObject) {
    const request = axios.post(baseUrl, newObject);
    return request.then(response => response.data);
  },

  update(id, newObject) {
    const request = axios.put(`${baseUrl}/${id}`, newObject);
    return request.then(response => response.data);
  }
}

export default noteService;