const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = 'mongodb+srv://3557301573_db_user:hymhym060410@cluster0.vf2vjpg.mongodb.net/bookmarks?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ 成功连接云数据库'))
  .catch(err => console.log('❌ 数据库连接失败:', err));

const Bookmark = mongoose.model('Bookmark', new mongoose.Schema({
  title: String,
  url: String,
  category: String,
  desc: String,
  isDeleted: { type: Boolean, default: false },
  isPinned: { type: Boolean, default: false },
  isStarred: { type: Boolean, default: false }
}, { timestamps: true }));

app.get('/api/bookmarks', async (req, res) => {
  const bookmarks = await Bookmark.find({ isDeleted: false }).sort({ isPinned: -1, isStarred: -1, createdAt: -1 });
  res.json(bookmarks);
});

app.post('/api/bookmarks', async (req, res) => {
  const newBookmark = new Bookmark(req.body);
  await newBookmark.save();
  res.status(201).json(newBookmark);
});

// ✨【新增】修改书签接口
app.put('/api/bookmarks/:id', async (req, res) => {
  const updatedBookmark = await Bookmark.findByIdAndUpdate(
    req.params.id, 
    req.body, 
    { new: true } // 返回更新后的数据
  );
  res.json(updatedBookmark);
});

app.delete('/api/bookmarks/:id', async (req, res) => {
  await Bookmark.findByIdAndUpdate(req.params.id, { isDeleted: true });
  res.json({ message: '已移至回收站' });
});

app.put('/api/bookmarks/:id/pin', async (req, res) => {
  const bookmark = await Bookmark.findById(req.params.id);
  bookmark.isPinned = !bookmark.isPinned;
  await bookmark.save();
  res.json(bookmark);
});

app.put('/api/bookmarks/:id/star', async (req, res) => {
  const bookmark = await Bookmark.findById(req.params.id);
  bookmark.isStarred = !bookmark.isStarred;
  await bookmark.save();
  res.json(bookmark);
});

app.get('/api/trash', async (req, res) => {
  const bookmarks = await Bookmark.find({ isDeleted: true }).sort({ updatedAt: -1 });
  res.json(bookmarks);
});

app.delete('/api/trash/:id', async (req, res) => {
  await Bookmark.findByIdAndDelete(req.params.id);
  res.json({ message: '彻底删除成功' });
});

app.put('/api/trash/:id/restore', async (req, res) => {
  await Bookmark.findByIdAndUpdate(req.params.id, { isDeleted: false });
  res.json({ message: '恢复成功' });
});

// 只有本地开发时才启动端口，Vercel 环境不需要
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`🚀 本地服务器运行在端口: ${PORT}`));
}

// 导出 app 实例供 Vercel 使用
module.exports = app;