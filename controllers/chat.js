const { User } = require('../models/User');
const { Chat } = require('../models/Chat');
const { ChatMessage } = require('../models/ChatMessage');
const { Post } = require('../models/Post');
const { Video } = require('../models/Video');

const getMyChats = async (req, res) => {
    const { myId } = req.params;

    try {
        const user = await User.findById(userId);
        if(!user) return res.status(404).json({ message: 'This user is not registered' });

        const chats = [];

        const chats1 = await Chat.find({ firstUser: myId });
        let otherPersonsIds1 = chats1.map(chat => chat.secondUser);
        let otherPersons1 = await User.find({ _id: { $in: otherPersonsIds1 } });
        chats1.forEach((chat, i) => {
            delete otherPersons1[i].password;
            chats.push({ ...chat, user: otherPersons1[i] });
        });

        const chats2 = await Chat.find({ secondUser: myId });
        let otherPersonsIds2 = chats2.map(chat => chat.firstUser);
        let otherPersons2 = await User.find({ _id: { $in: otherPersonsIds2 } });
        chats2.forEach((chat, i) => {
            delete otherPersons2[i].password;
            chats.push({ ...chat, user: otherPersons2[i] });
        });

        res.status(200).json(chats);
    } catch (error) {
        res.status(500).json(error);
    }
}

const getMessagesOfChat = async (req, res) => {
    const { chatId } = req.params;

    try {
        const chat = await Chat.findById(chatId);
        if(!chat) return res.status(404).json({ message: 'This chat does not exist' });

        const messages = await ChatMessage.find({ chatId });

        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json(error);
    }
}

const sendMessage = async (req, res) => {
    const { chatId } = req.params;
    const { type, text, fileUrl, senderId, videoId, postId, actualEmail } = req.body;

    try {
        const user = await User.findById(senderId);
        if(user.email != actualEmail) return res.status(401).json({ message: 'Unauthorized user' });

        const chat = await Chat.findById(chatId);
        if(!chat) return res.status(404).json({ message: 'This chat does not exist' });

        if(!text && !fileUrl && !videoId && !postId ) return res.status(410).json({ message: 'Invalid empty message' });

        const message = await ChatMessage.create({ chatId, type, text, fileUrl, senderId, videoId, postId });
        let lastMsg = text;
        if(type === 'file') lastMsg = 'file';
        else if(type === 'voice') lastMsg = 'message';
        else if(type === 'image') lastMsg = 'image';
        else if(type === 'videoShare'){
            const video = await Video.findById(videoId);
            message.video = video;
            lastMsg = 'videoShare';
        }
        else if(type === 'postShare'){
            const post = await Post.findById(postId);
            message.post = post;
            lastMsg = 'postShare';
        }

        const updatedChat = await Chat.findByIdAndUpdate(chatId, { latestMessage: lastMsg, latestMessageDate: message.date, latestSenderId: senderId });

        res.status(200).json({ message, updatedChat });
    } catch (error) {
        res.status(500).json(error);
    }
}

const createChat = async (req, res) => {
    const { firstUser, secondUser, actualEmail } = req.body;

    try {
        const user1 = await User.findById(firstUser);
        const user2 = await User.findById(secondUser);
        if(!user1 || !user2) return res.status(404).json({ message: 'This user is not registered' });
        if(user1.email != actualEmail && user2.email != actualEmail) return res.status(401).json({ message: 'Unauthorized user' });

        const chat = await Chat.find({ $or:[ { firstUser, secondUser }, { firstUser: secondUser, secondUser: firstUser } ] });
        if(chat) return res.status(410).json({ message: 'This chat already exists' });

        const newChat = await Chat.create({ firstUser, secondUser });

        res.status(200).json(newChat);
    } catch (error) {
        res.status(500).json(error);
    }
}

module.exports = { getMyChats, getMessagesOfChat, sendMessage, createChat };