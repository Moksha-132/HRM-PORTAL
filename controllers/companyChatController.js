const { Op } = require('sequelize');
const {
    Company,
    Employee,
    SuperAdmin,
    CompanyChatGroup,
    CompanyChatGroupMember,
    CompanyChatMessage
} = require('../models');

const normalizeEmail = (email) => (email || '').toString().trim().toLowerCase();
const normalizeName = (user) => user?.name || user?.employee_name || user?.email || 'User';
const directKeyFor = (a, b) => [normalizeEmail(a), normalizeEmail(b)].sort().join('__');

const serializeCurrentUser = (user) => ({
    email: normalizeEmail(user?.email),
    name: normalizeName(user),
    role: user?.role || 'Employee',
    company_id: user?.company_id || null
});

const getDefaultCompany = async () => {
    const activeCompany = await Company.findOne({
        where: { status: 'Active' },
        order: [['id', 'ASC']]
    });
    if (activeCompany) return activeCompany;
    return Company.findOne({ order: [['id', 'ASC']] });
};

const persistCompanyIdIfMissing = async (record, companyId) => {
    if (!record || !companyId || record.company_id) return;
    if (typeof record.update !== 'function') return;
    await record.update({ company_id: companyId });
};

const resolveCompanyIdForRecord = async (record) => {
    if (!record) return null;
    if (record.company_id) return record.company_id;

    const email = normalizeEmail(record.email);
    const domain = email.split('@')[1];
    const companies = await Company.findAll({ attributes: ['id', 'email'] });
    const directMatch = companies.find((company) => normalizeEmail(company.email) === email);
    if (directMatch) return directMatch.id;
    const domainMatch = companies.find((company) => normalizeEmail(company.email).split('@')[1] === domain);
    if (domainMatch) return domainMatch.id;
    return companies.length === 1 ? companies[0].id : null;
};

const normalizePresence = (status) => {
    const value = (status || '').toString().trim().toLowerCase();
    if (['active', 'online', 'present'].includes(value)) return 'online';
    return 'offline';
};

const buildMockCompanyUsers = (companyId, company) => {
    const slug = (company?.name || 'company')
        .toString()
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '.')
        .replace(/^\.+|\.+$/g, '') || `company${companyId}`;

    return [
        { id: `mock:${companyId}:1`, name: 'John Doe', email: `john.${slug}@chat.local`, role: 'Employee', company_id: companyId, status: 'online', avatar: null, source: 'mock' },
        { id: `mock:${companyId}:2`, name: 'Rahul Sharma', email: `rahul.${slug}@chat.local`, role: 'Support', company_id: companyId, status: 'offline', avatar: null, source: 'mock' },
        { id: `mock:${companyId}:3`, name: 'Amit Patel', email: `amit.${slug}@chat.local`, role: 'Manager', company_id: companyId, status: 'online', avatar: null, source: 'mock' }
    ];
};

const getScopedUserPool = async (companyId, company = null) => {
    const [employees, admins] = await Promise.all([
        Employee.findAll({ attributes: ['employee_id', 'employee_name', 'email', 'role', 'company_id', 'status', 'avatar'] }),
        SuperAdmin.findAll({ attributes: ['id', 'name', 'email', 'role', 'company_id', 'avatar'] })
    ]);

    const employeeUsers = await Promise.all(
        employees.map(async (employee) => ({
            id: `employee:${employee.employee_id}`,
            name: employee.employee_name,
            email: normalizeEmail(employee.email),
            role: employee.role || 'Employee',
            company_id: employee.company_id || await resolveCompanyIdForRecord(employee),
            status: normalizePresence(employee.status),
            avatar: employee.avatar || null,
            source: 'employee'
        }))
    );

    const adminUsers = await Promise.all(
        admins.map(async (admin) => ({
            id: `admin:${admin.id}`,
            name: admin.name,
            email: normalizeEmail(admin.email),
            role: admin.role || 'Admin',
            company_id: admin.company_id || await resolveCompanyIdForRecord(admin),
            status: 'online',
            avatar: admin.avatar || null,
            source: 'admin'
        }))
    );

    const scopedUsers = [...employeeUsers, ...adminUsers]
        .filter((user) => user.email && user.company_id && String(user.company_id) === String(companyId));

    if (scopedUsers.length > 1) {
        return scopedUsers;
    }

    const fallbackUsers = buildMockCompanyUsers(companyId, company).filter(
        (mockUser) => !scopedUsers.some((user) => user.email === mockUser.email)
    );

    return [...scopedUsers, ...fallbackUsers];
};

const requireCompanyUser = async (req, res) => {
    const currentUser = serializeCurrentUser(req.user);
    let companyId = currentUser.company_id || await resolveCompanyIdForRecord(req.user);
    let company = companyId ? await Company.findByPk(companyId) : null;

    if (!company) {
        company = await getDefaultCompany();
        companyId = company?.id || null;
    }

    if (!companyId) {
        res.status(400).json({ success: false, error: 'No company assigned' });
        return null;
    }

    if (!company) {
        res.status(404).json({ success: false, error: 'Company not found for this user.' });
        return null;
    }

    await persistCompanyIdIfMissing(req.user, companyId);

    return {
        currentUser: { ...currentUser, company_id: companyId },
        company
    };
};

const ensureDirectConversation = async ({ companyId, currentUser, peerUser }) => {
    const key = directKeyFor(currentUser.email, peerUser.email);
    let group = await CompanyChatGroup.findOne({ where: { direct_key: key } });
    if (!group) {
        group = await CompanyChatGroup.create({
            name: `${currentUser.name} & ${peerUser.name}`,
            company_id: companyId,
            created_by: currentUser.email,
            is_direct: true,
            direct_key: key
        });
        await CompanyChatGroupMember.bulkCreate([
            {
                group_id: group.id,
                company_id: companyId,
                user_email: currentUser.email,
                user_name: currentUser.name,
                user_role: currentUser.role,
                is_admin: true
            },
            {
                group_id: group.id,
                company_id: companyId,
                user_email: peerUser.email,
                user_name: peerUser.name,
                user_role: peerUser.role,
                is_admin: false
            }
        ]);
    }
    return group;
};

const formatConversation = (group, memberships, messages) => {
    const lastMessage = messages[0] || null;
    return {
        id: group.id,
        name: group.name,
        company_id: group.company_id,
        is_direct: group.is_direct,
        created_by: group.created_by,
        members: memberships.map((member) => ({
            email: member.user_email,
            name: member.user_name,
            role: member.user_role,
            is_admin: member.is_admin
        })),
        lastMessage: lastMessage ? {
            id: lastMessage.id,
            message: lastMessage.message,
            sender_email: lastMessage.sender_email,
            sender_name: lastMessage.sender_name,
            created_at: lastMessage.created_at,
            fileUrl: lastMessage.fileUrl,
            fileType: lastMessage.fileType,
            deleted_for_everyone: lastMessage.deleted_for_everyone
        } : null
    };
};

const getGroupWithAdminCheck = async ({ companyId, groupId, currentUser }) => {
    const group = await CompanyChatGroup.findOne({
        where: { id: groupId, company_id: companyId, is_direct: false }
    });
    if (!group) {
        return { error: { status: 404, message: 'Group not found.' } };
    }

    const adminMembership = await CompanyChatGroupMember.findOne({
        where: { group_id: group.id, user_email: currentUser.email, is_admin: true }
    });
    if (!adminMembership) {
        return { error: { status: 403, message: 'Only group admins can manage this group.' } };
    }

    return { group, adminMembership };
};

const mapIdentifiersToEmails = (identifiers = [], userPool = []) => {
    const poolByEmail = new Map(userPool.map((user) => [normalizeEmail(user.email), user.email]));
    const poolById = new Map(userPool.map((user) => [String(user.id), user.email]));

    return [...new Set(
        identifiers
            .map((value) => {
                if (value === null || value === undefined) return null;
                const rawValue = String(value).trim();
                if (!rawValue) return null;
                return poolByEmail.get(normalizeEmail(rawValue)) || poolById.get(rawValue) || normalizeEmail(rawValue);
            })
            .filter(Boolean)
    )];
};

const toEmployeeStatus = (status) => (normalizePresence(status) === 'online' ? 'Active' : 'Inactive');

const generateUserEmail = async ({ name, companyId, company }) => {
    const baseName = (name || 'user')
        .toString()
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '.')
        .replace(/^\.+|\.+$/g, '') || 'user';
    const slug = (company?.name || `company${companyId}`)
        .toString()
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '.')
        .replace(/^\.+|\.+$/g, '') || `company${companyId}`;

    let attempt = 0;
    while (attempt < 25) {
        const suffix = attempt === 0 ? '' : `.${attempt + 1}`;
        const candidate = `${baseName}${suffix}.${slug}@chat.local`;
        const exists = await Employee.findOne({ where: { email: candidate } });
        if (!exists) return candidate;
        attempt += 1;
    }

    return `${baseName}.${Date.now()}.${slug}@chat.local`;
};

const serializeUserForChat = async (record, source = 'employee') => ({
    id: source === 'employee' ? `employee:${record.employee_id}` : `admin:${record.id}`,
    name: source === 'employee' ? record.employee_name : record.name,
    email: normalizeEmail(record.email),
    role: record.role || (source === 'employee' ? 'Employee' : 'Admin'),
    company_id: record.company_id || await resolveCompanyIdForRecord(record),
    status: source === 'employee' ? normalizePresence(record.status) : 'online',
    avatar: record.avatar || null,
    source
});

exports.getCompanyChatBootstrap = async (req, res) => {
    try {
        const scoped = await requireCompanyUser(req, res);
        if (!scoped) return;
        const { currentUser, company } = scoped;

        const userPool = await getScopedUserPool(company.id, company);
        const users = userPool.filter((user) => user.email !== currentUser.email);

        const memberships = await CompanyChatGroupMember.findAll({
            where: {
                company_id: company.id,
                user_email: currentUser.email
            }
        });

        const groupIds = memberships.map((membership) => membership.group_id);
        const groups = groupIds.length
            ? await CompanyChatGroup.findAll({
                where: { id: groupIds, company_id: company.id },
                order: [['updated_at', 'DESC']]
            })
            : [];

        const groupMembers = groupIds.length
            ? await CompanyChatGroupMember.findAll({ where: { group_id: groupIds } })
            : [];
        const recentMessages = groupIds.length
            ? await CompanyChatMessage.findAll({
                where: { group_id: groupIds },
                order: [['created_at', 'DESC']]
            })
            : [];

        const conversations = groups.map((group) => formatConversation(
            group,
            groupMembers.filter((member) => member.group_id === group.id),
            recentMessages.filter((message) => message.group_id === group.id)
        ));

        res.status(200).json({
            success: true,
            data: {
                company: { id: company.id, name: company.name },
                currentUser,
                users,
                groups: conversations.filter((conversation) => !conversation.is_direct),
                directConversations: conversations.filter((conversation) => conversation.is_direct)
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getConversationMessages = async (req, res) => {
    try {
        const scoped = await requireCompanyUser(req, res);
        if (!scoped) return;
        const { currentUser, company } = scoped;
        const { type, target } = req.params;

        const userPool = await getScopedUserPool(company.id, company);
        let group;

        if (type === 'direct') {
            const peer = userPool.find((user) => user.email === normalizeEmail(target));
            if (!peer) return res.status(404).json({ success: false, error: 'Direct chat user not found in your company.' });
            group = await CompanyChatGroup.findOne({ where: { direct_key: directKeyFor(currentUser.email, peer.email) } });
            if (!group) {
                return res.status(200).json({ success: true, data: { conversation: null, messages: [] } });
            }
        } else if (type === 'group') {
            group = await CompanyChatGroup.findOne({ where: { id: target, company_id: company.id, is_direct: false } });
            if (!group) return res.status(404).json({ success: false, error: 'Group not found.' });
            const membership = await CompanyChatGroupMember.findOne({ where: { group_id: group.id, user_email: currentUser.email } });
            if (!membership) return res.status(403).json({ success: false, error: 'You are not a member of this group.' });
        } else {
            return res.status(400).json({ success: false, error: 'Invalid conversation type.' });
        }

        const [members, messages] = await Promise.all([
            CompanyChatGroupMember.findAll({ where: { group_id: group.id } }),
            CompanyChatMessage.findAll({ where: { group_id: group.id }, order: [['created_at', 'ASC']] })
        ]);

        res.status(200).json({
            success: true,
            data: {
                conversation: formatConversation(group, members, [...messages].reverse()),
                messages
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.createGroup = async (req, res) => {
    try {
        const scoped = await requireCompanyUser(req, res);
        if (!scoped) return;
        const { currentUser, company } = scoped;
        const { name, memberEmails = [] } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ success: false, error: 'Group name is required.' });
        }

        const userPool = await getScopedUserPool(company.id, company);
        const allowedEmails = new Set(userPool.map((user) => user.email).concat(currentUser.email));
        const normalizedMembers = [...new Set(memberEmails.map(normalizeEmail).filter(Boolean))];
        const invalid = normalizedMembers.find((email) => !allowedEmails.has(email));
        if (invalid) {
            return res.status(403).json({ success: false, error: `User ${invalid} does not belong to your company.` });
        }

        const group = await CompanyChatGroup.create({
            name: name.trim(),
            company_id: company.id,
            created_by: currentUser.email,
            is_direct: false
        });

        const memberMap = new Map(userPool.map((user) => [user.email, user]));
        memberMap.set(currentUser.email, currentUser);
        const finalEmails = [...new Set([currentUser.email, ...normalizedMembers])];

        await CompanyChatGroupMember.bulkCreate(finalEmails.map((email) => {
            const member = memberMap.get(email);
            return {
                group_id: group.id,
                company_id: company.id,
                user_email: email,
                user_name: member?.name || email,
                user_role: member?.role || 'Employee',
                is_admin: email === currentUser.email
            };
        }));

        res.status(201).json({ success: true, data: group });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.updateGroupMembers = async (req, res) => {
    try {
        const scoped = await requireCompanyUser(req, res);
        if (!scoped) return;
        const { currentUser, company } = scoped;
        const { id } = req.params;
        const { memberEmails = [] } = req.body;

        const group = await CompanyChatGroup.findOne({ where: { id, company_id: company.id, is_direct: false } });
        if (!group) return res.status(404).json({ success: false, error: 'Group not found.' });

        const adminMembership = await CompanyChatGroupMember.findOne({
            where: { group_id: group.id, user_email: currentUser.email, is_admin: true }
        });
        if (!adminMembership) return res.status(403).json({ success: false, error: 'Only group admins can update members.' });

        const userPool = await getScopedUserPool(company.id, company);
        const memberMap = new Map(userPool.map((user) => [user.email, user]));
        memberMap.set(currentUser.email, currentUser);
        const finalEmails = [...new Set(memberEmails.map(normalizeEmail).filter(Boolean).concat(currentUser.email))];
        const invalid = finalEmails.find((email) => !memberMap.has(email));
        if (invalid) return res.status(403).json({ success: false, error: `User ${invalid} does not belong to your company.` });

        await CompanyChatGroupMember.destroy({
            where: {
                group_id: group.id,
                user_email: { [Op.notIn]: finalEmails }
            }
        });

        for (const email of finalEmails) {
            const member = memberMap.get(email);
            await CompanyChatGroupMember.findOrCreate({
                where: { group_id: group.id, user_email: email },
                defaults: {
                    company_id: company.id,
                    user_name: member?.name || email,
                    user_role: member?.role || 'Employee',
                    is_admin: email === currentUser.email
                }
            });
        }

        res.status(200).json({ success: true, message: 'Group members updated.' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.updateGroup = async (req, res) => {
    try {
        const scoped = await requireCompanyUser(req, res);
        if (!scoped) return;
        const { currentUser, company } = scoped;
        const { id } = req.params;
        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ success: false, error: 'Group name is required.' });
        }

        const access = await getGroupWithAdminCheck({ companyId: company.id, groupId: id, currentUser });
        if (access.error) {
            return res.status(access.error.status).json({ success: false, error: access.error.message });
        }

        await access.group.update({ name: name.trim() });

        return res.status(200).json({
            success: true,
            message: 'Group name updated.',
            data: access.group
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.addGroupMembers = async (req, res) => {
    try {
        const scoped = await requireCompanyUser(req, res);
        if (!scoped) return;
        const { currentUser, company } = scoped;
        const { id } = req.params;
        const identifiers = req.body.userIds || req.body.memberEmails || [];

        const access = await getGroupWithAdminCheck({ companyId: company.id, groupId: id, currentUser });
        if (access.error) {
            return res.status(access.error.status).json({ success: false, error: access.error.message });
        }

        const userPool = await getScopedUserPool(company.id, company);
        const memberMap = new Map(userPool.map((user) => [normalizeEmail(user.email), user]));
        memberMap.set(currentUser.email, currentUser);

        const memberEmails = mapIdentifiersToEmails(identifiers, userPool);
        const invalid = memberEmails.find((email) => !memberMap.has(email));
        if (invalid) {
            return res.status(403).json({ success: false, error: `User ${invalid} does not belong to your company.` });
        }

        for (const email of memberEmails) {
            const member = memberMap.get(email);
            await CompanyChatGroupMember.findOrCreate({
                where: { group_id: access.group.id, user_email: email },
                defaults: {
                    company_id: company.id,
                    user_name: member?.name || email,
                    user_role: member?.role || 'Employee',
                    is_admin: false
                }
            });
        }

        return res.status(200).json({ success: true, message: 'Members added to group.' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.createCompanyUser = async (req, res) => {
    try {
        const scoped = await requireCompanyUser(req, res);
        if (!scoped) return;
        const { company } = scoped;
        const { name, email, status, avatar } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ success: false, error: 'User name is required.' });
        }

        const normalizedEmail = email ? normalizeEmail(email) : await generateUserEmail({ name, companyId: company.id, company });
        const duplicateUser = await Employee.findOne({
            where: {
                company_id: company.id,
                [Op.or]: [
                    { email: normalizedEmail },
                    { employee_name: name.trim() }
                ]
            }
        });

        if (duplicateUser) {
            return res.status(409).json({ success: false, error: 'A user with the same name or email already exists.' });
        }

        const employee = await Employee.create({
            employee_name: name.trim(),
            email: normalizedEmail,
            role: 'Employee',
            company_id: company.id,
            status: toEmployeeStatus(status),
            avatar: avatar || null
        });

        const user = await serializeUserForChat(employee, 'employee');
        return res.status(201).json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.updateCompanyUser = async (req, res) => {
    try {
        const scoped = await requireCompanyUser(req, res);
        if (!scoped) return;
        const { company } = scoped;
        const { id } = req.params;
        const { name, email, status, avatar } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ success: false, error: 'User name is required.' });
        }

        const [source, rawId] = String(id).split(':');
        const normalizedEmail = email ? normalizeEmail(email) : null;

        if (source === 'employee' && rawId) {
            const employee = await Employee.findOne({ where: { employee_id: rawId, company_id: company.id } });
            if (!employee) return res.status(404).json({ success: false, error: 'User not found.' });

            if (normalizedEmail) {
                const existing = await Employee.findOne({
                    where: {
                        company_id: company.id,
                        email: normalizedEmail,
                        employee_id: { [Op.ne]: employee.employee_id }
                    }
                });
                if (existing) {
                    return res.status(409).json({ success: false, error: 'Another user already uses this email.' });
                }
            }

            await employee.update({
                employee_name: name.trim(),
                email: normalizedEmail || employee.email,
                status: toEmployeeStatus(status),
                avatar: avatar !== undefined ? avatar : employee.avatar
            });

            const user = await serializeUserForChat(employee, 'employee');
            return res.status(200).json({ success: true, data: user });
        }

        if (source === 'admin' && rawId) {
            const admin = await SuperAdmin.findOne({ where: { id: rawId, company_id: company.id } });
            if (!admin) return res.status(404).json({ success: false, error: 'User not found.' });

            if (normalizedEmail) {
                const existingAdmin = await SuperAdmin.findOne({
                    where: {
                        company_id: company.id,
                        email: normalizedEmail,
                        id: { [Op.ne]: admin.id }
                    }
                });
                if (existingAdmin) {
                    return res.status(409).json({ success: false, error: 'Another user already uses this email.' });
                }
            }

            await admin.update({
                name: name.trim(),
                email: normalizedEmail || admin.email,
                avatar: avatar !== undefined ? avatar : admin.avatar
            });

            const user = await serializeUserForChat(admin, 'admin');
            return res.status(200).json({ success: true, data: user });
        }

        const materializedEmail = normalizedEmail || await generateUserEmail({ name, companyId: company.id, company });
        const existing = await Employee.findOne({ where: { company_id: company.id, email: materializedEmail } });
        if (existing) {
            await existing.update({
                employee_name: name.trim(),
                status: toEmployeeStatus(status)
            });
            const user = await serializeUserForChat(existing, 'employee');
            return res.status(200).json({ success: true, data: user });
        }

        const employee = await Employee.create({
            employee_name: name.trim(),
            email: materializedEmail,
            role: 'Employee',
            company_id: company.id,
            status: toEmployeeStatus(status),
            avatar: avatar || null
        });

        const user = await serializeUserForChat(employee, 'employee');
        return res.status(200).json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.deleteCompanyUser = async (req, res) => {
    try {
        const scoped = await requireCompanyUser(req, res);
        if (!scoped) return;
        const { currentUser, company } = scoped;
        const { id } = req.params;
        const [source, rawId] = String(id).split(':');

        if (source === 'employee' && rawId) {
            const employee = await Employee.findOne({ where: { employee_id: rawId, company_id: company.id } });
            if (!employee) return res.status(404).json({ success: false, error: 'User not found.' });
            if (normalizeEmail(employee.email) === currentUser.email) {
                return res.status(400).json({ success: false, error: 'You cannot delete your own account from chat.' });
            }

            await CompanyChatGroupMember.destroy({ where: { user_email: normalizeEmail(employee.email), company_id: company.id } });
            await employee.destroy();
            return res.status(200).json({ success: true, message: 'User deleted successfully.' });
        }

        if (source === 'admin' && rawId) {
            const admin = await SuperAdmin.findOne({ where: { id: rawId, company_id: company.id } });
            if (!admin) return res.status(404).json({ success: false, error: 'User not found.' });
            if (normalizeEmail(admin.email) === currentUser.email) {
                return res.status(400).json({ success: false, error: 'You cannot delete your own account from chat.' });
            }

            await CompanyChatGroupMember.destroy({ where: { user_email: normalizeEmail(admin.email), company_id: company.id } });
            await admin.destroy();
            return res.status(200).json({ success: true, message: 'User deleted successfully.' });
        }

        return res.status(400).json({ success: false, error: 'Invalid user id.' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.removeGroupMember = async (req, res) => {
    try {
        const scoped = await requireCompanyUser(req, res);
        if (!scoped) return;
        const { currentUser, company } = scoped;
        const { id, userId } = req.params;

        const access = await getGroupWithAdminCheck({ companyId: company.id, groupId: id, currentUser });
        if (access.error) {
            return res.status(access.error.status).json({ success: false, error: access.error.message });
        }

        const userPool = await getScopedUserPool(company.id, company);
        const memberEmails = mapIdentifiersToEmails([userId], userPool);
        const memberEmail = memberEmails[0];

        if (!memberEmail) {
            return res.status(400).json({ success: false, error: 'A valid member identifier is required.' });
        }

        if (memberEmail === currentUser.email) {
            return res.status(400).json({ success: false, error: 'Group admins cannot remove themselves.' });
        }

        const deletedCount = await CompanyChatGroupMember.destroy({
            where: { group_id: access.group.id, user_email: memberEmail }
        });

        if (!deletedCount) {
            return res.status(404).json({ success: false, error: 'Group member not found.' });
        }

        return res.status(200).json({ success: true, message: 'Member removed from group.' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.deleteGroup = async (req, res) => {
    try {
        const scoped = await requireCompanyUser(req, res);
        if (!scoped) return;
        const { currentUser, company } = scoped;
        const { id } = req.params;

        const access = await getGroupWithAdminCheck({ companyId: company.id, groupId: id, currentUser });
        if (access.error) {
            return res.status(access.error.status).json({ success: false, error: access.error.message });
        }

        await CompanyChatMessage.destroy({ where: { group_id: access.group.id } });
        await CompanyChatGroupMember.destroy({ where: { group_id: access.group.id } });
        await access.group.destroy();

        return res.status(200).json({ success: true, message: 'Group deleted successfully.' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.sendConversationMessage = async (req, res) => {
    try {
        const scoped = await requireCompanyUser(req, res);
        if (!scoped) return;
        const { currentUser, company } = scoped;
        const { type, target, message } = req.body;
        const trimmedMessage = (message || '').trim();

        if (!trimmedMessage && !req.file) {
            return res.status(400).json({ success: false, error: 'Message or attachment is required.' });
        }

        const userPool = await getScopedUserPool(company.id, company);
        let group;

        if (type === 'direct') {
            const peer = userPool.find((user) => user.email === normalizeEmail(target));
            if (!peer) return res.status(404).json({ success: false, error: 'Direct chat user not found in your company.' });
            group = await ensureDirectConversation({ companyId: company.id, currentUser, peerUser: peer });
        } else if (type === 'group') {
            group = await CompanyChatGroup.findOne({ where: { id: target, company_id: company.id, is_direct: false } });
            if (!group) return res.status(404).json({ success: false, error: 'Group not found.' });
            const membership = await CompanyChatGroupMember.findOne({ where: { group_id: group.id, user_email: currentUser.email } });
            if (!membership) return res.status(403).json({ success: false, error: 'You are not a member of this group.' });
        } else {
            return res.status(400).json({ success: false, error: 'Invalid conversation type.' });
        }

        const chatMessage = await CompanyChatMessage.create({
            group_id: group.id,
            company_id: company.id,
            sender_email: currentUser.email,
            sender_name: currentUser.name,
            sender_role: currentUser.role,
            message: trimmedMessage || 'Attachment',
            fileUrl: req.file ? `/uploads/${req.file.filename}` : null,
            fileType: req.file ? req.file.mimetype : null
        });

        res.status(201).json({ success: true, data: chatMessage });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.clearConversationMessages = async (req, res) => {
    try {
        const scoped = await requireCompanyUser(req, res);
        if (!scoped) return;
        const { currentUser, company } = scoped;
        const { type, target } = req.params;

        let group = null;

        if (type === 'direct') {
            const userPool = await getScopedUserPool(company.id, company);
            const peer = userPool.find((user) => user.email === normalizeEmail(target));
            if (!peer) {
                return res.status(404).json({ success: false, error: 'Direct chat user not found in your company.' });
            }

            group = await CompanyChatGroup.findOne({
                where: { direct_key: directKeyFor(currentUser.email, peer.email), company_id: company.id }
            });

            if (!group) {
                return res.status(200).json({ success: true, message: 'Conversation already clear.', data: { deletedCount: 0 } });
            }
        } else if (type === 'group') {
            const access = await getGroupWithAdminCheck({ companyId: company.id, groupId: target, currentUser });
            if (access.error) {
                return res.status(access.error.status).json({ success: false, error: access.error.message });
            }
            group = access.group;
        } else {
            return res.status(400).json({ success: false, error: 'Invalid conversation type.' });
        }

        const deletedCount = await CompanyChatMessage.destroy({
            where: { group_id: group.id, company_id: company.id }
        });

        return res.status(200).json({
            success: true,
            message: deletedCount > 0 ? 'Conversation cleared successfully.' : 'Conversation already clear.',
            data: { deletedCount }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.editConversationMessage = async (req, res) => {
    try {
        const scoped = await requireCompanyUser(req, res);
        if (!scoped) return;
        const { currentUser, company } = scoped;
        const { id } = req.params;
        const { message } = req.body;

        const chatMessage = await CompanyChatMessage.findOne({ where: { id, company_id: company.id } });
        if (!chatMessage) return res.status(404).json({ success: false, error: 'Message not found.' });
        if (normalizeEmail(chatMessage.sender_email) !== currentUser.email) {
            return res.status(403).json({ success: false, error: 'You can only edit your own messages.' });
        }
        if (!message || !message.trim()) {
            return res.status(400).json({ success: false, error: 'Message is required.' });
        }

        await chatMessage.update({ message: message.trim(), edited_at: new Date() });
        res.status(200).json({ success: true, data: chatMessage });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.deleteConversationMessage = async (req, res) => {
    try {
        const scoped = await requireCompanyUser(req, res);
        if (!scoped) return;
        const { currentUser, company } = scoped;
        const { id } = req.params;

        const chatMessage = await CompanyChatMessage.findOne({ where: { id, company_id: company.id } });
        if (!chatMessage) return res.status(404).json({ success: false, error: 'Message not found.' });
        if (normalizeEmail(chatMessage.sender_email) !== currentUser.email) {
            return res.status(403).json({ success: false, error: 'You can only delete your own messages for everyone.' });
        }

        await chatMessage.update({
            message: 'This message was deleted',
            deleted_for_everyone: true,
            edited_at: new Date()
        });

        res.status(200).json({ success: true, data: chatMessage });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
