const API_BASE_URL = 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  auth: {
    login: async (emailOrStudentId, password, role) => {
      const payload = { password, role };
      if (role === 'student') {
        payload.studentId = emailOrStudentId;
      } else {
        payload.email = emailOrStudentId;
      }
      
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data;
    },
    signupAdmin: async (adminData) => {
      const res = await fetch(`${API_BASE_URL}/auth/signup/admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Admin Registration failed');
      return data;
    },
    signupStudent: async (studentData) => {
      const res = await fetch(`${API_BASE_URL}/auth/signup/student`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Student Registration failed');
      return data;
    },
    signupParent: async (parentData) => {
      const res = await fetch(`${API_BASE_URL}/auth/signup/parent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parentData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Parent Registration failed');
      return data;
    },
    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    getCurrentUser: () => {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    },
    getToken: () => {
      return localStorage.getItem('token');
    }
  },

  students: {
    list: async (classFilter = '', sectionFilter = '') => {
      let url = `${API_BASE_URL}/students`;
      const params = [];
      if (classFilter) params.push(`class=${encodeURIComponent(classFilter)}`);
      if (sectionFilter) params.push(`section=${encodeURIComponent(sectionFilter)}`);
      if (params.length) url += `?${params.join('&')}`;

      const res = await fetch(url, {
        headers: getHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch students');
      return data;
    },
    create: async (studentData) => {
      const res = await fetch(`${API_BASE_URL}/students`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(studentData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create student');
      return data;
    },
    update: async (id, studentData) => {
      const res = await fetch(`${API_BASE_URL}/students/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(studentData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update student');
      return data;
    },
    delete: async (id) => {
      const res = await fetch(`${API_BASE_URL}/students/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete student');
      return data;
    }
  },

  attendance: {
    list: async (className, section, date) => {
      const res = await fetch(
        `${API_BASE_URL}/attendance?class=${encodeURIComponent(className)}&section=${encodeURIComponent(section)}&date=${date}`,
        { headers: getHeaders() }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch attendance');
      return data;
    },
    markBulk: async (records) => {
      const res = await fetch(`${API_BASE_URL}/attendance/bulk`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ records }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save attendance');
      return data;
    },
    getStudentStats: async (studentId) => {
      const res = await fetch(`${API_BASE_URL}/attendance/student/${studentId}`, {
        headers: getHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch attendance stats');
      return data;
    }
  },

  fees: {
    list: async (studentId = '', status = '', month = '') => {
      let url = `${API_BASE_URL}/fees`;
      const params = [];
      if (studentId) params.push(`studentId=${studentId}`);
      if (status) params.push(`status=${status}`);
      if (month) params.push(`month=${month}`);
      if (params.length) url += `?${params.join('&')}`;

      const res = await fetch(url, { headers: getHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch fees');
      return data;
    },
    create: async (feeData) => {
      const res = await fetch(`${API_BASE_URL}/fees`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(feeData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to generate fee invoice');
      return data;
    },
    pay: async (id, paymentMethodUsed = 'online') => {
      const res = await fetch(`${API_BASE_URL}/fees/${id}/pay`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ paymentMethodUsed })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to pay invoice');
      return data;
    }
  },

  notices: {
    list: async () => {
      const res = await fetch(`${API_BASE_URL}/notices`, { headers: getHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch notices');
      return data;
    },
    create: async (noticeData) => {
      const res = await fetch(`${API_BASE_URL}/notices`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(noticeData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create notice');
      return data;
    },
    delete: async (id) => {
      const res = await fetch(`${API_BASE_URL}/notices/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete notice');
      return data;
    }
  }
};
