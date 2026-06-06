const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Determine if we should use MongoDB or local JSON fallback
let useMongoDB = false;
const MONGODB_URI = process.env.MONGODB_URI;

// Local JSON File Database Configuration
const MOCK_DB_DIR = path.join(__dirname, '../mock_db');

// Ensure mock_db directory exists
if (!fs.existsSync(MOCK_DB_DIR)) {
  fs.mkdirSync(MOCK_DB_DIR, { recursive: true });
}

// Helpers for reading/writing local JSON files
const getFilePath = (collection) => path.join(MOCK_DB_DIR, `${collection}.json`);

const readJSON = (collection) => {
  const filePath = getFilePath(collection);
  if (!fs.existsSync(filePath)) {
    // Write empty array if file does not exist
    fs.writeFileSync(filePath, JSON.stringify([], null, 2), 'utf8');
    return [];
  }
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error(`Error reading mock db file for ${collection}:`, err);
    return [];
  }
};

const writeJSON = (collection, data) => {
  const filePath = getFilePath(collection);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`Error writing mock db file for ${collection}:`, err);
    return false;
  }
};

// --- MONGOOSE SCHEMAS & MODELS ---
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'student', 'parent'], required: true },
  
  // Student Specific
  studentId: { type: String }, // Unique ID for Student Login
  rollNumber: { type: String },
  class: { type: String }, // e.g. "Grade 9", "Grade 10"
  section: { type: String }, // e.g. "A", "B"
  parentEmail: { type: String }, // Link to parent account
  
  // Parent Specific
  childrenEmails: [{ type: String }], // Array of linked children emails (for parents)
  
  phone: { type: String },
  address: { type: String },
  admissionDate: { type: Date, default: Date.now }
});

const AttendanceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentName: { type: String, required: true },
  rollNumber: { type: String },
  class: { type: String, required: true },
  section: { type: String, required: true },
  date: { type: String, required: true }, // Format YYYY-MM-DD
  status: { type: String, enum: ['present', 'absent', 'late'], required: true }
});

const FeeSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentName: { type: String, required: true },
  rollNumber: { type: String },
  class: { type: String, required: true },
  month: { type: String, required: true }, // e.g. "June 2026"
  amount: { type: Number, required: true },
  status: { type: String, enum: ['paid', 'unpaid'], default: 'unpaid' },
  feeType: { type: String, enum: ['tuition', 'admission', 'fine', 'other'], default: 'tuition' },
  paymentMethodUsed: { type: String },
  dueDate: { type: String },
  paidDate: { type: String }
});

const NoticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  date: { type: Date, default: Date.now },
  targetAudience: { type: String, enum: ['all', 'students', 'parents'], default: 'all' },
  createdBy: { type: String, default: 'Admin' }
});

let UserModel, AttendanceModel, FeeModel, NoticeModel;

// Initialize MongoDB if URI is configured
const initializeMongoDB = async () => {
  if (!MONGODB_URI) {
    console.log('⚠️ No MONGODB_URI found in environment variables. Operating in LOCAL JSON mode.');
    return false;
  }
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 3000
    });
    console.log('🔌 Connected to MongoDB successfully. Operating in MONGODB mode.');
    
    UserModel = mongoose.model('User', UserSchema);
    AttendanceModel = mongoose.model('Attendance', AttendanceSchema);
    FeeModel = mongoose.model('Fee', FeeSchema);
    NoticeModel = mongoose.model('Notice', NoticeSchema);
    
    useMongoDB = true;
    return true;
  } catch (err) {
    console.error('❌ MongoDB Connection failed:', err.message);
    console.log('⚠️ Falling back to LOCAL JSON file database mode.');
    useMongoDB = false;
    return false;
  }
};

// --- REUSABLE ABSTRACT DATABASE SERVICES ---
const dbService = {
  initialize: initializeMongoDB,
  
  isMongo: () => useMongoDB,

  users: {
    find: async (query = {}) => {
      if (useMongoDB) {
        return await UserModel.find(query).lean();
      } else {
        const users = readJSON('users');
        return users.filter(user => {
          for (let key in query) {
            if (query[key] !== undefined && user[key] !== query[key]) {
              // Support matching items in arrays (like childrenEmails)
              if (Array.isArray(user[key]) && user[key].includes(query[key])) {
                continue;
              }
              return false;
            }
          }
          return true;
        });
      }
    },

    findOne: async (query = {}) => {
      if (useMongoDB) {
        return await UserModel.findOne(query).lean();
      } else {
        const users = readJSON('users');
        const user = users.find(user => {
          for (let key in query) {
            if (user[key] !== query[key]) return false;
          }
          return true;
        });
        return user || null;
      }
    },

    findById: async (id) => {
      if (useMongoDB) {
        return await UserModel.findById(id).lean();
      } else {
        const users = readJSON('users');
        return users.find(user => user.id === id || user._id === id) || null;
      }
    },

    create: async (userData) => {
      if (useMongoDB) {
        const newUser = new UserModel(userData);
        return await newUser.save();
      } else {
        const users = readJSON('users');
        const newUser = {
          _id: new mongoose.Types.ObjectId().toString(),
          id: new mongoose.Types.ObjectId().toString(),
          admissionDate: new Date().toISOString(),
          ...userData
        };
        // Update parent mapping if child is created
        if (newUser.role === 'student' && newUser.parentEmail) {
          const parent = users.find(u => u.email === newUser.parentEmail && u.role === 'parent');
          if (parent) {
            parent.childrenEmails = parent.childrenEmails || [];
            if (!parent.childrenEmails.includes(newUser.email)) {
              parent.childrenEmails.push(newUser.email);
            }
          }
        }
        users.push(newUser);
        writeJSON('users', users);
        return newUser;
      }
    },

    findByIdAndUpdate: async (id, updateData) => {
      if (useMongoDB) {
        return await UserModel.findByIdAndUpdate(id, updateData, { new: true }).lean();
      } else {
        const users = readJSON('users');
        const idx = users.findIndex(user => user.id === id || user._id === id);
        if (idx !== -1) {
          users[idx] = { ...users[idx], ...updateData };
          writeJSON('users', users);
          return users[idx];
        }
        return null;
      }
    },

    findByIdAndDelete: async (id) => {
      if (useMongoDB) {
        return await UserModel.findByIdAndDelete(id).lean();
      } else {
        const users = readJSON('users');
        const deletedUser = users.find(user => user.id === id || user._id === id);
        const updatedUsers = users.filter(user => user.id !== id && user._id !== id);
        
        // Remove student mapping from parent if needed
        if (deletedUser && deletedUser.role === 'student' && deletedUser.parentEmail) {
          const parent = updatedUsers.find(u => u.email === deletedUser.parentEmail && u.role === 'parent');
          if (parent && parent.childrenEmails) {
            parent.childrenEmails = parent.childrenEmails.filter(email => email !== deletedUser.email);
          }
        }
        
        writeJSON('users', updatedUsers);
        return deletedUser || null;
      }
    }
  },

  attendance: {
    find: async (query = {}) => {
      if (useMongoDB) {
        return await AttendanceModel.find(query).lean();
      } else {
        const list = readJSON('attendance');
        return list.filter(item => {
          for (let key in query) {
            if (query[key] !== undefined && item[key] !== query[key]) return false;
          }
          return true;
        });
      }
    },

    upsert: async (record) => {
      if (useMongoDB) {
        return await AttendanceModel.findOneAndUpdate(
          { studentId: record.studentId, date: record.date },
          record,
          { upsert: true, new: true }
        ).lean();
      } else {
        const list = readJSON('attendance');
        const idx = list.findIndex(item => item.studentId === record.studentId && item.date === record.date);
        
        const newRecord = {
          _id: record._id || new mongoose.Types.ObjectId().toString(),
          ...record
        };

        if (idx !== -1) {
          list[idx] = { ...list[idx], ...record };
          writeJSON('attendance', list);
          return list[idx];
        } else {
          list.push(newRecord);
          writeJSON('attendance', list);
          return newRecord;
        }
      }
    }
  },

  fees: {
    find: async (query = {}) => {
      if (useMongoDB) {
        return await FeeModel.find(query).lean();
      } else {
        const list = readJSON('fees');
        return list.filter(item => {
          for (let key in query) {
            if (query[key] !== undefined && item[key] !== query[key]) return false;
          }
          return true;
        });
      }
    },

    create: async (feeData) => {
      if (useMongoDB) {
        const newFee = new FeeModel(feeData);
        return await newFee.save();
      } else {
        const list = readJSON('fees');
        const newFee = {
          _id: new mongoose.Types.ObjectId().toString(),
          status: 'unpaid',
          ...feeData
        };
        list.push(newFee);
        writeJSON('fees', list);
        return newFee;
      }
    },

    findByIdAndUpdate: async (id, updateData) => {
      if (useMongoDB) {
        return await FeeModel.findByIdAndUpdate(id, updateData, { new: true }).lean();
      } else {
        const list = readJSON('fees');
        const idx = list.findIndex(item => item._id === id || item.id === id);
        if (idx !== -1) {
          list[idx] = { ...list[idx], ...updateData };
          writeJSON('fees', list);
          return list[idx];
        }
        return null;
      }
    }
  },

  notices: {
    find: async (query = {}) => {
      if (useMongoDB) {
        return await NoticeModel.find(query).sort({ date: -1 }).lean();
      } else {
        const list = readJSON('notices');
        const filtered = list.filter(item => {
          for (let key in query) {
            if (query[key] !== undefined && item[key] !== query[key]) return false;
          }
          return true;
        });
        // Sort by date desc
        return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
      }
    },

    create: async (noticeData) => {
      if (useMongoDB) {
        const newNotice = new NoticeModel(noticeData);
        return await newNotice.save();
      } else {
        const list = readJSON('notices');
        const newNotice = {
          _id: new mongoose.Types.ObjectId().toString(),
          date: new Date().toISOString(),
          createdBy: 'Admin',
          ...noticeData
        };
        list.push(newNotice);
        writeJSON('notices', list);
        return newNotice;
      }
    },

    findByIdAndDelete: async (id) => {
      if (useMongoDB) {
        return await NoticeModel.findByIdAndDelete(id).lean();
      } else {
        const list = readJSON('notices');
        const deletedNotice = list.find(item => item._id === id || item.id === id);
        const updatedList = list.filter(item => item._id !== id && item.id !== id);
        writeJSON('notices', updatedList);
        return deletedNotice || null;
      }
    }
  }
};

module.exports = dbService;
