const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
};

export const api = {
  getTodos: () =>
    fetch(`${API_URL}/api/todos`).then(handleResponse),

  createTodo: (todo) =>
    fetch(`${API_URL}/api/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(todo),
    }).then(handleResponse),

  updateTodo: (id, todo) =>
    fetch(`${API_URL}/api/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(todo),
    }).then(handleResponse),

  toggleTodo: (id) =>
    fetch(`${API_URL}/api/todos/${id}/toggle`, {
      method: 'PATCH',
    }).then(handleResponse),

  deleteTodo: (id) =>
    fetch(`${API_URL}/api/todos/${id}`, {
      method: 'DELETE',
    }).then(handleResponse),
};
