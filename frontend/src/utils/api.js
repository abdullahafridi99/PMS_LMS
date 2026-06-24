export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
    login: async (emailOrStudentId, password, role, otp = '') => {
      const payload = { password, role, otp };
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
      
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      return data;
    },
    signupTeacher: async (teacherData) => {
      const res = await fetch(`${API_BASE_URL}/auth/signup/teacher`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teacherData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Teacher Signup failed');
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
    },
    sessions: {
      list: async () => {
        const res = await fetch(`${API_BASE_URL}/auth/sessions`, { headers: getHeaders() });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch sessions');
        return data;
      },
      terminate: async (tokenToTerminate) => {
        const res = await fetch(`${API_BASE_URL}/auth/sessions/terminate`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ tokenToTerminate })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to terminate session');
        return data;
      }
    }
  },

  students: {
    list: async (classFilter = '', sectionFilter = '') => {
      let url = `${API_BASE_URL}/students`;
      const params = [];
      if (classFilter) params.push(`class=${encodeURIComponent(classFilter)}`);
      if (sectionFilter) params.push(`section=${encodeURIComponent(sectionFilter)}`);
      if (params.length) url += `?${params.join('&')}`;

      const res = await fetch(url, { headers: getHeaders() });
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
    },
    checkIn: async (checkInData) => {
      const res = await fetch(`${API_BASE_URL}/attendance/check-in`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(checkInData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Check-in failed');
      return data;
    },
    listStaff: async () => {
      const res = await fetch(`${API_BASE_URL}/attendance/staff`, { headers: getHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch staff logs');
      return data;
    },
    getTeacherLogs: async () => {
      const res = await fetch(`${API_BASE_URL}/attendance/teacher/my-logs`, { headers: getHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch teacher logs');
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
    createBulk: async (bulkData) => {
      const res = await fetch(`${API_BASE_URL}/fees/bulk`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(bulkData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to generate bulk invoices');
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

  exams: {
    list: async (term = '', className = '', subject = '') => {
      let url = `${API_BASE_URL}/exams`;
      const params = [];
      if (term) params.push(`term=${term}`);
      if (className) params.push(`class=${className}`);
      if (subject) params.push(`subject=${subject}`);
      if (params.length) url += `?${params.join('&')}`;

      const res = await fetch(url, { headers: getHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch exams');
      return data;
    },
    upload: async (examData) => {
      const res = await fetch(`${API_BASE_URL}/exams`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(examData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to upload exam scores');
      return data;
    },
    getReportCard: async (studentId) => {
      const res = await fetch(`${API_BASE_URL}/exams/report-card/${studentId}`, { headers: getHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch student report card');
      return data;
    }
  },

  lms: {
    list: async (classFilter = '', subjectFilter = '') => {
      let url = `${API_BASE_URL}/lms`;
      const params = [];
      if (classFilter) params.push(`class=${classFilter}`);
      if (subjectFilter) params.push(`subject=${subjectFilter}`);
      if (params.length) url += `?${params.join('&')}`;

      const res = await fetch(url, { headers: getHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch LMS courses');
      return data;
    },
    create: async (courseData) => {
      const res = await fetch(`${API_BASE_URL}/lms`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(courseData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create course');
      return data;
    },
    addLecture: async (courseId, lectureData) => {
      const res = await fetch(`${API_BASE_URL}/lms/${courseId}/lectures`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(lectureData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to add lecture');
      return data;
    },
    addNotes: async (courseId, notesData) => {
      const res = await fetch(`${API_BASE_URL}/lms/${courseId}/notes`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(notesData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to add notes');
      return data;
    },
    addQuiz: async (courseId, quizData) => {
      const res = await fetch(`${API_BASE_URL}/lms/${courseId}/quizzes`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(quizData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to add quiz');
      return data;
    }
  },

  homework: {
    list: async (classFilter = '', subjectFilter = '') => {
      let url = `${API_BASE_URL}/homework`;
      const params = [];
      if (classFilter) params.push(`class=${classFilter}`);
      if (subjectFilter) params.push(`subject=${subjectFilter}`);
      if (params.length) url += `?${params.join('&')}`;

      const res = await fetch(url, { headers: getHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch homework');
      return data;
    },
    create: async (homeworkData) => {
      const res = await fetch(`${API_BASE_URL}/homework`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(homeworkData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to assign homework');
      return data;
    },
    submit: async (id, submissionData) => {
      const res = await fetch(`${API_BASE_URL}/homework/${id}/submit`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(submissionData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit homework');
      return data;
    },
    grade: async (id, gradeData) => {
      const res = await fetch(`${API_BASE_URL}/homework/${id}/grade`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(gradeData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to grade submission');
      return data;
    }
  },

  transport: {
    list: async () => {
      const res = await fetch(`${API_BASE_URL}/transport`, { headers: getHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch transport routes');
      return data;
    },
    create: async (routeData) => {
      const res = await fetch(`${API_BASE_URL}/transport`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(routeData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create route');
      return data;
    }
  },

  inventory: {
    list: async () => {
      const res = await fetch(`${API_BASE_URL}/inventory`, { headers: getHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch inventory');
      return data;
    },
    create: async (itemData) => {
      const res = await fetch(`${API_BASE_URL}/inventory`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(itemData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to add inventory item');
      return data;
    },
    update: async (id, quantity) => {
      const res = await fetch(`${API_BASE_URL}/inventory/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ quantity })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update stock');
      return data;
    }
  },

  ai: {
    generate: async (promptType, context) => {
      const res = await fetch(`${API_BASE_URL}/ai/generate`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ promptType, context })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'AI generation failed');
      return data;
    }
  },

  logs: {
    listEmail: async () => {
      const res = await fetch(`${API_BASE_URL}/logs/email`, { headers: getHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch email logs');
      return data;
    },
    listAudit: async () => {
      const res = await fetch(`${API_BASE_URL}/logs/audit`, { headers: getHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch audit logs');
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
  },

  settings: {
    get: async () => {
      const res = await fetch(`${API_BASE_URL}/settings`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch school settings');
      return data;
    },
    update: async (settingsData) => {
      const res = await fetch(`${API_BASE_URL}/settings`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(settingsData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save school settings');
      return data;
    }
  },

  smsLogs: {
    list: async () => {
      const res = await fetch(`${API_BASE_URL}/sms-logs`, { headers: getHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch SMS logs');
      return data;
    }
  },

  inquiries: {
    list: async () => {
      const res = await fetch(`${API_BASE_URL}/inquiries`, { headers: getHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch admission inquiries');
      return data;
    },
    create: async (inquiryData) => {
      const res = await fetch(`${API_BASE_URL}/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inquiryData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit admission inquiry');
      return data;
    },
    delete: async (id) => {
      const res = await fetch(`${API_BASE_URL}/inquiries/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to resolve admission inquiry');
      return data;
    }
  },

  emailLogs: {
    list: async () => {
      const res = await fetch(`${API_BASE_URL}/email-logs`, { headers: getHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch email logs');
      return data;
    }
  }
};
