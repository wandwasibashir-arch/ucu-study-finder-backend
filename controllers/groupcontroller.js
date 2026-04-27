const db = require('../config/db');

exports.searchGroups = async (req, res) => {
    const { faculty, courseCode } = req.query;
    try {
        let query = 'SELECT * FROM studygroups WHERE 1=1';
        let params = [];
        if (faculty) {
            query += ' AND Faculty LIKE ?';
            params.push(`%${faculty}%`);
        }
        if (courseCode) {
            query += ' AND CourseCode LIKE ?';
            params.push(`%${courseCode}%`);
        }
        const [rows] = await db.execute(query, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createGroup = async (req, res) => {
    const { GroupName, CourseCode, CourseName, Faculty, Description, MeetingLocation } = req.body;
    const LeaderID = req.user ? (req.user.id || req.user.UserID) : null;
    if (!LeaderID) return res.status(401).json({ error: "Login required" });
    try {
        const [result] = await db.execute(
            `INSERT INTO studygroups (GroupName, CourseCode, CourseName, Faculty, Description, MeetingLocation, LeaderID) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [GroupName || null, CourseCode || null, CourseName || null, Faculty || null, Description || null, MeetingLocation || null, LeaderID]
        );
        await db.execute('INSERT INTO memberships (UserID, GroupID) VALUES (?, ?)', [LeaderID, result.insertId]);
        res.status(201).json({ msg: "Created", GroupID: result.insertId });
    } catch (err) {
        console.error("Create Group Error:", err.message);
        res.status(500).json({ error: err.message });
    }
};

exports.getAllGroups = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM studygroups ORDER BY CreatedAt DESC');
        res.status(200).json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.joinGroup = async (req, res) => {
    const GroupID = req.params.id;
    const UserID = req.user ? (req.user.id || req.user.UserID) : null;
    try {
        const [existing] = await db.execute('SELECT * FROM memberships WHERE UserID = ? AND GroupID = ?', [UserID, GroupID]);
        if (existing.length > 0) return res.status(400).json({ msg: "Already a member" });
        await db.execute('INSERT INTO memberships (UserID, GroupID) VALUES (?, ?)', [UserID, GroupID]);
        res.status(200).json({ msg: "Joined!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getUserGroups = async (req, res) => {
    const UserID = req.user ? (req.user.id || req.user.UserID) : null;
    try {
        const query = `SELECT g.* FROM studygroups g JOIN memberships m ON g.GroupID = m.GroupID WHERE m.UserID = ?`;
        const [rows] = await db.execute(query, [UserID]);
        res.status(200).json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getGroupDetails = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM studygroups WHERE GroupID = ?', [req.params.id]);
        res.status(200).json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getGroupMembers = async (req, res) => {
    try {
        // UPDATED: Included u.UserID so the frontend has the ID for the remove button
        const query = `SELECT u.UserID, u.FullName, u.Email FROM users u JOIN memberships m ON u.UserID = m.UserID WHERE m.GroupID = ?`;
        const [rows] = await db.execute(query, [req.params.id]);
        res.status(200).json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ADDED: Logic for leader to remove a member
exports.removeMember = async (req, res) => {
    const { GroupID, TargetUserID } = req.body;
    const RequesterID = req.user ? (req.user.id || req.user.UserID) : null;

    try {
        const [group] = await db.execute('SELECT LeaderID FROM studygroups WHERE GroupID = ?', [GroupID]);
        if (group.length === 0) return res.status(404).json({ msg: "Group not found" });

        if (Number(group[0].LeaderID) !== Number(RequesterID)) {
            return res.status(403).json({ msg: "Only the group leader can remove members" });
        }

        if (Number(TargetUserID) === Number(RequesterID)) {
            return res.status(400).json({ msg: "Leaders cannot remove themselves." });
        }

        await db.execute('DELETE FROM memberships WHERE UserID = ? AND GroupID = ?', [TargetUserID, GroupID]);
        res.status(200).json({ msg: "Member removed successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAnnouncements = async (req, res) => {
    try {
        const query = `SELECT a.*, u.FullName FROM announcements a JOIN users u ON a.UserID = u.UserID WHERE a.GroupID = ? ORDER BY a.CreatedAt DESC`;
        const [rows] = await db.execute(query, [req.params.id]);
        res.status(200).json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.postAnnouncement = async (req, res) => {
    const { Message } = req.body;
    const UserID = req.user ? (req.user.id || req.user.UserID) : null;
    try {
        await db.execute('INSERT INTO announcements (GroupID, UserID, Message) VALUES (?, ?, ?)', [req.params.id, UserID, Message]);
        res.status(201).json({ msg: "Posted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createSession = async (req, res) => {
    const { GroupID, SessionDate, SessionTime, LocationLink, SessionDescription } = req.body;
    try {
        await db.execute(`INSERT INTO studysessions (GroupID, SessionDate, SessionTime, LocationLink, SessionDescription) VALUES (?, ?, ?, ?, ?)`, [GroupID, SessionDate, SessionTime, LocationLink || null, SessionDescription || null]);
        res.status(201).json({ msg: "Scheduled" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getGroupSessions = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM studysessions WHERE GroupID = ? ORDER BY SessionDate ASC', [req.params.id]);
        res.status(200).json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.leaveGroup = async (req, res) => {
    const GroupID = req.params.id;
    const UserID = req.user ? (req.user.id || req.user.UserID) : null;
    if (!UserID) return res.status(401).json({ error: "Login required" });
    try {
        const [rows] = await db.execute('SELECT LeaderID FROM studygroups WHERE GroupID = ?', [GroupID]);
        if (rows.length === 0) return res.status(404).json({ msg: "Group not found." });
        const group = rows[0];
        if (Number(group.LeaderID) === Number(UserID)) {
            return res.status(400).json({ msg: "Leaders cannot leave the group." });
        }
        const [result] = await db.execute('DELETE FROM memberships WHERE UserID = ? AND GroupID = ?', [UserID, GroupID]);
        if (result.affectedRows === 0) return res.status(404).json({ msg: "Membership not found." });
        res.status(200).json({ msg: "Successfully left the group" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
