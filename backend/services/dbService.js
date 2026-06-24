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
  role: { type: String, enum: ['admin', 'student', 'parent', 'teacher'], required: true },
  
  // Student Specific
  studentId: { type: String }, 
  rollNumber: { type: String },
  class: { type: String }, 
  section: { type: String }, 
  parentEmail: { type: String }, 
  
  // Parent Specific
  childrenEmails: [{ type: String }], 
  
  phone: { type: String },
  address: { type: String },
  admissionDate: { type: Date, default: Date.now },

  // SaaS and Security additions
  twoFactorOTP: { type: String },
  twoFactorOTPExpires: { type: Date },
  activeSessions: [{
    token: { type: String },
    ip: { type: String },
    device: { type: String },
    createdAt: { type: Date, default: Date.now }
  }],
  cnic: { type: String } // For teachers verification lookup
});

const TenantSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true }, // e.g. 'landing_page'
  schoolName: { type: String, default: 'Pakhtunkhwa Model School (Zangali Branch)' },
  schoolBuildingUrl: { type: String, default: '' },
  principalMessage: { type: String, default: 'Welcome to Pakhtunkhwa Model School. Our mission is to provide high-quality education and build strong character in our students.' },
  principalName: { type: String, default: 'Principal Tariq Zaman' },
  principalUrl: { type: String, default: '' },
  staffList: [{
    name: { type: String },
    title: { type: String },
    phone: { type: String },
    email: { type: String },
    bio: { type: String },
    url: { type: String },
    cnic: { type: String }
  }]
});

const AttendanceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentName: { type: String, required: true },
  rollNumber: { type: String },
  class: { type: String, required: true },
  section: { type: String, required: true },
  date: { type: String, required: true }, 
  status: { type: String, enum: ['present', 'absent', 'late'], required: true }
});

const FeeSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentName: { type: String, required: true },
  rollNumber: { type: String },
  class: { type: String, required: true },
  month: { type: String, required: true }, 
  amount: { type: Number, required: true },
  status: { type: String, enum: ['paid', 'unpaid'], default: 'unpaid' },
  feeType: { type: String, enum: ['tuition', 'admission', 'fine', 'other', 'transport', 'exam', 'library'], default: 'tuition' },
  paymentMethodUsed: { type: String },
  dueDate: { type: String },
  paidDate: { type: String },
  breakdown: {
    tuition: { type: Number, default: 0 },
    transport: { type: Number, default: 0 },
    exam: { type: Number, default: 0 },
    library: { type: Number, default: 0 }
  }
});

const ExamSchema = new mongoose.Schema({
  term: { type: String, required: true }, 
  class: { type: String, required: true },
  subject: { type: String, required: true },
  maxMarks: { type: Number, default: 100 },
  marks: [{
    studentId: { type: String, required: true },
    studentName: { type: String, required: true },
    rollNumber: { type: String },
    score: { type: Number, default: 0 },
    grade: { type: String },
    position: { type: Number }
  }],
  createdBy: { type: String },
  date: { type: Date, default: Date.now }
});

const LMSSchema = new mongoose.Schema({
  courseName: { type: String, required: true },
  class: { type: String, required: true },
  subject: { type: String, required: true },
  lectures: [{
    title: { type: String, required: true },
    videoUrl: { type: String },
    description: { type: String }
  }],
  notes: [{
    title: { type: String, required: true },
    fileUrl: { type: String }
  }],
  quizzes: [{
    quizTitle: { type: String, required: true },
    durationMinutes: { type: Number, default: 15 },
    questions: [{
      questionText: { type: String, required: true },
      options: [{ type: String }],
      correctOptionIdx: { type: Number, required: true }
    }]
  }]
});

const HomeworkSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  class: { type: String, required: true },
  subject: { type: String, required: true },
  deadline: { type: Date },
  fileUrl: { type: String },
  submissions: [{
    studentId: { type: String, required: true },
    studentName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    submittedAt: { type: Date, default: Date.now },
    grade: { type: String },
    feedback: { type: String }
  }]
});

const TransportSchema = new mongoose.Schema({
  routeName: { type: String, required: true },
  driverName: { type: String, required: true },
  driverPhone: { type: String, required: true },
  vehicleNumber: { type: String, required: true },
  pickupPoints: [{ type: String }]
});

const InventorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, default: 0 },
  category: { type: String }, // e.g. computer, furniture, books, lab
  lastUpdated: { type: Date, default: Date.now }
});

const NoticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  date: { type: Date, default: Date.now },
  targetAudience: { type: String, enum: ['all', 'students', 'parents'], default: 'all' },
  createdBy: { type: String, default: 'Admin' }
});

const SmsLogSchema = new mongoose.Schema({
  recipient: { type: String, required: true },
  phone: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['absentee_alert', 'notice_broadcast'], required: true },
  status: { type: String, default: 'sent' },
  date: { type: Date, default: Date.now }
});

const StaffAttendanceSchema = new mongoose.Schema({
  staffId: { type: String, required: true },
  name: { type: String, required: true },
  title: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  status: { type: String, enum: ['present', 'absent', 'late'], default: 'present' }
});

const InquirySchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  grade: { type: String, required: true },
  parentName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  address: { type: String },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'resolved'], default: 'pending' }
});

const EmailLogSchema = new mongoose.Schema({
  recipient: { type: String, required: true },
  subject: { type: String, required: true },
  body: { type: String, required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['sent', 'failed'], default: 'sent' }
});

const AuditLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  details: { type: String },
  userId: { type: String },
  userRole: { type: String },
  date: { type: Date, default: Date.now }
});

let UserModel, TenantModel, AttendanceModel, FeeModel, NoticeModel, SmsModel, StaffAttendanceModel, InquiryModel, EmailLogModel;
let ExamModel, LMSModel, HomeworkModel, TransportModel, InventoryModel, AuditLogModel;

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
    TenantModel = mongoose.model('Tenant', TenantSchema);
    AttendanceModel = mongoose.model('Attendance', AttendanceSchema);
    FeeModel = mongoose.model('Fee', FeeSchema);
    NoticeModel = mongoose.model('Notice', NoticeSchema);
    SmsModel = mongoose.model('SmsLog', SmsLogSchema);
    StaffAttendanceModel = mongoose.model('StaffAttendance', StaffAttendanceSchema);
    InquiryModel = mongoose.model('Inquiry', InquirySchema);
    EmailLogModel = mongoose.model('EmailLog', EmailLogSchema);
    ExamModel = mongoose.model('Exam', ExamSchema);
    LMSModel = mongoose.model('LMS', LMSSchema);
    HomeworkModel = mongoose.model('Homework', HomeworkSchema);
    TransportModel = mongoose.model('Transport', TransportSchema);
    InventoryModel = mongoose.model('Inventory', InventorySchema);
    AuditLogModel = mongoose.model('AuditLog', AuditLogSchema);
    
    useMongoDB = true;
    return true;
  } catch (err) {
    console.error('❌ MongoDB Connection failed:', err.message);
    console.log('⚠️ Falling back to LOCAL JSON file database mode.');
    useMongoDB = false;
    return false;
  }
};

// Generic JSON database driver wrapper helper
const getJsonDriver = (collection, defaultInitializer = []) => {
  return {
    find: async (query = {}) => {
      const list = readJSON(collection);
      return list.filter(item => {
        for (let key in query) {
          if (query[key] !== undefined && item[key] !== query[key]) {
            if (Array.isArray(item[key]) && item[key].includes(query[key])) {
              continue;
            }
            return false;
          }
        }
        return true;
      });
    },

    findOne: async (query = {}) => {
      const list = readJSON(collection);
      const matched = list.find(item => {
        for (let key in query) {
          if (item[key] !== query[key]) return false;
        }
        return true;
      });
      return matched || null;
    },

    findById: async (id) => {
      const list = readJSON(collection);
      return list.find(item => item.id === id || item._id === id) || null;
    },

    create: async (data) => {
      const list = readJSON(collection);
      const newItem = {
        _id: new mongoose.Types.ObjectId().toString(),
        id: new mongoose.Types.ObjectId().toString(),
        date: new Date().toISOString(),
        ...data
      };
      list.push(newItem);
      writeJSON(collection, list);
      return newItem;
    },

    findByIdAndUpdate: async (id, updateData) => {
      const list = readJSON(collection);
      const idx = list.findIndex(item => item.id === id || item._id === id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...updateData };
        writeJSON(collection, list);
        return list[idx];
      }
      return null;
    },

    findByIdAndDelete: async (id) => {
      const list = readJSON(collection);
      const deleted = list.find(item => item.id === id || item._id === id);
      const updated = list.filter(item => item.id !== id && item._id !== id);
      writeJSON(collection, updated);
      return deleted || null;
    }
  };
};

// --- REUSABLE ABSTRACT DATABASE SERVICES ---
const dbService = {
  initialize: initializeMongoDB,
  isMongo: () => useMongoDB,

  users: {
    find: async (query = {}) => {
      if (useMongoDB) return await UserModel.find(query).lean();
      return await getJsonDriver('users').find(query);
    },
    findOne: async (query = {}) => {
      if (useMongoDB) return await UserModel.findOne(query).lean();
      return await getJsonDriver('users').findOne(query);
    },
    findById: async (id) => {
      if (useMongoDB) return await UserModel.findById(id).lean();
      return await getJsonDriver('users').findById(id);
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
          activeSessions: [],
          ...userData
        };
        // Update parent mapping if student created
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
      if (useMongoDB) return await UserModel.findByIdAndUpdate(id, updateData, { new: true }).lean();
      return await getJsonDriver('users').findByIdAndUpdate(id, updateData);
    },
    findByIdAndDelete: async (id) => {
      if (useMongoDB) {
        return await UserModel.findByIdAndDelete(id).lean();
      } else {
        const users = readJSON('users');
        const deletedUser = users.find(user => user.id === id || user._id === id);
        const updatedUsers = users.filter(user => user.id !== id && user._id !== id);
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

  settings: {
    findOne: async (query = {}) => {
      if (useMongoDB) {
        let settings = await TenantModel.findOne(query).lean();
        if (!settings && query.key === 'landing_page') {
          const defaultSettings = {
            key: 'landing_page',
            schoolName: 'Pakhtunkhwa Model School (Zangali Branch)',
            schoolBuildingUrl: '',
            principalMessage: 'Welcome to Pakhtunkhwa Model School. Our mission is to provide high-quality education and build strong character in our students.',
            principalName: 'Principal Tariq Zaman',
            principalUrl: '',
            staffList: [
              { name: 'Dr. Tariq Zaman', title: 'Principal & Physics Head', phone: '+92 333 9123456', email: 'admin@pms.edu', bio: 'PhD in Education with 25 years of academic leadership experience.', url: '', cnic: '17301-1111111-1' },
              { name: 'Sir Niamat Ullah', title: 'Senior Mathematics Head', phone: '+92 312 9876543', email: 'niamat@pms.edu', bio: 'MSc Mathematics, specialized in algebra and trigonometry.', url: '', cnic: '17301-2222222-2' },
              { name: 'Miss Palwasha', title: 'English Literature Lead', phone: '+92 300 1234567', email: 'palwasha@pms.edu', bio: 'MA English, expert in language building and communication skills.', url: '', cnic: '17301-3333333-3' }
            ]
          };
          const newSettings = new TenantModel(defaultSettings);
          await newSettings.save();
          settings = newSettings.toObject();
        }
        return settings;
      } else {
        const list = readJSON('settings');
        if (list.length === 0) {
          const defaultSettings = {
            _id: new mongoose.Types.ObjectId().toString(),
            key: 'landing_page',
            schoolName: 'Pakhtunkhwa Model School (Zangali Branch)',
            schoolBuildingUrl: '',
            principalMessage: 'Welcome to Pakhtunkhwa Model School. Our mission is to provide high-quality education and build strong character in our students.',
            principalName: 'Principal Tariq Zaman',
            principalUrl: '',
            staffList: [
              { name: 'Dr. Tariq Zaman', title: 'Principal & Physics Head', phone: '+92 333 9123456', email: 'admin@pms.edu', bio: 'PhD in Education with 25 years of academic leadership experience.', url: '', cnic: '17301-1111111-1' },
              { name: 'Sir Niamat Ullah', title: 'Senior Mathematics Head', phone: '+92 312 9876543', email: 'niamat@pms.edu', bio: 'MSc Mathematics, specialized in algebra and trigonometry.', url: '', cnic: '17301-2222222-2' },
              { name: 'Miss Palwasha', title: 'English Literature Lead', phone: '+92 300 1234567', email: 'palwasha@pms.edu', bio: 'MA English, expert in language building and communication skills.', url: '', cnic: '17301-3333333-3' }
            ]
          };
          list.push(defaultSettings);
          writeJSON('settings', list);
          return defaultSettings;
        }
        return list[0];
      }
    },
    findOneAndUpdate: async (query = {}, updateData) => {
      if (useMongoDB) {
        return await TenantModel.findOneAndUpdate(query, updateData, { new: true, upsert: true }).lean();
      } else {
        const list = readJSON('settings');
        let idx = list.findIndex(item => item.key === 'landing_page');
        if (idx === -1) {
          const newItem = {
            _id: new mongoose.Types.ObjectId().toString(),
            key: 'landing_page',
            ...updateData
          };
          list.push(newItem);
          writeJSON('settings', list);
          return newItem;
        } else {
          list[idx] = { ...list[idx], ...updateData };
          writeJSON('settings', list);
          return list[idx];
        }
      }
    }
  },

  attendance: {
    find: async (query = {}) => {
      if (useMongoDB) return await AttendanceModel.find(query).lean();
      return await getJsonDriver('attendance').find(query);
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
      if (useMongoDB) return await FeeModel.find(query).lean();
      return await getJsonDriver('fees').find(query);
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
          breakdown: { tuition: feeData.amount || 0, transport: 0, exam: 0, library: 0 },
          ...feeData
        };
        list.push(newFee);
        writeJSON('fees', list);
        return newFee;
      }
    },
    findByIdAndUpdate: async (id, updateData) => {
      if (useMongoDB) return await FeeModel.findByIdAndUpdate(id, updateData, { new: true }).lean();
      return await getJsonDriver('fees').findByIdAndUpdate(id, updateData);
    }
  },

  exams: {
    find: async (query = {}) => {
      if (useMongoDB) return await ExamModel.find(query).lean();
      return await getJsonDriver('exams').find(query);
    },
    create: async (data) => {
      if (useMongoDB) return await new ExamModel(data).save();
      return await getJsonDriver('exams').create(data);
    },
    findByIdAndUpdate: async (id, updateData) => {
      if (useMongoDB) return await ExamModel.findByIdAndUpdate(id, updateData, { new: true }).lean();
      return await getJsonDriver('exams').findByIdAndUpdate(id, updateData);
    },
    findByIdAndDelete: async (id) => {
      if (useMongoDB) return await ExamModel.findByIdAndDelete(id).lean();
      return await getJsonDriver('exams').findByIdAndDelete(id);
    }
  },

  lms: {
    find: async (query = {}) => {
      if (useMongoDB) return await LMSModel.find(query).lean();
      return await getJsonDriver('lms').find(query);
    },
    findOne: async (query = {}) => {
      if (useMongoDB) return await LMSModel.findOne(query).lean();
      return await getJsonDriver('lms').findOne(query);
    },
    create: async (data) => {
      if (useMongoDB) return await new LMSModel(data).save();
      return await getJsonDriver('lms').create(data);
    },
    findByIdAndUpdate: async (id, updateData) => {
      if (useMongoDB) return await LMSModel.findByIdAndUpdate(id, updateData, { new: true }).lean();
      return await getJsonDriver('lms').findByIdAndUpdate(id, updateData);
    }
  },

  homework: {
    find: async (query = {}) => {
      if (useMongoDB) return await HomeworkModel.find(query).lean();
      return await getJsonDriver('homework').find(query);
    },
    create: async (data) => {
      if (useMongoDB) return await new HomeworkModel(data).save();
      return await getJsonDriver('homework').create(data);
    },
    findByIdAndUpdate: async (id, updateData) => {
      if (useMongoDB) return await HomeworkModel.findByIdAndUpdate(id, updateData, { new: true }).lean();
      return await getJsonDriver('homework').findByIdAndUpdate(id, updateData);
    }
  },

  transport: {
    find: async (query = {}) => {
      if (useMongoDB) return await TransportModel.find(query).lean();
      return await getJsonDriver('transport').find(query);
    },
    create: async (data) => {
      if (useMongoDB) return await new TransportModel(data).save();
      return await getJsonDriver('transport').create(data);
    }
  },

  inventory: {
    find: async (query = {}) => {
      if (useMongoDB) return await InventoryModel.find(query).lean();
      return await getJsonDriver('inventory').find(query);
    },
    create: async (data) => {
      if (useMongoDB) return await new InventoryModel(data).save();
      return await getJsonDriver('inventory').create(data);
    },
    findByIdAndUpdate: async (id, updateData) => {
      if (useMongoDB) return await InventoryModel.findByIdAndUpdate(id, updateData, { new: true }).lean();
      return await getJsonDriver('inventory').findByIdAndUpdate(id, updateData);
    }
  },

  notices: {
    find: async (query = {}) => {
      if (useMongoDB) return await NoticeModel.find(query).sort({ date: -1 }).lean();
      return await getJsonDriver('notices').find(query);
    },
    create: async (noticeData) => {
      if (useMongoDB) {
        const newNotice = new NoticeModel(noticeData);
        return await newNotice.save();
      } else {
        return await getJsonDriver('notices').create(noticeData);
      }
    },
    findByIdAndDelete: async (id) => {
      if (useMongoDB) return await NoticeModel.findByIdAndDelete(id).lean();
      return await getJsonDriver('notices').findByIdAndDelete(id);
    }
  },

  smsLogs: {
    find: async (query = {}) => {
      if (useMongoDB) return await SmsModel.find(query).sort({ date: -1 }).lean();
      return await getJsonDriver('sms_logs').find(query);
    },
    create: async (smsData) => {
      if (useMongoDB) {
        const newSms = new SmsModel(smsData);
        return await newSms.save();
      } else {
        return await getJsonDriver('sms_logs').create(smsData);
      }
    }
  },

  staffAttendance: {
    find: async (query = {}) => {
      if (useMongoDB) return await StaffAttendanceModel.find(query).sort({ date: -1 }).lean();
      return await getJsonDriver('staff_attendance').find(query);
    },
    upsert: async (record) => {
      if (useMongoDB) {
        const query = { staffId: record.staffId, date: record.date };
        return await StaffAttendanceModel.findOneAndUpdate(query, record, { new: true, upsert: true }).lean();
      } else {
        const list = readJSON('staff_attendance');
        const idx = list.findIndex(item => item.staffId === record.staffId && item.date === record.date);
        const newRecord = {
          _id: new mongoose.Types.ObjectId().toString(),
          ...record
        };
        if (idx === -1) {
          list.push(newRecord);
          writeJSON('staff_attendance', list);
          return newRecord;
        } else {
          list[idx] = { ...list[idx], ...record };
          writeJSON('staff_attendance', list);
          return list[idx];
        }
      }
    }
  },

  inquiries: {
    find: async (query = {}) => {
      if (useMongoDB) return await InquiryModel.find(query).sort({ date: -1 }).lean();
      return await getJsonDriver('inquiries').find(query);
    },
    create: async (inquiryData) => {
      if (useMongoDB) {
        const newInquiry = new InquiryModel(inquiryData);
        return await newInquiry.save();
      } else {
        return await getJsonDriver('inquiries').create(inquiryData);
      }
    },
    findByIdAndUpdate: async (id, updateData) => {
      if (useMongoDB) return await InquiryModel.findByIdAndUpdate(id, updateData, { new: true }).lean();
      return await getJsonDriver('inquiries').findByIdAndUpdate(id, updateData);
    },
    findByIdAndDelete: async (id) => {
      if (useMongoDB) return await InquiryModel.findByIdAndDelete(id).lean();
      return await getJsonDriver('inquiries').findByIdAndDelete(id);
    }
  },

  emailLogs: {
    find: async (query = {}) => {
      if (useMongoDB) return await EmailLogModel.find(query).sort({ date: -1 }).lean();
      return await getJsonDriver('email_logs').find(query);
    },
    create: async (emailData) => {
      if (useMongoDB) {
        const newLog = new EmailLogModel(emailData);
        return await newLog.save();
      } else {
        return await getJsonDriver('email_logs').create(emailData);
      }
    }
  },

  auditLogs: {
    find: async (query = {}) => {
      if (useMongoDB) return await AuditLogModel.find(query).sort({ date: -1 }).lean();
      return await getJsonDriver('audit_logs').find(query);
    },
    create: async (data) => {
      if (useMongoDB) return await new AuditLogModel(data).save();
      return await getJsonDriver('audit_logs').create(data);
    }
  }
};

module.exports = dbService;
