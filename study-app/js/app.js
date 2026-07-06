const App = {
  state: { user: null, currentPage: 'home', currentTab: '' },

  init() {
    DB.init();
    const saved = sessionStorage.getItem('studyapp_session');
    if (saved) { this.state.user = JSON.parse(saved); this.showDashboard(); return; }
    this.showLogin();
  },

  showLogin() {
    document.getElementById('app-root').innerHTML = `
      <div class="login-page">
        <div class="login-left">
          <h1>📚 轻学</h1>
          <p>轻量级学习工具 · 让学习更高效</p>
        </div>
        <div class="login-right">
          <div class="login-card">
            <h2 id="auth-title">登录</h2>
            <p class="subtitle" id="auth-subtitle">欢迎回来，请登录你的账号</p>
            <div class="role-selector" id="role-selector">
              <div class="role-option active" data-role="student"><div class="icon">🎓</div><div class="name">学生</div></div>
              <div class="role-option" data-role="teacher"><div class="icon">👨‍🏫</div><div class="name">教师</div></div>
              <div class="role-option" data-role="admin"><div class="icon">⚙️</div><div class="name">管理员</div></div>
            </div>
            <div id="auth-form">
              <div class="form-group"><label>邮箱</label><input type="email" id="login-email" placeholder="请输入邮箱" value="student@test.com"></div>
              <div class="form-group"><label>密码</label><input type="password" id="login-password" placeholder="请输入密码" value="123456"></div>
              <button class="btn btn-primary btn-block" onclick="App.doLogin()">登 录</button>
            </div>
            <p class="auth-switch" id="auth-switch">还没有账号？<a onclick="App.showRegister()">立即注册</a></p>
            <p class="auth-switch mt-2" style="font-size:.75rem;color:var(--gray-400)">测试账号：student/teacher/admin@test.com · 密码 123456</p>
          </div>
        </div>
      </div>`;
    document.querySelectorAll('.role-option').forEach(el => {
      el.onclick = () => {
        document.querySelectorAll('.role-option').forEach(r => r.classList.remove('active'));
        el.classList.add('active');
        const role = el.dataset.role;
        const emails = { student:'student@test.com', teacher:'teacher@test.com', admin:'admin@test.com' };
        document.getElementById('login-email').value = emails[role];
      };
    });
  },

  showRegister() {
    document.getElementById('auth-title').textContent = '注册';
    document.getElementById('auth-subtitle').textContent = '创建你的学习账号';
    document.getElementById('auth-form').innerHTML = `
      <div class="form-row">
        <div class="form-group"><label>邮箱</label><input type="email" id="reg-email" placeholder="请输入邮箱"></div>
        <div class="form-group"><label>昵称</label><input type="text" id="reg-nickname" placeholder="请输入昵称"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>密码</label><input type="password" id="reg-password" placeholder="请输入密码"></div>
        <div class="form-group"><label>确认密码</label><input type="password" id="reg-confirm" placeholder="请确认密码"></div>
      </div>
      <div class="form-group"><label>学号（选填）</label><input type="text" id="reg-student-id" placeholder="请输入学号"></div>
      <button class="btn btn-primary btn-block" onclick="App.doRegister()">注 册</button>
    `;
    document.getElementById('auth-switch').innerHTML = '已有账号？<a onclick="App.showLogin()">返回登录</a>';
  },

  doLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const role = document.querySelector('.role-option.active')?.dataset.role || 'student';
    const user = DB.auth.login(email, password);
    if (!user) { this.toast('邮箱或密码错误', 'error'); return; }
    if (user.role !== role) { this.toast(`该账号不是${ {student:'学生',teacher:'教师',admin:'管理员'}[role] }角色`, 'error'); return; }
    this.state.user = user;
    sessionStorage.setItem('studyapp_session', JSON.stringify(user));
    this.showDashboard();
  },

  doRegister() {
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-confirm').value;
    const nickname = document.getElementById('reg-nickname').value;
    if (!email || !password || !nickname) { this.toast('请填写必填字段', 'error'); return; }
    if (password !== confirm) { this.toast('两次密码不一致', 'error'); return; }
    const studentId = document.getElementById('reg-student-id').value || null;
    const user = DB.auth.register({ email, password, nickname, role:'student', student_id:studentId });
    if (!user) { this.toast('该邮箱已被注册', 'error'); return; }
    this.toast('注册成功，请登录', 'success');
    this.showLogin();
  },

  logout() {
    this.state.user = null;
    sessionStorage.removeItem('studyapp_session');
    this.showLogin();
  },

  showDashboard() {
    const user = this.state.user;
    if (!user) { this.showLogin(); return; }
    const roleMap = { student: '学生', teacher: '教师', admin: '管理员' };
    const roleEmoji = { student: '🎓', teacher: '👨‍🏫', admin: '⚙️' };
    const roleClass = { student: 'student', teacher: 'teacher', admin: 'admin' };

    const navSections = {
      student: [
        { section:'学习', items:[
          { id:'home', icon:'🏠', label:'首页概览' },
          { id:'courses', icon:'📚', label:'我的课程' },
          { id:'notes', icon:'📝', label:'学习笔记' },
          { id:'tasks', icon:'✅', label:'任务清单' },
        ]},
        { section:'效率', items:[
          { id:'pomodoro', icon:'🍅', label:'番茄钟' },
          { id:'checkin', icon:'📅', label:'每日打卡' },
        ]},
        { section:'学习', items:[
          { id:'materials', icon:'📁', label:'学习资料' },
          { id:'assignments', icon:'📋', label:'课程作业' },
          { id:'grades', icon:'🏆', label:'成绩查看' },
          { id:'stats', icon:'📊', label:'学习统计' },
        ]},
        { section:'行政', items:[
          { id:'leave', icon:'📋', label:'请假管理' },
        ]},
      ],
      teacher: [
        { section:'教学', items:[
          { id:'home', icon:'🏠', label:'首页概览' },
          { id:'courses', icon:'📚', label:'课程管理' },
          { id:'assignments', icon:'📋', label:'作业管理' },
        ]},
        { section:'管理', items:[
          { id:'students', icon:'👥', label:'学生管理' },
          { id:'announcements', icon:'📢', label:'发布公告' },
        ]},
        { section:'行政', items:[
          { id:'leave', icon:'📋', label:'请假审批' },
        ]},
      ],
      admin: [
        { section:'管理', items:[
          { id:'home', icon:'🏠', label:'控制台' },
          { id:'users', icon:'👥', label:'用户管理' },
          { id:'announcements', icon:'📢', label:'公告管理' },
        ]},
        { section:'系统', items:[
          { id:'config', icon:'⚙️', label:'系统配置' },
          { id:'audit', icon:'📜', label:'审计日志' },
        ]},
        { section:'行政', items:[
          { id:'leave', icon:'📋', label:'请假管理' },
        ]},
      ]
    };

    const sections = navSections[user.role] || [];
    const navHTML = sections.map(s => `
      <div class="nav-section">
        <div class="nav-section-title">${s.section}</div>
        ${s.items.map(i => `<a class="nav-item" data-page="${i.id}" onclick="App.navigate('${i.id}')"><span class="nav-icon">${i.icon}</span>${i.label}</a>`).join('')}
      </div>
    `).join('');

    const pageTitles = {
      home:'首页概览', courses:'我的课程', notes:'学习笔记', tasks:'任务清单',
      pomodoro:'番茄钟', checkin:'每日打卡', materials:'学习资料',
      assignments:'课程作业', grades:'成绩查看', stats:'学习统计',
      students:'学生管理', announcements:'发布公告',
      users:'用户管理', config:'系统配置', audit:'审计日志'
    };

    document.getElementById('app-root').innerHTML = `
      <div class="app-layout">
        <aside class="sidebar" id="sidebar">
          <div class="sidebar-brand">
            <div class="logo">轻</div>
            <h2>轻学</h2>
          </div>
          <nav class="sidebar-nav">${navHTML}</nav>
          <div class="sidebar-footer">
            <div class="user-info" onclick="App.toggleSidebar()">
              <div class="user-avatar ${roleClass[user.role]}">${user.nickname[0]}</div>
              <div class="user-details">
                <div class="name">${user.nickname}</div>
                <div class="role">${roleEmoji[user.role]} ${roleMap[user.role]}${user.department ? ' · '+user.department : ''}</div>
              </div>
            </div>
            <div style="display:flex;gap:6px;margin-top:10px;padding:0 4px">
              <button class="btn btn-outline btn-sm" style="flex:1;font-size:.75rem" onclick="App.exportData()" title="导出数据备份">📤 导出</button>
              <button class="btn btn-outline btn-sm" style="flex:1;font-size:.75rem" onclick="App.showImportDialog()" title="导入数据恢复">📥 导入</button>
            </div>
          </div>
        </aside>
        <main class="main-content">
          <div class="topbar">
            <button class="mobile-toggle" onclick="App.toggleSidebar()">☰</button>
            <h1 id="page-title">首页概览</h1>
            <div class="topbar-actions">
              <span style="font-size:.85rem;color:var(--gray-500)">${user.email}</span>
              <button class="notif-btn" onclick="App.toggleNotifications()" id="notif-btn" title="通知">
                🔔<span id="notif-badge" class="badge-dot" style="display:none">0</span>
              </button>
              <button class="btn btn-outline btn-sm" onclick="App.toggleTheme()" id="theme-btn" title="切换深色模式">🌙</button>
              <button class="btn btn-outline btn-sm" onclick="App.logout()">退出</button>
            </div>
          </div>
          <div class="content" id="page-content"></div>
        </main>
      </div>
      <div class="toast-container" id="toast-container"></div>
      <div class="modal-overlay" id="modal-overlay"><div class="modal" id="modal-content"></div></div>
      <div class="notif-panel" id="notif-panel">
        <div class="notif-header">
          <h4>🔔 通知</h4>
          <button class="btn-text" onclick="App.markAllNotifRead()">全部已读</button>
        </div>
        <div class="notif-list" id="notif-list"></div>
      </div>
    `;

    this.initTheme();
    this.navigate('home');
    this.bindGlobalEvents();
    this.initShortcuts();
    this.checkNotifications();
    this.updateNotifBadge();
  },

  toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
  },

  bindGlobalEvents() {
    document.getElementById('modal-overlay').onclick = function(e) {
      if (e.target === this) this.classList.remove('show');
    };
    document.addEventListener('click', (e) => {
      const panel = document.getElementById('notif-panel');
      const btn = document.getElementById('notif-btn');
      if (panel && panel.classList.contains('show') && !panel.contains(e.target) && btn !== e.target && !btn.contains(e.target)) {
        panel.classList.remove('show');
      }
    });
  },

  navigate(page) {
    this.state.currentPage = page;
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.page === page);
    });
    const titles = { home:'首页概览', courses:'我的课程', notes:'学习笔记', tasks:'任务清单',
      pomodoro:'番茄钟', checkin:'每日打卡', materials:'学习资料',
      assignments:'课程作业', grades:'成绩查看', stats:'学习统计',
      students:'学生管理', announcements:'发布公告',
      users:'用户管理', config:'系统配置', audit:'审计日志',
      leave:'请假管理' };
    document.getElementById('page-title').textContent = titles[page] || page;

    const renderers = {
      home: () => this.renderHome(),
      courses: () => this.renderCourses(),
      notes: () => this.renderNotes(),
      tasks: () => this.renderTasks(),
      pomodoro: () => this.renderPomodoro(),
      checkin: () => this.renderCheckin(),
      materials: () => this.renderMaterials(),
      assignments: () => this.renderAssignments(),
      grades: () => this.renderGrades(),
      stats: () => this.renderStats(),
      students: () => this.renderStudents(),
      announcements: () => this.renderAnnouncements(),
      users: () => this.renderUsers(),
      config: () => this.renderConfig(),
      audit: () => this.renderAudit(),
      leave: () => this.renderLeave(),
    };
    const content = document.getElementById('page-content');
    if (renderers[page]) { renderers[page](); }
    else { content.innerHTML = '<div class="empty-state"><div class="icon">🚧</div><h3>功能开发中</h3></div>'; }
    window.scrollTo(0, 0);
  },

  /* ==================== HOME (共用) ==================== */
  renderHome() {
    const user = this.state.user;
    if (user.role === 'student') return this.renderStudentHome();
    if (user.role === 'teacher') return this.renderTeacherHome();
    if (user.role === 'admin') return this.renderAdminHome();
  },

  renderStudentHome() {
    const stats = DB.get('dailyStats').filter(s => s.user_id === this.state.user.id);
    const latest = stats[stats.length - 1] || { total_focus_minutes:0, has_checkin:0, completed_tasks:0, new_notes:0 };
    const totalFocus = stats.reduce((a,b) => a + b.total_focus_minutes, 0);
    const totalTasks = stats.reduce((a,b) => a + b.completed_tasks, 0);
    const totalNotes = stats.reduce((a,b) => a + b.new_notes, 0);
    const checkinCount = DB.get('checkins').filter(c => c.user_id === this.state.user.id).length;
    const courses = DB.get('enrollments').filter(e => e.student_id === this.state.user.id).length;
    const pendingTasks = DB.get('tasks').filter(t => t.user_id === this.state.user.id && t.status === 'pending' && !t.parent_id).length;
    const recentNotes = DB.get('notes').filter(n => n.user_id === this.state.user.id).sort((a,b) => b.updated_at?.localeCompare(a.updated_at)).slice(0, 3);
    const announcements = DB.get('announcements').filter(a => a.scope === 'system' || (a.scope === 'course' && DB.get('enrollments').find(e => e.student_id === this.state.user.id && e.course_id === a.course_id)));

    const weekDays = ['日','一','二','三','四','五','六'];
    const today = new Date();
    const weekLabels = [];
    const weekData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today); d.setDate(d.getDate() - i);
      weekLabels.push(weekDays[d.getDay()]);
      const s = stats.find(x => x.stat_date === d.toISOString().slice(0,10));
      weekData.push(s ? s.total_focus_minutes : 0);
    }
    const maxData = Math.max(...weekData, 1);

    const html = `
      <div class="stat-grid">
        <div class="stat-card"><div class="stat-icon blue">📚</div><div class="stat-info"><h4>${courses}</h4><p>已选课程</p></div></div>
        <div class="stat-card"><div class="stat-icon green">🍅</div><div class="stat-info"><h4>${Math.floor(totalFocus/60)}h${totalFocus%60}m</h4><p>累计专注</p></div></div>
        <div class="stat-card"><div class="stat-icon orange">📅</div><div class="stat-info"><h4>${checkinCount}天</h4><p>累计打卡</p></div></div>
        <div class="stat-card"><div class="stat-icon purple">✅</div><div class="stat-info"><h4>${pendingTasks}</h4><p>待完成</p></div></div>
      </div>
      <div class="grid-2">
        <div class="card">
          <div class="card-header"><h3>📊 本周专注趋势</h3></div>
          <div style="display:flex;align-items:end;height:120px;gap:8px;padding:10px 0">
            ${weekLabels.map((l,i) => `
              <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px">
                <div style="width:100%;background:var(--primary-light);border-radius:4px 4px 0 0;height:${weekData[i]/maxData*100}px;min-height:4px;position:relative;transition:height .5s">
                  <span style="position:absolute;top:-20px;left:50%;transform:translateX(-50%);font-size:.7rem;color:var(--gray-500)">${weekData[i]}</span>
                </div>
                <span style="font-size:.75rem;color:var(--gray-400)">${l}</span>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="card">
          <div class="card-header"><h3>📢 最新公告</h3></div>
          ${announcements.length ? announcements.slice(0,3).map(a => `
            <div class="note-item" onclick="App.showAnnouncementDetail(${a.id})">
              <h4>${a.is_pinned ? '📌 ' : ''}${a.title}</h4>
              <p>${a.content?.slice(0,60)}...</p>
              <div class="meta">${a.scope === 'system' ? '系统' : '课程'} · ${a.published_at?.slice(0,10)}</div>
            </div>
          `).join('') : '<div class="empty-state" style="padding:30px"><p>暂无公告</p></div>'}
        </div>
      </div>
      <div class="card">
        <div class="card-header"><h3>📝 最近编辑的笔记</h3></div>
        ${recentNotes.length ? recentNotes.map(n => `
          <div class="note-item" onclick="App.editNote(${n.id})">
            <h4>${n.title}</h4>
            <p>${n.content_markdown?.slice(0,80) || ''}</p>
            <div class="meta">${n.tags?.length ? n.tags.map(t=>`<span class="badge badge-primary">${t}</span>`).join(' ') : ''} · ${n.updated_at?.slice(0,10)}</div>
          </div>
        `).join('') : '<div class="empty-state" style="padding:30px"><p>还没有笔记，快去写一篇吧</p></div>'}
      </div>`;
    document.getElementById('page-content').innerHTML = html;
  },

  renderTeacherHome() {
    const myCourses = DB.get('courses').filter(c => c.teacher_id === this.state.user.id);
    const totalStudents = DB.get('enrollments').filter(e => myCourses.some(c => c.id === e.course_id) && e.status === 'approved').length;
    const totalAssignments = DB.get('assignments').filter(a => myCourses.some(c => c.id === a.course_id)).length;
    const pendingGrading = DB.get('submissions').filter(s => s.status === 'submitted' && DB.get('assignments').some(a => a.id === s.assignment_id && myCourses.some(c => c.id === a.course_id))).length;
    const today = new Date().toISOString().slice(0,10);
    const todayCheckins = DB.get('checkins').filter(c => c.checkin_date === today).length;

    const html = `
      <div class="stat-grid">
        <div class="stat-card"><div class="stat-icon blue">📚</div><div class="stat-info"><h4>${myCourses.length}</h4><p>我的课程</p></div></div>
        <div class="stat-card"><div class="stat-icon green">👥</div><div class="stat-info"><h4>${totalStudents}</h4><p>在读学生</p></div></div>
        <div class="stat-card"><div class="stat-icon orange">📋</div><div class="stat-info"><h4>${pendingGrading}</h4><p>待批改</p></div></div>
        <div class="stat-card"><div class="stat-icon purple">📝</div><div class="stat-info"><h4>${totalAssignments}</h4><p>已发布作业</p></div></div>
      </div>
      <div class="grid-2">
        <div class="card">
          <div class="card-header"><h3>📚 我的课程</h3></div>
          ${myCourses.length ? myCourses.map(c => `
            <div class="note-item" onclick="App.navigate('courses')">
              <h4>${c.name}</h4>
              <p>${c.description?.slice(0,60) || ''} · ${c.semester}</p>
              <div class="meta">${DB.get('enrollments').filter(e=>e.course_id===c.id&&e.status==='approved').length} 名学生</div>
            </div>
          `).join('') : '<div class="empty-state" style="padding:30px"><p>还没有课程</p></div>'}
        </div>
        <div class="card">
          <div class="card-header"><h3>📢 最近公告</h3></div>
          ${DB.get('announcements').filter(a => a.publisher_id === this.state.user.id).slice(0,3).map(a => `
            <div class="note-item">
              <h4>${a.title}</h4>
              <p>${a.content?.slice(0,60)}...</p>
              <div class="meta">${a.published_at?.slice(0,10)}</div>
            </div>
          `).join('') || '<div class="empty-state" style="padding:30px"><p>暂无公告</p></div>'}
        </div>
      </div>`;
    document.getElementById('page-content').innerHTML = html;
  },

  renderAdminHome() {
    const users = DB.get('users');
    const students = users.filter(u => u.role === 'student').length;
    const teachers = users.filter(u => u.role === 'teacher').length;
    const admins = users.filter(u => u.role === 'admin').length;
    const courses = DB.get('courses').length;
    const todayLogs = DB.get('auditLogs').filter(l => l.created_at?.startsWith(new Date().toISOString().slice(0,10))).length;

    const html = `
      <div class="stat-grid">
        <div class="stat-card"><div class="stat-icon blue">👥</div><div class="stat-info"><h4>${users.length}</h4><p>总用户数</p></div></div>
        <div class="stat-card"><div class="stat-icon green">🎓</div><div class="stat-info"><h4>${students}</h4><p>学生</p></div></div>
        <div class="stat-card"><div class="stat-icon orange">👨‍🏫</div><div class="stat-info"><h4>${teachers}</h4><p>教师</p></div></div>
        <div class="stat-card"><div class="stat-icon purple">📚</div><div class="stat-info"><h4>${courses}</h4><p>课程总数</p></div></div>
      </div>
      <div class="grid-2">
        <div class="card">
          <div class="card-header"><h3>👥 用户分布</h3></div>
          <div style="display:flex;gap:16px;padding:10px 0">
            <div style="flex:1;text-align:center;padding:20px;background:var(--primary-light);border-radius:12px"><div style="font-size:2rem;font-weight:700;color:var(--primary)">${students}</div><div style="font-size:.85rem;color:var(--gray-500)">🎓 学生</div></div>
            <div style="flex:1;text-align:center;padding:20px;background:#dcfce7;border-radius:12px"><div style="font-size:2rem;font-weight:700;color:#16a34a">${teachers}</div><div style="font-size:.85rem;color:var(--gray-500)">👨‍🏫 教师</div></div>
            <div style="flex:1;text-align:center;padding:20px;background:#fef3c7;border-radius:12px"><div style="font-size:2rem;font-weight:700;color:#d97706">${admins}</div><div style="font-size:.85rem;color:var(--gray-500)">⚙️ 管理员</div></div>
          </div>
        </div>
        <div class="card">
          <div class="card-header"><h3>📜 最近操作</h3></div>
          ${DB.get('auditLogs').slice(-3).reverse().map(l => `
            <div class="note-item">
              <h4>${l.action}</h4>
              <p class="log-detail">${l.detail || ''}</p>
              <div class="meta">${l.created_at?.slice(0,16) || ''} · IP: ${l.ip_address}</div>
            </div>
          `).join('') || '<div class="empty-state" style="padding:30px"><p>暂无日志</p></div>'}
        </div>
      </div>`;
    document.getElementById('page-content').innerHTML = html;
  },

  /* ==================== STUDENT: COURSES ==================== */
  renderCourses() {
    if (this.state.user.role === 'teacher') return this.renderTeacherCourses();
    if (this.state.user.role === 'student') return this.renderStudentCourses();
  },

  renderStudentCourses() {
    const enrollments = DB.get('enrollments').filter(e => e.student_id === this.state.user.id && e.status === 'approved');
    const courses = DB.get('courses').filter(c => enrollments.some(e => e.course_id === c.id));
    const allCourses = DB.get('courses').filter(c => c.status === 'published');
    const available = allCourses.filter(c => !enrollments.some(e => e.course_id === c.id));

    const html = `
      <div class="card">
        <div class="card-header"><h3>📚 我的课程 (${courses.length})</h3></div>
        ${courses.length ? `<div class="grid-2">${courses.map(c => {
          const a = DB.get('assignments').filter(x => x.course_id === c.id && x.status === 'published');
          return `<div class="course-card">
            <div class="course-cover" style="background:${c.cover_color}">${c.name[0]}</div>
            <div class="course-body">
              <h4>${c.name}</h4>
              <p>${c.description?.slice(0,50) || ''}</p>
              <div class="meta"><span>📖 ${a.length} 个作业</span><span>📊 ${c.credits} 学分</span></div>
            </div>
          </div>`;
        }).join('')}</div>` : '<div class="empty-state"><h3>还没有选课</h3><p>在下方可选课程中选择</p></div>'}
      </div>
      ${available.length ? `<div class="card">
        <div class="card-header"><h3>📖 可选课程</h3></div>
        <div class="grid-2">${available.map(c => {
          const teacher = DB.get('users').find(u => u.id === c.teacher_id);
          return `<div class="course-card">
            <div class="course-cover" style="background:${c.cover_color}">${c.name[0]}</div>
            <div class="course-body">
              <h4>${c.name}</h4>
              <p>${c.description?.slice(0,50) || ''} · ${teacher?.nickname || ''}</p>
              <div class="meta"><span>📊 ${c.credits} 学分</span><span>${c.semester}</span></div>
              <button class="btn btn-primary btn-sm mt-2" onclick="App.enrollCourse(${c.id})">立即选课</button>
            </div>
          </div>`;
        }).join('')}</div>
      </div>` : ''}`;
    document.getElementById('page-content').innerHTML = html;
  },

  enrollCourse(courseId) {
    if (DB.get('enrollments').find(e => e.course_id === courseId && e.student_id === this.state.user.id)) {
      this.toast('你已经选了这门课', 'warning'); return;
    }
    DB.add('enrollments', { course_id:courseId, student_id:this.state.user.id, status:'approved', enrolled_at:new Date().toISOString() });
    this.toast('选课成功！', 'success');
    this.renderCourses();
  },

  /* ==================== STUDENT: NOTES ==================== */
  renderNotes() {
    const notebooks = DB.get('notebooks').filter(n => n.user_id === this.state.user.id && !n.parent_id);
    const allNotes = DB.get('notes').filter(n => n.user_id === this.state.user.id);
    const currentNb = this.state.currentTab || 'all';
    const notes = currentNb === 'all' ? allNotes : allNotes.filter(n => n.notebook_id == currentNb);
    const tags = [...new Set(allNotes.flatMap(n => n.tags || []))];

    const html = `
      <div class="flex gap-3" style="margin-bottom:20px;flex-wrap:wrap">
        <button class="btn ${currentNb==='all'?'btn-primary':'btn-outline'} btn-sm" onclick="App.state.currentTab='all';App.renderNotes()">全部 (${allNotes.length})</button>
        ${notebooks.map(nb => `<button class="btn ${currentNb==nb.id?'btn-primary':'btn-outline'} btn-sm" onclick="App.state.currentTab='${nb.id}';App.renderNotes()">${nb.icon||'📓'} ${nb.name} (${allNotes.filter(n=>n.notebook_id===nb.id).length})</button>`).join('')}
        <button class="btn btn-primary btn-sm" onclick="App.showNoteForm()" style="margin-left:auto">+ 新建笔记</button>
      </div>
      ${tags.length ? `<div class="flex gap-2" style="margin-bottom:16px;flex-wrap:wrap">${tags.map(t => `<span class="badge badge-primary" style="cursor:pointer" onclick="App.searchByTag('${t}')"># ${t}</span>`).join('')}</div>` : ''}
      <div class="card">
        ${notes.length ? notes.map(n => `
          <div class="note-item" onclick="App.editNote(${n.id})">
            <h4>${n.is_pinned ? '📌 ' : ''}${n.title}</h4>
            <p>${n.content_markdown?.replace(/[#*_`>\[\]]/g,'').slice(0,100) || ''}</p>
            <div class="meta">${n.tags?.length ? n.tags.map(t=>`<span class="badge badge-primary">${t}</span>`).join(' ') : ''} ${n.word_count}字 · 👁 ${n.read_count} · ${n.updated_at?.slice(0,10)}</div>
          </div>
        `).join('') : '<div class="empty-state"><h3>暂无笔记</h3><p>点击右上角新建笔记</p></div>'}
      </div>`;
    document.getElementById('page-content').innerHTML = html;
  },

  showNoteForm(note) {
    const notebooks = DB.get('notebooks').filter(n => n.user_id === this.state.user.id);
    const isEdit = !!note;
    this.showModal(`
      <div class="modal-header"><h3>${isEdit ? '编辑笔记' : '新建笔记'}</h3><div class="modal-close" onclick="App.hideModal()">×</div></div>
      <div class="modal-body">
        <div class="form-group"><label>标题</label><input id="note-title" value="${isEdit ? note.title : ''}"></div>
        <div class="form-group"><label>所属笔记本</label><select id="note-notebook">${notebooks.map(nb => `<option value="${nb.id}" ${isEdit && note.notebook_id === nb.id ? 'selected':''}>${nb.icon||'📓'} ${nb.name}</option>`).join('')}</select></div>
        <div class="form-group"><label>正文 (Markdown)</label><textarea id="note-content" rows="8" style="width:100%;padding:12px;border:2px solid var(--gray-200);border-radius:8px;resize:vertical;font-size:.9rem">${isEdit ? note.content_markdown : ''}</textarea></div>
        <div class="form-group"><label>标签（逗号分隔）</label><input id="note-tags" value="${isEdit ? (note.tags||[]).join(',') : ''}" placeholder="如：重点,考试"></div>
        <div class="form-group"><label><input type="checkbox" id="note-pinned" ${isEdit && note.is_pinned ? 'checked':''}> 置顶</label></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="App.hideModal()">取消</button>
        <button class="btn btn-primary" onclick="App.saveNote(${isEdit ? note.id : 'null'})">${isEdit ? '保存' : '创建'}</button>
      </div>
    `);
  },

  saveNote(id) {
    const title = document.getElementById('note-title').value || '未命名笔记';
    const notebook_id = parseInt(document.getElementById('note-notebook').value);
    const content = document.getElementById('note-content').value || '';
    const tags = document.getElementById('note-tags').value.split(',').map(t=>t.trim()).filter(Boolean);
    const is_pinned = document.getElementById('note-pinned').checked ? 1 : 0;
    const wordCount = content.replace(/\s/g,'').length;
    if (id) {
      DB.update('notes', id, { title, notebook_id, content_markdown:content, tags, is_pinned, word_count:wordCount, read_count: (DB.findOne('notes', n=>n.id===id)?.read_count||0) });
      this.toast('笔记已更新', 'success');
    } else {
      DB.add('notes', { user_id:this.state.user.id, notebook_id, title, content_markdown:content, content_html:content, tags, is_pinned, word_count:wordCount, read_count:0 });
      this.toast('笔记已创建', 'success');
    }
    this.hideModal();
    this.renderNotes();
  },

  editNote(id) {
    const note = DB.findOne('notes', n => n.id === id);
    if (note) { DB.update('notes', id, { read_count:(note.read_count||0)+1 }); this.showNoteForm(note); }
  },

  searchByTag(tag) {
    const notes = DB.get('notes').filter(n => n.user_id === this.state.user.id && n.tags?.includes(tag));
    const html = `<div class="card"><div class="card-header"><h3># ${tag} (${notes.length})</h3><button class="btn btn-outline btn-sm" onclick="App.renderNotes()">← 返回</button></div>
      ${notes.length ? notes.map(n => `<div class="note-item" onclick="App.editNote(${n.id})"><h4>${n.title}</h4><p>${n.content_markdown?.slice(0,100)}</p></div>`).join('') : '<div class="empty-state"><p>暂无结果</p></div>'}
    </div>`;
    document.getElementById('page-content').innerHTML = html;
  },

  /* ==================== STUDENT: TASKS ==================== */
  renderTasks() {
    const all = DB.get('tasks').filter(t => t.user_id === this.state.user.id);
    const parents = all.filter(t => !t.parent_id);
    const statuses = ['pending','in_progress','completed'];
    const currentStatus = this.state.currentTab || 'all';

    const html = `
      <div class="flex gap-3" style="margin-bottom:16px;flex-wrap:wrap">
        <button class="btn ${currentStatus==='all'?'btn-primary':'btn-outline'} btn-sm" onclick="App.state.currentTab='all';App.renderTasks()">全部 (${all.length})</button>
        <button class="btn ${currentStatus==='pending'?'btn-warning':'btn-outline'} btn-sm" onclick="App.state.currentTab='pending';App.renderTasks()">待处理 (${all.filter(t=>t.status==='pending').length})</button>
        <button class="btn ${currentStatus==='in_progress'?'btn-primary':'btn-outline'} btn-sm" onclick="App.state.currentTab='in_progress';App.renderTasks()">进行中 (${all.filter(t=>t.status==='in_progress').length})</button>
        <button class="btn ${currentStatus==='completed'?'btn-success':'btn-outline'} btn-sm" onclick="App.state.currentTab='completed';App.renderTasks()">已完成 (${all.filter(t=>t.status==='completed').length})</button>
        <button class="btn btn-primary btn-sm" onclick="App.showTaskForm()" style="margin-left:auto">+ 新建任务</button>
      </div>
      <div class="card">${parents.filter(t => currentStatus === 'all' || t.status === currentStatus).map(t => `
        <div class="task-item">
          <div class="task-check ${t.status==='completed'?'done':''}" onclick="App.toggleTask(${t.id})"></div>
          <div class="task-body">
            <div class="title ${t.status==='completed'?'done':''}">${t.title}</div>
            <div class="meta">
              <span class="badge ${t.priority==='high'?'badge-danger':t.priority==='medium'?'badge-warning':'badge-gray'}">${t.priority==='high'?'高':t.priority==='medium'?'中':'低'}</span>
              ${t.due_date ? `<span>📅 ${t.due_date}</span>` : ''}
              ${t.estimated_minutes ? `<span>⏱ ${t.estimated_minutes}m</span>` : ''}
            </div>
            ${all.filter(sub => sub.parent_id === t.id).map(sub => `
              <div style="display:flex;align-items:center;gap:8px;margin-top:6px;padding-left:8px;border-left:2px solid var(--gray-200)">
                <div class="task-check ${sub.status==='completed'?'done':''}" style="width:16px;height:16px;flex-shrink:0" onclick="App.toggleTask(${sub.id})"></div>
                <span style="font-size:.85rem;${sub.status==='completed'?'text-decoration:line-through;color:var(--gray-400)':''}">${sub.title}</span>
              </div>
            `).join('')}
          </div>
          <button class="btn btn-outline btn-sm" onclick="App.showTaskForm(${t.id})" style="flex-shrink:0">✏️</button>
        </div>
      `).join('') || '<div class="empty-state"><h3>暂无任务</h3><p>点击右上角新建任务</p></div>'}</div>`;
    document.getElementById('page-content').innerHTML = html;
  },

  toggleTask(id) {
    const t = DB.findOne('tasks', x => x.id === id);
    if (!t) return;
    const newStatus = t.status === 'completed' ? 'pending' : 'completed';
    DB.update('tasks', id, { status:newStatus, completed_at:newStatus==='completed'?new Date().toISOString():null });
    this.renderTasks();
  },

  showTaskForm(task) {
    const isEdit = !!task;
    this.showModal(`
      <div class="modal-header"><h3>${isEdit?'编辑任务':'新建任务'}</h3><div class="modal-close" onclick="App.hideModal()">×</div></div>
      <div class="modal-body">
        <div class="form-group"><label>标题</label><input id="task-title" value="${isEdit?task.title:''}"></div>
        <div class="form-group"><label>描述</label><textarea id="task-desc" rows="3" style="width:100%;padding:12px;border:2px solid var(--gray-200);border-radius:8px">${isEdit?task.description||'':''}</textarea></div>
        <div class="form-row">
          <div class="form-group"><label>优先级</label><select id="task-priority"><option value="low" ${isEdit&&task.priority==='low'?'selected':''}>低</option><option value="medium" ${isEdit&&task.priority==='medium'?'selected':''}>中</option><option value="high" ${isEdit&&task.priority==='high'?'selected':''}>高</option></select></div>
          <div class="form-group"><label>截止日期</label><input type="date" id="task-due" value="${isEdit?task.due_date||'':''}"></div>
        </div>
        <div class="form-group"><label>预计用时（分钟）</label><input type="number" id="task-est" value="${isEdit?task.estimated_minutes||'':''}"></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="App.hideModal()">取消</button>
        ${isEdit ? '<button class="btn btn-danger" onclick="App.deleteTask('+task.id+')">删除</button>' : ''}
        <button class="btn btn-primary" onclick="App.saveTask(${isEdit?task.id:'null'})">${isEdit?'保存':'创建'}</button>
      </div>
    `);
  },

  saveTask(id) {
    const data = {
      title: document.getElementById('task-title').value,
      description: document.getElementById('task-desc').value,
      priority: document.getElementById('task-priority').value,
      due_date: document.getElementById('task-due').value || null,
      estimated_minutes: parseInt(document.getElementById('task-est').value) || null,
      user_id: this.state.user.id
    };
    if (!data.title) { this.toast('请输入标题', 'error'); return; }
    if (id) { DB.update('tasks', id, data); this.toast('任务已更新', 'success'); }
    else { DB.add('tasks', { ...data, parent_id:null, status:'pending', sort_order:0, tags:[] }); this.toast('任务已创建', 'success'); }
    this.hideModal(); this.renderTasks();
  },

  deleteTask(id) { if (confirm('确定删除？')) { DB.remove('tasks', id); this.hideModal(); this.renderTasks(); } },

  /* ==================== STUDENT: POMODORO ==================== */
  renderPomodoro() {
    const records = DB.get('pomodoro').filter(p => p.user_id === this.state.user.id).slice(-10).reverse();
    const todayFocus = records.filter(r => r.type === 'focus' && r.created_at?.startsWith(new Date().toISOString().slice(0,10)));
    const todayMinutes = todayFocus.reduce((a,b) => a + (b.actual_minutes || 0), 0);

    const html = `
      <div class="grid-2">
        <div class="card">
          <div class="pomodoro-timer">
            <div class="time" id="pomo-time">25:00</div>
            <div class="phase" id="pomo-phase">🍅 专注时间</div>
            <button class="pomodoro-btn start" id="pomo-btn" onclick="App.pomoToggle()">▶ 开始</button>
            <div class="flex" style="justify-content:center;gap:12px;margin-top:16px">
              <button class="btn btn-outline btn-sm" onclick="App.pomoSetTime(25)">25m</button>
              <button class="btn btn-outline btn-sm" onclick="App.pomoSetTime(30)">30m</button>
              <button class="btn btn-outline btn-sm" onclick="App.pomoSetTime(45)">45m</button>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-header"><h3>📊 今日专注</h3></div>
          <div style="text-align:center;padding:20px">
            <div style="font-size:3rem;font-weight:700;color:var(--primary)">${Math.floor(todayMinutes/60)}h${todayMinutes%60}m</div>
            <p style="color:var(--gray-500)">已完成 ${todayFocus.length} 个番茄钟</p>
          </div>
          <div class="card-header"><h3>📋 最近记录</h3></div>
          ${records.length ? records.map(r => `
            <div class="task-item">
              <div class="task-body">
                <div class="title">${r.type === 'focus' ? '🍅 专注' : r.type === 'short_break' ? '☕ 短休' : '🌙 长休'} · ${r.actual_minutes}分钟</div>
                <div class="meta">${r.note ? r.note : ''} · ${r.created_at?.slice(0,16) || ''}</div>
              </div>
            </div>
          `).join('') : '<div class="empty-state" style="padding:20px"><p>还没有记录</p></div>'}
        </div>
      </div>`;
    document.getElementById('page-content').innerHTML = html;
    this.pomoMinutes = 25;
    this.pomoSeconds = 0;
    this.pomoRunning = false;
    this.pomoInterval = null;
    this.pomoStartTime = null;
    this.updatePomoDisplay();
  },

  pomoSetTime(m) {
    if (this.pomoRunning) return;
    this.pomoMinutes = m; this.pomoSeconds = 0;
    this.updatePomoDisplay();
  },

  updatePomoDisplay() {
    const el = document.getElementById('pomo-time');
    if (el) el.textContent = `${String(this.pomoMinutes).padStart(2,'0')}:${String(this.pomoSeconds).padStart(2,'0')}`;
  },

  pomoToggle() {
    const btn = document.getElementById('pomo-btn');
    const phase = document.getElementById('pomo-phase');
    if (this.pomoRunning) {
      clearInterval(this.pomoInterval);
      this.pomoRunning = false;
      const elapsed = Math.floor((Date.now() - this.pomoStartTime) / 60000);
      if (elapsed > 0) {
        DB.add('pomodoro', { user_id:this.state.user.id, task_id:null, planned_minutes:this.pomoMinutes, actual_minutes:elapsed, type:'focus', note:'', started_at:new Date(Date.now()-elapsed*60000).toISOString(), ended_at:new Date().toISOString() });
        this.toast(`完成了 ${elapsed} 分钟专注！`, 'success');
      }
      btn.textContent = '▶ 开始'; btn.className = 'pomodoro-btn start';
      phase.textContent = '🍅 专注时间';
      this.pomoMinutes = 25; this.pomoSeconds = 0; this.updatePomoDisplay();
      setTimeout(() => this.renderPomodoro(), 500);
    } else {
      this.pomoRunning = true;
      this.pomoStartTime = Date.now();
      const totalSec = this.pomoMinutes * 60 + this.pomoSeconds;
      let remaining = totalSec;
      this.pomoInterval = setInterval(() => {
        remaining--;
        if (remaining <= 0) {
          clearInterval(this.pomoInterval);
          this.pomoRunning = false;
          DB.add('pomodoro', { user_id:this.state.user.id, task_id:null, planned_minutes:this.pomoMinutes, actual_minutes:this.pomoMinutes, type:'focus', note:'', started_at:new Date(Date.now()-this.pomoMinutes*60000).toISOString(), ended_at:new Date().toISOString() });
          this.toast('🍅 时间到！做得好！', 'success');
          btn.textContent = '▶ 开始'; btn.className = 'pomodoro-btn start';
          phase.textContent = '🎉 休息一下吧';
          this.pomoMinutes = 25; this.pomoSeconds = 0; this.updatePomoDisplay();
          setTimeout(() => this.renderPomodoro(), 500);
          return;
        }
        const m = Math.floor(remaining / 60);
        const s = remaining % 60;
        this.pomoMinutes = m; this.pomoSeconds = s;
        this.updatePomoDisplay();
      }, 1000);
      btn.textContent = '■ 停止'; btn.className = 'pomodoro-btn stop';
      phase.textContent = '🍅 正在专注...';
    }
  },

  /* ==================== STUDENT: CHECK-IN ==================== */
  renderCheckin() {
    const today = new Date().toISOString().slice(0,10);
    const doneToday = DB.get('checkins').find(c => c.user_id === this.state.user.id && c.checkin_date === today);
    const allCheckins = DB.get('checkins').filter(c => c.user_id === this.state.user.id);
    const year = new Date().getFullYear();
    const month = new Date().getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthStr = `${year}-${String(month+1).padStart(2,'0')}`;
    const consecutive = this.getConsecutiveCheckins(allCheckins);

    const html = `
      <div class="grid-2">
        <div class="card">
          <div class="card-header"><h3>📅 ${year}年${month+1}月</h3></div>
          <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-bottom:8px">
            ${['日','一','二','三','四','五','六'].map(d => `<div style="text-align:center;font-size:.7rem;color:var(--gray-400);font-weight:600;padding:4px">${d}</div>`).join('')}
            ${Array(firstDay).fill().map(() => '<div></div>').join('')}
            ${Array(daysInMonth).fill().map((_, i) => {
              const day = i + 1;
              const dateStr = `${monthStr}-${String(day).padStart(2,'0')}`;
              const isToday = dateStr === today;
              const isDone = allCheckins.some(c => c.checkin_date === dateStr);
              return `<div class="calendar-day ${isDone?'done':''} ${isToday?'today':''}" ${!isDone && isToday && !doneToday ? `onclick="App.doCheckin()" style="cursor:pointer"`:''}>
                <span class="day-num">${day}</span>
                ${isDone ? '<span class="day-dot">✅</span>' : ''}
              </div>`;
            }).join('')}
          </div>
        </div>
        <div>
          <div class="card">
            <div class="card-header"><h3>🏆 打卡统计</h3></div>
            <div style="text-align:center;padding:10px">
              <div style="font-size:2.5rem;font-weight:700;color:var(--primary)">${allCheckins.length}天</div>
              <p style="color:var(--gray-500)">本月已打卡 ${allCheckins.filter(c=>c.checkin_date.startsWith(monthStr)).length} 天</p>
              <p style="color:var(--gray-500)">🔥 连续打卡 ${consecutive} 天</p>
              ${doneToday ? '<p style="margin-top:12px;color:var(--success);font-weight:600">✅ 今日已打卡</p>'
                : '<button class="btn btn-primary mt-3" onclick="App.doCheckin()">📅 今日打卡</button>'}
            </div>
          </div>
          <div class="card">
            <div class="card-header"><h3>📝 打卡记录</h3></div>
            ${allCheckins.slice(-5).reverse().map(c => `
              <div class="task-item">
                <div class="task-body">
                  <div class="title">${c.checkin_date} · 心情 ${'⭐'.repeat(c.mood_score)}</div>
                  <div class="meta">${c.journal || ''} · 学习 ${c.study_minutes} 分钟</div>
                </div>
              </div>
            `).join('') || '<div class="empty-state" style="padding:20px"><p>暂无记录</p></div>'}
          </div>
        </div>
      </div>`;
    document.getElementById('page-content').innerHTML = html;
  },

  getConsecutiveCheckins(checkins) {
    if (!checkins.length) return 0;
    const sorted = [...new Set(checkins.map(c => c.checkin_date))].sort().reverse();
    let count = 1;
    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i-1]);
      const curr = new Date(sorted[i]);
      const diff = (prev - curr) / (1000*60*60*24);
      if (diff === 1) count++;
      else break;
    }
    return count;
  },

  doCheckin() {
    const today = new Date().toISOString().slice(0,10);
    if (DB.get('checkins').find(c => c.user_id === this.state.user.id && c.checkin_date === today)) {
      this.toast('今天已经打过卡了', 'warning'); return;
    }
    this.showModal(`
      <div class="modal-header"><h3>📅 今日打卡</h3><div class="modal-close" onclick="App.hideModal()">×</div></div>
      <div class="modal-body">
        <div class="form-group"><label>今天心情</label>
          <div style="display:flex;gap:8px">${[1,2,3,4,5].map(i => `<div class="btn btn-outline btn-sm mood-btn" data-score="${i}" onclick="document.querySelectorAll('.mood-btn').forEach(b=>b.className='btn btn-outline btn-sm mood-btn');this.className='btn btn-primary btn-sm mood-btn'">${'😢😊😄🤩🥳'[i-1]}</div>`).join('')}</div>
        </div>
        <div class="form-group"><label>学习时长（分钟）</label><input type="number" id="checkin-minutes" value="120"></div>
        <div class="form-group"><label>学习总结</label><textarea id="checkin-journal" rows="3" style="width:100%;padding:12px;border:2px solid var(--gray-200);border-radius:8px" placeholder="今天学了什么？"></textarea></div>
      </div>
      <div class="modal-footer"><button class="btn btn-outline" onclick="App.hideModal()">取消</button><button class="btn btn-primary" onclick="App.saveCheckin()">打卡</button></div>
    `);
  },

  saveCheckin() {
    const score = parseInt(document.querySelector('.mood-btn.btn-primary')?.dataset?.score || '3');
    const minutes = parseInt(document.getElementById('checkin-minutes').value) || 0;
    const journal = document.getElementById('checkin-journal').value || '';
    const today = new Date().toISOString().slice(0,10);
    DB.add('checkins', { user_id:this.state.user.id, checkin_date:today, mood_score:score, journal, study_minutes:minutes });
    this.toast('打卡成功！', 'success');
    this.hideModal();
    this.renderCheckin();
  },

  /* ==================== STUDENT: MATERIALS ==================== */
  renderMaterials() {
    const materials = DB.get('materials').filter(m => m.user_id === this.state.user.id);
    const courses = DB.get('courses');
    const html = `
      <div class="card">
        <div class="card-header"><h3>📁 学习资料 (${materials.length})</h3><button class="btn btn-primary btn-sm" onclick="App.showUploadForm()">+ 上传</button></div>
        ${materials.length ? `<div class="table-wrap"><table>
          <tr><th>文件名</th><th>类型</th><th>大小</th><th>课程</th><th>上传时间</th></tr>
          ${materials.map(m => `<tr>
            <td><strong>${m.original_filename}</strong></td>
            <td><span class="badge badge-info">${m.file_type}</span></td>
            <td>${(m.file_size/1024/1024).toFixed(1)}MB</td>
            <td>${courses.find(c=>c.id===m.course_id)?.name || m.course_name || '-'}</td>
            <td>${m.uploaded_at?.slice(0,10)}</td>
          </tr>`).join('')}
        </table></div>` : '<div class="empty-state"><h3>暂无资料</h3><p>点击上传添加学习资料</p></div>'}
      </div>`;
    document.getElementById('page-content').innerHTML = html;
  },

  showUploadForm() {
    const myCourses = DB.get('enrollments').filter(e => e.student_id === this.state.user.id && e.status === 'approved');
    const courses = DB.get('courses').filter(c => myCourses.some(e => e.course_id === c.id));
    this.showModal(`
      <div class="modal-header"><h3>上传资料</h3><div class="modal-close" onclick="App.hideModal()">×</div></div>
      <div class="modal-body">
        <div class="upload-area" onclick="document.getElementById('file-input').click()">
          <div class="icon">📁</div><p>点击选择文件</p>
          <input type="file" id="file-input" style="display:none" onchange="document.getElementById('file-name').textContent=this.files[0]?.name||'未选择'">
          <p id="file-name" style="font-size:.8rem;color:var(--gray-400);margin-top:4px">未选择</p>
        </div>
        <div class="form-group"><label>关联课程</label><select id="upload-course"><option value="">不关联</option>${courses.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}</select></div>
        <div class="form-group"><label>标签</label><input id="upload-tags" placeholder="课件, 习题, 考试"></div>
      </div>
      <div class="modal-footer"><button class="btn btn-outline" onclick="App.hideModal()">取消</button><button class="btn btn-primary" onclick="App.saveUpload()">上传</button></div>
    `);
  },

  saveUpload() {
    const fileInput = document.getElementById('file-input');
    const courseId = document.getElementById('upload-course').value;
    const tags = document.getElementById('upload-tags').value.split(',').map(t=>t.trim()).filter(Boolean);
    const fileName = fileInput.files?.[0]?.name || '示例文件.pdf';
    const ext = fileName.split('.').pop().toLowerCase();
    const typeMap = { pdf:'pdf', docx:'word', doc:'word', jpg:'image', jpeg:'image', png:'image', gif:'image', mp4:'video', ppt:'other', pptx:'other' };
    DB.add('materials', { user_id:this.state.user.id, course_id:courseId?parseInt(courseId):null, original_filename:fileName, file_type:typeMap[ext]||'other', file_size:Math.floor(Math.random()*5000000)+500000, course_name:DB.findOne('courses',c=>c.id==courseId)?.name||'', tags, uploaded_at:new Date().toISOString() });
    this.toast('上传成功！', 'success');
    this.hideModal();
    this.renderMaterials();
  },

  /* ==================== ASSIGNMENTS (共用，按角色区分) ==================== */
  renderAssignments() {
    if (this.state.user.role === 'teacher') return this.renderTeacherAssignments();
    if (this.state.user.role === 'student') return this.renderStudentAssignments();
  },

  renderStudentAssignments() {
    const enrollments = DB.get('enrollments').filter(e => e.student_id === this.state.user.id && e.status === 'approved');
    const courseIds = enrollments.map(e => e.course_id);
    const assignments = DB.get('assignments').filter(a => courseIds.includes(a.course_id) && a.status === 'published');
    const submissions = DB.get('submissions').filter(s => s.student_id === this.state.user.id);

    const html = `
      <div class="card">
        <div class="card-header"><h3>📋 待完成作业</h3></div>
        ${assignments.filter(a => !submissions.some(s => s.assignment_id === a.id)).length ? assignments.filter(a => !submissions.some(s => s.assignment_id === a.id)).map(a => {
          const course = DB.findOne('courses', c => c.id === a.course_id);
          return `<div class="note-item">
            <h4>${a.title}</h4>
            <p>${course?.name || ''} · ${a.description?.slice(0,60) || ''}</p>
            <div class="meta"><span class="badge badge-danger">⏰ ${a.due_date?.slice(0,10)}</span> <span class="badge badge-primary">${a.full_score}分</span></div>
            <button class="btn btn-primary btn-sm mt-2" onclick="App.submitAssignment(${a.id})">提交作业</button>
          </div>`;
        }).join('') : '<div class="empty-state" style="padding:20px"><p>🎉 所有作业已提交</p></div>'}
      </div>
      <div class="card">
        <div class="card-header"><h3>✅ 已提交</h3></div>
        ${submissions.length ? submissions.map(s => {
          const a = DB.findOne('assignments', x => x.id === s.assignment_id);
          const g = DB.findOne('grades', x => x.submission_id === s.id);
          const course = DB.findOne('courses', c => c.id === a?.course_id);
          return `<div class="note-item">
            <h4>${a?.title || ''} <span class="badge ${s.status==='graded'?'badge-success':'badge-warning'}">${s.status==='graded'?'已批改':'待批改'}</span></h4>
            <p>${course?.name || ''} · 提交于 ${s.submitted_at?.slice(0,16)}${s.is_late ? ' ⚠️ 迟交' : ''}</p>
            <div class="meta">${g ? `得分：<strong>${g.score}</strong>/${a?.full_score || 100} · ${g.comment || ''}` : '等待批改中...'}</div>
          </div>`;
        }).join('') : '<div class="empty-state" style="padding:20px"><p>还没有提交记录</p></div>'}
      </div>`;
    document.getElementById('page-content').innerHTML = html;
  },

  submitAssignment(id) {
    const a = DB.findOne('assignments', x => x.id === id);
    this.showModal(`
      <div class="modal-header"><h3>提交作业：${a.title}</h3><div class="modal-close" onclick="App.hideModal()">×</div></div>
      <div class="modal-body">
        <div class="form-group"><label>作业内容</label><textarea id="sub-content" rows="8" style="width:100%;padding:12px;border:2px solid var(--gray-200);border-radius:8px" placeholder="在此输入作业内容..."></textarea></div>
        <div class="form-group"><label>附件（选填）</label><input type="file" id="sub-file"></div>
      </div>
      <div class="modal-footer"><button class="btn btn-outline" onclick="App.hideModal()">取消</button><button class="btn btn-primary" onclick="App.saveSubmission(${id})">提交</button></div>
    `);
  },

  saveSubmission(assignmentId) {
    const content = document.getElementById('sub-content').value || '（未填写内容）';
    const now = new Date();
    const a = DB.findOne('assignments', x => x.id === assignmentId);
    const isLate = a && now > new Date(a.due_date);
    DB.add('submissions', { assignment_id:assignmentId, student_id:this.state.user.id, content_text:content, file_url:'', submit_count:1, status:'submitted', submitted_at:now.toISOString(), is_late:isLate?1:0 });
    this.toast('作业提交成功！', 'success');
    this.hideModal();
    this.renderAssignments();
  },

  /* ==================== STUDENT: GRADES ==================== */
  renderGrades() {
    const grades = DB.get('grades').filter(g => g.student_id === this.state.user.id);
    const courses = DB.get('courses');
    const html = `
      <div class="card">
        <div class="card-header"><h3>🏆 我的成绩</h3></div>
        ${grades.filter(g => g.type === 'assignment').length ? `<div class="table-wrap"><table>
          <tr><th>课程</th><th>作业</th><th>得分</th><th>评语</th><th>批改时间</th></tr>
          ${grades.filter(g => g.type === 'assignment').map(g => {
            const a = DB.findOne('assignments', x => x.id === g.assignment_id);
            const course = courses.find(c => c.id === g.course_id);
            const pct = g.score / (a?.full_score || 100) * 100;
            return `<tr>
              <td>${course?.name || '-'}</td>
              <td>${a?.title || '-'}</td>
              <td><strong>${g.score}</strong>/${a?.full_score || 100} <div class="grade-bar"><div class="grade-bar-fill ${pct>=80?'high':pct>=60?'medium':'low'}" style="width:${pct}%"></div></div></td>
              <td style="max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${g.comment || '-'}</td>
              <td>${g.graded_at?.slice(0,10) || '-'}</td>
            </tr>`;
          }).join('')}
        </table></div>` : '<div class="empty-state" style="padding:20px"><p>还没有成绩记录</p></div>'}
      </div>`;
    document.getElementById('page-content').innerHTML = html;
  },

  /* ==================== STUDENT: STATS ==================== */
  renderStats() {
    const stats = DB.get('dailyStats').filter(s => s.user_id === this.state.user.id);
    const totalFocus = stats.reduce((a,b) => a + b.total_focus_minutes, 0);
    const totalTasks = stats.reduce((a,b) => a + b.completed_tasks, 0);
    const totalNotes = stats.reduce((a,b) => a + b.new_notes, 0);
    const totalWords = stats.reduce((a,b) => a + b.new_words, 0);
    const checkinCount = DB.get('checkins').filter(c => c.user_id === this.state.user.id).length;

    const html = `
      <div class="stat-grid">
        <div class="stat-card"><div class="stat-icon blue">🍅</div><div class="stat-info"><h4>${Math.floor(totalFocus/60)}h ${totalFocus%60}m</h4><p>总专注时长</p></div></div>
        <div class="stat-card"><div class="stat-icon green">📝</div><div class="stat-info"><h4>${totalNotes}</h4><p>总笔记数</p></div></div>
        <div class="stat-card"><div class="stat-icon orange">✍️</div><div class="stat-info"><h4>${totalWords.toLocaleString()}</h4><p>累计字数</p></div></div>
        <div class="stat-card"><div class="stat-icon purple">✅</div><div class="stat-info"><h4>${totalTasks}</h4><p>完成任务</p></div></div>
      </div>
      <div class="card">
        <div class="card-header"><h3>📊 每日趋势</h3></div>
        ${stats.length ? `<div class="table-wrap"><table>
          <tr><th>日期</th><th>专注时长</th><th>打卡</th><th>完成任务</th><th>新增笔记</th><th>新增字数</th></tr>
          ${stats.slice(-14).reverse().map(s => `
            <tr>
              <td>${s.stat_date}</td>
              <td><span class="badge badge-primary">${Math.floor(s.total_focus_minutes/60)}h${s.total_focus_minutes%60}m</span></td>
              <td>${s.has_checkin ? '✅' : '❌'}</td>
              <td>${s.completed_tasks}</td>
              <td>${s.new_notes}</td>
              <td>${s.new_words.toLocaleString()}</td>
            </tr>
          `).join('')}
        </table></div>` : '<div class="empty-state"><p>暂无数据</p></div>'}
      </div>`;
    document.getElementById('page-content').innerHTML = html;
  },

  /* ==================== TEACHER: COURSES ==================== */
  renderTeacherCourses() {
    const myCourses = DB.get('courses').filter(c => c.teacher_id === this.state.user.id);

    const html = `
      <div class="card">
        <div class="card-header"><h3>📚 课程管理</h3><button class="btn btn-primary btn-sm" onclick="App.showCourseForm()">+ 创建课程</button></div>
        ${myCourses.length ? `<div class="grid-2">${myCourses.map(c => {
          const students = DB.get('enrollments').filter(e => e.course_id === c.id && e.status === 'approved');
          const pending = DB.get('enrollments').filter(e => e.course_id === c.id && e.status === 'pending');
          const aCount = DB.get('assignments').filter(x => x.course_id === c.id).length;
          return `<div class="course-card">
            <div class="course-cover" style="background:${c.cover_color}">${c.name[0]}</div>
            <div class="course-body">
              <div class="flex justify-between"><h4>${c.name}</h4><span class="badge ${c.status==='published'?'badge-success':'badge-gray'}">${c.status==='published'?'已发布':'草稿'}</span></div>
              <p>${c.description?.slice(0,50) || ''}</p>
              <div class="meta"><span>👥 ${students.length}/${c.max_students||'∞'} 学生</span><span>📋 ${aCount} 作业</span><span>📊 ${c.credits} 学分</span></div>
              ${pending.length ? `<div style="margin-top:8px"><span class="badge badge-warning">${pending.length} 个选课待审核</span></div>` : ''}
              <div class="flex gap-2 mt-2">
                <button class="btn btn-outline btn-sm" onclick="App.showCourseForm(${c.id})">✏️ 编辑</button>
                <button class="btn ${c.status==='published'?'btn-warning':'btn-success'} btn-sm" onclick="App.toggleCourseStatus(${c.id})">${c.status==='published'?'下架':'发布'}</button>
              </div>
            </div>
          </div>`;
        }).join('')}</div>` : '<div class="empty-state"><h3>还没有课程</h3><p>点击创建课程</p></div>'}
      </div>`;
    document.getElementById('page-content').innerHTML = html;
  },

  showCourseForm(course) {
    const isEdit = !!course;
    this.showModal(`
      <div class="modal-header"><h3>${isEdit ? '编辑课程' : '创建课程'}</h3><div class="modal-close" onclick="App.hideModal()">×</div></div>
      <div class="modal-body">
        <div class="form-group"><label>课程名称</label><input id="course-name" value="${isEdit?course.name:''}"></div>
        <div class="form-group"><label>课程简介</label><textarea id="course-desc" rows="3" style="width:100%;padding:12px;border:2px solid var(--gray-200);border-radius:8px">${isEdit?course.description||'':''}</textarea></div>
        <div class="form-row">
          <div class="form-group"><label>学分</label><input type="number" id="course-credits" value="${isEdit?course.credits||3:3}"></div>
          <div class="form-group"><label>学期</label><input id="course-semester" value="${isEdit?course.semester:'2025-2026-1'}"></div>
        </div>
        <div class="form-group"><label>封面颜色</label><input type="color" id="course-color" value="${isEdit?course.cover_color||'#4a6cf7':'#4a6cf7'}"></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="App.hideModal()">取消</button>
        <button class="btn btn-primary" onclick="App.saveCourse(${isEdit?course.id:'null'})">${isEdit?'保存':'创建'}</button>
      </div>
    `);
  },

  saveCourse(id) {
    const data = {
      name: document.getElementById('course-name').value,
      description: document.getElementById('course-desc').value,
      credits: parseFloat(document.getElementById('course-credits').value) || 3,
      semester: document.getElementById('course-semester').value,
      cover_color: document.getElementById('course-color').value,
    };
    if (!data.name) { this.toast('请输入课程名称', 'error'); return; }
    if (id) { DB.update('courses', id, data); this.toast('课程已更新', 'success'); }
    else { DB.add('courses', { ...data, teacher_id:this.state.user.id, status:'draft', max_students:100, department:this.state.user.department||'' }); this.toast('课程已创建', 'success'); }
    this.hideModal(); this.renderCourses();
  },

  toggleCourseStatus(id) {
    const c = DB.findOne('courses', x => x.id === id);
    if (!c) return;
    const newStatus = c.status === 'published' ? 'draft' : 'published';
    DB.update('courses', id, { status: newStatus });
    this.toast(`课程已${newStatus==='published'?'发布':'下架'}`,'success');
    this.renderCourses();
  },

  /* ==================== TEACHER: ASSIGNMENTS ==================== */
  renderTeacherAssignments() {
    const myCourses = DB.get('courses').filter(c => c.teacher_id === this.state.user.id);
    const courseIds = myCourses.map(c => c.id);
    const assignments = DB.get('assignments').filter(a => courseIds.includes(a.course_id));

    const html = `
      <div class="card">
        <div class="card-header"><h3>📋 作业管理</h3><button class="btn btn-primary btn-sm" onclick="App.showAssignmentForm()">+ 布置作业</button></div>
        ${assignments.length ? assignments.map(a => {
          const course = myCourses.find(c => c.id === a.course_id);
          const subs = DB.get('submissions').filter(s => s.assignment_id === a.id);
          const graded = subs.filter(s => s.status === 'graded').length;
          return `<div class="note-item">
            <div class="flex justify-between">
              <h4>${a.title}</h4>
              <span class="badge ${a.status==='published'?'badge-success':'badge-gray'}">${a.status==='published'?'已发布':'草稿'}</span>
            </div>
            <p>${course?.name || ''} · ${a.description?.slice(0,60)}</p>
            <div class="meta">满分 ${a.full_score} · 截止 ${a.due_date?.slice(0,10)} · 提交 ${subs.length} 人 · 已批改 ${graded} 人</div>
            <div class="flex gap-2 mt-2">
              <button class="btn btn-outline btn-sm" onclick="App.showAssignmentForm(${a.id})">✏️ 编辑</button>
              <button class="btn btn-sm ${a.status==='published'?'btn-warning':'btn-success'}" onclick="App.toggleAssignStatus(${a.id})">${a.status==='published'?'关闭':'发布'}</button>
              <button class="btn btn-primary btn-sm" onclick="App.gradeAssignment(${a.id})">📝 批改 (${subs.length-graded})</button>
            </div>
          </div>`;
        }).join('') : '<div class="empty-state"><h3>暂无作业</h3><p>点击布置作业</p></div>'}
      </div>`;
    document.getElementById('page-content').innerHTML = html;
  },

  showAssignmentForm(assign) {
    const isEdit = !!assign;
    const myCourses = DB.get('courses').filter(c => c.teacher_id === this.state.user.id);
    this.showModal(`
      <div class="modal-header"><h3>${isEdit?'编辑作业':'布置作业'}</h3><div class="modal-close" onclick="App.hideModal()">×</div></div>
      <div class="modal-body">
        <div class="form-group"><label>所属课程</label><select id="assign-course">${myCourses.map(c => `<option value="${c.id}" ${isEdit&&assign.course_id===c.id?'selected':''}>${c.name}</option>`).join('')}</select></div>
        <div class="form-group"><label>作业标题</label><input id="assign-title" value="${isEdit?assign.title:''}"></div>
        <div class="form-group"><label>作业要求</label><textarea id="assign-desc" rows="3" style="width:100%;padding:12px;border:2px solid var(--gray-200);border-radius:8px">${isEdit?assign.description||'':''}</textarea></div>
        <div class="form-row">
          <div class="form-group"><label>满分</label><input type="number" id="assign-score" value="${isEdit?assign.full_score:100}"></div>
          <div class="form-group"><label>权重</label><input type="number" id="assign-weight" step="0.05" value="${isEdit?assign.weight||0.2:0.2}" style="width:100%"></div>
        </div>
        <div class="form-group"><label>截止日期</label><input type="datetime-local" id="assign-due" value="${isEdit?assign.due_date?.slice(0,16):''}"></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="App.hideModal()">取消</button>
        ${isEdit ? '<button class="btn btn-danger" onclick="App.deleteAssign('+assign.id+')">删除</button>' : ''}
        <button class="btn btn-primary" onclick="App.saveAssignment(${isEdit?assign.id:'null'})">${isEdit?'保存':'创建'}</button>
      </div>
    `);
  },

  saveAssignment(id) {
    const data = {
      course_id: parseInt(document.getElementById('assign-course').value),
      title: document.getElementById('assign-title').value,
      description: document.getElementById('assign-desc').value,
      full_score: parseFloat(document.getElementById('assign-score').value) || 100,
      weight: parseFloat(document.getElementById('assign-weight').value) || 0.2,
      due_date: document.getElementById('assign-due').value ? new Date(document.getElementById('assign-due').value).toISOString() : null,
    };
    if (!data.title) { this.toast('请输入作业标题', 'error'); return; }
    let isNew = false;
    if (id) { DB.update('assignments', id, data); this.toast('作业已更新', 'success'); }
    else { const newA = DB.add('assignments', { ...data, teacher_id:this.state.user.id, type:'essay', status:'draft', created_at:new Date().toISOString(), updated_at:new Date().toISOString() }); this.toast('作业已创建', 'success'); isNew = true; if (data.status === 'published') this.notifyNewAssignment(newA.id); }
    this.hideModal(); this.renderAssignments();
  },

  toggleAssignStatus(id) {
    const a = DB.findOne('assignments', x => x.id === id);
    const newStatus = a?.status === 'published' ? 'draft' : 'published';
    DB.update('assignments', id, { status: newStatus });
    if (newStatus === 'published') this.notifyNewAssignment(id);
    this.toast(`作业已${newStatus==='published'?'发布':'关闭'}`,'success');
    this.renderAssignments();
  },

  deleteAssign(id) { if (confirm('确定删除该作业？')) { DB.remove('assignments', id); this.hideModal(); this.renderAssignments(); } },

  gradeAssignment(assignmentId) {
    const subs = DB.get('submissions').filter(s => s.assignment_id === assignmentId);
    const a = DB.findOne('assignments', x => x.id === assignmentId);
    if (!subs.length) { this.toast('暂无提交记录', 'info'); return; }

    const html = `<div class="card"><div class="card-header"><h3>📝 批改作业：${a?.title}</h3><button class="btn btn-outline btn-sm" onclick="App.renderAssignments()">← 返回</button></div>
      ${subs.map(s => {
        const student = DB.findOne('users', u => u.id === s.student_id);
        const g = DB.findOne('grades', x => x.submission_id === s.id);
        return `<div class="card" style="margin-bottom:12px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
            <div><strong>${student?.nickname || '未知'} (${student?.student_id || ''})</strong> · 提交于 ${s.submitted_at?.slice(0,16) || ''} ${s.is_late ? '<span class="badge badge-danger">迟交</span>' : ''}</div>
            <div>第 ${s.submit_count} 次提交</div>
          </div>
          <div style="padding:12px;background:var(--gray-50);border-radius:8px;margin-bottom:12px;font-size:.9rem;white-space:pre-wrap;max-height:150px;overflow-y:auto">${s.content_text || '(文件已上传)'}</div>
          ${g ? `<div style="display:flex;align-items:center;gap:12px;padding:8px 0"><strong>得分：${g.score}/${a?.full_score || 100}</strong> <span style="color:var(--gray-500)">${g.comment || ''}</span></div>`
            : `<div style="display:flex;gap:8px;align-items:center">
                <input type="number" id="grade-score-${s.id}" placeholder="分数" style="width:80px;padding:8px;border:2px solid var(--gray-200);border-radius:6px" max="${a?.full_score||100}">
                <input id="grade-comment-${s.id}" placeholder="评语" style="flex:1;padding:8px;border:2px solid var(--gray-200);border-radius:6px">
                <button class="btn btn-primary btn-sm" onclick="App.saveGrade(${s.id},${assignmentId},${a?.course_id})">评分</button>
              </div>`}
        </div>`;
      }).join('')}
    </div>`;
    document.getElementById('page-content').innerHTML = html;
  },

  saveGrade(submissionId, assignmentId, courseId) {
    const score = parseFloat(document.getElementById(`grade-score-${submissionId}`).value);
    const comment = document.getElementById(`grade-comment-${submissionId}`).value || '';
    if (isNaN(score)) { this.toast('请输入分数', 'error'); return; }
    const a = DB.findOne('assignments', x => x.id === assignmentId);
    if (score > (a?.full_score || 100)) { this.toast('分数不能超过满分', 'error'); return; }
    const sub = DB.findOne('submissions', x => x.id === submissionId);
    if (!sub) return;
    DB.add('grades', { type:'assignment', assignment_id:assignmentId, course_id:courseId, student_id:sub.student_id, submission_id:submissionId, score, comment, graded_by:this.state.user.id, graded_at:new Date().toISOString() });
    DB.update('submissions', submissionId, { status: 'graded' });
    DB.addNotification(sub.student_id, '作业已批改：' + (a?.title || ''), '你的作业已批改，得分：' + score + '/' + (a?.full_score || 100) + (comment ? ' · 评语：' + comment : ''), 'grade', assignmentId);
    this.toast(`已评分：${score}分`, 'success');
    this.gradeAssignment(assignmentId);
  },

  /* ==================== TEACHER: STUDENTS ==================== */
  renderStudents() {
    const myCourses = DB.get('courses').filter(c => c.teacher_id === this.state.user.id);
    const courseId = this.state.currentTab || myCourses[0]?.id;
    const enrollments = DB.get('enrollments').filter(e => e.course_id == courseId);
    const users = DB.get('users');

    const html = `
      <div class="card">
        <div class="card-header"><h3>👥 学生管理</h3></div>
        <div class="flex gap-2 mb-3" style="flex-wrap:wrap">${myCourses.map(c => `<button class="btn ${c.id==courseId?'btn-primary':'btn-outline'} btn-sm" onclick="App.state.currentTab=${c.id};App.renderStudents()">${c.name}</button>`).join('')}</div>
        ${enrollments.length ? `<div class="table-wrap"><table>
          <tr><th>学号</th><th>姓名</th><th>院系</th><th>状态</th><th>选课时间</th><th>操作</th></tr>
          ${enrollments.map(e => {
            const u = users.find(x => x.id === e.student_id);
            return `<tr>
              <td>${u?.student_id || '-'}</td>
              <td>${u?.nickname || '未知'}</td>
              <td>${u?.department || '-'}</td>
              <td><span class="badge ${e.status==='approved'?'badge-success':e.status==='pending'?'badge-warning':'badge-danger'}">${e.status==='approved'?'在读':e.status==='pending'?'待审核':'已退课'}</span></td>
              <td>${e.enrolled_at?.slice(0,10) || '-'}</td>
              <td>${e.status === 'pending' ? `<button class="btn btn-success btn-sm" onclick="App.approveEnroll(${e.id})">批准</button>` : e.status === 'approved' ? `<button class="btn btn-danger-outline btn-sm" onclick="App.rejectEnroll(${e.id})">退课</button>` : '-'}</td>
            </tr>`;
          }).join('')}
        </table></div>` : '<div class="empty-state"><h3>暂无学生</h3></div>'}
      </div>`;
    document.getElementById('page-content').innerHTML = html;
  },

  approveEnroll(id) { DB.update('enrollments', id, { status:'approved' }); this.toast('已批准选课', 'success'); this.renderStudents(); },
  rejectEnroll(id) { DB.update('enrollments', id, { status:'dropped', dropped_at:new Date().toISOString() }); this.toast('已退课', 'info'); this.renderStudents(); },

  /* ==================== TEACHER/ADMIN: ANNOUNCEMENTS ==================== */
  renderAnnouncements() {
    const user = this.state.user;
    const myCourses = user.role === 'teacher' ? DB.get('courses').filter(c => c.teacher_id === user.id) : [];
    const courseIds = myCourses.map(c => c.id);
    const announcements = user.role === 'teacher' ? DB.get('announcements').filter(a => a.scope === 'system' || (a.scope === 'course' && courseIds.includes(a.course_id))) : DB.get('announcements');

    const html = `
      <div class="card">
        <div class="card-header"><h3>📢 公告管理</h3><button class="btn btn-primary btn-sm" onclick="App.showAnnouncementForm()">+ 发布公告</button></div>
        ${announcements.length ? announcements.sort((a,b) => (b.is_pinned||0) - (a.is_pinned||0)).map(a => {
          const course = DB.findOne('courses', c => c.id === a.course_id);
          return `<div class="note-item">
            <div class="flex justify-between"><h4>${a.is_pinned?'📌 ':''}${a.title}</h4><span class="badge ${a.scope==='system'?'badge-info':'badge-success'}">${a.scope==='system'?'全系统':'课程'}</span></div>
            <p>${a.content?.slice(0,100)}</p>
            <div class="meta">${a.scope==='course'?(course?.name||'')+' · ':''}${a.published_at?.slice(0,10)}${a.end_at ? ` · 有效期至 ${a.end_at?.slice(0,10)}` : ''}</div>
            ${user.role === 'admin' ? `<div class="flex gap-2 mt-2"><button class="btn btn-outline btn-sm" onclick="App.showAnnouncementForm(${a.id})">编辑</button><button class="btn btn-danger-outline btn-sm" onclick="App.deleteAnnouncement(${a.id})">删除</button></div>` : ''}
          </div>`;
        }).join('') : '<div class="empty-state"><h3>暂无公告</h3><p>点击发布公告</p></div>'}
      </div>`;
    document.getElementById('page-content').innerHTML = html;
  },

  showAnnouncementForm(ann) {
    const isEdit = !!ann;
    const user = this.state.user;
    const myCourses = user.role === 'teacher' ? DB.get('courses').filter(c => c.teacher_id === user.id) : [];
    this.showModal(`
      <div class="modal-header"><h3>${isEdit?'编辑公告':'发布公告'}</h3><div class="modal-close" onclick="App.hideModal()">×</div></div>
      <div class="modal-body">
        <div class="form-group"><label>发布范围</label><select id="ann-scope" onchange="document.getElementById('ann-course-wrap').style.display=this.value==='course'?'block':'none'">
          <option value="system" ${isEdit&&ann.scope==='system'?'selected':''} ${user.role==='teacher'?'':'selected'}>全系统</option>
          ${user.role === 'teacher' ? '<option value="course" '+(isEdit&&ann.scope==='course'?'selected':'')+'>指定课程</option>' : ''}
        </select></div>
        <div class="form-group" id="ann-course-wrap" style="display:${isEdit&&ann.scope==='course'?'block':'none'}">
          <label>选择课程</label><select id="ann-course">${myCourses.map(c => `<option value="${c.id}" ${isEdit&&ann.course_id===c.id?'selected':''}>${c.name}</option>`).join('')}</select>
        </div>
        <div class="form-group"><label>标题</label><input id="ann-title" value="${isEdit?ann.title:''}"></div>
        <div class="form-group"><label>内容</label><textarea id="ann-content" rows="5" style="width:100%;padding:12px;border:2px solid var(--gray-200);border-radius:8px">${isEdit?ann.content:''}</textarea></div>
        <div class="form-row">
          <div class="form-group"><label>生效时间（选填）</label><input type="datetime-local" id="ann-start" value="${isEdit&&ann.start_at?ann.start_at.slice(0,16):''}"></div>
          <div class="form-group"><label>过期时间（选填）</label><input type="datetime-local" id="ann-end" value="${isEdit&&ann.end_at?ann.end_at.slice(0,16):''}"></div>
        </div>
        <div class="form-group"><label><input type="checkbox" id="ann-pinned" ${isEdit&&ann.is_pinned?'checked':''}> 置顶</label></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="App.hideModal()">取消</button>
        <button class="btn btn-primary" onclick="App.saveAnnouncement(${isEdit?ann.id:'null'})">${isEdit?'保存':'发布'}</button>
      </div>
    `);
  },

  saveAnnouncement(id) {
    const data = {
      scope: document.getElementById('ann-scope').value,
      course_id: document.getElementById('ann-scope').value === 'course' ? parseInt(document.getElementById('ann-course').value) : null,
      title: document.getElementById('ann-title').value,
      content: document.getElementById('ann-content').value,
      start_at: document.getElementById('ann-start').value ? new Date(document.getElementById('ann-start').value).toISOString() : null,
      end_at: document.getElementById('ann-end').value ? new Date(document.getElementById('ann-end').value).toISOString() : null,
      is_pinned: document.getElementById('ann-pinned').checked ? 1 : 0,
      publisher_id: this.state.user.id,
      published_at: new Date().toISOString(),
    };
    if (!data.title || !data.content) { this.toast('请填写标题和内容', 'error'); return; }
    if (id) { DB.update('announcements', id, data); this.toast('公告已更新', 'success'); }
    else { DB.add('announcements', data); this.toast('公告已发布', 'success'); }
    this.hideModal(); this.renderAnnouncements();
  },

  deleteAnnouncement(id) { if (confirm('确定删除公告？')) { DB.remove('announcements', id); this.renderAnnouncements(); } },

  showAnnouncementDetail(id) {
    const a = DB.findOne('announcements', x => x.id === id);
    if (!a) return;
    this.showModal(`
      <div class="modal-header"><h3>${a.is_pinned?'📌 ':''}${a.title}</h3><div class="modal-close" onclick="App.hideModal()">×</div></div>
      <div class="modal-body"><div style="white-space:pre-wrap;line-height:1.8;font-size:.95rem">${a.content}</div><div class="meta mt-3">${a.published_at?.slice(0,10)} ${a.scope==='system'?'· 全系统公告':''}</div></div>
    `);
  },

  /* ==================== ADMIN: USERS ==================== */
  renderUsers() {
    const users = DB.get('users');
    const roles = { student:'🎓 学生', teacher:'👨‍🏫 教师', admin:'⚙️ 管理员' };
    const filter = this.state.currentTab || 'all';

    const html = `
      <div class="card">
        <div class="card-header"><h3>👥 用户管理 (${users.length})</h3></div>
        <div class="flex gap-2 mb-3" style="flex-wrap:wrap">
          <button class="btn ${filter==='all'?'btn-primary':'btn-outline'} btn-sm" onclick="App.state.currentTab='all';App.renderUsers()">全部</button>
          <button class="btn ${filter==='student'?'btn-primary':'btn-outline'} btn-sm" onclick="App.state.currentTab='student';App.renderUsers()">🎓 学生</button>
          <button class="btn ${filter==='teacher'?'btn-primary':'btn-outline'} btn-sm" onclick="App.state.currentTab='teacher';App.renderUsers()">👨‍🏫 教师</button>
          <button class="btn ${filter==='admin'?'btn-primary':'btn-outline'} btn-sm" onclick="App.state.currentTab='admin';App.renderUsers()">⚙️ 管理员</button>
        </div>
        <div class="table-wrap"><table>
          <tr><th>ID</th><th>邮箱</th><th>昵称</th><th>角色</th><th>院系</th><th>学号/职称</th><th>注册时间</th><th>操作</th></tr>
          ${users.filter(u => filter === 'all' || u.role === filter).map(u => `<tr>
            <td>${u.id}</td>
            <td>${u.email}</td>
            <td>${u.nickname}</td>
            <td><span class="badge badge-info">${roles[u.role]||u.role}</span></td>
            <td>${u.department || '-'}</td>
            <td>${u.student_id || u.teacher_title || '-'}</td>
            <td>${u.created_at?.slice(0,10)}</td>
            <td><button class="btn btn-sm ${u.deleted_at?'btn-success':'btn-danger-outline'}" onclick="App.toggleUserBan(${u.id})">${u.deleted_at?'解封':'封禁'}</button></td>
          </tr>`).join('')}
        </table></div>
      </div>`;
    document.getElementById('page-content').innerHTML = html;
  },

  toggleUserBan(id) {
    const u = DB.findOne('users', x => x.id === id);
    if (!u || u.id === this.state.user.id) { this.toast('不能操作自己', 'error'); return; }
    if (u.deleted_at) { DB.update('users', id, { deleted_at: null }); this.toast('用户已解封', 'success'); }
    else { DB.update('users', id, { deleted_at: new Date().toISOString() }); DB.add('auditLogs', { admin_id:this.state.user.id, action:'user_ban', target_type:'users', target_id:id, detail:JSON.stringify({reason:'管理员操作',previous_status:'active'}), ip_address:'127.0.0.1', created_at:new Date().toISOString() }); this.toast('用户已封禁', 'info'); }
    this.renderUsers();
  },

  /* ==================== ADMIN: CONFIG ==================== */
  renderConfig() {
    const configs = DB.get('systemConfigs');
    const html = `
      <div class="card">
        <div class="card-header"><h3>⚙️ 系统配置</h3></div>
        <div class="table-wrap"><table>
          <tr><th>配置项</th><th>值</th><th>说明</th><th>操作</th></tr>
          ${configs.map(c => `
            <tr>
              <td><code>${c.config_key}</code></td>
              <td><strong>${c.config_value}</strong></td>
              <td>${c.description || '-'}</td>
              <td><button class="btn btn-outline btn-sm" onclick="App.showConfigForm(${c.id})">编辑</button></td>
            </tr>
          `).join('')}
        </table></div>
      </div>`;
    document.getElementById('page-content').innerHTML = html;
  },

  showConfigForm(id) {
    const c = DB.findOne('systemConfigs', x => x.id === id);
    if (!c) return;
    this.showModal(`
      <div class="modal-header"><h3>编辑配置</h3><div class="modal-close" onclick="App.hideModal()">×</div></div>
      <div class="modal-body">
        <div class="form-group"><label>配置键</label><input value="${c.config_key}" disabled style="padding:8px;border:2px solid var(--gray-200);border-radius:6px;width:100%"></div>
        <div class="form-group"><label>配置值</label><input id="cfg-value" value="${c.config_value}" style="padding:8px;border:2px solid var(--gray-200);border-radius:6px;width:100%"></div>
        <div class="form-group"><label>说明</label><input value="${c.description||''}" disabled style="padding:8px;border:2px solid var(--gray-200);border-radius:6px;width:100%"></div>
      </div>
      <div class="modal-footer"><button class="btn btn-outline" onclick="App.hideModal()">取消</button><button class="btn btn-primary" onclick="App.saveConfig(${id})">保存</button></div>
    `);
  },

  saveConfig(id) {
    const val = document.getElementById('cfg-value').value;
    DB.update('systemConfigs', id, { config_value: val, updated_by: this.state.user.id });
    DB.add('auditLogs', { admin_id:this.state.user.id, action:'config_update', target_type:'system_configs', target_id:id, detail:JSON.stringify({key:DB.findOne('systemConfigs',x=>x.id===id).config_key,new:val}), ip_address:'127.0.0.1', created_at:new Date().toISOString() });
    this.toast('配置已更新', 'success');
    this.hideModal();
    this.renderConfig();
  },

  /* ==================== ADMIN: AUDIT ==================== */
  renderAudit() {
    const logs = DB.get('auditLogs');
    const html = `
      <div class="card">
        <div class="card-header"><h3>📜 审计日志 (${logs.length})</h3></div>
        ${logs.length ? `<div class="table-wrap"><table>
          <tr><th>时间</th><th>操作人</th><th>操作类型</th><th>对象</th><th>详情</th><th>IP</th></tr>
          ${logs.slice().reverse().map(l => {
            const admin = DB.findOne('users', u => u.id === l.admin_id);
            const detail = l.detail ? (()=>{try{const d=JSON.parse(l.detail);return JSON.stringify(d).slice(0,60)}catch{return l.detail}})() : '';
            return `<tr>
              <td>${l.created_at?.slice(0,16)}</td>
              <td>${admin?.nickname || '未知'}</td>
              <td><span class="badge badge-info">${l.action}</span></td>
              <td>${l.target_type}#${l.target_id || '-'}</td>
              <td class="log-detail" title="${detail}">${detail}</td>
              <td>${l.ip_address || '-'}</td>
            </tr>`;
          }).join('')}
        </table></div>` : '<div class="empty-state"><h3>暂无日志</h3></div>'}
      </div>`;
    document.getElementById('page-content').innerHTML = html;
  },

  /* ==================== LEAVE MANAGEMENT ==================== */
  renderLeave() {
    const user = this.state.user;
    if (user.role === 'student') this.renderStudentLeave();
    else if (user.role === 'teacher') this.renderTeacherLeave();
    else if (user.role === 'admin') this.renderAdminLeave();
  },

  renderStudentLeave() {
    const user = this.state.user;
    const leaves = DB.get('leaveRequests').filter(l => l.student_id === user.id).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const statusMap = { pending:'待审批', approved:'已批准', rejected:'已拒绝' };
    const typeMap = { sick:'病假', personal:'事假', other:'其他' };
    const statusClass = { pending:'warning', approved:'success', rejected:'danger' };

    document.getElementById('page-content').innerHTML = `
      <div class="card" style="margin-bottom:16px">
        <div class="card-header"><h3>📋 提交请假申请</h3></div>
        <div class="card-body">
          <div class="form-row">
            <div class="form-group"><label>请假类型</label><select id="leave-type"><option value="sick">病假</option><option value="personal">事假</option><option value="other">其他</option></select></div>
            <div class="form-group"><label>关联课程（选填）</label><select id="leave-course"><option value="">不关联</option>${DB.find('enrollments', e => e.student_id === user.id && e.status === 'approved').map(e => { const c = DB.findOne('courses', x => x.id === e.course_id); return c ? `<option value="${c.id}">${c.name}</option>` : ''; }).join('')}</select></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>开始日期</label><input type="date" id="leave-start"></div>
            <div class="form-group"><label>结束日期</label><input type="date" id="leave-end"></div>
          </div>
          <div class="form-group"><label>请假原因</label><textarea id="leave-reason" rows="3" style="width:100%;padding:12px;border:2px solid var(--gray-200);border-radius:8px;resize:vertical" placeholder="请说明请假原因..."></textarea></div>
          <button class="btn btn-primary" onclick="App.submitLeave()">提交申请</button>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><h3>📋 我的请假记录 (${leaves.length})</h3></div>
        ${leaves.length ? `<div class="table-wrap"><table>
          <tr><th>类型</th><th>日期范围</th><th>原因</th><th>状态</th><th>审批意见</th><th>提交时间</th></tr>
          ${leaves.map(l => {
            const course = l.course_id ? DB.findOne('courses', c => c.id === l.course_id) : null;
            return `<tr>
              <td>${typeMap[l.type] || l.type}</td>
              <td>${l.start_date?.slice(0,10)} ~ ${l.end_date?.slice(0,10)}</td>
              <td>${l.reason}${course ? '<br><span style="font-size:.78rem;color:var(--gray-400)">课程：' + course.name + '</span>' : ''}</td>
              <td><span class="status-badge ${statusClass[l.status]}">${statusMap[l.status] || l.status}</span></td>
              <td>${l.comment || '-'}</td>
              <td>${l.created_at?.slice(0,10) || ''}</td>
            </tr>`;
          }).join('')}
        </table></div>` : '<div class="empty-state"><div class="icon">📋</div><p>暂无请假记录</p></div>'}
      </div>`;
  },

  submitLeave() {
    const start = document.getElementById('leave-start')?.value;
    const end = document.getElementById('leave-end')?.value;
    const reason = document.getElementById('leave-reason')?.value.trim();
    const type = document.getElementById('leave-type')?.value;
    const courseId = parseInt(document.getElementById('leave-course')?.value) || null;
    if (!start || !end) { this.toast('请选择请假日期', 'error'); return; }
    if (!reason) { this.toast('请填写请假原因', 'error'); return; }
    if (new Date(end) < new Date(start)) { this.toast('结束日期不能早于开始日期', 'error'); return; }
    DB.addLeaveRequest(this.state.user.id, { start_date: start, end_date: end, reason, type, course_id: courseId });
    this.toast('请假申请已提交', 'success');
    this.renderStudentLeave();
  },

  renderTeacherLeave() {
    const user = this.state.user;
    const myCourseIds = DB.get('courses').filter(c => c.teacher_id === user.id).map(c => c.id);
    const leaves = DB.get('leaveRequests').filter(l => l.status === 'pending' && (!l.course_id || myCourseIds.includes(l.course_id))).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const allLeaves = DB.get('leaveRequests').filter(l => !l.course_id || myCourseIds.includes(l.course_id)).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const typeMap = { sick:'病假', personal:'事假', other:'其他' };
    const statusMap = { pending:'待审批', approved:'已批准', rejected:'已拒绝' };
    const statusClass = { pending:'warning', approved:'success', rejected:'danger' };

    document.getElementById('page-content').innerHTML = `
      ${leaves.length ? `<div class="card" style="margin-bottom:16px">
        <div class="card-header"><h3>⏳ 待审批 (${leaves.length})</h3></div>
        <div class="card-body">${leaves.map(l => {
          const s = DB.findOne('users', u => u.id === l.student_id);
          const c = l.course_id ? DB.findOne('courses', x => x.id === l.course_id) : null;
          return `<div style="padding:14px;border:1px solid var(--border-color);border-radius:8px;margin-bottom:10px">
            <div style="display:flex;justify-content:space-between;align-items:start">
              <div><strong>${s?.nickname || '未知'}</strong> · ${typeMap[l.type] || l.type} · ${l.start_date?.slice(0,10)} ~ ${l.end_date?.slice(0,10)}${c ? '<br><span style="font-size:.82rem;color:var(--gray-500)">课程：' + c.name + '</span>' : ''}</div>
              <span class="status-badge warning">待审批</span>
            </div>
            <p style="margin-top:8px;font-size:.9rem;color:var(--gray-600);background:var(--gray-50);padding:10px;border-radius:6px">${l.reason}</p>
            <div style="display:flex;gap:8px;margin-top:10px;align-items:center">
              <input id="leave-comment-${l.id}" placeholder="审批意见（选填）" style="flex:1;padding:8px 12px;border:2px solid var(--gray-200);border-radius:6px;font-size:.85rem">
              <button class="btn btn-success btn-sm" onclick="App.approveLeave(${l.id})">✓ 批准</button>
              <button class="btn btn-danger btn-sm" onclick="App.rejectLeave(${l.id})">✗ 拒绝</button>
            </div>
          </div>`;
        }).join('')}</div>
      </div>` : ''}
      <div class="card">
        <div class="card-header"><h3>📋 全部请假记录</h3></div>
        ${allLeaves.length ? `<div class="table-wrap"><table>
          <tr><th>学生</th><th>类型</th><th>日期</th><th>原因</th><th>状态</th><th>审批意见</th></tr>
          ${allLeaves.map(l => {
            const s = DB.findOne('users', u => u.id === l.student_id);
            return `<tr>
              <td>${s?.nickname || '未知'}</td>
              <td>${typeMap[l.type] || l.type}</td>
              <td>${l.start_date?.slice(0,10)} ~ ${l.end_date?.slice(0,10)}</td>
              <td>${l.reason}</td>
              <td><span class="status-badge ${statusClass[l.status]}">${statusMap[l.status] || l.status}</span></td>
              <td>${l.comment || '-'}</td>
            </tr>`;
          }).join('')}
        </table></div>` : '<div class="empty-state"><div class="icon">📋</div><p>暂无记录</p></div>'}
      </div>`;
  },

  renderAdminLeave() {
    const leaves = DB.get('leaveRequests').sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const pending = leaves.filter(l => l.status === 'pending');
    const typeMap = { sick:'病假', personal:'事假', other:'其他' };
    const statusMap = { pending:'待审批', approved:'已批准', rejected:'已拒绝' };
    const statusClass = { pending:'warning', approved:'success', rejected:'danger' };

    document.getElementById('page-content').innerHTML = `
      <div class="card" style="margin-bottom:16px">
        <div class="card-header"><h3>⏳ 待审批 (${pending.length})</h3></div>
        <div class="card-body">${pending.length ? pending.map(l => {
          const s = DB.findOne('users', u => u.id === l.student_id);
          return `<div style="padding:14px;border:1px solid var(--border-color);border-radius:8px;margin-bottom:10px">
            <div style="display:flex;justify-content:space-between;align-items:start">
              <div><strong>${s?.nickname || '未知'}</strong> · ${typeMap[l.type] || l.type} · ${l.start_date?.slice(0,10)} ~ ${l.end_date?.slice(0,10)}</div>
              <span class="status-badge warning">待审批</span>
            </div>
            <p style="margin:8px 0;font-size:.9rem;color:var(--gray-600);background:var(--gray-50);padding:10px;border-radius:6px">${l.reason}</p>
            <div style="display:flex;gap:8px;align-items:center">
              <input id="aleave-comment-${l.id}" placeholder="审批意见（选填）" style="flex:1;padding:8px 12px;border:2px solid var(--gray-200);border-radius:6px;font-size:.85rem">
              <button class="btn btn-success btn-sm" onclick="App.approveLeave(${l.id})">✓ 批准</button>
              <button class="btn btn-danger btn-sm" onclick="App.rejectLeave(${l.id})">✗ 拒绝</button>
            </div>
          </div>`;
        }).join('') : '<div class="empty-state" style="padding:20px"><div class="icon">✅</div><p>没有待审批的申请</p></div>'}</div>
      </div>
      <div class="card">
        <div class="card-header"><h3>📋 全部请假记录 (${leaves.length})</h3></div>
        ${leaves.length ? `<div class="table-wrap"><table>
          <tr><th>学生</th><th>类型</th><th>日期</th><th>原因</th><th>状态</th><th>审批意见</th><th>审批人</th></tr>
          ${leaves.map(l => {
            const s = DB.findOne('users', u => u.id === l.student_id);
            const ap = l.approver_id ? DB.findOne('users', u => u.id === l.approver_id) : null;
            return `<tr>
              <td>${s?.nickname || '未知'}</td>
              <td>${typeMap[l.type] || l.type}</td>
              <td>${l.start_date?.slice(0,10)} ~ ${l.end_date?.slice(0,10)}</td>
              <td>${l.reason}</td>
              <td><span class="status-badge ${statusClass[l.status]}">${statusMap[l.status] || l.status}</span></td>
              <td>${l.comment || '-'}</td>
              <td>${ap?.nickname || '-'}</td>
            </tr>`;
          }).join('')}
        </table></div>` : '<div class="empty-state"><div class="icon">📋</div><p>暂无记录</p></div>'}
      </div>`;
  },

  approveLeave(id) {
    const comment = document.getElementById('leave-comment-' + id)?.value.trim() || document.getElementById('aleave-comment-' + id)?.value.trim() || '';
    DB.approveLeaveRequest(id, this.state.user.id, comment);
    this.toast('已批准', 'success');
    this.renderLeave();
  },

  rejectLeave(id) {
    const comment = document.getElementById('leave-comment-' + id)?.value.trim() || document.getElementById('aleave-comment-' + id)?.value.trim() || '';
    DB.rejectLeaveRequest(id, this.state.user.id, comment);
    this.toast('已拒绝', 'info');
    this.renderLeave();
  },

  /* ==================== THEME ==================== */
  initTheme() {
    const saved = localStorage.getItem('studyapp_theme');
    if (saved === 'dark') { document.documentElement.setAttribute('data-theme', 'dark'); this.updateThemeBtn(); }
  },

  toggleTheme() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) { document.documentElement.removeAttribute('data-theme'); localStorage.setItem('studyapp_theme', 'light'); }
    else { document.documentElement.setAttribute('data-theme', 'dark'); localStorage.setItem('studyapp_theme', 'dark'); }
    this.updateThemeBtn();
    this.toast(isDark ? '已切换为浅色模式' : '已切换为深色模式', 'info');
  },

  updateThemeBtn() {
    const btn = document.getElementById('theme-btn');
    if (btn) btn.textContent = document.documentElement.getAttribute('data-theme') === 'dark' ? '☀️' : '🌙';
  },

  /* ==================== DATA EXPORT / IMPORT ==================== */
  exportData() {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('studyapp_'));
    const data = {};
    keys.forEach(k => { data[k.replace('studyapp_', '')] = JSON.parse(localStorage.getItem(k)); });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `轻学备份_${new Date().toISOString().slice(0,10)}.json`;
    a.click(); URL.revokeObjectURL(url);
    this.toast('数据已导出', 'success');
  },

  showImportDialog() {
    this.showModal(`
      <div class="modal-header"><h3>📥 导入数据</h3><div class="modal-close" onclick="App.hideModal()">×</div></div>
      <div class="modal-body">
        <p style="margin-bottom:16px;color:var(--gray-500)">选择之前导出的 JSON 备份文件，将恢复所有数据。<br><strong style="color:var(--danger)">⚠️ 当前数据将被覆盖！</strong></p>
        <div class="upload-area" onclick="document.getElementById('import-file').click()">
          <div class="icon">📁</div><p>点击选择备份文件</p>
          <input type="file" id="import-file" accept=".json" style="display:none" onchange="document.getElementById('import-name').textContent=this.files[0]?.name||'未选择'">
          <p id="import-name" style="font-size:.8rem;color:var(--gray-400);margin-top:4px">未选择</p>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="App.hideModal()">取消</button>
        <button class="btn btn-danger" onclick="App.importData()">恢复数据</button>
      </div>
    `);
  },

  importData() {
    const fileInput = document.getElementById('import-file');
    if (!fileInput.files?.[0]) { this.toast('请选择备份文件', 'error'); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        Object.keys(data).forEach(k => { localStorage.setItem('studyapp_' + k, JSON.stringify(data[k])); });
        this.toast('数据恢复成功，请重新登录', 'success');
        this.hideModal();
        setTimeout(() => this.logout(), 1000);
      } catch (err) { this.toast('文件格式错误', 'error'); }
    };
    reader.readAsText(fileInput.files[0]);
  },

  /* ==================== KEYBOARD SHORTCUTS ==================== */
  initShortcuts() {
    document.removeEventListener('keydown', this._shortcutHandler);
    this._shortcutHandler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        if (e.ctrlKey && e.key === 'Enter') {
          const modal = document.getElementById('modal-overlay');
          if (modal?.classList.contains('show')) {
            const okBtn = modal.querySelector('.modal-footer .btn-primary');
            if (okBtn) okBtn.click();
          }
          return;
        }
        if (e.ctrlKey && e.key === 's') { e.preventDefault(); this.toast('已自动保存', 'info'); return; }
        return;
      }
      if (e.key === 'Escape') {
        const modal = document.getElementById('modal-overlay');
        if (modal?.classList.contains('show')) this.hideModal();
      }
      if (e.ctrlKey && e.key === 'k') { e.preventDefault(); this.toast('快捷键: Ctrl+S 保存 · Ctrl+Enter 提交 · Esc 关闭', 'info'); }
    };
    document.addEventListener('keydown', this._shortcutHandler);
  },

  /* ==================== BROWSER NOTIFICATIONS ==================== */
  checkNotifications() {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') { Notification.requestPermission(); }
    if (Notification.permission !== 'granted') return;
    const today = new Date().toISOString().slice(0,10);
    const user = this.state.user;
    if (!user || user.role !== 'student') return;
    const enrollments = DB.get('enrollments').filter(e => e.student_id === user.id && e.status === 'approved');
    const courseIds = enrollments.map(e => e.course_id);
    const assignments = DB.get('assignments').filter(a => courseIds.includes(a.course_id) && a.status === 'published');
    const submissions = DB.get('submissions').filter(s => s.student_id === user.id);
    const pending = assignments.filter(a => !submissions.some(s => s.assignment_id === a.id));
    const notified = JSON.parse(localStorage.getItem('studyapp_notified') || '[]');
    pending.forEach(a => {
      if (!a.due_date || notified.includes(a.id)) return;
      const due = new Date(a.due_date);
      const now = new Date();
      const diff = (due - now) / (1000 * 60 * 60 * 24);
      if (diff > 0 && diff <= 2) {
        new Notification('⏰ 作业即将截止', { body: `"${a.title}" 还剩 ${Math.round(diff*10)/10} 天截止`, icon: '📋' });
        notified.push(a.id);
      }
    });
    localStorage.setItem('studyapp_notified', JSON.stringify(notified));
  },

  /* ==================== NOTIFICATION CENTER ==================== */
  toggleNotifications() {
    const panel = document.getElementById('notif-panel');
    if (!panel) return;
    panel.classList.toggle('show');
    if (panel.classList.contains('show')) this.renderNotifList();
  },

  renderNotifList() {
    const user = this.state.user;
    if (!user) return;
    const list = document.getElementById('notif-list');
    const notifs = DB.getNotifications(user.id);
    if (!notifs.length) {
      list.innerHTML = '<div class="notif-empty">暂无通知</div>';
      return;
    }
    list.innerHTML = notifs.map(n => `
      <div class="notif-item ${n.is_read ? '' : 'unread'}" onclick="App.clickNotification(${n.id})">
        <div class="notif-icon" style="background:${n.type==='system'?'var(--primary-light)':n.type==='grade'?'#dcfce7':n.type==='assignment'?'#fef3c7':'#dbeafe'}">
          ${n.type==='system'?'📢':n.type==='grade'?'🏆':n.type==='assignment'?'⏰':'📚'}
        </div>
        <div class="notif-body">
          <div class="notif-title">${!n.is_read ? '<span class="unread-dot"></span>' : ''}${n.title}</div>
          <div class="notif-preview">${n.content}</div>
          <div class="notif-time">${new Date(n.created_at).toLocaleString()}</div>
        </div>
      </div>
    `).join('');
    this.updateNotifBadge();
  },

  clickNotification(id) {
    DB.markNotifRead(id);
    this.renderNotifList();
    this.updateNotifBadge();
  },

  markAllNotifRead() {
    if (!this.state.user) return;
    DB.markAllNotifRead(this.state.user.id);
    this.renderNotifList();
    this.updateNotifBadge();
    this.toast('已全部标记为已读', 'info');
  },

  updateNotifBadge() {
    const badge = document.getElementById('notif-badge');
    if (!badge || !this.state.user) return;
    const count = DB.getUnreadCount(this.state.user.id);
    if (count > 0) { badge.style.display = 'flex'; badge.textContent = count > 99 ? '99+' : count; }
    else { badge.style.display = 'none'; }
  },

  notifyNewAssignment(assignmentId) {
    const a = DB.findOne('assignments', x => x.id === assignmentId);
    if (!a) return;
    const students = DB.find('enrollments', e => e.course_id === a.course_id && e.status === 'approved');
    students.forEach(e => DB.addNotification(e.student_id, '新作业：' + a.title, '作业「' + a.title + '」已发布，请在 ' + (a.due_date ? new Date(a.due_date).toLocaleString() : '截止日期前') + ' 完成提交。', 'assignment', assignmentId));
  },

  /* ==================== MODAL / TOAST ==================== */
  showModal(html) {
    document.getElementById('modal-content').innerHTML = html;
    document.getElementById('modal-overlay').classList.add('show');
  },

  hideModal() {
    document.getElementById('modal-overlay').classList.remove('show');
  },

  toast(msg, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.textContent = msg;
    container.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; setTimeout(() => t.remove(), 300); }, 2500);
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
