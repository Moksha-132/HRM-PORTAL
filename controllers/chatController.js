const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { ChatMessage, Employee, Leave, SuperAdmin, Company, HeaderSetting, AboutSetting, ContactSetting, Notification } = require('../models');
const { callGroqChat } = require('../services/groqClient');

const SYSTEM_PROMPTS = {
    public: 'You are a friendly help desk assistant for a HRM platform. Explain the company, platform features, and how to login or navigate. Keep responses concise and helpful.',
    employee: 'You are an HR assistant for employees. Help with HR policies, leave info, salary basics (no sensitive data), and general platform guidance. Be friendly and clear.',
    manager: 'You are a professional assistant for managers. Help with team management, reports, approvals, and employee-related queries. Be concise and professional.',
    admin: 'You are a system assistant for administrators. Help with platform administration, configuration, and overall system guidance. Be precise and helpful.'
};

const FORMAT_INSTRUCTIONS = 'Give concise answers. Use one line for simple queries. Use bullets for lists. Avoid unnecessary explanations unless asked. Highlight important values with **bold**.';

const getCompanyContext = async () => {
    try {
        const [header, about, contact] = await Promise.all([
            HeaderSetting.findOne(),
            AboutSetting.findOne(),
            ContactSetting.findOne()
        ]);

        let context = 'Company Information:\n';
        context += `Name: ${header?.title || 'Shnoor International LLC'}\n`;
        context += `Tagline: ${header?.subtitle || 'Empowering Next-Gen Workforce'}\n`;
        context += `Description: ${about?.description || 'A cutting-edge HRM platform for modern enterprises.'}\n`;
        context += `Mission: ${about?.mission || 'To empower organizations with an intuitive platform.'}\n`;
        context += `Contact Email: ${contact?.email || 'contact@shnoor.com'}\n`;
        context += `Contact Phone: ${contact?.phone || '+1 (555) 123-4567'}\n`;
        context += `Address: ${contact?.address || '123 Business Avenue, Suite 100, New York, NY 10001'}\n`;
        
        return context;
    } catch (err) {
        console.error('[Chat] Failed to fetch company context:', err);
        return 'Company: Shnoor International LLC\nEmail: contact@shnoor.com\nPhone: +1 (555) 123-4567\n';
    }
};

const normalize = (text) => (text || '').toLowerCase().trim();

const isSimpleQuestion = (message) => {
    const msg = normalize(message);
    const keywords = ['how many', 'count', 'total', 'number of'];
    return keywords.some(k => msg.includes(k));
};

const wantsExplanation = (message) => {
    const msg = normalize(message);
    return msg.includes('explain') || msg.includes('summary') || msg.includes('details') || msg.includes('why') || msg.includes('elaborate');
};

const isDatabaseQuestion = (message) => {
    const msg = normalize(message);
    const keywords = [
        'employee', 'employees', 'team', 'team members', 'under me', 'active employees',
        'company', 'companies', 'active companies',
        'leave', 'leaves', 'on leave', 'leave balance', 'leave today',
        'attendance', 'report', 'reports'
    ];
    return keywords.some(k => msg.includes(k));
};

const getToday = () => {
    try {
        // Use local date to avoid UTC offset issues
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const d = String(now.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    } catch (e) {
        return new Date().toISOString().split('T')[0];
    }
};

const daysBetween = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    const diff = Math.floor((e - s) / (1000 * 60 * 60 * 24));
    return diff + 1;
};

const resolveEmployeeByEmail = async (email) => {
    if (!email) return null;
    return Employee.findOne({ where: { email } });
};

const ensureManagerEmployeeRecord = async (email) => {
    if (!email) return null;
    let emp = await Employee.findOne({ where: { email } });
    if (emp) return emp;
    const admin = await SuperAdmin.findOne({ where: { email, role: 'Manager' } });
    if (!admin) return null;
    emp = await Employee.create({
        employee_name: admin.name || 'Manager',
        email: admin.email,
        role: 'Employee',
        designation: 'Manager',
        department: 'Management',
        joining_date: new Date()
    });
    return emp;
};

const buildList = (title, items) => {
    if (!items.length) return title + '\n- **None found**';
    return [title, ...items.map(i => `- ${i}`)].join('\n');
};

const findEmployeeByNameInMessage = async (message, role, managerEmp) => {
    const msg = normalize(message);
    let scope = [];
    if (role === 'admin') {
        scope = await Employee.findAll({ attributes: ['employee_id', 'employee_name', 'email', 'manager_id'] });
    } else if (role === 'manager') {
        if (!managerEmp) return null;
        scope = await Employee.findAll({ where: { manager_id: managerEmp.employee_id }, attributes: ['employee_id', 'employee_name', 'email', 'manager_id'] });
        if (!scope.length) {
            // Fallback to all employees when manager/team mapping is not set
            scope = await Employee.findAll({ attributes: ['employee_id', 'employee_name', 'email', 'manager_id'] });
        }
    } else if (role === 'employee') {
        if (!managerEmp) return null;
        scope = [managerEmp];
    }

    const found = scope.find(e => e.employee_name && msg.includes(e.employee_name.toLowerCase()));
    return found || null;
};

const handleDatabaseQuery = async ({ message, role, userId }) => {
    const msg = normalize(message);
    const today = getToday();
    let employee = null;

    if (role === 'employee') {
        employee = await resolveEmployeeByEmail(userId);
    }
    if (role === 'manager') {
        employee = await ensureManagerEmployeeRecord(userId);
    }

    // Team / employee count
    if ((msg.includes('how many') || msg.includes('count') || msg.includes('total') || msg.includes('number of')) && (msg.includes('employee') || msg.includes('team'))) {
        let where = {};
        if (role === 'manager') {
            if (!employee) return { text: 'I could not find your employee record to locate your team.', simple: true };
            where.manager_id = employee.employee_id;
        }
        
        if (msg.includes('active')) {
            where.status = 'Active';
        }

        const count = await Employee.count({ where });
        const scope = (role === 'manager') ? 'team members' : 'employees in total';
        const type = (msg.includes('active')) ? 'active ' : '';
        
        return { text: `You have **${count}** ${type}${scope}.`, simple: true };
    }

    // Team list
    if ((msg.includes('list') || msg.includes('show')) && (msg.includes('team') || msg.includes('my employees') || msg.includes('team members') || msg.includes('employees'))) {
        if (role === 'manager') {
            if (!employee) return { text: 'I could not find your employee record to locate your team.', simple: false };
            const team = await Employee.findAll({ where: { manager_id: employee.employee_id }, order: [['employee_name', 'ASC']] });
            const items = team.map(t => `**${t.employee_name}** (ID: ${t.employee_id})`);
            return { text: buildList('Your team members:', items), simple: false };
        }
        if (role === 'admin') {
            const all = await Employee.findAll({ order: [['employee_name', 'ASC']] });
            const items = all.map(t => `**${t.employee_name}** (ID: ${t.employee_id})`);
            return { text: buildList('All employees:', items), simple: false };
        }
        return { text: 'You do not have team access for this request.', simple: false };
    }

    // Company count (Admin only)
    if ((msg.includes('how many') || msg.includes('count') || msg.includes('total') || msg.includes('number of')) && (msg.includes('company') || msg.includes('companies'))) {
        console.log('[Chat] Company count query matched:', msg, 'Role:', role);
        if (role === 'admin') {
            let where = {};
            if (msg.includes('active')) {
                where.status = 'Active';
            }
            const count = await Company.count({ where });
            const type = (msg.includes('active')) ? 'active ' : '';
            return { text: `There are **${count}** ${type}companies on the platform.`, simple: true };
        }
        return { text: 'You do not have access to company data.', simple: true };
    }

    // Who is on leave today
    if (
        (msg.includes('on leave') && msg.includes('today')) ||
        (msg.includes('leave') && msg.includes('today') && (msg.includes('who') || msg.includes('take') || msg.includes('taking') || msg.includes('leave today')))
    ) {
        if (role === 'employee') {
            if (!employee) return { text: 'I could not find your employee record to check leave status.', simple: true };
            const onLeave = await Leave.findOne({
                where: {
                    employee_id: employee.employee_id,
                    status: 'Approved',
                    start_date: { [Op.lte]: today },
                    end_date: { [Op.gte]: today }
                }
            });
            return { text: onLeave ? 'You are **on leave today**.' : 'You are **not on leave today**.', simple: true };
        }
        const where = {
            status: 'Approved',
            start_date: { [Op.lte]: today },
            end_date: { [Op.gte]: today }
        };
        if (role === 'manager') {
            if (!employee) return { text: 'I could not find your employee record to locate your team.', simple: false };
            const teamIds = await Employee.findAll({ where: { manager_id: employee.employee_id }, attributes: ['employee_id'] });
            const ids = teamIds.map(t => t.employee_id);
            if (ids.length) {
                where.employee_id = ids;
            }
        }
        const leaves = await Leave.findAll({ where, include: [Employee], order: [['start_date', 'ASC']] });
        const items = leaves.map(l => `**${l.Employee ? l.Employee.employee_name : 'Employee'}** (${l.leave_type})`);
        return { text: buildList(`Employees on leave today (${today}):`, items), simple: false };
    }

    // Specific person leave status/history
    if (msg.includes('leave') && (msg.includes('took') || msg.includes('take') || msg.includes('on leave') || msg.includes('leave'))) {
        const target = await findEmployeeByNameInMessage(message, role, employee);
        if (target) {
            const latest = await Leave.findOne({
                where: { employee_id: target.employee_id },
                order: [['start_date', 'DESC']]
            });
            if (!latest) {
                return { text: `No leave records found for **${target.employee_name}**.`, simple: true };
            }
            return { text: `**${target.employee_name}** has a **${latest.status}** ${latest.leave_type} leave from **${latest.start_date}** to **${latest.end_date}**.`, simple: true };
        }
    }

    // Leave balance
    if (msg.includes('leave balance')) {
        if (!employee) {
            return { text: 'I could not find your employee record to check leave balance.', simple: true };
        }
        const leaves = await Leave.findAll({ where: { employee_id: employee.employee_id, status: 'Approved' } });
        const usedDays = leaves.reduce((sum, l) => sum + daysBetween(l.start_date, l.end_date), 0);
        return { text: `You have **${usedDays}** approved leave day(s) recorded.`, simple: true };
    }

    return { text: null, simple: false };
};

exports.handleChat = async (req, res) => {
    try {
        const { message, role, userId } = req.body;

        if (!message || !role || !userId) {
            return res.status(400).json({ success: false, error: 'message, role, and userId are required' });
        }

        if (!SYSTEM_PROMPTS[role]) {
            return res.status(400).json({ success: false, error: 'Invalid role' });
        }

        let responseText = '';
        const dataQuery = isDatabaseQuestion(message);
        const wantsExplain = wantsExplanation(message);
        const companyContext = await getCompanyContext();
        const baseSystemPrompt = `${companyContext}\n${SYSTEM_PROMPTS[role]} ${FORMAT_INSTRUCTIONS}`;

        if (dataQuery) {
            console.log('[Chat] Database question detected:', message, 'Role:', role);
            const dbResult = await handleDatabaseQuery({ message, role, userId });
            if (dbResult.text) {
                if (wantsExplain) {
                    const systemPrompt = baseSystemPrompt;
                    const userMessage = `User asked: "${message}".\nHere are the exact data results:\n${dbResult.text}\nProvide a concise explanation only (no restating the list).`;
                    const explanation = await callGroqChat({ systemPrompt, userMessage });
                    responseText = `${dbResult.text}\n\n${explanation}`;
                } else {
                    responseText = dbResult.text;
                    if (!dbResult.simple && isSimpleQuestion(message)) {
                        responseText = dbResult.text.split('\n')[0];
                    }
                }
            } else {
                // STRICT DATA MODE: If it's a data query but we couldn't match the specific logic,
                // don't let it fall through to LLM which might hallucinate.
                responseText = "I found your question related to system data, but I couldn't calculate that specific metric. Please try asking 'total companies' or 'list employees'.";
            }
        }

        if (!responseText) {
            const systemPrompt = baseSystemPrompt;
            responseText = await callGroqChat({ systemPrompt, userMessage: message });
            if (isSimpleQuestion(message) && !wantsExplain) {
                responseText = responseText.split('\n')[0];
            }
        }

        const record = await ChatMessage.create({
            userId,
            role,
            message,
            response: responseText,
            timestamp: new Date(),
            fileUrl: req.file ? `/uploads/${req.file.filename}` : null,
            fileType: req.file ? req.file.mimetype : null
        });

        // Add Notification for Admin if user is not admin
        if (role !== 'admin') {
            try {
                const admins = await SuperAdmin.findAll({ where: { role: { [Op.in]: ['Admin', 'Super Admin'] } } });
                for (const admin of admins) {
                    await Notification.create({
                        userId: admin.email,
                        role: 'admin',
                        message: `New message from ${userId} (${role})`,
                        type: 'chat_new',
                        timestamp: new Date()
                    });
                }
            } catch (notifyErr) {
                console.error('[Chat] Failed to create admin notification:', notifyErr);
            }
        }

        res.status(200).json({
            success: true,
            response: responseText,
            id: record.id,
            timestamp: record.timestamp,
            fileUrl: record.fileUrl
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getUserHistory = async (req, res) => {
    try {
        const { userId } = req.params;
        const role = (req.query.role || '').toLowerCase();
        if (!userId || !role) return res.status(400).json({ success: false, error: 'userId and role are required' });

        if (role !== 'public') {
            const authHeader = req.headers.authorization || '';
            if (!authHeader.startsWith('Bearer ')) {
                return res.status(401).json({ success: false, error: 'Not authorized' });
            }
            const token = authHeader.split(' ')[1];
            let decoded;
            try {
                decoded = jwt.verify(token, process.env.JWT_SECRET);
            } catch (e) {
                return res.status(401).json({ success: false, error: 'Not authorized' });
            }
            let userEmail = null;
            if (decoded.role === 'Employee') {
                const emp = await Employee.findByPk(decoded.id);
                userEmail = emp ? emp.email : null;
            } else {
                const admin = await SuperAdmin.findByPk(decoded.id);
                userEmail = admin ? admin.email : null;
            }
            if (!userEmail || userEmail.toLowerCase() !== userId.toLowerCase()) {
                return res.status(403).json({ success: false, error: 'Forbidden' });
            }
        }

        const chats = await ChatMessage.findAll({
            where: { userId, role },
            order: [['timestamp', 'ASC']]
        });
        res.status(200).json({ success: true, data: chats });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getAllChats = async (req, res) => {
    try {
        const chats = await ChatMessage.findAll({ order: [['timestamp', 'DESC']] });
        res.status(200).json({ success: true, data: chats });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.updateChatResponse = async (req, res) => {
    try {
        const chat = await ChatMessage.findByPk(req.params.id);
        if (!chat) return res.status(404).json({ success: false, error: 'Chat not found' });

        const { response } = req.body;
        if (!response) return res.status(400).json({ success: false, error: 'response is required' });

        await chat.update({ response });

        // Add Notification for User
        try {
            await Notification.create({
                userId: chat.userId,
                role: chat.role === 'public' ? 'employee' : chat.role, // Simple mapping for public if needed
                message: `An admin has updated the response to your message: "${chat.message.substring(0, 30)}..."`,
                type: 'chat_edit',
                timestamp: new Date()
            });
        } catch (notifyErr) {
            console.error('[Chat] Failed to create user notification:', notifyErr);
        }

        res.status(200).json({ success: true, data: chat });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
