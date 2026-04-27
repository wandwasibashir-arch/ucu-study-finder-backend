const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupcontroller');
const verifyToken = require('../middleware/auth');

console.log("1. Search:", groupController.searchGroups ? "✅" : "❌ MISSING");
console.log("2. My Groups:", groupController.getUserGroups ? "✅" : "❌ MISSING");
console.log("3. Create:", groupController.createGroup ? "✅" : "❌ MISSING");
console.log("4. List All:", groupController.getAllGroups ? "✅" : "❌ MISSING");
console.log("5. Join:", groupController.joinGroup ? "✅" : "❌ MISSING");
console.log("6. Leave:", groupController.leaveGroup ? "✅" : "❌ MISSING");
// ADDED: Log for Remove Member
console.log("7. Remove Member:", groupController.removeMember ? "✅" : "❌ MISSING"); 

router.get('/search', groupController.searchGroups);
router.get('/my-groups', verifyToken, groupController.getUserGroups);
router.post('/create', verifyToken, groupController.createGroup);
router.get('/', groupController.getAllGroups);
router.post('/join/:id', verifyToken, groupController.joinGroup);
router.delete('/leave/:id', verifyToken, groupController.leaveGroup);

// ADDED: Route for leader to remove a member
router.delete('/remove-member', verifyToken, groupController.removeMember);

router.get('/details/:id', groupController.getGroupDetails);
router.get('/members/:id', verifyToken, groupController.getGroupMembers);
router.get('/announcements/:id', verifyToken, groupController.getAnnouncements);
router.post('/announcements/:id', verifyToken, groupController.postAnnouncement);
router.post('/sessions', verifyToken, groupController.createSession);
router.get('/sessions/:id', verifyToken, groupController.getGroupSessions);

module.exports = router;
