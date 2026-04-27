const db = require('../config/db');

const Group = {
    search: async (faculty, courseCode) => {
        let query = 'SELECT * FROM StudyGroups WHERE 1=1';
        let params = [];
        if (faculty) { query += ' AND Faculty LIKE ?'; params.push(`%${faculty}%`); }
        if (courseCode) { query += ' AND CourseCode LIKE ?'; params.push(`%${courseCode}%`); }
        const [rows] = await db.execute(query, params);
        return rows;
    },

    
    create: async (groupData) => {
        const { GroupName, CourseCode, CourseName, Faculty, Description, MeetingLocation, LeaderID } = groupData;
        const query = `INSERT INTO StudyGroups (GroupName, CourseCode, CourseName, Faculty, Description, MeetingLocation, LeaderID) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const [result] = await db.execute(query, [GroupName, CourseCode, CourseName, Faculty, Description, MeetingLocation, LeaderID]);
        return result.insertId;
    },

    findAll: async () => {
        const [rows] = await db.execute('SELECT * FROM StudyGroups ORDER BY CreatedAt DESC');
        return rows;
    },

    findByUserId: async (userId) => {
        const query = `SELECT sg.* FROM StudyGroups sg JOIN GroupMemberships gm ON sg.GroupID = gm.GroupID WHERE gm.UserID = ?`;
        const [rows] = await db.execute(query, [userId]);
        return rows;
    }
};

module.exports = Group;
