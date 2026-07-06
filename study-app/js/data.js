const DB = {
  _get(key) { return JSON.parse(localStorage.getItem('studyapp_' + key) || 'null'); },
  _set(key, val) { localStorage.setItem('studyapp_' + key, JSON.stringify(val)); return val; },

  init() {
    const now = new Date();
    const today = now.toISOString().slice(0,10);
    const dataVer = this._get('dataVer') || 0;
    const hadOldData = !!this._get('inited');

    // already at latest version
    if (dataVer >= 2) return;

    // migration from v1 to v2: just add leaveRequests table
    if (dataVer === 1 || (dataVer === 0 && hadOldData)) {
      if (!this._get('leaveRequests')) {
        this._set('leaveRequests', [
          { id:1, student_id:1, course_id:1, type:'sick', start_date:new Date(Date.now() + 86400000).toISOString().slice(0,10), end_date:new Date(Date.now() + 172800000).toISOString().slice(0,10), reason:'感冒发烧，需要休息两天', status:'pending', approver_id:null, comment:'', created_at:new Date(Date.now() - 86400000).toISOString(), updated_at:new Date(Date.now() - 86400000).toISOString() },
          { id:2, student_id:1, course_id:null, type:'personal', start_date:new Date(Date.now() + 259200000).toISOString().slice(0,10), end_date:new Date(Date.now() + 345600000).toISOString().slice(0,10), reason:'家里有急事需要处理', status:'approved', approver_id:2, comment:'同意，注意安全', created_at:new Date(Date.now() - 172800000).toISOString(), updated_at:new Date(Date.now() - 86400000).toISOString() },
        ]);
      }
      this._set('dataVer', 2);
      return;
    }

    const users = [
      { id:1, email:'student@test.com', password:'123456', role:'student', nickname:'张同学', avatar:'', bio:'好好学习天天向上', student_id:'2024001', department:'计算机学院', settings:{}, created_at:'2024-01-01T00:00:00Z' },
      { id:2, email:'teacher@test.com', password:'123456', role:'teacher', nickname:'李老师', avatar:'', bio:'认真教学', teacher_title:'副教授', department:'计算机学院', settings:{}, created_at:'2024-01-01T00:00:00Z' },
      { id:3, email:'admin@test.com', password:'123456', role:'admin', nickname:'管理员', avatar:'', bio:'系统管理员', department:'信息中心', settings:{}, created_at:'2024-01-01T00:00:00Z' },
    ];
    const courses = [
      { id:1, teacher_id:2, name:'高等数学', description:'微积分、线性代数、概率论', cover_color:'#4a6cf7', semester:'2025-2026-1', department:'计算机学院', credits:4, status:'published', max_students:100, created_at:'2024-08-01T00:00:00Z' },
      { id:2, teacher_id:2, name:'数据结构与算法', description:'链表、树、图、排序算法', cover_color:'#22c55e', semester:'2025-2026-1', department:'计算机学院', credits:3, status:'published', max_students:80, created_at:'2024-08-01T00:00:00Z' },
      { id:3, teacher_id:2, name:'操作系统', description:'进程管理、内存管理、文件系统', cover_color:'#f59e0b', semester:'2025-2026-1', department:'计算机学院', credits:3, status:'published', max_students:80, created_at:'2024-08-01T00:00:00Z' },
    ];
    const enrollments = [
      { id:1, course_id:1, student_id:1, status:'approved', enrolled_at:'2024-09-01T00:00:00Z' },
      { id:2, course_id:2, student_id:1, status:'approved', enrolled_at:'2024-09-01T00:00:00Z' },
    ];
    const assignments = [
      { id:1, course_id:1, teacher_id:2, title:'第一章 函数与极限', description:'完成课本 P23 习题 1-8', full_score:100, weight:0.2, due_date:'2025-10-15T23:59:00Z', type:'essay', status:'published', created_at:'2024-10-01T00:00:00Z' },
      { id:2, course_id:1, teacher_id:2, title:'第二章 导数与微分', description:'完成课本 P56 习题 1-10', full_score:100, weight:0.2, due_date:'2025-11-01T23:59:00Z', type:'essay', status:'published', created_at:'2024-10-15T00:00:00Z' },
      { id:3, course_id:2, teacher_id:2, title:'线性表操作', description:'实现顺序表和链表的增删改查', full_score:100, weight:0.3, due_date:'2025-10-20T23:59:00Z', type:'file', status:'published', created_at:'2024-10-05T00:00:00Z' },
    ];
    const submissions = [
      { id:1, assignment_id:1, student_id:1, content_text:'函数极限的解题过程：1. 利用等价无穷小替换...', file_url:'', submit_count:1, status:'submitted', submitted_at:'2025-10-14T20:30:00Z', is_late:false },
    ];
    const grades = [
      { id:1, type:'assignment', assignment_id:1, course_id:1, student_id:1, submission_id:1, score:88, comment:'解题思路清晰，步骤完整，注意书写规范。', graded_by:2, graded_at:'2025-10-16T10:00:00Z' },
    ];
    const notes = [
      { id:1, user_id:1, notebook_id:1, title:'高数第一章笔记', content_markdown:'# 函数与极限\n\n## 1.1 映射与函数\n- 函数定义：...\n- 复合函数：...', tags:['重点','考试'], is_pinned:0, word_count:1200, read_count:15, created_at:'2025-09-10T08:00:00Z', updated_at:'2025-09-15T10:00:00Z' },
      { id:2, user_id:1, notebook_id:1, title:'导数公式表', content_markdown:'# 常用导数公式\n\n1. (x^n)\' = nx^(n-1)\n2. (sin x)\' = cos x', tags:['公式'], is_pinned:1, word_count:800, read_count:23, created_at:'2025-09-12T09:00:00Z', updated_at:'2025-09-13T11:00:00Z' },
      { id:3, user_id:1, notebook_id:2, title:'链表操作总结', content_markdown:'# 链表\n\n## 单链表\n- 插入 O(1)\n- 删除 O(1)\n- 查找 O(n)', tags:['数据结构'], is_pinned:0, word_count:600, read_count:8, created_at:'2025-09-18T14:00:00Z' },
    ];
    const notebooks = [
      { id:1, user_id:1, name:'高等数学', parent_id:null, sort_order:0, icon:'📐', color:'#4a6cf7' },
      { id:2, user_id:1, name:'数据结构', parent_id:null, sort_order:1, icon:'💻', color:'#22c55e' },
      { id:3, user_id:1, name:'大学课程', parent_id:null, sort_order:0, icon:'📚', color:'#f59e0b' },
      { id:4, user_id:1, name:'大学英语', parent_id:3, sort_order:0, icon:'🇬🇧', color:'#a855f7' },
    ];
    const tasks = [
      { id:1, user_id:1, parent_id:null, title:'复习高数第三章', description:'', priority:'high', status:'in_progress', due_date:'2025-10-20', estimated_minutes:120, actual_minutes:0, sort_order:0, tags:['考试'] },
      { id:2, user_id:1, parent_id:null, title:'完成数据结构大作业', description:'实现一个简易数据库系统', priority:'medium', status:'pending', due_date:'2025-11-01', estimated_minutes:300, actual_minutes:0, sort_order:1, tags:['作业'] },
      { id:3, user_id:1, parent_id:1, title:'复习导数部分', description:'重点是复合函数求导', priority:'high', status:'pending', due_date:'2025-10-18', estimated_minutes:60, actual_minutes:0, sort_order:0, tags:[] },
      { id:4, user_id:1, parent_id:null, title:'每天背单词 30 个', description:'', priority:'low', status:'completed', due_date:'2025-10-30', estimated_minutes:30, actual_minutes:25, sort_order:2, tags:['英语'], completed_at:'2025-10-13T08:00:00Z' },
    ];
    const pomodoro = [
      { id:1, user_id:1, task_id:null, planned_minutes:25, actual_minutes:25, type:'focus', note:'今天状态不错', started_at:'2025-10-13T09:00:00Z', ended_at:'2025-10-13T09:25:00Z' },
      { id:2, user_id:1, task_id:1, planned_minutes:25, actual_minutes:25, type:'focus', note:'', started_at:'2025-10-13T10:00:00Z', ended_at:'2025-10-13T10:25:00Z' },
      { id:3, user_id:1, task_id:null, planned_minutes:25, actual_minutes:20, type:'focus', note:'被打断了', started_at:'2025-10-12T14:00:00Z', ended_at:'2025-10-12T14:20:00Z' },
      { id:4, user_id:1, task_id:null, planned_minutes:5, actual_minutes:5, type:'short_break', note:'', started_at:'2025-10-13T09:25:00Z', ended_at:'2025-10-13T09:30:00Z' },
    ];
    const checkins = [];
    for (let i = 0; i < 20; i++) {
      const d = new Date(now); d.setDate(d.getDate() - i - 1);
      if (i % 3 !== 0) checkins.push({ id:i+1, user_id:1, checkin_date:d.toISOString().slice(0,10), mood_score:Math.floor(Math.random()*3)+3, journal:'今天学习了', study_minutes:Math.floor(Math.random()*120)+60 });
    }
    const materials = [
      { id:1, user_id:1, course_id:1, original_filename:'高数第一章课件.pdf', file_type:'pdf', file_size:2048000, course_name:'高等数学', tags:['课件'], uploaded_at:'2025-09-05T10:00:00Z' },
      { id:2, user_id:1, course_id:2, original_filename:'数据结构PPT.pptx', file_type:'other', file_size:5120000, course_name:'数据结构与算法', tags:['课件'], uploaded_at:'2025-09-08T14:00:00Z' },
    ];
    const dailyStats = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date(now); d.setDate(d.getDate() - i);
      dailyStats.push({ id:i+1, user_id:1, stat_date:d.toISOString().slice(0,10), total_focus_minutes:Math.floor(Math.random()*150)+30, has_checkin:i%3!==0?1:0, completed_tasks:Math.floor(Math.random()*3), new_notes:Math.floor(Math.random()*2), new_words:Math.floor(Math.random()*500)+100 });
    }
    const announcements = [
      { id:1, scope:'system', course_id:null, publisher_id:3, title:'系统维护通知', content:'系统将于本周六凌晨 2:00-4:00 进行维护升级。', is_pinned:1, start_at:null, end_at:'2025-11-01T00:00:00Z', published_at:'2025-10-10T08:00:00Z' },
      { id:2, scope:'course', course_id:1, publisher_id:2, title:'下周考试通知', content:'下周三（10月25日）进行第一章单元测验，请同学们做好准备。', is_pinned:1, start_at:null, end_at:null, published_at:'2025-10-12T09:00:00Z' },
    ];
    const auditLogs = [
      { id:1, admin_id:3, action:'user_ban', target_type:'users', target_id:5, detail:'{"reason":"恶意灌水","previous_status":"active"}', ip_address:'192.168.1.100', created_at:'2025-10-01T08:00:00Z' },
      { id:2, admin_id:3, action:'config_update', target_type:'system_configs', target_id:1, detail:'{"key":"registration_enabled","old":"true","new":"false"}', ip_address:'192.168.1.100', created_at:'2025-10-05T10:30:00Z' },
    ];
    const configs = [
      { id:1, config_key:'registration_enabled', config_value:'true', description:'是否允许新用户注册' },
      { id:2, config_key:'default_pomodoro_minutes', config_value:'25', description:'番茄钟默认时长(分钟)' },
      { id:3, config_key:'max_file_size_mb', config_value:'50', description:'上传文件大小上限(MB)' },
      { id:4, config_key:'allowed_file_types', config_value:'["pdf","docx","jpg","png","pptx"]', description:'允许上传的文件类型' },
    ];
    const notifications = [
      { id:1, user_id:1, title:'欢迎使用轻学 🎉', content:'欢迎加入轻学学习平台，祝你学习愉快！', type:'system', related_id:null, is_read:0, created_at:new Date(Date.now() - 3600000).toISOString() },
      { id:2, user_id:1, title:'高数第一章作业已批改', content:'你的作业获得 88 分（满分100），查看评语了解详情。', type:'grade', related_id:1, is_read:0, created_at:new Date(Date.now() - 7200000).toISOString() },
      { id:3, user_id:1, title:'线性表操作即将截止', content:'距离作业截止还有不到 2 天，请尽快提交。', type:'assignment', related_id:3, is_read:0, created_at:new Date(Date.now() - 86400000).toISOString() },
      { id:4, user_id:1, title:'下周考试通知', content:'第一章单元测验将于下周三进行，请做好准备。', type:'course', related_id:1, is_read:0, created_at:new Date(Date.now() - 172800000).toISOString() },
    ];
    const leaveRequests = [
      { id:1, student_id:1, course_id:1, type:'sick', start_date:new Date(Date.now() + 86400000).toISOString().slice(0,10), end_date:new Date(Date.now() + 172800000).toISOString().slice(0,10), reason:'感冒发烧，需要休息两天', status:'pending', approver_id:null, comment:'', created_at:new Date(Date.now() - 86400000).toISOString(), updated_at:new Date(Date.now() - 86400000).toISOString() },
      { id:2, student_id:1, course_id:null, type:'personal', start_date:new Date(Date.now() + 259200000).toISOString().slice(0,10), end_date:new Date(Date.now() + 345600000).toISOString().slice(0,10), reason:'家里有急事需要处理', status:'approved', approver_id:2, comment:'同意，注意安全', created_at:new Date(Date.now() - 172800000).toISOString(), updated_at:new Date(Date.now() - 86400000).toISOString() },
    ];
    this._set('dataVer', 2);
    this._set('users', users); this._set('courses', courses); this._set('enrollments', enrollments);
    this._set('assignments', assignments); this._set('submissions', submissions); this._set('grades', grades);
    this._set('notes', notes); this._set('notebooks', notebooks); this._set('tasks', tasks);
    this._set('pomodoro', pomodoro); this._set('checkins', checkins); this._set('materials', materials);
    this._set('dailyStats', dailyStats); this._set('announcements', announcements);
    this._set('auditLogs', auditLogs); this._set('systemConfigs', configs);
    this._set('notifications', notifications);
    this._set('leaveRequests', leaveRequests);
  },

  auth: {
    login(email, password) {
      const users = DB._get('users') || [];
      return users.find(u => u.email === email && u.password === password) || null;
    },
    register(data) {
      const users = DB._get('users') || [];
      if (users.find(u => u.email === data.email)) return null;
      const id = Math.max(...users.map(u=>u.id), 0) + 1;
      const user = { id, ...data, avatar:'', bio:'', settings:{}, created_at:new Date().toISOString() };
      users.push(user); DB._set('users', users);
      return user;
    }
  },

  get(table) { return DB._get(table) || []; },
  set(table, data) { return DB._set(table, data); },
  add(table, item) {
    const arr = DB._get(table) || [];
    item.id = Math.max(...arr.map(x=>x.id||0), 0) + 1;
    item.created_at = new Date().toISOString();
    item.updated_at = item.created_at;
    arr.push(item); DB._set(table, arr); return item;
  },
  update(table, id, changes) {
    const arr = DB._get(table) || [];
    const idx = arr.findIndex(x => x.id === id);
    if (idx === -1) return null;
    changes.updated_at = new Date().toISOString();
    arr[idx] = { ...arr[idx], ...changes }; DB._set(table, arr); return arr[idx];
  },
  remove(table, id) {
    let arr = DB._get(table) || [];
    arr = arr.filter(x => x.id !== id); DB._set(table, arr);
  },
  find(table, predicate) {
    const arr = DB._get(table) || [];
    return predicate ? arr.filter(predicate) : arr;
  },
  findOne(table, predicate) {
    const arr = DB._get(table) || [];
    return predicate ? arr.find(predicate) : arr[0];
  },
  getNextId(table) {
    const arr = DB._get(table) || [];
    return Math.max(...arr.map(x=>x.id||0), 0) + 1;
  },

  getNotifications(userId) {
    return (DB._get('notifications') || []).filter(n => n.user_id === userId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  getUnreadCount(userId) {
    return (DB._get('notifications') || []).filter(n => n.user_id === userId && !n.is_read).length;
  },

  addNotification(userId, title, content, type, relatedId) {
    const arr = DB._get('notifications') || [];
    const id = Math.max(...arr.map(x=>x.id||0), 0) + 1;
    arr.push({ id, user_id: userId, title, content, type: type || 'system', related_id: relatedId || null, is_read: 0, created_at: new Date().toISOString() });
    DB._set('notifications', arr);
    return id;
  },

  markNotifRead(id) {
    DB.update('notifications', id, { is_read: 1 });
  },

  markAllNotifRead(userId) {
    const arr = DB._get('notifications') || [];
    arr.forEach(n => { if (n.user_id === userId) n.is_read = 1; });
    DB._set('notifications', arr);
  },

  addLeaveRequest(studentId, data) {
    const arr = DB._get('leaveRequests') || [];
    const id = Math.max(...arr.map(x=>x.id||0), 0) + 1;
    const item = { id, student_id: studentId, course_id: data.course_id || null, type: data.type || 'other', start_date: data.start_date, end_date: data.end_date, reason: data.reason, status: 'pending', approver_id: null, comment: '', created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    arr.push(item); DB._set('leaveRequests', arr);
    DB.addNotification(studentId, '请假申请已提交', '你的请假申请已提交，等待审批。', 'system', id);
    return item;
  },

  approveLeaveRequest(id, approverId, comment) {
    const item = DB.update('leaveRequests', id, { status: 'approved', approver_id: approverId, comment: comment || '已批准' });
    if (item) DB.addNotification(item.student_id, '请假已批准', '你的请假申请已被批准' + (comment ? '，审批意见：' + comment : '') + '。', 'system', id);
    return item;
  },

  rejectLeaveRequest(id, approverId, comment) {
    const item = DB.update('leaveRequests', id, { status: 'rejected', approver_id: approverId, comment: comment || '未通过' });
    if (item) DB.addNotification(item.student_id, '请假未通过', '你的请假申请未通过' + (comment ? '，原因：' + comment : '') + '。', 'system', id);
    return item;
  }
};
