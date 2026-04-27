const db = require('../config/db');

exports.getSystemStats = async (req, res) => {
    try {
        const [userCount] = await db.execute('SELECT COUNT(*) as total FROM Users');
        const [groupCount] = await db.execute('SELECT COUNT(*) as total FROM studygroups');
        const [sessionCount] = await db.execute('SELECT COUNT(*) as total FROM studysessions');
        const [announcementCount] = await db.execute('SELECT COUNT(*) as total FROM announcements');
        
        res.status(200).json({
            users: userCount[0].total,
            groups: groupCount[0].total,
            sessions: sessionCount[0].total,
            announcements: announcementCount[0].total
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT UserID, FullName, Email, Program FROM Users');
        res.status(200).json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};



exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await db.execute('DELETE FROM Users WHERE UserID = ?', [id]);
        res.status(200).json({ message: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteGroup = async (req, res) => {
    try {
        const { id } = req.params;
        await db.execute('DELETE FROM studygroups WHERE GroupID = ?', [id]);
        res.status(200).json({ message: "Study Group deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};



exports.getAllGroups = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT GroupID, GroupName, CourseCode, CourseName, Faculty, Description, MeetingLocation FROM studygroups');
        res.status(200).json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAllSessions = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT SessionID, SessionDescription, SessionDate, SessionTime FROM studysessions');
        res.status(200).json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAllAnnouncements = async (req, res) => {
    try {
        
        const [rows] = await db.execute('SELECT AnnouncementID, Message, CreatedAt FROM announcements');
        res.status(200).json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteSession = async (req, res) => {
    try {
        const { id } = req.params;
        await db.execute('DELETE FROM studysessions WHERE SessionID = ?', [id]);
        res.status(200).json({ message: "Session deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        
        await db.execute('DELETE FROM announcements WHERE AnnouncementID = ?', [id]);
        res.status(200).json({ message: "Announcement deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
